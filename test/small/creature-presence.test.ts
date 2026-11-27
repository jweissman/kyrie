import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Atlas } from '../support/atlas';

// A creature with nothing else said of it is said by what it is, its kind as it varies: "The keeper of the vault is
// here." had been all the sealed vault said of the barrow ghoul that killed the company (cold play 3, CL-13); and what
// its kind looks like, once ("The snakes are here." had been all an ossuary said of them: cold play 4, CL-42).
describe('a creature present', () => {
  it('is said by its kind where its name does not say it', async () => {
    const t = await Tiny.start(`${Atlas.ground}
      Person keeper "the keeper of the vault" at green { Role "the last of whoever built the undercroft". Species ghoul.
        Variant barrow. Numbers 1. Level 2. Temperament territorial. Lair green. }`,
    { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    expect(t.look().glance.life?.text).toBe('The keeper of the vault is here: a barrow ghoul. A gaunt grey thing that '
      + 'was a man, long-nailed and hollow-cheeked, crouched over bones.');
  });
  // A band whose name already says its kind is not told it again, and never in a made-up plural: "The wolves are
  // here: wolfs." (the porthalen loop's old stope, 26 November).
  it('is not told its kind again where its name says it in the plural', async () => {
    const t = await Tiny.start(`${Atlas.ground}
      Person pack "the wolves" at green { Role "a pair of wolves that have made the green their den". Species wolf.
        Numbers 2. Level 1. Temperament territorial. Lair green. }`,
    { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    const said = t.look().glance.life?.text ?? '';
    expect(said).toStartWith('The wolves are here, each ');
    expect(said).not.toContain('wolfs');
  });
});
