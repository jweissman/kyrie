import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';

// What is out in the country round a town, asked at its inn (the owner's own session, 7 November: "It seems galling I
// can't find anything or start quests or just find a dungeon and fight things"): a fresh company's map had held one
// cave not made out, and a country's eleven sites were heard of only by asking after each by a name nobody had said.
class Country {
  static marks(s: PlaySession) {
    const land = ScreenModel.build(s.campaign).region?.land as { marks: { name: string; state: string }[] } | undefined;
    return (land?.marks ?? []).filter(m => m.state !== 'unknown');
  }
}

describe('what is out in the country round', () => {
  it('is told at the inn: the nearest old places, on the map with the way to each, to set out for', async () => {
    for (const seed of ['kite', 'a1']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
        party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const s = await PlaySession.start(w.path, seed, w.source);
      GeneratedWorld.put(s, 's1_taproom');
      await s.leg('wait');
      const before = Country.marks(s).length;
      const ask = PlayerView.choices(s.campaign).find(c => / what is out in the country round$/.test(c.choice.name));
      expect(ask).toBeDefined();
      const told = await s.leg(ask!.choice.id) as { response?: string };
      expect(told.response).toMatch(/Nobody goes to them that has any sense/);
      const sites = w.report.region.sites.map(x => x.name);
      const heard = Country.marks(s).filter(m => sites.includes(m.name));
      expect(Country.marks(s).length).toBeGreaterThanOrEqual(before + 3);
      expect(heard.length).toBeGreaterThanOrEqual(3);
      // And there is a way to set out on toward one, out of doors in the town (the journeys the map offers).
      GeneratedWorld.put(s, 's1_green');
      await s.leg('wait');
      const dests = (ScreenModel.build(s.campaign).destinations ?? []).map(d => d.name);
      expect(heard.some(m => dests.some(d => d.includes(m.name)))).toBe(true);
    }
  }, 300000);
});
