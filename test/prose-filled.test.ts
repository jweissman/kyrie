import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ProseLint } from '../src/presentation/prose-lint';
import type { Module } from '../src/lang/module';

// The prose lint over a world drawn fresh (doc/authoring/plain-prose.md; test/small/prose-lint reads the recorded
// first hour): every narrated string of the module a generated country is written as, its templates filled with the
// country's own names, read for the faults that show only once filled (a word said twice across a slot's edge, "a"
// before a filled vowel, a sentence begun in lower case, a space before a stop), in its authored modules too. A slot
// the engine fills as it tells ({recipient}, {Actor}) is the narrator's, filled at play, and is passed over here.
class Filled {
  // What the narrator does to every line as it tells it (ObservationText.render capitalises each sentence's start),
  // and a slot it fills then; the recorded pages of test/small/prose-lint hold both as told.
  static readonly rendered = new Set(['unfilled slot', 'lower case after a stop']);
  static texts(m: Module): { id: string; text: string }[] {
    return [
      ...(m.observations ?? []).map(o => ({ id: o.id, text: o.text })),
      ...(m.rules ?? []).filter(r => r.say).map(r => ({ id: r.id, text: r.say! })),
      ...m.actions.flatMap(a => [a.report, a.otherwise, ...(a.told ?? []).map(t => t.text)].filter(Boolean)
        .map(text => ({ id: a.schema ?? a.id, text: text! })))];
  }
  static async faults(seed: string, origin: string): Promise<string[]> {
    const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    return this.texts(s.campaign.module).flatMap(t => ProseLint.filled(t.text.replace(/\{[^}]*\}/g, 'Wenna'), false)
      .filter(f => !Filled.rendered.has(f.rule)).map(f => `${t.id}: ${f.rule} "${f.match}" in ${t.text.slice(0, 100)}`));
  }
}
describe('the prose lint, over a world drawn fresh', () => {
  it('finds no fault in what a1 holds, its templates filled', async () => {
    expect(await Filled.faults('a1', 'courier')).toEqual([]);
  }, 120000);
  it('finds none in Iscoed, the fen of the atlas, begun on the drove', async () => {
    expect(await Filled.faults('iscoed', 'drove')).toEqual([]);
  }, 120000);
});
