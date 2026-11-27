import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ScreenModel } from '../../../src/ui/screen-model';
import { Milestones } from '../../../src/lang';
import { Undertakings } from '../../../src/presentation/undertakings';
import { AsMeant } from '../../support/as-meant';
import { GoldenWalk } from '../../support/golden-walk';
import { TalkWay } from '../../support/talk-way';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Choice and consequence › The First Aims (OR-443; the
// owner's direction of 24 November, §9): one optional, nested undertaking in three levels (its chapter, "First
// aims"; the undertaking within it, finding your feet in the country; and what it is made of, each recognised from the
// world's facts as it is done). Never followed here: Dai met in the adit is help gained; the workings under Porthalen
// gone down into and explored to their second level; Dun Rìerdan learnt of from the Rì's proclamation. Available only
// once two of its first things are done (what was done before counts), achieved when all are, each rewarded once,
// and its end told once.
describe('Choice and consequence › The First Aims', () => {
  it('recognises what the company did unprompted, offers the undertaking after, and rewards each part once', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const achieved = () => Milestones.achieved(c.world).filter(m => m.id.startsWith('aims__')).map(m => m.id);
    const aim = () => (r.said('look').aims ?? []).some(a => a.id === 'aims__orient');
    const followed = () => Undertakings.followed(c)?.id;
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened())) { await AsMeant.ask(r, line); }
    // Help gained in the adit, the aim never followed: recognised; the undertaking not yet there, one thing being done.
    expect([achieved(), aim()]).toEqual([['aims__help_gained'], false]);
    expect(followed()).not.toBe('aims__orient');
    let s = r.said('look');
    const play = async (steps: string[]) => {
      for (const step of steps) {
        // Found as the page's player finds it, a talk open (TalkWay, OR-1451).
        const way = step === 'through' ? undefined : await TalkWay.find(r, s, x => new RegExp(step, 'i').test(x.label));
        if (way) { s = way.said; }
        const found = way?.o;
        if (step !== 'through') { expect([step, found?.label]).toEqual([step, expect.any(String)]); }
        const said = await AsMeant.ask(r, JSON.stringify({ act: found?.id ?? RunnerFight.through }));
        expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
        s = said as Said;
      }
    };
    // Down into the workings under the town, by the corn-store: found; and with that, two things done, the undertaking.
    await play(['^Read the notice on the well-post', "^To Holgar's salt-house",
      '^Holgar: the rats in the corn-store', '^Buy a torch for', '^To the old corn-store', '^Light a torch', '^Down to the corn-store cellar']);
    expect(achieved()).toEqual(['aims__help_gained', 'aims__dungeon_found']);
    expect(aim()).toBe(true);
    expect(followed()).not.toBe('aims__orient');
    // Explored to their second level; then the Rì's commission searched for beneath the notice: Dun Rìerdan learnt of.
    await play(['^To the rat-runs', '^Attack the rats', 'through', '^Down to the nest']);
    expect(achieved()).toContain('aims__dungeon_explored');
    const xp = () => ScreenModel.build(c).party.map(m => m.experience);
    await play(['^Attack the old buck rat', 'through', 'light a candle', '^Out to the landing at Porthalen']);
    for (let tries = 0; tries < 20 && !achieved().includes('aims__far_learnt'); tries++) {
      await play(['^Search under the notices for the Rì\'s commission']);
    }
    expect(achieved()).toEqual(['aims__help_gained', 'aims__dungeon_found', 'aims__dungeon_explored',
      'aims__far_learnt', 'aims__oriented']);
    // Achieved: the undertaking gone from what is held, its end told once, and no part rewarded twice.
    expect(aim()).toBe(false);
    const told = () => c.history.filter(e => JSON.stringify(e).includes('You have found your feet in Iscoed')).length;
    expect(told()).toBe(1);
    const before = xp();
    await play(["^To Holgar's salt-house", '^To the landing at Porthalen']);
    expect([xp(), told()]).toEqual([before, 1]);
  }, 240000);
});
