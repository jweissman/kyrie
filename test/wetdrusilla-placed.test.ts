import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Countries } from '../src/world/countries';
import { Provinces } from '../src/world/provinces';
import { Terrain } from '../src/world/land/terrain';
import { RegionGeography } from '../src/world/region-geography';
import { MapPlay } from './support/map-play';

// Wet Drusilla in a world that goes on: a province of the first country, as every adventure is
// (test/small/every-adventure-placed), placed after the others so that no way in placed before moves. Its way in
// stands to the south, where the road gives out into white sand, clear of the others and never in the first town's
// own country (the owner, 26 November: what is integrated is found by travel, not at the start); set out for on the
// map (ways to another hex are the map's alone), its road is the Quay road down to Dryquay.
describe('Wet Drusilla, placed', () => {
  it('stands its way in to the south, clear of the others, and away from the first town', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('wetdrusilla');
    expect(Countries.marches.some(c => c.id === 'wetdrusilla')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared), all = w.report.region.provinces ?? [];
    const province = all.find(p => p.country === 'wetdrusilla');
    expect(province?.name).toBe('the Ebb');
    expect(all.filter(p => p.gate.cell === province!.gate.cell).map(p => p.country)).toEqual(['wetdrusilla']);
    for (const seed of ['kite', 'a1', 'b2', 'debt']) {
      const region = WorldAssembler.region(seed, [0, 0]), town = region.settlements[0]!;
      const gate = Provinces.situate(region).find(p => p.country === 'wetdrusilla')!.gate;
      expect(Terrain.distance(RegionGeography.atlas(region).land, town.cell!, gate.cell)).toBeGreaterThanOrEqual(4);
      expect(gate.road.cells[0]).not.toBe(town.cell);
    }
  }, 120000);
  it('is set out for on the map, and its road is the Quay road down to Dryquay', async () => {
    const j = await MapPlay.start('kite', 'debt');
    expect(await MapPlay.press(j, 'region__gate_wetdrusilla')).toEqual({ to: 'region__gate_wetdrusilla', arrived: true });
    expect(j.campaign.installed).toContain('pwetdrusilla');
    const road = PlayerView.choices(j.campaign).find(x => x.choice.id.endsWith(',pwetdrusilla__road)'));
    expect(road?.choice.id).toBeDefined();
    await j.session.leg(road!.choice.id);
    expect(MapPlay.at(j)).toBe('pwetdrusilla__road');
    expect(j.campaign.module.entities.some(e => e.id === 'pwetdrusilla__pomfret')).toBe(true);
  }, 900000);
});
