import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { CompanyRecall } from '../src/presentation/company-recall';
import { VisitedPlaces } from '../src/presentation/visited-places';

// A player who does what the page leads with (the autoplay's "follow") is not led round in a ring: the page had led a
// merchant's rumour asked again and again (160 times), lodging and working for one's keep at the same inn turn and turn
// about, and from the dark of a crypt back into the ossuary its raiser was in, and back. Each step a new act or a new
// place before long. A warrior: led now to the merchant who gives the corn-store's job (M19-86), a lone cleric fights
// its rats within a dozen steps, and they kill one in four (M19-87), which ends the walk before it has gone anywhere.
describe('a player who follows the page', () => {
  it('is never led to do one thing over and over, and comes to new places', async () => {
    const spec = { seed: 'a1', origin: 'wanderer', protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' },
      policy: 'follow' as const, steps: 120 };
    const s = await AutoplayRun.start(spec), c = s.campaign;
    const player = new AutoPlayer(spec.policy, new Draw('a1:wanderer:follow'));
    const metrics = (AutoplayRun as unknown as { empty(): Parameters<typeof AutoplayRun.apply>[3] }).empty();
    let last = '', run = 0, longest = 0;
    for (let step = 0; step < spec.steps && c.running; step++) {
      const move = player.next(AutoplayRun.situation(s, step, true))!;
      const said = move.kind === 'travel' ? `travel:${move.to}` : move.id;
      run = said === last ? run + 1 : 1; longest = Math.max(longest, run); last = said;
      await AutoplayRun.apply(s, move, player, metrics);
    }
    expect(longest).toBeLessThan(10);
    expect(VisitedPlaces.of(c, c.playerActor!).size).toBeGreaterThan(8);
  }, 600000);
  it('counts a choice as done in the form the page offers it', () => {
    expect(CompanyRecall.same('work_keep(innkeeper)', 'work_keep(party,innkeeper)')).toBe(true);
    expect(CompanyRecall.same('work_keep(innkeeper)', 'work_keep(party,steward)')).toBe(false);
    expect(CompanyRecall.same('take_lodging(room,keeper)', 'take_lodging(party,room,keeper)')).toBe(true);
    expect(CompanyRecall.same('go(a,b)', 'go(party,b,a)')).toBe(false);
  });
});
