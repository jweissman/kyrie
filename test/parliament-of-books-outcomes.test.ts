import { describe, expect, it } from 'bun:test';
import { Calamy, C, Steps } from './support/calamy';
import type { Journey } from '../src/session/journey';
import type { CreatureGenerationContext } from '../src/content';

// The settlements the Parliament of the Bound can come to, each by the members it moved and the city's part at the
// fire (doc/adventures/parliament-of-books, 06: the council and its outcomes).
const reached = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
const sealed = (j: Journey) => j.campaign.world.related(C('sealed')).map(r => r.args[0]).sort();
const until = async (j: Journey, watch: number) => { try { await j.play(`=${watch}`); } catch (e) {
  if (!reached(j).length) { throw e; } } };
const one = (classId: string, backgroundId: string, level = 1): CreatureGenerationContext[] =>
  [{ name: 'Sam', raceId: 'human', classId, backgroundId, level } as CreatureGenerationContext];
// What the city knows that the Kindling was; and the Canon, told, will not have an almanack on the fire.
const rite = [...Steps.pieces, 'go:quarles_room', 'Talk to Ottoline', 'Tell the Archivist what you have found', 'Take your leave'];
const canon = ['go:vestry', 'Talk to Canon', 'what the Kindling was', 'Take your leave'];
// Through Crake's door with Crake beside you.
const withCrake = [...Steps.corvell, ...Steps.crakeTrust];
// Come in without the Catalogue's entry, a reader stands in the Parliament only if a member speaks for them.
const sponsor = ['go:draft_fields', 'Talk to the Second', 'where they stand', 'speak for you', 'Take your leave'];
const roll = ['go:chamber', 'Talk to the Great Roll', 'where it stands', 'when the Parliament sits', 'Take your leave'];
const wellhead = ['go:wellhead', 'first words: Examine', 'go:chamber', 'Talk to the Great Roll', 'first words at the Wellhead', 'Take your leave'];
const kindling = async (j: Journey) => { await until(j, 1240); await until(j, 1300); };

describe('A Parliament of Books: what the Parliament comes to', () => {
  it('carries the Recall by vote; the Canon keeps the almanacks off the fire, and the Quick are Sewn in the night', async () => {
    const j = await Calamy.start('recall');
    await Calamy.play(j, ...rite, ...canon, ...withCrake, ...sponsor, ...roll, '=1176', 'Ask the Speaker to call',
      'Put to the Parliament: that every book of Calamy be Sewn', 'seal the Colophon');
    expect(sealed(j)).toEqual([C('door_shut'), C('fire_leave'), C('read_rounds'), C('sew_all')]);
    expect(Calamy.holds(j, 'byDefault', 'art_door')).toBe(true);
    await kindling(j);
    expect(Calamy.holds(j, 'almanacksSpared', 'ashpit')).toBe(true);
    expect(Calamy.holds(j, 'almanackGone', 'almanack')).toBe(true);
    expect(reached(j)).toEqual([C('recalled')]);
  }, 600000);

  it('comes to the Separation: the Bound asleep, and a licensed door for the Quick to go by', async () => {
    const j = await Calamy.start('separation');
    await Calamy.play(j, ...rite, ...canon, ...withCrake, 'go:draft_fields', 'Talk to the Second', 'where they stand', 'let Crake keep',
      'speak for you', 'Take your leave', 'go:chamber', 'Talk to the Great Roll', 'where it stands', 'when the Parliament sits', 'licence is a toll',
      'Take your leave', '=1176', 'Ask the Speaker to call', 'Put to the Parliament: that every book of Calamy be Sewn',
      "Put to the Parliament: that Crake's door", 'seal the Colophon');
    expect(sealed(j)).toContain(C('door_licensed'));
    expect(sealed(j)).toContain(C('sew_all'));
    await kindling(j);
    expect(reached(j)).toEqual([C('separation')]);
  }, 600000);

  it('comes to the Pleading Accord: a warden sworn to the Physick, who clears the Ash from the gangway and binds the Lexicon', async () => {
    const j = await Calamy.start('pleading', one('cleric', 'warden', 3));
    await Calamy.play(j, ...rite, ...canon, 'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'Take your leave', ...withCrake,
      'go:orme_garden', 'Talk to Mother', 'where she stands', 'Swear to the Physick', 'Take your leave', 'go:draft_fields',
      'Talk to the Second', 'where they stand', 'poems in an attic', 'speak for you', 'Take your leave', 'go:foxing_deep', 'Talk to Dame', 'where it stands',
      'Take your leave', ...roll, ...wellhead, '=1176', 'Ask the Speaker to call', 'Drive the burned out of the gangway',
      'Talk to the Black Lexicon', 'where it stands',
      'Take your leave', 'Bind the Lexicon');
    expect(Calamy.holds(j, 'lexiconBound', 'lexicon')).toBe(true);
    expect(j.measure(C('seated'), C('chamber'))).toBe(5);
    await Calamy.play(j, 'Put to the Parliament: that every book sleep or wake', 'Put to the Parliament: that no book be burned but by judgment',
      'seal the Colophon');
    expect(sealed(j)).toEqual([C('door_shut'), C('fire_plea'), C('read_rounds'), C('sew_leave')]);
    await kindling(j);
    expect(reached(j)).toEqual([C('pleading')]);
  }, 600000);

  it('comes to the Open Door, by a traveller\'s word to the Physick, a dying man\'s letter, and an hour\'s reading in the Remainder Market', async () => {
    const j = await Calamy.start('open', one('bard', 'messenger'));
    await Calamy.play(j, 'go:taproom', 'Talk to the Almanack', 'what it is', 'kitchens of the Hithe', 'Take your leave', ...rite, ...canon, 'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'Take your leave', ...withCrake,
      'Read aloud for an hour', 'go:crake_parlour', 'green ledger: Examine', 'go:jonquil_garret', 'Talk to Jonquil', 'Housebook', 'what he would do', 'where his family', 'Take your leave',
      'letter to his mother.s book: Take', 'go:hb_kitchen', 'Talk to the Annery', 'where she stands', 'Take your leave', 'Give Jonquil',
      'go:orme_garden', 'Talk to Mother', 'where she stands', 'toll-gate', 'Take your leave',
      'go:foxing_deep', 'Talk to Dame', 'where it stands', 'nobody has ever read', 'Take your leave', 'go:draft_fields', 'Talk to the Second',
      'where they stand', 'poems in an attic', 'speak for you', 'Take your leave', ...roll, ...wellhead, '=1176', 'Ask the Speaker to call',
      'Put to the Parliament: that every book sleep or wake', 'Put to the Parliament: that the doors stand open', 'seal the Colophon');
    expect(sealed(j)).toContain(C('door_open'));
    await kindling(j);
    expect(reached(j)).toEqual([C('open_door')]);
  }, 600000);

  it('gives the Effusions to the Kindling by their own leave, and the Colophon is renewed', async () => {
    const j = await Calamy.start('yearbook');
    await Calamy.play(j, ...rite, ...canon, 'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'what the Kindling once was',
      'Take your leave', 'Effusions, tied in a string: Take');
    expect(Calamy.holds(j, 'yearBook', 'effusions')).toBe(true);
    await Calamy.play(j, 'go:ashpit', '=1227', 'Give the Effusions to the fire');
    expect(Calamy.holds(j, 'colophonRenewed', 'ashpit')).toBe(true);
    expect(Calamy.said(j, j.taken.length - 1)).toContain('carrying something');
  }, 600000);
});
