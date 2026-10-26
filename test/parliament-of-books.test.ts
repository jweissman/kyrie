import { describe, expect, it } from 'bun:test';
import { Calamy, C, Steps } from './support/calamy';
import type { Journey } from '../src/session/journey';

// A Parliament of Books, played by the labels a player sees (doc/adventures/parliament-of-books). Calamy, a city of
// paper; its books waking; nine days to the Kindling. Each journey is one way through it, from the causeway.
const reached = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
const sealed = (j: Journey) => j.campaign.world.related(C('sealed')).map(r => r.args[0]).sort();
// Waits to a watch; an ending that closes the book mid-wait ends the journey there.
const until = async (j: Journey, watch: number) => { try { await j.play(`=${watch}`); } catch (e) {
  if (!reached(j).length) { throw e; } } };

describe('A Parliament of Books: the city', () => {
  it('opens on the saltings: the Lamb, its almanack, the kitchens of the Hithe, and a copy that goes along', async () => {
    const j = await Calamy.start();
    expect(j.taken.length).toBe(0);
    await Calamy.play(j, ...Steps.arrive);
    for (const f of ['lamb_known', 'almanack_one', 'almanack_woke', 'sluice_quarrel', 'ague_known', 'jonquil_known', 'bond_trouble',
      'kindling_custom']) { expect(Calamy.knows(j, f)).toBe(true); }
    expect(j.holds('travelsWith', C('almanack'), 'party')).toBe(true);
    // The Almanack goes where the company goes, and is not met afresh in every room.
    await Calamy.play(j, 'go:old_gate');
    expect(j.at(C('almanack'))).toBe(C('old_gate'));
    expect(j.taken.at(-1)!.page).not.toContain('Almanack, a penny almanack');
    // What it heard leads somewhere: the garret at the top of Pudding Lane is on the map before it is visited.
    expect(j.holds('leadsTo', C('jonquil_known'), C('jonquil_garret'))).toBe(true);
  }, 120000);

  it('settles the night sluice and feeds the eel-pie wedding; and finds the heron that takes the fishwife\'s eels', async () => {
    const j = await Calamy.start('civic');
    await Calamy.play(j, 'go:quay', 'Talk to Bet', 'against the school', 'Take your leave', '=12', '=13', 'Talk to Bet', 'takes her fish',
      'Take your leave', 'go:buttery', 'Talk to Mistress Bunce', 'cheese', 'Take your leave', 'Talk to the Almanack', 'who takes the cheese',
      'Take your leave', 'Talk to Mistress Bunce', 'who has been taking', 'Take your leave', 'go:quad', 'Talk to the students', 'brass ring',
      'Take your leave');
    expect(Calamy.knows(j, 'heron_home')).toBe(true);
    expect(Calamy.holds(j, 'heronSettled', 'bet')).toBe(true);
    await Calamy.play(j, ...Steps.sluice);
    expect(Calamy.holds(j, 'sluiceSettled', 'sluice')).toBe(true);
    expect(Calamy.holds(j, 'coddyExposed', 'coddy')).toBe(false);
    await Calamy.play(j, 'go:taproom', '=342', '=344');
    expect(Calamy.said(j)).toContain('forty eel-heads');
    expect(Calamy.holds(j, 'fedAtWedding', 'party')).toBe(true);
    // The paper comes in from the mills on the fourth day.
    await Calamy.play(j, '=460');
    expect(Calamy.holds(j, 'paperIn', 'doble')).toBe(true);
  }, 180000);

  it('pleads a treatise\'s cause and wins it; a ballad finds a kinder verse; and the Ordinance fails', async () => {
    const j = await Calamy.start('law');
    await Calamy.play(j, 'go:bridge_middle', 'Talk to the Ballad', 'what it wants', 'kinder last verse', 'Take your leave',
      'go:court_hall', 'Talk to Pask', 'its cause', 'Offer to plead', 'Take your leave', ...Steps.sluice,
      'go:mudbank', '=198', 'go:saltings', 'Talk to Gil', 'what ails', 'tell the Court', 'Take your leave',
      'go:quay', '=444', 'go:court_hall', 'Show the Recorder page', 'Call Gil Marrish', 'Argue that a book may plead', '=+9', '=+2');
    expect(Calamy.holds(j, 'paskRuled', 'court')).toBe(true);
    expect(Calamy.said(j)).toContain('in Calamy a book may plead');
    await Calamy.play(j, 'go:guild_chamber', '=600', '=+4');
    expect(Calamy.holds(j, 'prowseSatisfied', 'prowse')).toBe(true);
    expect(Calamy.holds(j, 'ordinanceFailed', 'guildhall')).toBe(true);
    expect(Calamy.said(j)).toContain('The Ordinance fails');
  }, 180000);
});

