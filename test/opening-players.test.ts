import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../src/autoplay/run';
import { VisitedPlaces } from '../src/presentation/visited-places';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerFight } from '../src/cli/runner-fight';

// The opening's successive revelations (OR-441) played by the cheap players of the acceptance ladder, out of the adit:
// the gold-follower (the autoplay laboratory's gold temper, every step checked by its invariants), and a cold walk that
// takes whatever the page leads with, first, each turn, as one who has never seen it would, fighting through what it
// meets. Both come out at the drift's mouth, with no softlock and no broken invariant, in a few dozen steps.
const mouth = 'region__s1_adit_mouth';
describe('the opening, played cold', () => {
  it('is walked out of by the gold-follower, every step within the invariants', async () => {
    const result = await AutoplayRun.run({ seed: 'iscoed', origin: 'drove', opening: 'adit', policy: 'gold', steps: 40,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' }, frontier: false });
    expect(result.failure).toBeUndefined();
    const s = await AutoplayRun.start({ seed: 'iscoed', origin: 'drove', opening: 'adit', policy: 'gold', steps: 0,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' }, frontier: false });
    for (const step of result.steps) { await s.leg(step.command); }
    expect(VisitedPlaces.of(s.campaign, s.campaign.playerActor!).has(mouth)).toBe(true);
  }, 240000);
  it('is walked out of by taking the first row the page leads with, each turn', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse', '--opening',
      'adit']));
    const r = new Runner(journey.session);
    let s: Said = r.said('look'), turns = 0;
    for (; turns < 30 && journey.session.campaign.world.one('at', 'party') !== mouth; turns++) {
      const first = s.offer.primary.find(o => !o.id.startsWith('follow:')) ?? s.offer.primary[0]!;
      const next = await r.ask(JSON.stringify({ act: first.id }));
      if ('error' in next) { throw new Error(`${first.label}: ${next.error}`); }
      s = next.moment === 'fight' ? await r.ask(JSON.stringify({ act: RunnerFight.through })) as Said : next;
    }
    expect(journey.session.campaign.world.one('at', 'party')).toBe(mouth);
    console.log(`the cold walk: out of the adit in ${turns} turns`);
  }, 240000);
});
