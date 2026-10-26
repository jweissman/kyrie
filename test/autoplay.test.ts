import { describe, expect, it } from 'bun:test';
import { Draw } from '../src/autoplay/draw';
import { Shrinker } from '../src/autoplay/shrink';
import { AutoplayRun } from '../src/autoplay/run';
import { EncounterLab } from '../src/autoplay/encounters';

// The autoplay laboratory (src/autoplay): generated worlds played through the game's own offered commands and
// journeys, every step checked against what play must keep true, and a failure kept with what makes it again and
// made small. Its long runs are made from the terminal (scripts/autoplay.ts); this keeps the laboratory itself sound.
describe('the autoplay laboratory', () => {
  it('draws the same run again from the same seed', () => {
    const one = new Draw('wren:mixed'), two = new Draw('wren:mixed');
    expect(Array.from({ length: 8 }, () => one.next())).toEqual(Array.from({ length: 8 }, () => two.next()));
    expect(new Draw('a1').next()).not.toBe(new Draw('b2').next());
  });
  it('makes a failure small: the fewest commands that still bring it', async () => {
    const steps = 'abcdefghijklmnopqrstuvwxyz'.split('');
    // A failure that needs both "f" and "t", in that order.
    const kept = await Shrinker.minimize(steps, async s => s.indexOf('f') >= 0 && s.indexOf('t') > s.indexOf('f'));
    expect(kept).toEqual(['f', 't']);
    expect(Shrinker.same('Invalid creature conditions at step 31', 'Invalid creature conditions at step 7')).toBe(true);
  });
  // Before fights let go of what they were fought under (f911ff2), one company in six of these failed with "Invalid
  // creature conditions".
  it('fights companies of every calling against the catalog\'s kinds, fight after fight, with every creature sound', () => {
    const r = EncounterLab.run('autoplay-test', 60);
    expect([r.failures, r.fights > 60, r.undecided]).toEqual([[], true, 0]);
  }, 60000);
  it('plays a world through its offered commands, kept and played again alike', async () => {
    const r = await AutoplayRun.run({ seed: 'a1', origin: 'wanderer', policy: 'mixed', steps: 40, keep: 20,
      replay: true, protagonist: { name: 'Wenna', raceId: 'dwarf', classId: 'cleric' } });
    expect(r.failure).toBeUndefined();
    expect([r.metrics.steps > 0, r.metrics.commands >= r.metrics.steps, r.steps.length]).toEqual([true, true,
      r.metrics.commands]);
  }, 180000);
});
