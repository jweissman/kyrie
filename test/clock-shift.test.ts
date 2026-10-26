import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';

// A module installed after a campaign began counts its days from the first morning after it was installed (see
// placed-days.test.ts for why a morning). Eighteen days in, the country east of the march is drawn when the company
// first stands there: beyond b2, with a child sick of a fever that kills her on the tenth day of its own telling,
// alive when the company arrives; beyond g7, with a brood that raids by its own clock (east of a fen like a1 lies
// Tessary now, an authored country).
class Late {
  static readonly fixed = /"name":"watch","args":\["clock"\]\},"right":\{"kind":"number","value":(\d+)/;
  static readonly own = new RegExp(String.raw`"op":"-","left":\{"kind":"call","name":"watch","args":\["clock"\]\},`
    + String.raw`"right":\{"kind":"number","value":(\d+)`);
  static async beyond(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    (s.campaign as unknown as { current: { elapsed: number } }).current.elapsed = 18 * 144;
    GeneratedWorld.put(s, 'edge_east');
    await s.perform('wait');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    return s;
  }
  // A module of timers, read every way (see the last case).
  static readonly files: Record<string, string> = {
    'cs/a/site.kyr': `Module a "A" { Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
      Company party "You" of 1 at room. Goal false. }`,
    'cs/a/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
    'cs/b/site.kyr': `Module b "B" { Place yard "Yard" is site.
      Relation r_literal(). Relation r_query(). Relation r_arith(). Relation r_measure(). Relation r_set().
      Measure dueAt(place). Measure dueAt2(place). Measure setAt(place).
      Initially Set dueAt(yard) to 20. Initially Set dueAt2(yard) to 20. Initially Set setAt(yard) to watch(clock) + 20.
      Query late() means watch(clock) >= 20.
      Rule literal when watch(clock) >= 20 { Assert r_literal(). }
      Rule viaquery when late() { Assert r_query(). }
      Rule arith when watch(clock) >= dueAt(yard) - 0 { Assert r_arith(). }
      Rule measure when watch(clock) >= dueAt2(yard) { Assert r_measure(). }
      Rule set when watch(clock) >= setAt(yard) { Assert r_set(). }
      Goal false. }`,
    'cs/b/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }),
    'cs/a.campaign.json': JSON.stringify({ version: 1, name: 'a', modules: [{ id: 'a', bundle: 'a/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
  };
  static fired(c: Campaign): string[] {
    return ['r_literal', 'r_query', 'r_arith', 'r_measure', 'r_set']
      .filter(n => c.world.test(ModuleWriter.call(`b__${n}`)));
  }
  static until(c: Campaign, watch: number) {
    while (c.readout.elapsed < watch) { c.execute(c.offered().find(o => o.schema === 'wait_hour')!.id); }
  }
}
describe('a module installed late', () => {
  it('counts a fever\'s days from when it was installed', async () => {
    const s = await Late.beyond('b2');
    const timed = (s.campaign.module.rules ?? []).filter(r => r.id.startsWith('x1y0fever')
      && Late.fixed.test(JSON.stringify(r.when)));
    expect(timed.length).toBeGreaterThan(0);
    for (const rule of timed) {
      expect(Number(Late.fixed.exec(JSON.stringify(rule.when))![1])).toBeGreaterThan(18 * 144);
    }
    const said = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(said.perceptions?.some(p => /has died/.test(p.text)) ?? false).toBe(false);
  }, 120000);
  it('counts its own time from when it was installed', async () => {
    const s = await Late.beyond('g7'), fixed = Late.fixed;
    // What was installed with the campaign keeps the times it was written with.
    const home = (s.campaign.module.rules ?? [])
      .filter(r => !/^(x1y0|link)/.test(r.id) && fixed.test(JSON.stringify(r.when)));
    expect(home.length).toBeGreaterThan(0);
    for (const rule of home) { expect(Number(fixed.exec(JSON.stringify(rule.when))![1])).toBeLessThan(18 * 144); }
    // And a measure it starts, which the clock is compared with, is compared with its own watch: the watches since
    // that morning.
    const raiding = (s.campaign.module.rules ?? [])
      .filter(r => r.id.startsWith('x1y0brood') && Late.own.test(JSON.stringify(r.when)));
    expect(raiding.length).toBeGreaterThan(0);
    for (const rule of raiding) {
      expect(Number(Late.own.exec(JSON.stringify(rule.when))![1])).toBeGreaterThanOrEqual(18 * 144);
    }
    const said = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(said.perceptions?.some(p => /has died|gone out on the road alone/.test(p.text)) ?? false).toBe(false);
  }, 120000);
});

// A module installed after the game began reads the clock's watch as its own, counted from the next morning, however it
// reads it (the architecture review's A14, from its probe state-clockshift): installed at watch 300, its timers for
// its own watch 20 (452) fired at once where they were read through a query or in arithmetic.
describe('a module installed late, however it reads the watch', () => {
  it('counts its time from the next morning', async () => {
    const overlay = new OverlayBundleSource(NodeBundleSource.shared, Late.files);
    const c = (await PlaySession.start(overlay.resolve('cs/a.campaign.json'), 'seed', overlay)).campaign;
    Late.until(c, 300);
    await c.install({ id: 'b', bundle: overlay.resolve('cs/b/module.json') }, overlay);
    c.execute(c.offered().find(o => o.schema === 'wait')!.id);
    expect(Late.fired(c)).toEqual([]);
    // Its own watch 20 is the first morning after (432) and 20 watches on: not an hour before, and by then all of them.
    Late.until(c, 444);
    expect(Late.fired(c)).toEqual([]);
    Late.until(c, 452);
    expect(Late.fired(c)).toEqual(['r_literal', 'r_query', 'r_arith', 'r_measure', 'r_set']);
  }, 120000);
});
