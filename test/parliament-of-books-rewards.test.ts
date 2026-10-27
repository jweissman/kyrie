import { describe, expect, it } from 'bun:test';
import { Arcs, Calamy, C, Steps } from './support/calamy';
import type { Journey } from '../src/session/journey';
import type { CreatureGenerationContext } from '../src/content';

// The Manuals of A Parliament of Books: books that read their readers back, by `Resolve endow` (doc/adventures/
// parliament-of-books, the rewards). Each asks something of its reader before it gives, and gives once.
const one = (classId: string, backgroundId: string, level = 1): CreatureGenerationContext[] =>
  [{ name: 'Sam', raceId: 'human', classId, backgroundId, level } as CreatureGenerationContext];
const sam = (j: Journey) => j.campaign.readout.creatures.find(c => c.name === 'Sam')!;
const stacks = [...Steps.corvell, ...Steps.crakeTrust];
const corday = [...stacks, 'go:gloss_wood', 'Go round the glosses', 'go:margin_edge', 'Talk to Corday', 'why he sulks',
  'Scholiasts will not', 'Take your leave', "Corday's Grammar of the Sword: Take"];

describe('A Parliament of Books: the Manuals', () => {
  it('gives Corday\'s Grammar to a hunter who went round the glosses; read at the fourth level, it puts strength in the cut',
    async () => {
      const j = await Calamy.start('corday', one('ranger', 'hunter', 4));
      await Calamy.play(j, ...corday);
      expect(j.holds('carries', 'party', C('corday_book'))).toBe(true);
      const before = sam(j).base.strength;
      await Calamy.play(j, 'study Corday.s Grammar for the cut');
      expect(sam(j).base.strength).toBe(before + 2);
      expect(Calamy.holds(j, 'studied', 'corday_book')).toBe(true);
      // Once read, it has nothing more for anyone in this company: the parry is not offered after the cut.
      expect(j.offers('study Corday.s Grammar for the parry')).toBe(false);
    }, 300000);

  it('will not be read by a beginner: "Go and be beaten by a few people first"', async () => {
    const j = await Calamy.start('corday-young', one('ranger', 'hunter', 1));
    await Calamy.play(j, ...corday);
    expect(j.offers('study Corday.s Grammar')).toBe(false);
    expect(Calamy.said(j)).toContain('Go and be beaten by a few people first');
  }, 300000);

  it('takes Orme\'s cut chapters home from the Imprimatur, by Rhule\'s leave; the Physick\'s beds come back, and she gives a leaf',
    async () => {
      const j = await Calamy.start('physick');
      await Calamy.play(j, ...Arcs.rhuleKept, 'go:taproom', 'Talk to Moll', 'about the Kindling', 'Take your leave',
        'go:nance_room', 'Talk to Goody Nance', 'about the ague', 'Take your leave', '=218', 'go:imp_kitchen', 'Talk to Hester',
        'pages she reads at night', 'Orme.s cut chapter', 'Take your leave', 'go:excisions', "Orme's cut chapters: Take");
      expect(Calamy.knows(j, 'orme_cut')).toBe(true);
      await Calamy.play(j, '=294', ...stacks, 'go:orme_garden', 'Talk to Mother', 'where she stands', 'Take your leave',
        "Give Orme's cut chapters");
      expect(Calamy.holds(j, 'ormeRestored', 'physick')).toBe(true);
      await Calamy.play(j, 'Talk to Mother', 'anything in her garden', 'Take your leave');
      expect(Calamy.holds(j, 'ormeGave', 'physick')).toBe(true);
      expect(Calamy.said(j)).toContain('tangerine and church');
    }, 300000);

  it('keeps the Primer\'s last lesson for whoever read it aloud in the Foxing, at any level: wisdom, by one', async () => {
    const j = await Calamy.start('primer', one('warrior', 'soldier', 1));
    await Calamy.play(j, ...stacks, 'go:foxing_deep', 'Talk to Dame', 'where it stands', 'Take your leave', 'Read the Primer aloud');
    expect(Calamy.holds(j, 'hornbookRead', 'hornbook')).toBe(true);
    const before = sam(j).base.wisdom;
    await Calamy.play(j, 'Talk to Dame', 'teach you something', 'Take your leave', "keep the Primer's lesson");
    expect(sam(j).base.wisdom).toBe(before + 1);
    expect(j.offers("keep the Primer's lesson")).toBe(false);
  }, 300000);
});
