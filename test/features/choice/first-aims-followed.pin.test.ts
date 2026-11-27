import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';
import { ScreenModel } from '../../../src/ui/screen-model';
import { Milestones } from '../../../src/lang';
import { ContinuityCensus } from '../../../scripts/continuity-census';
import { AsMeant } from '../../support/as-meant';
import { GoldenWalk } from '../../support/golden-walk';
import { HonestPlayer } from '../../support/honest-player';
import { TalkWay } from '../../support/talk-way';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Choice and consequence › The First Aims followed
// (OR-468): the warrior's walk, then the page's lead alone (HonestPlayer) until the undertaking is there to take up;
// followed then, as the Notes offer it, and the page's lead again. Its guidance goes to each part in turn (the
// workings under the town, to their second level; then, Dai going with the company from the adit, the green, where
// the Rì's proclamation is posted), the aim followed going on into its next part as it arises; held each turn by the
// continuity census's focus and undertaking invariants; and the Notes say which of its parts are done.
describe('Choice and consequence › The First Aims followed', () => {
  it('leads to each part in turn under the gold, focus held, the Notes saying which parts are done', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const s = journey.session, c = s.campaign, r = new Runner(s);
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened())) { await AsMeant.ask(r, line); }
    // Down into the workings under the town by the corn-store, as the first-aims pin goes: two things done, and the
    // undertaking there to take up.
    for (const step of ['^Read the notice on the well-post', "^To Holgar's salt-house",
      '^Holgar: the rats in the corn-store', '^Buy a torch for', '^To the old corn-store', '^Light a torch',
      '^Down to the corn-store cellar']) {
      const row = (await TalkWay.find(r, r.said('look'), x => new RegExp(step, 'i').test(x.label))).o;
      expect([step, row?.label]).toEqual([step, expect.any(String)]);
      await AsMeant.ask(r, JSON.stringify({ act: row!.id }));
    }
    const p = new HonestPlayer(s);
    const aims = () => ScreenModel.build(c).aims ?? [];
    const ours = () => aims().find(a => a.id.startsWith('aims__') && a.id !== 'aims__oriented');
    const achieved = () => Milestones.achieved(c.world).map(m => m.id);
    expect(aims().some(a => a.id === 'aims__orient')).toBe(true);
    // The Notes: the undertaking's parts, Dai met in the adit already done.
    expect(ours()?.parts).toEqual([{ text: expect.stringMatching(/as far as their second level/), done: false },
      { text: 'Found someone who would go with you', done: true },
      { text: expect.stringMatching(/Dun Rìerdan/), done: false }]);
    // The drove's matter followed first, as the Notes offer it (Bran held for four short of the count); then the
    // undertaking chosen over it, the drove's set aside, to be gone back to when the undertaking is done
    // (Undertakings.resume): nothing is followed for the player that they did not choose.
    const own = aims().find(a => a.id === 'drove__held_aim');
    expect(own?.follow).toEqual(expect.any(String));
    await p.glanced.perform(own!.follow!);
    await p.glanced.perform(ours()!.follow!);
    const followed: string[] = [], breaches: unknown[] = [];
    let before = ContinuityCensus.aims(s);
    for (let turn = 0; turn < 80 && !achieved().includes('aims__oriented'); turn++) {
      if (!await p.step()) { break; }
      const after = ContinuityCensus.aims(s), screen = ScreenModel.build(c), where = { walk: 'first aims', turn };
      if (screen.engaged || screen.warned) { breaches.push(...ContinuityCensus.focus(s, r.said(), screen, where)); }
      breaches.push(...ContinuityCensus.undertaking(before, after, where));
      if (after.followed && followed.at(-1) !== after.followed) { followed.push(after.followed); }
      before = after;
    }
    if (!achieved().includes('aims__oriented')) { console.log(p.log.slice(-30).join('\n')); }
    expect(achieved()).toContain('aims__oriented');
    // Followed throughout, from its first part into the next as it arose, never let fall.
    expect(followed.slice(0, 2)).toEqual(['aims__orient', 'aims__far']);
    expect(breaches).toEqual([]);
    expect(ContinuityCensus.aims(s).followed).toBe(own!.id);
    // Where no one goes with the company when the workings are explored, the part between leads where travellers sit
    // (Carlin, in the Stone Horn's taproom); the last, where the proclamation is posted.
    const toward = (id: string) => c.module.objectives?.find(o => o.id === id)?.toward;
    expect([toward('aims__orient'), toward('aims__help'), toward('aims__far')])
      .toEqual([['region__s1_u_cellar'], ['region__s1_taproom'], ['region__s1_green']]);
  }, 300000);
});
