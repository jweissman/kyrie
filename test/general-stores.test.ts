import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneralStores } from '../src/world/general-stores';
import { Foundings } from '../src/world/founding';
import { GeneratedWorld } from './support/generated';
import type { Region, Settlement } from '../src/world/region-writer';

// Market towns should make ordinary gear and clothing reasonably purchasable, through suitable shops and tradespeople,
// and what they stock should answer to the settlement's size, its economy and its circumstances, rather than be the
// same everywhere (the owner, 7 November). The general family of Orsino's shops had never opened, so clothing, the
// tent, a backpack, ale and wine were only ever found (the item audit's G3).
class Country {
  static readonly seeds = ['kite', 'b2', 'wren', 'thorn', 'mere', 'c3', 'a1', 'd4'];
  static regions(): Region[] { return this.seeds.map(seed => WorldAssembler.region(seed, [0, 0])); }
  static market(region: Region): number[] {
    return region.settlements.flatMap((s, i) => s.size === 'town' && Foundings.of(region, i).kind === 'market' ? [i] : []);
  }
  static sold(region: Region, i: number): string[] {
    return GeneralStores.kinds(region, i).flatMap(k => GeneralStores.shelves(region, i, k).map(([what]) => what));
  }
}

describe("a country's general stores and clothiers", () => {
  it('in a market town, in every seed that has one, sell clothing and ordinary gear', () => {
    const markets = Country.regions().flatMap(r => Country.market(r).map(i => ({ r, i })));
    expect(markets.length).toBeGreaterThanOrEqual(2);
    for (const { r, i } of markets) {
      expect(GeneralStores.kinds(r, i)).toEqual(['general', 'clothier']);
      expect([r.settlements[i]!.name, Country.sold(r, i)]).toEqual([r.settlements[i]!.name,
        expect.arrayContaining(['tunic', 'cloak', 'boots', 'backpack', 'tent', 'blanket', 'ale'])]);
      // At what each is worth, or a little less where the town makes it.
      for (const [what, fee] of GeneralStores.kinds(r, i).flatMap(k => GeneralStores.shelves(r, i, k))) {
        expect(fee).toBeGreaterThanOrEqual(1);
        expect(fee).toBeLessThanOrEqual(10);
        expect(what).toBeTruthy();
      }
    }
  });
  it('sell less the smaller the place: a town less than a market town, a village a little, a hamlet nothing', () => {
    const regions = Country.regions(), size = (kind: string) => regions.flatMap(r => r.settlements
      .flatMap((s, i) => s.size === 'town' && (Foundings.of(r, i).kind === 'market') === (kind === 'market')
        ? [GeneralStores.shelves(r, i, 'general').length] : []));
    const [market, town] = [size('market'), size('town')];
    expect(town.length).toBeGreaterThan(0);
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(mean(town)).toBeLessThan(mean(market));
    // And every town sells something to wear, clothier or none.
    for (const r of regions) {
      r.settlements.forEach((s, i) => {
        if (s.size === 'town') { expect(Country.sold(r, i)).toEqual(expect.arrayContaining(['tunic', 'shoes', 'cloak'])); }
      });
    }
    const all = regions.flatMap(r => r.settlements.map((s, i) => ({ r, s, i })));
    const village = all.find(x => x.s.size === 'village')!, hamlet = all.find(x => x.s.size === 'hamlet')!;
    expect(GeneralStores.kinds(village.r, village.i)).toEqual([]);
    expect(GeneralStores.village(village.r, village.s, []).map(([what]) => what))
      .toEqual(expect.arrayContaining(['tunic', 'shoes', 'cloak']));
    expect(GeneralStores.village(village.r, village.s, []).length).toBeLessThanOrEqual(Math.min(...town));
    expect([GeneralStores.kinds(hamlet.r, hamlet.i), GeneralStores.village(hamlet.r, hamlet.s, [])]).toEqual([[], []]);
  });
  it('stock by the trade of the place: two towns of different trades sell differently, each its own trade cheaper', () => {
    const region = Country.regions()[0]!, base = region.settlements.findIndex(s => s.size === 'town');
    const at = (trade: string) => ({ ...region, settlements: region.settlements
      .map((s, i) => i === base ? { ...s, trade } as Settlement : s) }) as Region;
    const [slate, eels] = [GeneralStores.shelves(at('slate'), base, 'general'), GeneralStores.shelves(at('eels'), base, 'general')];
    expect(slate.map(([what]) => what)).toEqual(expect.arrayContaining(['chalk', 'hammer', 'piton']));
    expect(eels.map(([what]) => what)).toEqual(expect.arrayContaining(['fish_hook', 'fishing_net', 'twine']));
    expect(new Set(eels.map(([what]) => what))).not.toEqual(new Set(slate.map(([what]) => what)));
    const net = eels.find(([what]) => what === 'fishing_net')!, elsewhere = slate.find(([what]) => what === 'fishing_net');
    expect(net[1]).toBeLessThan(3);
    if (elsewhere) { expect(elsewhere[1]).toBe(3); }
    // A wool town keeps a clothier though it is no market town, and its blankets and cloaks are its own.
    const wool = at('wool'), market = Foundings.of(wool, base).kind === 'market';
    expect(GeneralStores.kinds(wool, base)).toContain('clothier');
    expect(GeneralStores.shelves(wool, base, 'clothier').find(([what]) => what === 'blanket')).toBeDefined();
    if (!market) { expect(GeneralStores.kinds(at('slate'), base)).toEqual(['general']); }
  });
  it('are in the world, kept by someone of the town, and sell a cloak to whoever can pay', async () => {
    const seed = Country.seeds.find(x => Country.market(WorldAssembler.region(x, [0, 0])).length)!;
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const region = w.report.region as Region, i = Country.market(region)[0]!, s = region.settlements[i]!;
    const session = await PlaySession.start(w.path, seed, w.source);
    GeneratedWorld.put(session, `${s.id}_clothier`);
    await session.perform('wait');
    const buy = PlayerView.choices(session.campaign)
      .find(c => c.choice.id.startsWith(`buy_item(region__${s.id}_clothier_keeper_`) && c.choice.id.includes('cloak'));
    expect(buy).toBeDefined();
    const gold = session.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await session.perform(buy!.choice.id);
    expect(session.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBeLessThan(gold);
  }, 180000);
});
