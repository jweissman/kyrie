import { describe, expect, it } from 'bun:test';
import { FirstQuarter } from '../scripts/first-quarter';
import { AutoplayRun } from '../src/autoplay/run';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { PlayerView } from '../src/presentation/player-view';

// The keeper of the sealed vault, on the first quarter hour's walk (the World agent's, 21 November: iscoed, the debt,
// a warrior). At the vault the keeper warns; the gold is the answer to it (the attack), not the way out; drawn back to
// the undercroft, the aim's gold had led straight back down the stair, and back, forty times, never saying the keeper
// stood between. The way back in is no step of the aim's now, and the need says why (Guarded), as a barred way's does.
// And since OR-412 the page never leads into the keeper at all, for it would end a lone first-level warrior.
const asked = ['region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
  'region__s1_u_rats_job_ask'];
const spec = { seed: 'iscoed', origin: 'debt', policy: 'gold' as const, steps: 1,
  protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' } };
describe('the keeper of the vault', () => {
  it('is not led into, at the vault or from the undercroft, and what stands between is said', async () => {
    const q = await FirstQuarter.walk('iscoed', 'debt', 'warrior', { steps: 45, asked });
    // The walk goes down by the corn-store's rats, back up to be paid, and down again by the drain to the undercroft,
    // where the lettered flag is opened (the rats come up behind the first job met and fought on the way: OR-413).
    const opened = q.steps.findIndex(x => x.command === 'region__s1_u_flag_pressed(party,region__s1_u_undercroft)');
    expect(opened).toBeGreaterThan(0);
    const s = await AutoplayRun.start(spec, AutoplayRun.empty()), c = s.campaign;
    for (const a of asked) { await s.leg(a); }
    for (const x of q.steps.slice(0, opened + 1)) { await s.leg(x.command); }
    const look = () => {
      Undertakings.follow(c, 'region__s1_u_vault_sought');
      const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance!;
      return { place: screen.place.name, gold: g.acts.filter(a => a.continues).map(a => a.choice),
        led: g.acts.map(a => a.choice), need: g.need ?? [] };
    };
    // At the vault the keeper would end a lone first-level warrior: the page leads away from it, never into it
    // (OR-412), and the attack is still there to be chosen, asked.
    await s.leg('go(region__s1_u_vault_stair,region__s1_u_vault)');
    const vault = look();
    expect(vault.place).toBe('the sealed vault');
    expect(vault.led).not.toContain('region__s1_u_keeper/0:Attack');
    expect(vault.gold).not.toContain('region__s1_u_keeper/0:Attack');
    expect(PlayerView.choices(c).some(x => x.choice.id.startsWith('attack(region__s1_u_keeper'))).toBe(true);
    // Back in the undercroft, the stair down is no step of the aim's, and the need says why.
    await s.leg('go(region__s1_u_vault_stair,region__s1_u_undercroft)');
    const undercroft = look();
    expect(undercroft.place).toBe('the undercroft');
    expect(undercroft.gold).toEqual([]);
    expect(undercroft.need.join(' ')).toMatch(/beyond you alone|beyond the company as it is/);
  }, 600000);
});
