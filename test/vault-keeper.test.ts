import { describe, expect, it } from 'bun:test';
import { FirstQuarter } from '../scripts/first-quarter';
import { AutoplayRun } from '../src/autoplay/run';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';

// The keeper of the sealed vault, on the first quarter hour's walk (the World agent's, 21 November: iscoed, the debt,
// a warrior). At the vault the keeper warns; the gold is the answer to it (the attack), not the way out; drawn back to
// the undercroft, the aim's gold had led straight back down the stair, and back, forty times, never saying the keeper
// stood between. The way back in is no step of the aim's now, and the need says why (Guarded), as a barred way's does:
// the walker who follows the gold goes on to the job it holds besides (the dead in the crypt, seen to and paid), and
// passes between the vault and the undercroft once.
const asked = ['region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
  'region__s1_u_rats_job_ask'];
const spec = { seed: 'iscoed', origin: 'debt', policy: 'gold' as const, steps: 1,
  protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' } };
describe('the keeper of the vault', () => {
  it('is answered at the vault, said to stand between at the undercroft, and not gone to and fro', async () => {
    const q = await FirstQuarter.walk('iscoed', 'debt', 'warrior', { steps: 45, asked });
    const places = q.steps.map(x => x.place);
    const back = places.findIndex((p, i) => p === 'the undercroft' && places[i - 1] === 'the sealed vault');
    expect(back).toBeGreaterThan(0);
    // Between the vault and the undercroft once, not to and fro.
    const fro = places.filter((p, i) => i > 0 && [p, places[i - 1]].sort().join() === 'the sealed vault,the undercroft');
    expect(fro.length).toBeLessThanOrEqual(2);
    expect(q.steps.map(x => x.command)).toContain('region__s1_u_dead_job_paid');
    // The same steps again, to look at the vault and the undercroft as the aim to the vault is followed.
    const s = await AutoplayRun.start(spec, AutoplayRun.empty()), c = s.campaign;
    for (const a of asked) { await s.leg(a); }
    for (const x of q.steps.slice(0, back)) { await s.leg(x.command); }
    const look = () => {
      Undertakings.follow(c, 'region__s1_u_vault_sought');
      const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance!;
      return { place: screen.place.name, gold: g.acts.filter(a => a.continues).map(a => a.choice), need: g.need ?? [] };
    };
    const vault = look();
    expect(vault.place).toBe('the sealed vault');
    expect(vault.gold).toEqual(['region__s1_u_keeper/0:Attack']);
    await s.leg(q.steps[back]!.command);
    const undercroft = look();
    expect(undercroft.place).toBe('the undercroft');
    expect(undercroft.gold).toEqual([]);
    expect(undercroft.need).toContain('The stair under the lettered flag: the keeper of the vault is beyond it, and beyond '
      + 'the company as it is; more hands, or more seasoning, first.');
  }, 600000);
});
