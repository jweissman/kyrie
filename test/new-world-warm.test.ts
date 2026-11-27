import { describe, expect, it, spyOn } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Costs } from '../src/costs';
import { ParseCache } from '../src/lang/parse-cache';
import { ModuleParser } from '../src/lang/module-parser';

// A new world started warm (AX-04: what a player gets; OR-144's Set out now): in a process that has started one
// already, a world of a seed never drawn, its Kyr written new, through its first screen and what it tells. The
// engine's start (layer A: drawing, composing, installing) and the first screen (layer B) apart; the parse of the
// new Kyr among the stages, said. 21 November: A 5.4-5.8 s and B 0.4 s here once a new world has been parsed before
// in the process (5.8-6.3 s before declarations were kept, DeclarationParses), parse 1.0 s of it; the budget is
// what a CI runner takes, with room, until AX-04's three seconds are reached.
class Warm {
  static readonly budget = process.env.CI ? { a: 16000, b: 2500 } : { a: 10000, b: 1500 };
  static readonly party = [{ name: 'Mira', raceId: 'human', classId: 'warrior' }];
  static async start(seed: string) {
    const mark = Costs.mark(), began = performance.now();
    const s = await DrawnWorld.start(seed, { origin: 'debt', party: Warm.party } as never, NodeBundleSource.shared);
    const a = performance.now() - began, shown = performance.now();
    Narrator.leaf(s.campaign, ScreenModel.build(s.campaign));
    const tally = Costs.since(mark);
    return { a: Math.round(a), b: Math.round(performance.now() - shown), parse: Math.round(tally.parse?.ms ?? 0),
      texts: tally.parse?.n ?? 0 };
  }
}

describe('a new world, warm', () => {
  it('starts within its budget, its new Kyr parsed among the stages', async () => {
    const tag = `warm${Date.now() % 1000000}`;
    await Warm.start('a1');
    await Warm.start(`${tag}-x`);
    const contexts = new Map<string, Parameters<typeof ModuleParser.chunkedWithin>[0]>(), get = ParseCache.get;
    const looked = spyOn(ParseCache, 'get').mockImplementation((context, key) => {
      const found = get.call(ParseCache, context, key);
      if (!found) { contexts.set(key, context.fork()); }
      return found;
    });
    const kept = spyOn(ParseCache, 'set');
    const run = await Warm.start(`${tag}-y`);
    const texts = kept.mock.calls.map(([, key]) => {
      const [, text, declared] = key.split('\u0000');
      const context = contexts.get(key);
      if (!context || text === undefined) { throw new Error('No context captured for a new parse'); }
      return { context, text,
        declared: declared ? JSON.parse(declared) as Parameters<typeof ModuleParser.chunkedWithin>[2] : [] };
    });
    kept.mockRestore();
    looked.mockRestore();
    console.log(`  a new world, warm: A ${run.a} ms, B ${run.b} ms, parse ${run.parse} ms of ${run.texts} new texts`);
    expect(run.texts).toBeGreaterThan(10);
    expect(run.texts).toBeLessThan(80);
    expect(run.a).toBeLessThan(Warm.budget.a);
    expect(run.b).toBeLessThan(Warm.budget.b);
    // Its new texts, each parsed a declaration at a time where it splits so, are what their whole parse makes.
    const differ = texts.filter(({ context, text, declared }) => {
      const split = ModuleParser.chunkedWithin(context.fork(), text, declared);
      if (!split) { return false; }
      const whole = ModuleParser.wholeWithin(context.fork(), text, declared);
      return JSON.stringify(split) !== JSON.stringify(whole);
    });
    expect(differ.length).toBe(0);
    const splitCount = texts.filter(({ context, text, declared }) =>
      ModuleParser.chunkedWithin(context.fork(), text, declared)).length;
    expect(splitCount).toBeGreaterThan(texts.length / 2);
  }, 240000);
});
