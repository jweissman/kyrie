import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { Journey } from '../src/session/journey';
import { GeneratedWorld } from './support/generated';

// Sennet in a world that goes on: a province of the first country (Mission 18's Gate B), its way in on the country's
// own land a little in from the east, with a road to it from the nearest town. In every town the Rector's
// proclamation of the Grand Tour is nailed up where travellers are kept, and whoever keeps them tells of it; once
// read or heard, the way in is on the map. An ordinary protagonist of the world walks there, and the coast road
// comes down into Sennet; the Tour's days run from the morning after; the city goes on after the book would close.
describe('Sennet, a province of the first country', () => {
  it('stands its way in on the country\'s land, and is not among the marches', async () => {
    expect(Countries.provinces.map(c => c.id)).toContain('sennet');
    expect(Countries.marches.some(c => c.id === 'sennet')).toBe(false);
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared);
    const province = w.report.region.provinces?.find(p => p.country === 'sennet');
    expect(province).toMatchObject({ name: 'Sennet', region: 'psennet__sennet_bay' });
    // The Strewnfield's way in is where it was: Sennet's is placed after it, clear of it.
    const strewn = w.report.region.provinces?.find(p => p.country === 'strewnfield');
    expect(strewn?.gate.cell).not.toBe(province!.gate.cell);
  }, 120000);

  it('the proclamation is nailed up in a town; read, the way in is on the map; walked to, the coast road comes down into Sennet', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source), j = Journey.of(s);
    // The notice is where travellers are kept in the first town; reading it is knowing of Sennet.
    const notices = s.campaign.module.entities.filter(e => /^region__gate_sennet_notice_/.test(e.id));
    expect(notices.length).toBeGreaterThan(0);
    const keeper = s.campaign.module.actions.find(a => a.id.startsWith('region__gate_sennet_beyond_told_'))!;
    await GeneratedWorld.travel(s, s.campaign.world.one('at', keeper.speaker!)!.replace(/^region__/, ''));
    const told = await j.play('Grand Tour at Sennet');
    expect(told).toContain('Door of Doors');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'region__gate_sennet_beyond')).toBe(true);
    // To the way in by the country's roads, and the province is installed within the country there.
    await GeneratedWorld.travel(s, 'gate_sennet');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installed).toContain('psennet');
    const region = s.campaign.module.entities.find(e => e.id === 'psennet__sennet_bay');
    expect(region?.space?.parent).toBe('region__region');
    await j.play('To the top of the coast road');
    expect(s.campaign.world.one('at', 'party')).toBe('psennet__coast_road');
    const arrived = j.watch();
    const seen = await j.play('To the Landward Gate', 'To the Glass Market');
    expect(seen).toContain('THE GRAND TOUR IS PROCLAIMED');
    // Left alone, the week goes by and the Rector has her way; the book does not close: the world goes on.
    while (!s.campaign.world.related('reached').length && j.watch() < arrived + 1300) { await j.play(`=${j.watch() + 36}`); }
    expect(s.campaign.world.related('reached').map(r => r.args[0])).toEqual(['psennet__end_second_whelming']);
    expect(s.campaign.running).toBe(true);
    await j.play('To the Quay');
    expect(await j.play('Wait › A while')).toBeDefined();
  }, 900000);
});
