import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RegionGeography } from '../src/world/region-geography';

// Generated regions as economies: each settlement's trade gives it its own kind of merchant (Deem's merchantType),
// and a band that makes a road its own (the toll-road kit) is felt in the inns at either end, through the same
// shared facts the Varrow uses: tolls, credit, owes, losses.
class Economy {
  static async start(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    return { w, s: await PlaySession.start(w.path, seed, w.source) };
  }
  static num(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  // Where the toll-road kit was placed: the way it holds, the settlement whose inn feeds the keepers, and the road's
  // two ends.
  static async toll(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const c = await ModuleBundle.campaign(w.path, w.source, seed);
    const b = c.composition!.placements.find(p => p.kit === 'toll_road')!.bindings;
    const road = RegionGeography.roads(w.report.region).find(r => `region__${r.way}` === b.post)!;
    return { way: road.way, market: b.market!.replace('region__', '').replace('_green', ''), from: road.from.id,
      to: road.to.id,
      elsewhere: w.report.region.settlements.find(t => ![road.from.id, road.to.id].includes(t.id))!.id };
  }
}

describe('generated campaigns', () => {
  it('differ in more than names: their merchants, who tolls which road, who raids whom, who puts a price on whom',
    async () => {
    const shapes = await Promise.all(['thorn', 'ash', 'brine', 'ember'].map(async seed => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
      const c = await ModuleBundle.campaign(w.path, w.source, seed);
      return JSON.stringify({ terrain: w.report.region.terrain,
        merchants: w.report.region.settlements.map(s => s.merchantType),
        kits: c.composition!.placements.map(p => [p.kit, p.choices, p.bindings]) });
    }));
    expect(new Set(shapes).size).toBe(4);
  }, 120000);
  it('gives a settlement the merchant its trade supports: a smith where slate is worked, a salter on the salt-marsh',
    async () => {
    const [mountain, marsh] = await Promise.all([WorldAssembler.assemble('ash', NodeBundleSource.shared),
      WorldAssembler.assemble('thorn', NodeBundleSource.shared)]);
    expect(mountain.report.region.settlements.filter(s => ['slate', 'tin'].includes(s.trade)).map(s => s.merchantType))
      .toEqual(expect.arrayContaining(['smith']));
    expect(marsh.report.region.settlements.find(s => ['salt', 'eels'].includes(s.trade))?.merchantType).toBe('salter');
  }, 60000);
  it('makes the inns at either end of a tolled road dearer, stops the company there, and remembers one that runs it',
    async () => {
    // Ash: deserters keep a road that crosses a river, and buy their bread at the inn of the town at one end.
    const toll = await Economy.toll('ash'), { s } = await Economy.start('ash');
    const [way, from, to] = [`region__${toll.way}`, toll.from, toll.to];
    const base = Economy.num(s, 'goodsPrice', `region__${toll.elsewhere}_innkeeper`, 'rations');
    await s.perform('wait');
    expect(Economy.fact(s, 'tolls', 'tollKeepers__keepers', way)).toBe(true);
    expect(Economy.num(s, 'goodsPrice', `region__${from}_innkeeper`, 'rations')).toBeGreaterThan(base);
    expect(Economy.num(s, 'goodsPrice', `region__${toll.elsewhere}_innkeeper`, 'rations')).toBe(base);
    Economy.put(s, `region__${from}_green`);
    const stopped = await s.perform(`go(region__road_${from}_${to},${way})`);
    expect((stopped.perceptions ?? []).map(p => p.text).join(' ')).toContain('Six coin, the lot of you');
    expect(Economy.legal(s)).toContain(`tollKeepers__pay_toll(party,${way})`);
    // Walking on without paying: the deserters remember, and set on the company when it comes back.
    await s.perform(`go(region__road_${from}_${to}_on,region__${to}_green)`);
    expect(Economy.fact(s, 'hostile', 'tollKeepers__chief', 'party')).toBe(true);
  }, 120000);
  it('buys the deserters\' bread on credit at the inn; bought empty, the inn is robbed in the night', async () => {
    const { market } = await Economy.toll('ash'), fed = await Economy.start('ash');
    for (let h = 0; h < 72; h++) { await fed.s.perform('wait_hour'); }
    expect(Economy.num(fed.s, 'owes', 'tollKeepers__chief', `region__${market}_innkeeper`)).toBeGreaterThan(0);
    const starved = await Economy.start('ash');
    Economy.put(starved.s, `region__${market}_taproom`);
    // They start with three rations and eat one a night: by the fourth night they need bread.
    for (let h = 0; h < 100; h++) {
      for (let id; (id = Economy.legal(starved.s).find(x => x.startsWith(`buy_goods(rations,region__${market}_innkeeper)`)));) {
        await starved.s.perform(id);
      }
      await starved.s.perform('wait_hour');
    }
    expect(Economy.num(starved.s, 'losses', `region__${market}_green`)).toBeGreaterThanOrEqual(2);
  }, 240000);
});
