import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RegionShops } from '../src/world/region-shops';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import type { Region } from '../src/world/region-writer';

// A town keeps one of Orsino's shops beside its own merchant (a market town two), never of the family its merchant
// already sells (Mission 18: a herb-wife's town had a dispensary and a potion-shop besides); each is kept by someone
// of its town and sells what Orsino says its kind sells, at what it is worth.
describe("a town's shops", () => {
  it('are kept by someone of the town, and sell what the shop sells', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const region = w.report.region as Region, kinds = RegionShops.chosen(region, 0);
    expect(kinds.length).toBeGreaterThan(0);
    expect(region.settlements.slice(1).every((s, i) => s.size === 'town' || !RegionShops.chosen(region, i + 1).length))
      .toBe(true);
    // The first of the country's shops whose cheapest ware a wanderer can buy.
    const shops = region.settlements.flatMap((t, i) => RegionShops.chosen(region, i).map(k => ({ id: `${t.id}_${k}`, k })));
    const shop = shops.find(x => Math.min(...RegionShops.stocks[x.k]!.stock.map(([, fee]) => fee)) <= 12)!.id;
    const s = await PlaySession.start(w.path, 'kite', w.source);
    GeneratedWorld.put(s, shop);
    await s.perform('wait');
    const buy = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(`buy_item(region__${shop}_keeper_`))!;
    expect(buy).toBeDefined();
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await s.perform(buy.choice.id);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBeLessThan(gold);
  }, 60000);
  // A general store had the eight cheapest things of its kinds by name, a bedroll, a bell, dice and firewood, and no
  // light, rope or crowbar (M18-06): what anyone setting out needs comes first.
  it('a general store stocks the outfit first', () => {
    const stock = RegionShops.stocks.general!.stock.map(([what]) => what);
    expect(stock.slice(0, 5)).toEqual(['torch', 'candle', 'lantern', 'rope', 'crowbar']);
    expect(stock).not.toContain('dice');
  });
});

// What the company cannot afford is offered without its command, saying what it costs and what the company has:
// Tessary's draft for six coin was never offered to a player with five, and nothing was said (TS-W21, PRE-06).
describe('a purchase the company cannot afford', () => {
  it('is shown, and says what it costs and what the company has', async () => {
    const w = await WorldAssembler.assemble('mere', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'mere', w.source), c = s.campaign;
    GeneratedWorld.put(s, 's1_shop');
    await s.perform('wait');
    const cc = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    cc.commit(cc.world.apply([{ kind: 'set', call: ModuleWriter.call('quantity', 'party', 'gold'),
      value: { kind: 'number', value: 3 } }]));
    const lantern = ScreenModel.build(c).things.find(t => t.name === 'a lantern')!;
    const leaf = lantern.acts.flatMap(a => a.children ?? [a])[0]!;
    expect([leaf.command, leaf.disabled]).toEqual([undefined, 'It costs 7 coin, and you have 3.']);
    expect(PlayerView.choices(c).some(x => x.choice.id.includes('lantern'))).toBe(false);
  }, 120000);
});