describe('A Parliament of Books: the ways in', () => {
  it('goes in by the Archivist\'s reading: two pieces found, a letter read aloud, the ink cut at dead low water, and entered', async () => {
    const j = await Calamy.start('reading');
    await Calamy.play(j, ...Steps.arrive, ...Steps.pieces, ...Steps.hennet, ...Steps.quarles, ...Steps.key, ...Steps.ink, ...Steps.read);
    expect(j.at('party')).toBe(C('reading_room'));
    expect(Calamy.holds(j, 'entered', 'party')).toBe(true);
    expect(Calamy.holds(j, 'correctedEntry', 'party')).toBe(false);
    for (const f of ['quarles_account', 'codex_colophon', 'kindling_is_rite', 'shelfmark_given']) { expect(Calamy.knows(j, f)).toBe(true); }
    // Come home by the Founders' door, and the Chained Room is where you left it.
    await Calamy.play(j, 'go home by the Founders');
    expect(j.at('party')).toBe(C('chained_room'));
  }, 240000);

  it('goes in by Crake\'s back stacks, trusted: Crake comes, and the Second Canto sponsors the company', async () => {
    const j = await Calamy.start('stacks');
    await Calamy.play(j, ...Steps.arrive, ...Steps.corvell, ...Steps.crakeTrust);
    expect(j.at('party')).toBe(C('remainder_market'));
    expect(j.holds('travelsWith', C('crake'), 'party')).toBe(true);
    expect(Calamy.holds(j, 'entered', 'party')).toBe(false);
    // The Errata do not trouble a reader who comes in with the door's own keeper.
    expect(j.at(C('errata'))).not.toBe(C('remainder_market'));
    await Calamy.play(j, 'go:draft_fields', 'Talk to the Second', 'where they stand', 'speak for you', 'Take your leave');
    expect(Calamy.holds(j, 'sponsored', 'party')).toBe(true);
  }, 180000);
});

describe('A Parliament of Books: the Parliament and the Kindling', () => {
  it('moves the Parliament by what the city taught it, seals the Lending Accord on Kindling eve, and the Almanack sees the spring', async () => {
    const j = await Calamy.start('lending');
    await Calamy.play(j, ...Steps.arrive, 'Talk to the Almanack', 'kitchens of the Close', 'not sure it should tell', 'may keep',
      'Take your leave', ...Steps.pieces, ...Steps.hennet, ...Steps.quarles, 'go:gallon_attic', 'Talk to the Effusions', 'what they want',
      'Take your leave', ...Steps.corvell, 'go:crake_parlour', 'green ledger: Examine', 'go:jonquil_garret', 'Talk to Jonquil', 'Housebook',
      'what he would do', 'where his family', 'Take your leave', 'letter to his mother.s book: Take', ...Steps.key, ...Steps.ink, ...Steps.read);
    await Calamy.play(j, 'go:wellhead', 'first words: Examine', 'go:foxing_deep', 'Talk to Dame', 'where it stands',
      "Ottoline Quarles's message", 'Take your leave', 'go:hb_kitchen', 'Talk to the Annery', 'where she stands', 'Take your leave',
      'Give Jonquil', 'go:draft_fields', 'Talk to the Second', 'where they stand', 'poems in an attic', 'Take your leave',
      'go:orme_garden', 'Talk to Mother', 'where she stands', 'Take your leave', 'go:reading_room', 'Talk to the Catalogue',
      'how it would vote', "Crake's green ledger", 'Take your leave', 'go:chamber', 'Talk to the Great Roll', 'where it stands',
      'when the Parliament sits', 'first words at the Wellhead', 'Take your leave');
    // It does not sit until Kindling eve.
    expect(j.offers('Ask the Speaker to call')).toBe(false);
    await Calamy.play(j, '=1176', 'Ask the Speaker to call', 'Put to the Parliament: that every book sleep or wake',
      'Put to the Parliament: that any book may ask', "Put to the Parliament: that Crake's door",
      'Put to the Parliament: that no book be burned in Calamy save', 'seal the Colophon');
    const poll = Calamy.said(j, j.taken.length - 6);
    expect(poll).toContain('The Annery Housebook: aye.');
    expect(poll).toContain('The clerk votes aye');
    expect(sealed(j)).toEqual([C('door_licensed'), C('fire_leave'), C('read_asked'), C('sew_leave')]);
    expect(Calamy.knows(j, 'gift_given')).toBe(true);
    // Called home to the fire; the Almanack asks, and is spared.
    await Calamy.play(j, '=1219');
    expect(j.at('party')).toBe(C('ashpit'));
    await Calamy.play(j, 'Ask the Almanack to speak');
    await until(j, 1240);
    expect(Calamy.holds(j, 'almanacksSpared', 'ashpit')).toBe(true);
    await until(j, 1300);
    expect(reached(j)).toEqual([C('lending')]);
  }, 600000);

  it('does nothing at all: the almanacks are burned, the Colophon breaks, and the Year of Voices comes', async () => {
    const j = await Calamy.start('idle');
    await Calamy.play(j, 'go:ashpit');
    await until(j, 1240);
    expect(Calamy.holds(j, 'almanacksBurned', 'ashpit')).toBe(true);
    expect(Calamy.holds(j, 'colophonBroken', 'ashpit')).toBe(true);
    await until(j, 1300);
    expect(reached(j)).toEqual([C('unsewn')]);
    // The Speaker's motion stood for every article no one carried.
    expect(sealed(j)).toEqual([C('door_shut'), C('fire_leave'), C('read_rounds'), C('sew_all')]);
  }, 300000);
});
