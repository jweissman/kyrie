import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Countries } from '../src/world/countries';
import { Provinces } from '../src/world/provinces';
import { Terrain } from '../src/world/land/terrain';
import { RegionGeography } from '../src/world/region-geography';
import { MapPlay } from './support/map-play';

// Over Exall in a world that goes on: a province of the first country, as every adventure is
// (test/small/every-adventure-placed), placed after the others so that no way in placed before moves. Its way in
// stands to the north, on heath and fell, clear of the others and never in the first town's own country (the owner,
// 26 November: what is integrated is found by travel, not at the start); set out for on the map (ways to another hex
// are the map's alone), its road is the Edge road up to Exall, under the whale.
describe('Over Exall, placed', () => {
  it('stands its way in to the north, clear of the others, and away from the first town', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('overexall');
    expect(Countries.marches.some(c => c.id === 'overexall')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared), all = w.report.region.provinces ?? [];
    const province = all.find(p => p.country === 'overexall');
    expect(province?.name).toBe('the Brackmoor');
    expect(all.filter(p => p.gate.cell === province!.gate.cell).map(p => p.country)).toEqual(['overexall']);
    for (const seed of ['kite', 'a1', 'b2', 'debt']) {
      const region = WorldAssembler.region(seed, [0, 0]), town = region.settlements[0]!;
      const gate = Provinces.situate(region).find(p => p.country === 'overexall')!.gate;
      expect(Terrain.distance(RegionGeography.atlas(region).land, town.cell!, gate.cell)).toBeGreaterThanOrEqual(4);
      expect(gate.road.cells[0]).not.toBe(town.cell);
    }
  }, 120000);
  it('is set out for on the map, and its road is the Edge road up to Exall', async () => {
    const j = await MapPlay.start('kite', 'debt');
    expect(await MapPlay.press(j, 'region__gate_overexall')).toEqual({ to: 'region__gate_overexall', arrived: true });
    expect(j.campaign.installed).toContain('poverexall');
    const road = PlayerView.choices(j.campaign).find(x => x.choice.id.endsWith(',poverexall__road)'));
    expect(road?.choice.id).toBeDefined();
    await j.session.leg(road!.choice.id);
    expect(MapPlay.at(j)).toBe('poverexall__road');
    expect(j.campaign.module.entities.some(e => e.id === 'poverexall__dorcas')).toBe(true);
  }, 900000);
});
