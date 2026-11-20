import { describe, expect, it } from 'bun:test';
import { FirstQuarter } from '../scripts/first-quarter';

// The first quarter hour, played by the gold as the owner plays it (the owner, 19 November: "a random chain of quests
// that don't circle back", the dungeons "deathly dull"). The rats paid for, the gold goes back down: through the runs
// to the drain, the undercroft, the lettered flag's letters searched out where they are cut, and the sealed vault
// under it. It had gone up to be paid and off to the next notice, and the rooms below were never led to.
describe('the first quarter hour, by the gold', () => {
  it('goes from the corn-store job on down to the sealed vault', async () => {
    // The notice read and its rats asked after, as it says: its jobs are leads until their giver is asked (HP-01).
    const q = await FirstQuarter.walk('iscoed', 'debt', 'warrior', { steps: 35, asked: [
      'region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
      'region__s1_u_rats_job_ask'] });
    const places = q.steps.map(x => x.place);
    expect(places).toContain('the undercroft');
    expect(places).toContain('the sealed vault');
    expect(q.fights).toBeGreaterThanOrEqual(3);
  }, 300000);
});
