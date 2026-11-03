import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { Journey } from '../src/session/journey';
import { GeneratedWorld } from './support/generated';

// Ombra in a world that goes on: a province of the first country, its way in on the country's own land a little in
// from the west, with a road to it from the nearest town. In every town the Watch's notice is nailed up where
// travellers are kept, and whoever keeps them tells of it; once read or heard, the way in is on the map. An ordinary
// protagonist of the world walks there, the delta road comes down into the Gate of Strangers, and the Novena's days run
// from the morning after.
describe('Ombra, a province of the first country', () => {
  it('stands its way in on the country\'s land, and is not among the marches', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('ombra');
    expect(Countries.marches.some(c => c.id === 'ombra')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared);
    const province = w.report.region.provinces?.find(p => p.country === 'ombra');
    expect(province).toMatchObject({ name: 'Ombra', region: 'pombra__ombra_delta' });
    for (const other of w.report.region.provinces?.filter(p => p.country !== 'ombra') ?? []) {
      expect(other.gate.cell).not.toBe(province!.gate.cell);
    }
  }, 120000);

  it('the notice is nailed up in a town; read, the way in is on the map; walked to, the delta road comes down into Ombra', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source), j = Journey.of(s);
    const notices = s.campaign.module.entities.filter(e => /^region__gate_ombra_notice_/.test(e.id));
    expect(notices.length).toBeGreaterThan(0);
    const keeper = s.campaign.module.actions.find(a => a.id.startsWith('region__gate_ombra_beyond_told_'))!;
    await GeneratedWorld.travel(s, s.campaign.world.one('at', keeper.speaker!)!.replace(/^region__/, ''));
    const told = await j.play('Drawing at Ombra');
    expect(told).toContain('Registrar');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'region__gate_ombra_beyond')).toBe(true);
    await GeneratedWorld.travel(s, 'gate_ombra');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installed).toContain('pombra');
    const region = s.campaign.module.entities.find(e => e.id === 'pombra__ombra_delta');
    expect(region?.space?.parent).toBe('region__region');
    await j.play('To the end of the delta road');
    expect(s.campaign.world.one('at', 'party')).toBe('pombra__road_end');
    await j.play('To the Customs Steps', 'To Strangers\' Square');
    expect(s.campaign.world.one('at', 'party')).toBe('pombra__gate_square');
  }, 900000);
});
