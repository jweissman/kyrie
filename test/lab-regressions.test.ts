import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../src/autoplay/run';
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
  // was drawn with no road west, and nothing for the road from thorn to come in at.
  it('crosses into the country east of thorn, where the land had no road west', async () => {
    const spec = { seed: 'thorn', origin: 'kin', policy: 'mixed' as const, steps: 4, keep: 4,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'cleric' } };
    const s = await AutoplayRun.start(spec);
    for (const command of ['go(region__s5_approach_way,region__s5_green)', 'go(region__road_s5_s3,region__s5_s3_way)',
      'go(region__road_s5_s3_on,region__s3_green)', 'go(region__edge_east_road,region__edge_east)']) {
      await s.perform(command);
    }
    expect(s.campaign.installed).toContain('x1y0');
    expect(s.campaign.module.entities.some(e => e.id === 'x1y0__edge_west')).toBe(true);
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
    const waited = await s.perform('wait');
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
