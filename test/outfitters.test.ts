import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Outfitters } from '../src/world/outfitters';
import { RegionShops } from '../src/world/region-shops';
import { GeneratedWorld } from './support/generated';
import type { Region } from '../src/world/region-writer';

// Rations, light, rope and a crowbar, found from a typical starting place without searching blindly through many
// shops (the owner's review of Mission 18): every village and town of a generated country has a chandler, its own
// merchant where that is its trade and otherwise a chandlery off its heart; and a town's other shops are never two of
// one family (a herb-wife's town had a dispensary and a potion-shop besides, and nowhere to buy rope).
describe('the outfitters of a generated country', () => {
  it.each(['kite', 'b2'])('in %s, sell what anyone setting out needs in every village and town', async seed => {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const region = w.report.region as Region, s = await PlaySession.start(w.path, seed, w.source);
    const towns = region.settlements.filter(t => t.size !== 'hamlet');
    expect(towns.length).toBeGreaterThan(0);
    for (const t of towns) {
      const keeper = `region__${t.id}_${Outfitters.needed(t) ? 'chandler' : 'merchant'}`;
      GeneratedWorld.put(s, s.campaign.world.one('at', keeper)!.replace(/^region__/, ''));
      await s.perform('wait');
      const sold = ScreenModel.build(s.campaign).trade.find(c => c.id === keeper)?.sells.map(x => x.name) ?? [];
      expect([t.name, sold]).toEqual([t.name, expect.arrayContaining(['Ration', 'Torch', 'Lantern',
        'Flask of lamp oil', 'Coil of rope', 'Crowbar'])]);
    }
    region.settlements.forEach((_, i) => {
      const families = RegionShops.chosen(region, i).map(k => RegionShops.families[k] ?? k);
      expect([new Set(families).size, families.includes('general')]).toEqual([families.length, false]);
    });
  }, 180000);
});
