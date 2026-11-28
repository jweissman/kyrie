import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The Befriender (the owner, 15 November: a player verb as a pin): bond with an animal, travel with it, part, and meet
// it again with the bond intact. The probe's finding: an animal is led as an escort (acceptsEscort, following), not
// enlisted as a member, and the bond (petted, tolerates) is a fact of the world that outlasts the parting.
const country = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Place field "the far field" is room at 2, 0 outdoors.
  Passage gate "the gate" is path between yard and lane. Passage stile "the stile" is path between lane and field.
  Company party "You" of 1 at yard.
  Person bran "Bran" at yard { Role "a bay gelding". Species horse. Peaceable. Pronouns he. }
  Initially Assert acceptsEscort(bran, party).`;
const bonded = (t: Tiny) => t.world.related('petted').some(r => r.args[0] === 't__bran');

describe('a befriender', () => {
  it('makes much of a horse, travels with it, parts, and finds the bond and the horse where they were left', async () => {
    const t = await Tiny.start(country, { horizon: ['inhabitants'], party: [{ name: 'Wren', raceId: 'human', classId: 'ranger' }] });
    expect(bonded(t)).toBe(false);
    await t.play('Make much of (Bran|him)');
    expect(bonded(t)).toBe(true);
    await t.play('Ask (Bran|him) to come with you', 'To the lane', 'To the far field');
    expect(t.journey.at('t__bran')).toBe('t__field');
    await t.play('Let (Bran|him) make (their|his) own way', 'To the lane', 'To the yard', 'Wait an hour', 'To the lane',
      'To the far field');
    // Parted and reunited: the horse is where it was left, the bond stands, and it can be led again.
    expect([t.journey.at('t__bran'), bonded(t)]).toEqual(['t__field', true]);
    expect(t.journey.choices().some(c => /Ask (Bran|him) to come with you/.test(c.full))).toBe(true);
  });
});
