import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { FirstHourFights, type Fought } from '../../../scripts/first-hour-fights';
import { FirstHourBands, type Banded } from '../../../scripts/first-hour-bands';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Conflict › Fights that cost (CB-01; BRIEF §3.3:
// consequential, legible, genuinely risky): the first hour's fights on the supported route, as its own company plays
// them (scripts/first-hour-fights.ts): the golden walk's, and every band in the first hour's reach of a new life's
// start (the big ruin's barrow, the first ruin's keeper, the raiders' ring-fort, Redkeep, the Numbered House), fought
// by the warrior and the first town's hire, ten seeded trials a band. Floors, not a score (AGENTS.md: experiential
// pins): a fight that stands costs the company something; the one the company's reckoning calls grave or deadly can
// kill; one it calls fair or slight is won; a boss lives past the first round. Measured 24 November: the walk meets
// one fight (the gate-well's conger: two rounds, two hit points, the conger standing after the first); 20 bands in
// reach, every one told as it goes; the beasts of the wild (a fox, a butterfly) flee before a blow is struck.
describe('Conflict › Fights that cost', () => {
  let walk: Fought[] = [], bands: Banded[] = [];
  beforeAll(async () => {
    walk = await FirstHourFights.walk(FirstHourFights.walks[0]!);
    const begun = (await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']))).journey;
    bands = FirstHourBands.bands(begun.session.campaign, 10);
  }, 600000);
  // A band that stands and fights (a beast that runs before the first blow is not a fight).
  const standing = () => bands.filter(b => FirstHourBands.median(b.rounds) > 0);

  it('meets a fight on the golden walk, and it costs the company something past its first round', () => {
    expect(walk.length).toBeGreaterThan(0);
    for (const f of walk) {
      expect([f.command, f.hit, f.rounds > 1, f.leaderLived]).toEqual([f.command, true, true, true]);
    }
  });
  it('costs the company something in most fights that stand: hit in most trials, in nearly every band', () => {
    expect(standing().length).toBeGreaterThan(10);
    const costly = standing().filter(b => b.hit * 2 >= b.trials);
    expect(costly.length / standing().length).toBeGreaterThanOrEqual(0.8);
  });
  it('can kill where the company\'s reckoning says grave or deadly, and is won where it says fair or slight', () => {
    const grave = bands.filter(b => b.said === 'grave' || b.said === 'deadly');
    expect(grave.length).toBeGreaterThan(2);
    expect(grave.filter(b => b.fell * 10 < b.trials * 3).map(b => b.name)).toEqual([]);
    const easy = bands.filter(b => b.said === 'fair' || b.said === 'slight');
    expect(easy.filter(b => b.won * 10 < b.trials * 8).map(b => b.name)).toEqual([]);
  });
  it('keeps a boss on its feet past the first round', () => {
    const bosses = standing().filter(b => b.members === 1);
    expect(bosses.length).toBeGreaterThan(3);
    expect(bosses.filter(b => b.leaderLived * 10 < b.trials * 7).map(b => b.name)).toEqual([]);
    expect(standing().filter(b => b.leaderLived * 2 < b.trials).map(b => b.name)).toEqual([]);
  });
});
