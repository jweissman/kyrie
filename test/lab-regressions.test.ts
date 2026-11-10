import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../src/autoplay/run';
import { Frontier } from '../src/world/frontier';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Atlases } from '../src/world/land/atlas';
import { RandomStreams } from '../src/random-streams';
import { WorldGrid } from '../src/world/world-grid';
import type { Region } from '../src/world/region-writer';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { Borders } from '../src/world/land/borders';
import { Terrain } from '../src/world/land/terrain';
import { Settling } from '../src/world/land/settling';
import { Roads } from '../src/world/land/roads';

// Failures the autoplay laboratory found (scripts/autoplay.ts), kept as it made them small: each is the seed, the
// company and the fewest commands that brought it, played again through the game's own offered commands.
describe('what the autoplay laboratory found', () => {
  // thorn, a cleric come home (kin), mixed temper, step 53 of 150: going out to the eastern march-stone, the road
  // across the march could not come in to the country drawn beyond it ("Unresolved module import there:
  // x1y0.edge_west"). Loftymoor's one western town had a wall of peaks between it and its western edge, so the land
  // was drawn with no road west, and nothing for the road from thorn to come in at. East of every first country is
  // the Eastern Ocean now (see WorldShape), where Loftymoor had been: its land, as its seed lays it, still has a road
  // on every side; and the cell is refused plainly, not drawn, as the sea it is.
  it('lays the land at thorn\'s east with a road on every side, where it had none west, and draws no country there',
    async () => {
      const key = RandomStreams.key(WorldGrid.seed('thorn', 1, 0), 'world', 'land');
      const atlas = Atlases.make(key, 'mountain', { tongue: 'westron', taken: [] });
      expect(atlas.borders.map(b => b.side).sort()).toEqual(['east', 'north', 'south', 'west']);
      const s = await AutoplayRun.start({ seed: 'thorn', origin: 'kin', policy: 'mixed', steps: 1, keep: 1,
        frontier: false, protagonist: { name: 'Wenna', raceId: 'human', classId: 'cleric' } });
      const frontier = new Frontier('thorn', NodeBundleSource.shared) as unknown as { drawn(c: unknown, x: number,
        y: number): Promise<{ region: Region }> };
      await expect(frontier.drawn(s.campaign, 1, 0)).rejects.toThrow('x1y0 is the Eastern Ocean, crossed by ship');
    }, 180000);
  // thorn, a careful cleric (the laboratory's expedition), step 96: Sir Hamo's men held the company up on the road
  // ("Road-money, in Sir Hamo's name: five crowns") and came at it with swords in the same breath, before it could pay.
  // The company had once gone up to the hold, where the sentry's horn roused Sir Hamo; a roused hold's men turned out
  // on whoever was with them, on the road as at the hold.
  it('lets a company held up on the road pay, though the hold was once roused', async () => {
    const s = await AutoplayRun.start({ seed: 'thorn', origin: 'wanderer', policy: 'fight', steps: 1, keep: 0,
      frontier: false, protagonist: { name: 'Wenna', raceId: 'human', classId: 'cleric' } }), c = s.campaign;
    const road = c.world.related('tolls').find(r => r.args[0] === 'raidersFolk__band')!.args[1]!;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    held.commit(held.world.apply([['retract', 'at', 'party', c.world.one('at', 'party')!], ['assert', 'at', 'party', road],
      ['assert', 'alarmed', 'raidersFolk__hamo'], ['retract', 'at', 'raidersFolk__band', 'raidersFolk__yard'],
      ['assert', 'at', 'raidersFolk__band', road], ['assert', 'raidersFolk__demanding', 'raidersFolk__band'],
      ['assert', 'halts', 'raidersFolk__band', 'party']].map(([kind, name, ...args]) =>
      ({ kind, call: ModuleWriter.call(name!, ...args) }))));
    const waited = await s.leg('wait');
    expect(waited.combat).toEqual([]);
    expect(PlayerView.choices(c).some(x => /pay_road_money\(/.test(x.choice.id))).toBe(true);
  }, 180000);
  // Every side of a land has its road out, whatever stands between its towns and that edge: of 160 lands drawn, these
  // two mountain countries had none west.
  it('gives every side of a land its road out', () => {
    for (const key of ['scan34', 'scan114']) {
      const land = Terrain.make(key, 'mountain'), seats = Settling.make(key, 'mountain', land);
      const roads = Roads.make(land, seats);
      expect(Borders.make(land, seats, new Set(roads.flatMap(r => r.cells))).map(b => b.side).sort())
        .toEqual(['east', 'north', 'south', 'west']);
    }
  });
});
