import { describe, expect, it } from 'bun:test';
import { FirstQuarter } from '../scripts/first-quarter';

// The first quarter hour, played by the gold as the owner plays it (the owner, 19 November: "a random chain of quests
// that don't circle back", the dungeons "deathly dull"). The rats paid for, the gold goes back down: through the runs
// to the drain, the undercroft, the lettered flag's letters searched out where they are cut, and the sealed vault
// under it. It had gone up to be paid and off to the next notice, and the rooms below were never led to.
describe('the first quarter hour, by the gold', () => {
  it('goes from the corn-store job on down to the sealed vault', async () => {
    // The notice read and its rats asked after, as it says: its jobs are leads until their giver is asked (HP-01).
    // OR-1396: the new route reaches the raiser's conversation on act 35; allow its answer on the next act.
    const q = await FirstQuarter.walk('iscoed', 'debt', 'warrior', { steps: 36, asked: [
      'region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
      'region__s1_u_rats_job_ask'] });
    const places = q.steps.map(x => x.place);
    expect(places).toContain('the undercroft');
    expect(places).toContain('the sealed vault');
    // The rats and their buck fought, and the rats come up into the drain behind them (OR-413). The man with the black
    // candle, warning the company off in the ossuary, is answered by words, not fought (an engagement answered:
    // OR-163): this walk took no job of the dead, so it cannot tell him the town knows; it asks who he is once, not
    // again and again (OR-416), and talks him round. Since the keeper is not led into (OR-412), the walk comes to the
    // ossuary by the charnel passage after the vault.
    expect(q.fights).toBeGreaterThanOrEqual(2);
    const commands = q.steps.map(x => x.command);
    expect(commands.filter(x => x === 'region__s1_u_raiser_who')).toHaveLength(1);
    expect(commands).not.toContain('region__s1_u_raiser_who_again');
    expect(commands).toContain('talk_round(region__s1_u_raiser)');
    expect(commands.filter(x => /^attack\(region__s1_u_(raiser|dead)/.test(x))).toEqual([]);
  }, 300000);
});
