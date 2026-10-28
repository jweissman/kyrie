import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RegionGeography } from '../src/world/region-geography';
import { GeneratedWorld } from './support/generated';

// A toll can be talked down as well as paid or run (the play-structure investigation's PT-14: there was no talking down
// a toll): the deserters told their war is over, the reeve told the company is on the lord's business. Said well, the
// company goes by for nothing, this once; said badly, it is not heard twice, and the toll is still asked.
class Toll {
  static async stopped(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    const placed = (await ModuleBundle.campaign(w.path, w.source, seed)).composition!.placements
      .find(p => p.kit === 'toll_road')!.bindings;
    const road = RegionGeography.roads(w.report.region).find(r => `region__${r.way}` === placed.post)!;
    const s = await PlaySession.start(w.path, seed, w.source), way = `region__${road.way}`;
    GeneratedWorld.put(s, `${road.from.id}_green`);
    await s.perform(`go(region__road_${road.from.id}_${road.to.id},${way})`);
    return { s, way, on: `go(region__road_${road.from.id}_${road.to.id}_on,region__${road.to.id}_green)` };
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
}

describe('a toll', () => {
  // Ash and Kite have deserters on the road, Larch and Thorn the lord's customs-men; a warrior is believed in the first
  // of each, not in the second.
  it('can be talked down: through for nothing if believed, and not heard twice if not', async () => {
    const outcomes = await Promise.all(['ash', 'kite', 'larch', 'thorn'].map(async seed => {
      const { s, way, on } = await Toll.stopped(seed), talk = `tollKeepers__talk_toll(party,${way})`;
      expect(Toll.legal(s)).toContain(talk);
      await s.perform(talk);
      if (Toll.fact(s, 'tolerates', 'tollKeepers__keepers', 'party')) {
        // Believed: the company goes on along the road, and has not run the toll.
        await s.perform(on);
        expect(Toll.fact(s, 'hostile', 'tollKeepers__chief', 'party')).toBe(false);
        return 'believed';
      }
      expect(Toll.legal(s)).not.toContain(talk);
      expect(Toll.legal(s)).toContain(`tollKeepers__pay_toll(party,${way})`);
      return 'not';
    }));
    expect(outcomes).toEqual(['believed', 'not', 'believed', 'not']);
  }, 240000);
});
