import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A Paragon pin (doc/architecture/mission-21/paragon-pins.md): a ranger's mount. A named horse is led along, travels
// with the company, is left at the far end, and is found there again, the same horse, after the company has been
// away. What the pin finds about riding itself is in paragon-pins.md.
const country = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Place field "the far field" is room at 2, 0 outdoors.
  Passage gate "the gate" is path between yard and lane. Passage stile "the stile" is path between lane and field.
  Company party "You" of 1 at yard.
  Person bran "Bran" at yard { Role "a bay gelding". Species horse. Peaceable. Pronouns he. }
  Initially Assert acceptsEscort(bran, party).`;
describe("a ranger's mount", () => {
  it('is led along, travels with the company, is left, and is found again where it was left', async () => {
    const t = await Tiny.start(country, { party: [{ name: 'Wren', raceId: 'human', classId: 'ranger' }] });
    await t.play('Ask (Bran|him) to come with you', 'To the lane', 'To the far field');
    expect(t.journey.at('t__bran')).toBe('t__field');
    await t.play('Let (Bran|him) make (their|his) own way', 'To the lane', 'To the yard', 'Wait › An hour', 'To the lane',
      'To the far field');
    expect(t.journey.at('t__bran')).toBe('t__field');
    expect(t.journey.choices().some(c => /Ask (Bran|him) to come with you/.test(c.full))).toBe(true);
  });
});
