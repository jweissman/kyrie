import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Countries } from '../src/world/countries';
import { MapPlay } from './support/map-play';

// The Calf in the Tail-Race in a world that goes on: a province of the first country, as every adventure is (Mission
// 18's Gate B; test/small/every-adventure-placed), placed after the others so that no way in placed before moves. Its
// way in stands by the sea to the east, on meadow and heath, clear of every other; set out for on the map (ways to
// another hex are the map's alone, the owner, 25 November), its road is the loch road down to Tolt, with Mabet in the
// tail-race.
describe('The Calf in the Tail-Race, placed', () => {
  it('stands its way in on the first country\'s land, by the sea to the east, clear of the others', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('tailrace');
    expect(Countries.marches.some(c => c.id === 'tailrace')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared), all = w.report.region.provinces ?? [];
    const province = all.find(p => p.country === 'tailrace');
    expect(province?.name).toBe('the Tolt shore');
    expect(all.filter(p => p.gate.cell === province!.gate.cell).map(p => p.country)).toEqual(['tailrace']);
  }, 120000);
  it('is set out for on the map, and its road is the loch road down to Tolt', async () => {
    const j = await MapPlay.start('kite', 'debt');
    expect(await MapPlay.press(j, 'region__gate_tailrace')).toEqual({ to: 'region__gate_tailrace', arrived: true });
    expect(j.campaign.installed).toContain('ptailrace');
    const road = PlayerView.choices(j.campaign).find(x => x.choice.id.endsWith(',ptailrace__road)'));
    expect(road?.choice.id).toBeDefined();
    await j.session.leg(road!.choice.id);
    expect(MapPlay.at(j)).toBe('ptailrace__road');
    expect(j.campaign.module.entities.some(e => e.id === 'ptailrace__mabet')).toBe(true);
  }, 900000);
});
