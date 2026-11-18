import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Atlas } from '../support/atlas';

// A creature with nothing else said of it is said by what it is, its kind as it varies: "The keeper of the vault is
// here." had been all the sealed vault said of the barrow ghoul that killed the company (cold play 3, CL-13).
describe('a creature present', () => {
  it('is said by its kind where its name does not say it', async () => {
    const t = await Tiny.start(`${Atlas.ground}
      Person keeper "the keeper of the vault" at green { Role "the last of whoever built the undercroft". Species ghoul.
        Variant barrow. Numbers 1. Level 2. Temperament territorial. Lair green. }`,
    { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    expect(t.look().glance.life?.text).toBe('The keeper of the vault is here: a barrow ghoul.');
  });
});
