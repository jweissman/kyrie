import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RegionShops } from '../src/world/region-shops';
import { GeneratedWorld } from './support/generated';
import type { Region } from '../src/world/region-writer';

// A town keeps one of Orsino's shops beside its own merchant (a market town two): b2's town, a fort on the pass,
// keeps an armourer, who sells what Orsino's armoury sells (Kyr's armour of its kinds) at what it is worth.
describe("a town's shops", () => {
  it('are kept by someone of the town, and sell what the shop sells', async () => {
    const w = await WorldAssembler.assemble('b2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const region = w.report.region as Region, kinds = RegionShops.chosen(region, 0);
    expect(kinds.length).toBeGreaterThan(0);
    expect(region.settlements.slice(1).every((s, i) => s.size === 'town' || !RegionShops.chosen(region, i + 1).length))
      .toBe(true);
    const s = await PlaySession.start(w.path, 'b2', w.source), shop = `${region.settlements[0]!.id}_${kinds[0]}`;
    GeneratedWorld.put(s, shop);
    await s.perform('wait');
    const buy = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(`buy_item(region__${shop}_keeper_`))!;
    expect(buy).toBeDefined();
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await s.perform(buy.choice.id);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBeLessThan(gold);
  }, 60000);
});
