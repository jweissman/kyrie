import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';

// Windfall in a world that goes on: a province of the first country, as every adventure is (Mission 18's Gate B;
// test/small/every-adventure-placed), placed after the others so that no way in placed before moves. Its way in stands
// by the sea to the east, on fen and meadow, clear of every other; walked to, its road is the sea-bank road into Hythe,
// with the Reeve's bailiff in the Spare Bucket.
describe('Windfall, placed', () => {
  it('stands its way in on the first country\'s land, by the sea to the east, clear of the others', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('windfall');
    expect(Countries.marches.some(c => c.id === 'windfall')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared), all = w.report.region.provinces ?? [];
    const province = all.find(p => p.country === 'windfall');
    expect(province?.name).toBe('the Saltings');
    expect(all.filter(p => p.gate.cell === province!.gate.cell).map(p => p.country)).toEqual(['windfall']);
  }, 120000);
  it('is walked to, and its road is the sea-bank road into Hythe', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    await GeneratedWorld.travel(s, 'gate_windfall');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installed).toContain('pwindfall');
    const road = PlayerView.choices(s.campaign).find(x => x.choice.id.endsWith(',pwindfall__road)'));
    expect(road?.choice.id).toBeDefined();
    await s.leg(road!.choice.id);
    expect(s.campaign.world.one('at', 'party')).toBe('pwindfall__road');
    expect(s.campaign.module.entities.some(e => e.id === 'pwindfall__harrowby')).toBe(true);
  }, 900000);
});
