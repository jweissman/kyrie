import { describe, expect, it } from 'bun:test';
import { Calamy, C, Steps } from './support/calamy';
import type { CreatureGenerationContext } from '../src/content';

// The Stacks (doc/adventures/parliament-of-books/12-the-stacks.md): the Library proper, behind the Reading Room, where
// what is written does not stay written. Each journey is one thread of it: the books and their law; the lost scholar;
// the murder of the Concordance; the doors to the realms beyond.
const withCrake = [...Steps.corvell, ...Steps.crakeTrust];
const brand: CreatureGenerationContext[] =
  [{ name: 'Brand', raceId: 'human', classId: 'warrior', backgroundId: 'soldier', level: 6 } as CreatureGenerationContext];
const guide = ['go:hex_first', 'Examine — Look closely'];

describe('A Parliament of Books: the Stacks', () => {
  it('reads the Library\'s own books: the guide, the bestiary, the Cyclopaedia of Ys, three true histories, and the Two Books',
    async () => {
      const j = await Calamy.start('stacks');
      await Calamy.play(j, ...withCrake, 'who else has gone through', ...guide,
        'Talk to the library ladder', 'who has climbed it', 'Take your leave', 'go:balcony', 'go:hex_bestiary',
        'Examine — Look closely', 'go:hex_cyclopaedia', 'Examine — Look closely', 'Ysian compass: Take', 'go:hex_chronicles',
        'grey history', 'brown history', 'Chronology of Calamy', 'go:hex_two_books',
        'Talk to the Two Books', 'how they came to talk', 'why the books of Calamy', 'Take your leave');
      for (const f of ['stacks_laws', 'stair_count', 'mirror_trick', 'shaft_heard', 'beings_read', 'ys_read', 'history_author',
        'history_grown_read', 'chronology_read', 'density_known']) { expect(Calamy.knows(j, f)).toBe(true); }
      // Counted aloud, the stair added nothing.
      expect(Calamy.holds(j, 'slipped', 'party')).toBe(true);
      expect(j.at('party')).toBe(C('hex_two_books'));
      expect(j.holds('carries', 'party', C('ys_compass'))).toBe(true);
    }, 600000);

  it('finds Dr. Fenwick nine weeks lost, tells him it has been eleven years, and walks him home to the quad', async () => {
    const j = await Calamy.start('fenwick');
    await Calamy.play(j, ...withCrake, 'who else has gone through', ...guide,
      'go:hex_mapmaker', 'Talk to Dr. Aurelian', 'what he is mapping', 'how long he has been gone', 'binder who came down',
      'Take your leave', 'Talk to Dr. Aurelian', 'come with you', 'Take your leave', 'Ask Dr. Aurelian Fenwick to join');
    expect(Calamy.holds(j, 'fenwickTold', 'fenwick')).toBe(true);
    expect(j.holds('travelsWith', C('fenwick'), 'party')).toBe(true);
    await Calamy.play(j, 'go:remainder_market', 'go:crake_stacks', 'go:quad');
    expect(Calamy.holds(j, 'fenwickHome', 'fenwick')).toBe(true);
    expect(Calamy.said(j)).toMatch(/Fenwick.s back!/);
  }, 600000);

  it('solves the death of the Concordance: the cut at the fold, the binder\'s thread, the lamp, the fence and the surviving '
    + 'quire; tells Hask there is no Author, only nearness; and he Sews it whole', async () => {
    const j = await Calamy.start('concordance', brand);
    await Calamy.play(j, ...withCrake, 'Read aloud for an hour', ...guide, 'go:hex_concordance', 'Examine — Look closely',
      'Search here', 'Talk to the reading-lamp', 'what it saw', 'Take your leave', 'go:remainder_market', 'Talk to the Remainderman',
      'red quires', 'Take your leave', 'Pay the Remainderman an hour', 'red quire of the Concordance: Take', 'Talk to Signature XVII',
      'what happened to it', 'the way through', 'Take your leave');
    for (const f of ['concordance_dead', 'clue_cut', 'clue_thread', 'clue_witness', 'clue_fence', 'clue_author']) {
      expect(Calamy.knows(j, f)).toBe(true);
    }
    expect(j.holds('travelsWith', C('quire'), 'party')).toBe(true);
    await Calamy.play(j, 'go:hex_chronicles', 'brown history', 'go:hex_two_books', 'Talk to the Two Books',
      'how they came to talk', 'Take your leave', 'go:hex_untitled', 'Attack', 'go:mirror_hex', 'over your shoulder', 'go:rotunda',
      'Talk to Tobias Hask', 'who he is', 'what he did to the Concordance', 'only nearness', 'Take your leave');
    expect(Calamy.holds(j, 'haskConfessed', 'hask')).toBe(true);
    expect(Calamy.holds(j, 'haskRelents', 'hask')).toBe(true);
    await Calamy.play(j, 'go:hex_concordance', 'let him Sew it');
    await Calamy.play(j, `=${j.watch() + 14}`);
    expect(Calamy.holds(j, 'concordanceRestored', 'concordance')).toBe(true);
    await Calamy.play(j, 'Talk to the Concordance', 'word AUTHOR', 'Take your leave', 'Talk to Signature XVII', 'rather stay with you',
      'Take your leave');
    expect(Calamy.said(j)).toContain('READER: every page.');
    expect(Calamy.holds(j, 'quireStays', 'quire')).toBe(true);
  }, 900000);

  it('is read by the Book of the Exalted for what it has done, and blessed; then reads the Book of the Damned, and signs to come back',
    async () => {
      const j = await Calamy.start('doors', brand);
      await Calamy.play(j, 'go:dame_school', 'Dame Tibbet.s Primer: Take', 'go:bridge_middle', 'read the children their primer',
        ...withCrake, ...guide, 'go:hex_untitled', 'Attack', 'go:hex_doors', 'index bound in blue');
      expect(Calamy.knows(j, 'realms_read')).toBe(true);
      await Calamy.play(j, 'let the Book of the Exalted read you');
      expect(j.at('party')).toBe(C('celestia_terrace'));
      await Calamy.play(j, 'Talk to the Librarian', 'anything to take back', 'Take your leave', 'Go back down');
      expect(j.at('party')).toBe(C('hex_doors'));
      await Calamy.play(j, 'read the Book of the Damned');
      expect(j.at('party')).toBe(C('cthelll_gate'));
      await Calamy.play(j, 'Sign your name');
      expect(Calamy.holds(j, 'namedInCthelll', 'party')).toBe(true);
      const b = j.campaign.readout.creatures.find(c => c.name === 'Brand')!;
      expect([...b.base.abilities, ...b.state.learnedAbilities]).toEqual(expect.arrayContaining(['doom_spiral', 'anoint']));
    }, 600000);

  it('signs the lending slip for the shortest way to the Rotunda, and comes back under somebody else\'s name', async () => {
    const j = await Calamy.start('slip');
    await Calamy.play(j, ...withCrake, ...guide, 'go:gallery_lamps', 'Examine — Look closely', 'Sign the lending slip');
    expect(Calamy.holds(j, 'misnamed', 'party')).toBe(true);
    await Calamy.play(j, 'go:rotunda');
    expect(j.at('party')).toBe(C('rotunda'));
    // Its name altered, the company has no standing in the Parliament until the Catalogue hears it said aloud.
    await Calamy.play(j, 'go:reading_room', 'Talk to the Catalogue', 'enter you again', 'Take your leave');
    expect(Calamy.holds(j, 'misnamed', 'party')).toBe(false);
  }, 600000);

  it('carries a book of its own into the Stacks, and it comes back different: the Effusions, rewritten good, no longer ask to burn',
    async () => {
      const j = await Calamy.start('drift');
      await Calamy.play(j, 'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'Take your leave',
        'Effusions, tied in a string: Take', ...withCrake, ...guide, `=${j.watch() + 1}`);
      await Calamy.play(j, `=${j.watch() + 14}`);
      expect(Calamy.holds(j, 'mutated', 'effusions_stack')).toBe(true);
      expect(Calamy.said(j)).toContain('They have stopped asking to be burned');
    }, 600000);
});
