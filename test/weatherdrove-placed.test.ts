import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { GeneratedWorld } from './support/generated';

// The Weather Drove in a world that goes on (the coordinator's call, 24 November: batch 13 had integrated it with no
// world reaching it). A province of the first country, as every adventure is (Mission 18's Gate B), its way in on the
// country's own land a little in from the south, on dry heath and fell toward the Great Desert two countries south
// (the Sere country is a march's land; no adventure is a country beyond a march). An ordinary protagonist walks to
// its way in, and the road on comes into the salt road above Wickering, where Hannibal Muckle is.
describe('the Weather Drove, placed', () => {
  it('stands its way in on the first country\'s land, in from the south, clear of the others', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('weatherdrove');
    expect(Countries.marches.some(c => c.id === 'weatherdrove')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared);
    const province = w.report.region.provinces?.find(p => p.country === 'weatherdrove');
    expect(province?.name).toBe('the Sere country');
    for (const other of w.report.region.provinces?.filter(p => p.country !== 'weatherdrove') ?? []) {
      expect(other.gate.cell).not.toBe(province!.gate.cell);
    }
  }, 120000);
  it('is walked to, and its road comes into the salt road above Wickering', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    await GeneratedWorld.travel(s, 'gate_weatherdrove');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installed).toContain('pweatherdrove');
    const road = PlayerView.choices(s.campaign).find(x => x.choice.id.endsWith(',pweatherdrove__road)'));
    expect(road?.choice.id).toBeDefined();
    await s.leg(road!.choice.id);
    expect(s.campaign.world.one('at', 'party')).toBe('pweatherdrove__road');
    expect(s.campaign.module.entities.some(e => e.id === 'pweatherdrove__muckle')).toBe(true);
  }, 900000);
});
