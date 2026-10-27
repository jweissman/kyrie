import { describe, expect, it } from 'bun:test';
import { Calamy, C, Steps } from './support/calamy';
import type { CreatureGenerationContext } from '../src/content';

// Who the protagonist is changes what they can do in Calamy and before the Parliament: not a number on a roll, but
// another way through (doc/adventures/parliament-of-books, the build matrix). Each journey is one person, alone.
const one = (classId: string, backgroundId: string, level = 1, raceId = 'human'): CreatureGenerationContext[] =>
  [{ name: 'Sam', raceId, classId, backgroundId, level } as CreatureGenerationContext];
// The quickest way into the Commonplace: Corvell's library, the lamplighter, the truth, and Crake's ribbon.
const stacks = [...Steps.corvell, 'go:corvell_hall', 'Talk to Sir Gideon', 'left of their own accord', 'Take your leave',
  'go:crake_front', 'Talk to Absalom', 'Tell Absalom Crake you told', 'take you where the books go', 'Take your leave',
  'go:crake_parlour', 'ribbon: Take', 'go:remainder_market'];

describe('A Parliament of Books: who you are', () => {
  it('a scholar sees the eye-skip in two scribes\' copies, is taught without reading to anyone, and answers the glosses', async () => {
    const j = await Calamy.start('scholar', one('mage', 'scholar'));
    await Calamy.play(j, 'go:scriveners', 'Talk to Orrin', 'no longer does love', 'Take your leave');
    expect(Calamy.knows(j, 'ambery_variant')).toBe(true);
    expect(Calamy.knows(j, 'ambery_exemplar')).toBe(false);
    await Calamy.play(j, 'Talk to Orrin', 'each copy has half', 'Take your leave', ...Steps.pieces, 'go:quarles_room', 'Talk to Ottoline',
      'Tell the Archivist what you have found', 'teach you the Inward', 'Take your leave');
    expect(Calamy.holds(j, 'readingTaught', 'party')).toBe(true);
    expect(Calamy.holds(j, 'reconciled', 'orrin')).toBe(true);
    await Calamy.play(j, ...stacks, 'go:gloss_wood');
    expect(j.offers('Answer the Scholiasts')).toBe(true);
    await Calamy.play(j, 'Answer the Scholiasts', 'go:margin_edge');
    expect(j.at('party')).toBe(C('margin_edge'));
  }, 300000);

  it('a priest speaks to the Housebook of the soul, and holds the Ashpit on Kindling night as one who has held a crowd', async () => {
    const j = await Calamy.start('priest', one('cleric', 'acolyte'));
    await Calamy.play(j, ...stacks, 'go:hb_kitchen', 'Talk to the Annery', 'where she stands', 'Canon of the Lamp has ruled', 'Take your leave');
    expect(Calamy.holds(j, 'favours', 'housebook', 'sew_leave')).toBe(true);
    await Calamy.play(j, 'go:crake_stacks', ...Steps.pieces, 'go:quarles_room', 'Talk to Ottoline', 'Tell the Archivist what you have found',
      'Take your leave', 'go:ashpit', '=1214');
    expect(j.offers('as one who has held a crowd')).toBe(true);
    await Calamy.play(j, 'as one who has held a crowd', '=1240');
    expect(Calamy.holds(j, 'almanacksSpared', 'ashpit')).toBe(true);
  }, 300000);

  it('a merchant prices a licence as a toll, and the Roll can write that', async () => {
    const j = await Calamy.start('merchant', one('bard', 'merchant'));
    await Calamy.play(j, ...stacks, 'go:chamber', 'Talk to the Great Roll', 'where it stands');
    expect(j.offers('licence is a toll')).toBe(true);
    await Calamy.play(j, 'licence is a toll', 'Take your leave');
    expect(Calamy.holds(j, 'favours', 'roll', 'door_licensed')).toBe(true);
  }, 300000);

  it('one of the courts moves to divide the question, and cites the Sixth Plea for a book\'s standing', async () => {
    const j = await Calamy.start('court', one('bard', 'diplomat'));
    await Calamy.play(j, 'go:court_hall', 'Talk to Pask', 'its cause', 'Offer to plead', 'Take your leave', '=444', 'go:court_hall');
    expect(j.offers('Cite the Pleas on Housebooks')).toBe(true);
    await Calamy.play(j, 'Cite the Pleas on Housebooks', 'Show the Recorder page', '=+9', '=+2');
    expect(Calamy.holds(j, 'paskRuled', 'court')).toBe(true);
    await Calamy.play(j, ...stacks, 'go:chamber', 'Talk to the Great Roll', 'where it stands', 'Recall be divided', 'Take your leave');
    expect(Calamy.holds(j, 'favours', 'roll', 'sew_leave')).toBe(true);
  }, 300000);

  it('one who has been held captive tells the Second Canto what a body not chosen is', async () => {
    const j = await Calamy.start('margins', one('thief', 'escaped_slave'));
    await Calamy.play(j, ...stacks, 'go:draft_fields', 'Talk to the Second', 'where they stand', 'held in a body', 'Take your leave');
    expect(Calamy.holds(j, 'favours', 'canto', 'sew_leave')).toBe(true);
  }, 300000);

  it('a healer guesses the burnt-off fourth herb and cures the ague without the Imprimatur\'s pages', async () => {
    const j = await Calamy.start('healer', one('cleric', 'medic'));
    await Calamy.play(j, 'go:pudding_lane', 'go:nance_room', 'Talk to Goody', 'about the ague', 'Take your leave', 'go:physic_garden',
      'painted-over board: Examine', 'go:nance_room', 'Talk to Goody', 'under the paint', 'Take your leave', 'must be horehound',
      'go:mudbank', '=48', 'go:reed_edge', '=60', 'go:reed_heart', 'calamus root: Take', 'go:nance_room', 'Give a calamus');
    expect(Calamy.holds(j, 'cured', 'nance')).toBe(true);
    await Calamy.play(j, '=110', 'go:pudding_lane');
    expect(Calamy.said(j, j.taken.length - 1)).toContain('eating bread and dripping');
  }, 300000);

  it('a thief picks Crake\'s lock at night, lifts the ribbon while he sleeps, and is corrected by the Errata', async () => {
    const j = await Calamy.start('thief', one('thief', 'burglar'));
    await Calamy.play(j, 'go:lantern_yard', '=96', 'Pick the lock on Crake', 'go:crake_parlour', 'ribbon: Take', 'go:remainder_market');
    expect(j.at('party')).toBe(C('remainder_market'));
    expect(Calamy.holds(j, 'ribbonOffered', 'crake')).toBe(false);
    expect(j.at(C('errata'))).toBe(C('remainder_market'));
    await Calamy.play(j, 'Let the Errata take you');
    expect(Calamy.holds(j, 'correctedEntry', 'party')).toBe(true);
    expect(Calamy.holds(j, 'entered', 'party')).toBe(true);
    expect(j.at('party')).toBe(C('reading_room'));
  }, 300000);

  it('a soldier swears to stand between the books and the mob, and the Physick will have judgment', async () => {
    const j = await Calamy.start('soldier', one('warrior', 'soldier', 3));
    await Calamy.play(j, ...stacks, 'go:orme_garden', 'Talk to Mother', 'where she stands', 'Swear to the Physick', 'Take your leave');
    expect(Calamy.holds(j, 'favours', 'physick', 'fire_plea')).toBe(true);
  }, 300000);

  it('a hunter knows the sheep are poisoned at a glance, and goes round the glosses like a wasps\' nest', async () => {
    const j = await Calamy.start('hunter', one('ranger', 'hunter'));
    await Calamy.play(j, 'go:mudbank', '=48', 'go:saltings', 'Talk to Gil', 'what ails', 'Take your leave');
    expect(Calamy.knows(j, 'dose_known')).toBe(true);
    await Calamy.play(j, ...stacks, 'go:gloss_wood', 'Go round the glosses', 'go:margin_edge', 'Talk to Corday', 'Scholiasts will not',
      'Take your leave');
    expect(Calamy.holds(j, 'cordayWon', 'corday')).toBe(true);
  }, 300000);
});
