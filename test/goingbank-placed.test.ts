import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';

// The Going Bank in a world that goes on: a province of the first country, as every adventure is (Mission 18's Gate B;
// test/small/every-adventure-placed), placed after the others so that no way in placed before moves. Its way in
// stands a little in from the north, on fell and heath, clear of every other; walked to, its road is the road up to
// Tarrow Lip, with the pinwright Varnish in the Long Pull.
describe('The Going Bank, placed', () => {
  it('stands its way in on the first country\'s land, in from the north, clear of the others', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('goingbank');
    expect(Countries.marches.some(c => c.id === 'goingbank')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared), all = w.report.region.provinces ?? [];
    const province = all.find(p => p.country === 'goingbank');
    expect(province?.name).toBe('the Gape country');
    expect(all.filter(p => p.gate.cell === province!.gate.cell).map(p => p.country)).toEqual(['goingbank']);
  }, 120000);
  it('is walked to, and its road is the road up to Tarrow Lip', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    await GeneratedWorld.travel(s, 'gate_goingbank');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installed).toContain('pgoingbank');
    const road = PlayerView.choices(s.campaign).find(x => x.choice.id.endsWith(',pgoingbank__road)'));
    expect(road?.choice.id).toBeDefined();
    await s.leg(road!.choice.id);
    expect(s.campaign.world.one('at', 'party')).toBe('pgoingbank__road');
    expect(s.campaign.module.entities.some(e => e.id === 'pgoingbank__varnish')).toBe(true);
  }, 900000);
});
