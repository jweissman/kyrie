import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { DangerSense } from '../src/presentation/danger-sense';
import { HonestPlayer } from './support/honest-player';

// The weir route end to end as one walk (CB-30): Ilse, the elf scholar the weir life begins as, from Gatesend's
// gate-yard with 7 coin. She hires Gesk in the guest-hall (test/weir-hire) and takes Nest's job on the corn-store's
// rats; from there the page leads, as a player who knows only what it shows (HonestPlayer): down through the cellar,
// the rats in the runs and the old buck in the nest fought with Gesk beside her, and paid; then the sea-gate's aim
// followed, the pawl found in the gate-well and the gate wound shut; then the road to Porthalen, as the page sets
// out on it. What each fight was reckoned before it and what it cost are logged, so that a change moving them is seen.
const hire = ['go(region__s4_inn_door,region__s4_taproom)', 'region__s4_traveller_brings',
  'recruit(region__s4_traveller)', 'go(region__s4_inn_door,region__s4_green)', 'talk_to(origin__nest)',
  'region__s4_u_rats_job_ask'];
describe('the weir route', () => {
  it('is walked from the start: Gesk hired, the rats fought beside him and paid, the gate shut, Porthalen', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const s = journey.session, c = s.campaign, r = new Runner(s);
    for (const act of hire) { expect(await r.ask(JSON.stringify({ act }))).not.toHaveProperty('error'); }
    expect(c.readout.partyIds).toHaveLength(2);
    const reckoned = ['region__s4_u_rats', 'region__s4_u_buck'].map(id => DangerSense.reckon(c, id)?.danger);
    expect(await r.ask(JSON.stringify({ follow: 'region__s4_u_rats_job_aim' }))).not.toHaveProperty('error');
    const p = new HonestPlayer(s), done = (act: string) => c.history.some(h => JSON.stringify(h).includes(act));
    const hp = () => p.glanced.screen.party.map(m => `${m.name} ${m.hp}`);
    const paid = await p.until(() => done('rats_job_paid'), 80);
    console.log(`weir route: rats ${reckoned.join(', ')}; after the job ${hp().join(', ')}`);
    expect(paid).toBe(true);
    // Both fights fought, the company two strong through them.
    expect(p.log.filter(l => /\[danger\] Attack the (rats|old buck)/.test(l))).toHaveLength(2);
    expect(hp()).toHaveLength(2);
    expect(await r.ask(JSON.stringify({ follow: 'gate__gate_aim' }))).not.toHaveProperty('error');
    const shut = () => c.world.related('knows').some(k => k.args[0] === 'party' && k.args[1] === 'gate__shut');
    const at = () => c.world.one('at', 'party') ?? '';
    expect(await p.until(() => shut() && /^region__s1_/.test(at()), 60)).toBe(true);
    console.log(`weir route: at Porthalen (${at()}) ${hp().join(', ')}, ${c.history.length} acts`);
    expect(p.log.some(l => /journey: arrived/.test(l))).toBe(true);
  }, 300000);
});
