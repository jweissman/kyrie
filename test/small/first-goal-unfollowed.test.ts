import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Undertakings } from '../../src/presentation/undertakings';

// The first page says the company's own errand as its first goal, followed or not (M21's playability list, PL-30):
// nothing is followed until the player chooses it, and the goal was said only of an aim followed, so the page a player
// began on said no goal at all; Follow this was only in the Notes (round 13, thorn, in the page). An errand of the
// company's own (one somebody expects of it), and nothing followed.
const errand = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person mother "your mother" at yard { Role "your mother". Peaceable. Pronouns she. }
  Initially Assert expects(mother, party).
  Objective letter when expects(mother, party) "Carry the letter to your mother's sister.".
  Goal false.`;

describe('the first goal', () => {
  it('is said on the first page though nothing is followed yet', async () => {
    const t = await Tiny.start(errand);
    expect(Undertakings.followed(t.campaign)).toBeUndefined();
    expect(t.glance.goal).toBe('Carry the letter to your mother\'s sister.');
  });
});
