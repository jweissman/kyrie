import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Liberty of the Ice's 5 (ICE-05): a lie told to Abel, or a truth told on the Liars' Bench in front of Kemble,
// should be carried to Harker by whoever heard it, and Kyr had no person-to-person carrying: each adventure built its
// own (tattles, toldOf). Whoever is told of something has heard of it; one who passes on what they hear does so once
// they are with whom they tell; one who overhears hears what anyone beside them has heard.
describe('what one person hears', () => {
  it('is overheard beside them, and carried to whom they tell it', async () => {
    const j = await Journey.start('test/fixtures/probes/carried/probe.campaign.json');
    await j.play('Tell Abel his flock');
    expect(j.holds('heardOf', 'p__abel', 'p__flock_lie')).toBe(true);
    await j.play('Wait › A while');
    expect(j.holds('heardOf', 'p__kemble', 'p__flock_lie')).toBe(true);
    expect(j.holds('heardOf', 'p__harker', 'p__flock_lie')).toBe(false);
    await j.play('=until heardOf(harker, flock_lie)');
    expect(j.at('p__abel')).toBe('p__office');
  }, 30000);
});
