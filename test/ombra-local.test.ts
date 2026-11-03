import { describe, expect, it } from 'bun:test';
import { Ombra } from './support/ombra';

// The Book of Faces, local.kyr: the Heron and the Lamp, Hester Lyle's Book of Hands, the umbrella war and Barnaby
// Sweet's wager. A check's die depends on the seed and on what was done before it, so the steps that may fail are
// written with `?`, each journey is played on a seed found for it, and a build that is good at the check is chosen (a
// bard for persuasion and performance, a thief for stealth, a warrior for brawn); the failure branches are proved on
// seeds that fail. The campaign is the integrated one, and OMBRA_CAMPAIGN names another (the author's, with the other
// files' people stubbed).
const campaign = process.env.OMBRA_CAMPAIGN ?? 'data/campaigns/the-book-of-faces.campaign.json';
const as = (cls: string) => Ombra.one(cls, undefined, 'human', 'Lyra');
const start = (seed: string, cls = 'bard') => Ombra.start(campaign, seed, as(cls));
const row = ['^To the Customs Steps', '>ombra__umbrella_row'];
const rent = (face: string) => [`Rent the ${face}`, `Put on the ${face}`];
const toAnnex = ['>ombra__annex_counter'];

describe('The Book of Faces: the umbrella war', () => {
  it('a bare Judge who calls the Trial honestly ends the war in one shop, and the Row sells a Founders\' umbrella after', async () => {
    const o = await start('a');
    await o.play(...row, '=day 3 14:10', "Take the Judge's stool", '?Order the Firsts', '?Give the verdict');
    expect(o.holds('lcJudging', 'party')).toBe(false);
    expect(o.holds('lcMerged', 'party')).toBe(true);
    expect(o.knows('lc_same_hand')).toBe(true);
    expect(o.knows('lc_margery')).toBe(true);
    expect(o.holds('lcDuelled', 'party')).toBe(false);
    expect(o.page).toContain('OSTLER & PENHALLOW, THE FIRST');
    // It persists past the evening the cousins were to have fought on, and the cousins are gone home.
    await o.until(o.watch + 80);
    expect(o.holds('lcMerged', 'party')).toBe(true);
    expect(o.at('lc_ned')).not.toBe(o.at('ostler'));
    expect(o.holds('lcFuneral', 'party')).toBe(false);
    // Next morning, masked, a Founders' umbrella may be bought.
    await o.play('=day 4 08:05', ...toAnnex, ...rent('Cockle'), '>ombra__ostler_shop', "Buy a Founders' umbrella");
    expect(o.carries('lc_umb_f')).toBe(true);
    expect(o.gold()).toBe(14 - 3 - 9);
  }, 120000);

  it('a Judge who cannot talk anyone round seizes the Firsts and reads the Usages aloud: no charm, no learning, only patience', async () => {
    const o = await start('a', 'warrior');
    await o.play(...row, '=day 3 14:10', "Take the Judge's stool", 'Take the Firsts down yourself', 'Read the Usages aloud');
    expect(o.holds('lcMerged', 'party')).toBe(true);
    expect(o.holds('lcDuelOff', 'party')).toBe(true);
  }, 120000);

  it('a rig that works gives the patent to one shop; a rib that is seen starts a riot, and the cousins in the chalk with the ferrules uncapped', async () => {
    const o = await start('c', 'thief');
    await o.play(...row, '=day 3 14:10', "Take the Judge's stool", '?Slip a rib in Penhallow');
    expect(o.holds('lcPatentO', 'party')).toBe(true);
    expect(o.holds('lcDuelOff', 'party')).toBe(true);
    expect(o.holds('lcMerged', 'party')).toBe(false);
    expect(o.page).toContain('The Row cheers, a little guiltily');
    // No second rig, and no verdict after it.
    expect(o.j.offers('Slip a rib')).toBe(false);
    expect(o.j.offers('Give the verdict')).toBe(false);
    await o.play('=day 4 10:00', '>ombra__bread_market', '>ombra__umbrella_row');
    expect(o.page).toContain('THE FIRST BY THE ROW');

    const seen = await start('a', 'thief');
    await seen.play(...row, '=day 3 14:10', "Take the Judge's stool", '?Slip a rib in Penhallow');
    expect(seen.holds('lcRiot', 'party')).toBe(true);
    expect(seen.holds('lcDuelling', 'party')).toBe(true);
    expect(seen.measure('heat', 'party')).toBeGreaterThanOrEqual(1);
    expect(seen.page).toContain('ferrules are not capped');
  }, 120000);

  it('a duel the company is not there to see wounds two cousins and kills neither; the Row stays quiet and shut', async () => {
    const o = await start('a');
    await o.play('^To the Customs Steps', '=day 3 18:00');
    expect(o.holds('lcDuelled', 'party')).toBe(true);
    expect(o.holds('lcFuneral', 'party')).toBe(false);
    await o.play('>ombra__umbrella_row');
    expect(o.page).toContain('scrubbed');
    // By day the cousins are in their shops, bandaged; nobody is selling to anybody who has been across the way.
    await o.play('=day 4 10:00', '>ombra__bread_market', '>ombra__umbrella_row');
    expect(o.page).toContain('sling');
    expect(o.at('lc_ned')).toBe('ombra__ostler_shop');
    expect(o.holds('lcWarOver')).toBe(false);
  }, 120000);

  it('a duel seen and not stopped kills the cousin who was hired to be hit; one stopped, or bound, does not', async () => {
    const watched = await start('a');
    await watched.play(...row, '=day 3 17:10');
    expect(watched.holds('lcDuelling', 'party')).toBe(true);
    await watched.play('=day 3 18:20');
    expect(watched.holds('lcFuneral', 'party')).toBe(true);
    expect(watched.holds('lcDuelling', 'party')).toBe(false);
    expect(watched.page).toContain('The Row will not forget that it watched');
    // The crêpe is on the door.
    await watched.until(watched.watch + 60);
    expect(watched.holds('lcFuneral', 'party')).toBe(true);

    const bound = await start('a', 'cleric');
    await bound.play(...row, '=day 3 17:10', '?Bind');
    expect(bound.holds('lcBound', 'party')).toBe(true);
    expect(bound.holds('lcFuneral', 'party')).toBe(false);
    await bound.play('=day 3 19:00');
    expect(bound.holds('lcFuneral', 'party')).toBe(false);
    expect(bound.holds('lcTruce', 'party')).toBe(true);

    const stood = await start('e', 'warrior');
    await stood.play(...row, '=day 3 17:10', '?Step into the chalk');
    expect(stood.holds('lcQuiet', 'party')).toBe(true);
    expect(stood.holds('lcDuelling', 'party')).toBe(false);
    expect(stood.holds('lcFuneral', 'party')).toBe(false);
  }, 120000);

  it('two children who take their masks off at the Ninth Bell, and two old people asked, one at a time, make the war a wedding', async () => {
    const o = await start('e');
    await o.play(...toAnnex, ...rent('Cockle'), '>ombra__eel_pond', '=19:10', '?Ask the two Cockles');
    expect(o.knows('lc_children_known')).toBe(true);
    expect(o.holds('lcChildrenMet', 'party')).toBe(true);
    await o.play('>ombra__annex_counter', '=day 2 08:10', ...rent('Cockle'), '>ombra__ostler_shop', '?Ask Maud Orrell what she would give', '>ombra__penhallow_shop', '?Ask Silas Haskew what his register');
    expect(o.holds('lcWedded', 'party')).toBe(true);
    expect(o.holds('lcDuelOff', 'party')).toBe(true);
    expect(o.carries('lc_umb_w')).toBe(true);
    // The cousins never take the Row; the wedding stands past the Deepening.
    await o.play('=day 3 18:00');
    expect(o.holds('lcDuelled', 'party')).toBe(false);
    expect(o.holds('lcFuneral', 'party')).toBe(false);
  }, 120000);

  it('a mediation that persuades both of them to send the cousins home ends the day without the duel, and without the war', async () => {
    const o = await start('c');
    await o.play(...toAnnex, ...rent('Cockle'), '>ombra__ostler_shop', 'Ask Maud Orrell about the board', '?Ask Maud Orrell to be the first', '>ombra__penhallow_shop', 'Ask Silas Haskew about the board', '?Ask Silas Haskew to be the first');
    expect(o.holds('lcOstlerYields', 'party')).toBe(true);
    expect(o.holds('lcPenYields', 'party')).toBe(true);
    expect(o.holds('lcQuiet', 'party')).toBe(true);
    await o.play('=day 3 17:30');
    expect(o.holds('lcDuelled', 'party')).toBe(false);
    expect(o.holds('lcWarOver')).toBe(false);
  }, 120000);
});

// The Warrant, taken for real from the sergeant who stands in Strangers' Square till she has her Bare (warrant.kyr);
// once it is held she stands in the Gatehouse.
const warrant = ['^To the Customs Steps', '>ombra__gate_square', 'Talk to a sergeant', 'Ask what use the Watch', 'Take the Stranger', '?Take your leave'];
const lost = ['^To the Customs Steps', '>ombra__eel_pond', '=day 3 20:30'];
const lostWarranted = [...warrant, '>ombra__eel_pond', '=day 3 20:30'];
describe('The Book of Faces: Barnaby Sweet\'s wager', () => {
  it('a Bare who reads the Ninth Usage saves the face before the race; the Magpie goes home on its own head', async () => {
    const o = await start('a');
    await o.play('^To the Customs Steps', '>ombra__eel_pond', '=day 3 17:30', 'Say good evening to the old man', '?Object to the stake', '=day 3 19:30');
    expect(o.knows('lc_pond_usage')).toBe(true);
    expect(o.holds('lcSweetSaved', 'party')).toBe(true);
    expect(o.holds('lcSweetLost', 'party')).toBe(false);
    expect(o.holds('lcRaceRun', 'party')).toBe(true);
  }, 120000);

  it('a word to Sweet, masked, takes it off the table too', async () => {
    const o = await start('a');
    await o.play(...toAnnex, '=day 3 08:10', ...rent('Cockle'), '>ombra__eel_pond', '=day 3 17:00', 'Ask the tallyman what he has on', '?Ask Barnaby Sweet to take his face', '=day 3 19:30');
    expect(o.knows('lc_sweet_wager')).toBe(true);
    expect(o.holds('lcSweetSaved', 'party')).toBe(true);
  }, 120000);

  it('left alone he loses it, and a company that sits with Gudge a night is given it back, with no check at all', async () => {
    const o = await start('a');
    await o.play(...lost);
    expect(o.holds('lcSweetLost', 'party')).toBe(true);
    expect(o.holds('lcSweetBack', 'party')).toBe(false);
    expect(o.at('sweet')).toBe('ombra__eel_pond');
    await o.play('Knock at the shed', 'Ask Old Gudge whether the thirty-second', 'Give Barnaby Sweet his Magpie');
    expect(o.holds('lcSweetBack', 'party')).toBe(true);
    expect(o.carries('lc_magpie_old')).toBe(false);
    // The day after, he is at the Coffee-house in it.
    await o.play('=day 4 10:00');
    expect(o.at('sweet')).toBe('ombra__coffee_room');
  }, 120000);

  it('a new face needs three signatures, Gudge\'s, a Crow\'s and the clerk\'s, and costs eight coin', async () => {
    const o = await start('c');
    await o.play(...lost, '?Ask Old Gudge to put his name');
    expect(o.holds('lcSigGudge', 'party')).toBe(true);
    await o.play('>ombra__lc_booth', '?Ask Hester Lyle to sign for the tallyman');
    expect(o.holds('lcSigLamb', 'party')).toBe(true);
    await o.play('>ombra__annex_counter', 'Ask Ferris Moll to cut a Magpie');
    expect(o.carries('lc_magpie_new')).toBe(true);
    expect(o.gold()).toBe(14 - 8);
    await o.play('>ombra__eel_pond', 'Give Barnaby Sweet the new Magpie');
    expect(o.holds('lcSweetNew', 'party')).toBe(true);
    expect(o.holds('lcSweetBack', 'party')).toBe(false);
  }, 120000);

  it('work done bare: a man nobody answers, asked to tally for the Bare, hangs a slate, and the Exchange reads it', async () => {
    const o = await start('a');
    await o.play(...lost, 'Sit down beside the bare man', "Ask him to tally the company's money", '?Chalk the first slate');
    expect(o.holds('lcSweetSlate', 'party')).toBe(true);
    await o.play('=day 4 10:00', '>ombra__row_street');
    expect(o.page).toContain('TALLIES');
    expect(o.at('sweet')).toBe('ombra__row_street');
    await o.play('Ask Sweet what a friend of the Exchange might hear');
    expect(o.knows('lc_survey_tip')).toBe(true);
  }, 120000);

  it('the Warrant lets a Bare tally in his place, and the Watch counts it', async () => {
    const o = await start('a');
    await o.play(...lostWarranted, '>ombra__coffee_room');
    const heat = o.measure('heat', 'party');
    await o.play('?Tally at the Coffee-house');
    expect(o.holds('lcSweetTallied', 'party')).toBe(true);
    expect(o.measure('heat', 'party')).toBe(heat + 1);
    expect(o.knows('lc_survey_tip')).toBe(true);
  }, 120000);

  it('a rematch for the face, rigged, wins it back and the stake twice over; honest, it loses the twelve coin', async () => {
    const o = await start('a', 'thief');
    await o.play(...lost, 'Stake twelve coin', '=day 4 17:00', '?Jam the grating', '=day 4 19:30');
    expect(o.holds('lcRematch', 'party')).toBe(true);
    expect(o.holds('lcRematchRun', 'party')).toBe(true);
    if (o.holds('lcRaceFixed', 'party')) {
      expect(o.holds('lcSweetBack', 'party')).toBe(true);
      expect(o.gold()).toBe(14 - 12 + 24);
    } else {
      expect(o.holds('lcSweetBack', 'party')).toBe(false);
      expect(o.gold()).toBe(14 - 12);
    }
  }, 120000);
});

// Night four, in the booth: Hester Lyle is open to the company that sat with her.
const boothAt = (start: string[]) => [...start, '>ombra__arcade', '=day 4 11:00', '=day 4 21:00', '>ombra__lc_booth', 'Ask Hester Lyle whether she has a moment', 'Sit in the booth'];
const booth = ['^To the Customs Steps', '>ombra__arcade', '=day 4 11:00', '=day 4 21:00', '>ombra__lc_booth', 'Ask Hester Lyle whether she has a moment', 'Sit in the booth'];
describe('The Book of Faces: Hester Lyle and the Book of Hands', () => {
  it('left alone, she gives the book up at the Ninth Bell of the sixth day, and the arcade shuts its board to the wall', async () => {
    const o = await start('a');
    await o.play('^To the Customs Steps', '>ombra__arcade', '=day 4 11:00');
    expect(o.knows('lc_demand_known')).toBe(true);
    expect(o.at('lc_keyman')).toBe('ombra__arcade');
    await o.play('=day 6 20:30');
    expect(o.holds('lcSurrendered', 'party')).toBe(true);
    expect(o.holds('lcLettersStopped', 'party')).toBe(true);
    await o.play('=day 7 11:00', '>ombra__arcade');
    expect(o.page).toContain('turned to the wall');
    expect(o.at('lamb')).toBe('ombra__lc_booth');
  }, 120000);

  it('a night\'s walk warns the clients before the book goes, and the Watch counts it', async () => {
    const o = await start('a');
    await o.play(...booth);
    expect(o.holds('lcLambOpen', 'party')).toBe(true);
    const heat = o.measure('heat', 'party');
    await o.play('?Take Lyle\'s index of addresses');
    expect(o.holds('lcWarned', 'party') || o.holds('lcWarnedHalf', 'party')).toBe(true);
    expect(o.measure('heat', 'party')).toBe(heat + 1);
    if (o.holds('lcWarned', 'party')) {
      await o.play('=day 6 20:30');
      expect(o.holds('lcSurrendered', 'party')).toBe(false);
      expect(o.holds('lcLedgerSafe', 'party')).toBe(true);
    } else {
      // Half the doors: the book still goes, thinner.
      await o.play('=day 6 20:30');
      expect(o.holds('lcSurrendered', 'party')).toBe(true);
    }
  }, 120000);

  it('the Warrant keeps the book unread; a company that reads it learns the clerk who wrote about the Lock-tax and the Lamp, and breaks her promise', async () => {
    const o = await start('a');
    await o.play(...boothAt(warrant), '>ombra__gate_hall', 'Ask Sergeant Vail whether the Watch will protect');
    expect(o.knows('lc_custody_known')).toBe(true);
    await o.play('>ombra__lc_booth', '=day 4 22:00', 'Take the Book of Hands into the Warrant');
    expect(o.holds('lcSealed', 'party')).toBe(true);
    expect(o.carries('lc_hands')).toBe(true);
    expect(o.holds('lcLedgerSafe', 'party')).toBe(true);
    await o.play('=day 6 20:30');
    expect(o.holds('lcSurrendered', 'party')).toBe(false);
    await o.play('Open the Book of Hands');
    expect(o.holds('lcRead', 'party')).toBe(true);
    expect(o.knows('lc_ledger_nf')).toBe(true);
    expect(o.knows('lc_lamp_writes')).toBe(true);
    expect(o.holds('lcLambOpen', 'party')).toBe(false);
    expect(o.holds('promiseBroken', 'lc_unread')).toBe(true);
  }, 120000);

  it('sealed and not read, the promise is kept at the end', async () => {
    const o = await start('a');
    await o.play(...boothAt(warrant), '>ombra__gate_hall', 'Ask Sergeant Vail whether the Watch will protect', '>ombra__lc_booth', '=day 4 22:00', 'Take the Book of Hands into the Warrant');
    expect(o.holds('lcSealed', 'party')).toBe(true);
    await o.until(1440 / 10 * 9 - 20);
    expect(o.holds('promiseKept', 'lc_unread')).toBe(true);
    expect(o.holds('promiseBroken', 'lc_unread')).toBe(false);
  }, 120000);

  it('she will burn it herself if asked, after the page has said what it costs, and the man in the key-grey is told why', async () => {
    const o = await start('a');
    await o.play(...booth, 'Ask Lyle to burn the Book of Hands');
    expect(o.holds('lcBurned', 'party')).toBe(true);
    expect(o.holds('lcLedgerSafe', 'party')).toBe(true);
    await o.play('=day 5 10:00', '>ombra__arcade');
    expect(o.page).toContain('stove fire');
    expect(o.at('lc_keyman')).not.toBe('ombra__arcade');
  }, 120000);

  it('a second book, passed to the keyman, ends the demand; the book he sees through is the real one at the Ninth Bell', async () => {
    const fooled = await start('b');
    await fooled.play(...booth, '?Fill a second book', '=day 5 08:10', ...toAnnex, ...rent('Crow'), '>ombra__arcade', '=day 5 10:00', '?Hand the keyman the second book');
    expect(fooled.holds('lcDecoyPassed', 'party')).toBe(true);
    await fooled.play('=day 6 20:30');
    expect(fooled.holds('lcSurrendered', 'party')).toBe(false);
    expect(fooled.holds('lcLedgerSafe', 'party')).toBe(true);

    const seen = await start('a');
    await seen.play(...booth, '?Fill a second book', '=day 5 08:10', ...toAnnex, ...rent('Crow'), '>ombra__arcade', '=day 5 10:00', '?Hand the keyman the second book');
    expect(seen.holds('lcDecoyCaught', 'party')).toBe(true);
    expect(seen.measure('heat', 'party')).toBeGreaterThanOrEqual(1);
    await seen.play('=day 5 20:30');
    expect(seen.holds('lcSurrendered', 'party')).toBe(true);
  }, 120000);

  it('the index and not the book: asked of Lyle at the stall, by a masked company that has sat with her', async () => {
    const o = await start('b');
    await o.play(...booth, '=day 5 08:10', ...toAnnex, ...rent('Cockle'), '>ombra__arcade', '=day 5 10:00', '?Ask Lyle to give the keyman the index');
    expect(o.holds('lcIndexGiven', 'party')).toBe(true);
    expect(o.holds('lcLedgerSafe', 'party')).toBe(true);
    await o.play('=day 6 20:30');
    expect(o.holds('lcSurrendered', 'party')).toBe(false);
  }, 120000);
});

// The Heron and the Lamp. Night one, with no check at all: Moll tells the company what the Swap is; Lyle is sat with
// and says what the baskets are; Cosimo is sat with and brought to think of the Swap as a form; Rill is told she may
// send the company away, and is sat with. Then the fifth day: he is early, the ferrywoman's first fare is the Pair, and
// a Witness holds the lantern.
const moll = ['^To the Customs Steps', '>ombra__annex_counter', 'Ask Ferris Moll what the Swap is'];
const lyle = ['>ombra__lc_booth', '=21:00', 'Ask Hester Lyle whether she has a moment', 'Sit in the booth', 'Ask Hester Lyle about the two baskets', 'Ask Hester Lyle why she has said nothing', 'Ask Hester Lyle what the Swap is'];
const cosimo = ['>ombra__lc_dray_room', 'Sit with him', 'Ask him about the Lamp', 'Ask him what he is afraid', 'Say that the Swap might be a form'];
const rill = async (o: Ombra, ...more: string[]) => o.play(`>${o.at('rill')}`, 'Tell her she may send you away', 'Sit in the stern', ...more);
const swap = ['>ombra__lc_dray_room', '=day 5 19:10', 'Remind him of the Ninth Bell', '>ombra__drip_landing', '=day 5 20:05', 'Hold the lantern, and ask', 'To the middle of the Cuff', 'Hold the lantern high', 'Count the middle strokes'];
const dark = 'At the ninth stroke, lower the lantern';
const light = 'At the ninth stroke, hold the lantern high';

describe('The Book of Faces: the Heron and the Lamp', () => {
  it('with no charm and no learning, a company that sits with each of them brings them together in the dark, by a laugh', async () => {
    const o = await start('a', 'warrior');
    await o.play(...moll, ...lyle, ...cosimo);
    await rill(o);
    expect(o.measure('lcCourage', 'party')).toBe(2);
    expect(o.measure('lcThaw', 'party')).toBe(2);
    expect(o.measure('lcBlessing', 'party')).toBe(1);
    await o.play(...swap, dark);
    expect(o.holds('lcOutcome', 'party')).toBe(true);
    expect(o.holds('loversTogether', 'party')).toBe(true);
    expect(o.holds('loversRevealed', 'party')).toBe(true);
    expect(o.holds('lcByLaugh', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_lovers')).toBe(true);
    await o.until(o.watch + 2);
    expect(o.measure('marks', 'party')).toBe(1);
    expect(o.page).toContain('one fare');
    // The morning after, on the ferry: one umbrella, two persons, one fare.
    await o.play('>ombra__drip_landing', '=day 6 08:05');
    await o.play('Wait');
    expect(o.page).toContain('over two');
    expect(o.at('cosimo')).toBe('ombra__drip_landing');
  }, 180000);

  it('the same company, with the lantern held high, brings them only to a civil agreement to go on as before', async () => {
    const o = await start('a', 'warrior');
    await o.play(...moll, ...lyle, ...cosimo);
    await rill(o);
    await o.play(...swap, light);
    expect(o.holds('lcOutcome', 'party')).toBe(true);
    expect(o.holds('lcCivil', 'party')).toBe(true);
    expect(o.holds('loversTogether', 'party')).toBe(false);
    expect(o.holds('loversRevealed', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_lovers')).toBe(true);
  }, 180000);

  it('a company that is also good with them, and holds the lantern up, shows two people to one another in the light, and they laugh', async () => {
    const o = await start('a');
    await o.play(...moll, ...lyle, ...cosimo, '?Help him answer her last question');
    await rill(o, 'Ask her who the lines are for', 'Ask her what he knows of her', 'Ask her why she thinks it would not be fair', '?Tell her the sentences were hers');
    await o.play(...swap, light);
    expect(o.holds('lcOutcome', 'party')).toBe(true);
    expect(o.holds('loversTogether', 'party')).toBe(true);
    expect(o.holds('lcByLaugh', 'party')).toBe(false);
  }, 180000);

  it('told who the other is, by a Bare, each of them is hurt: the Watch counts it, the Swap is not kept, and they are estranged', async () => {
    const o = await start('a', 'warrior');
    await o.play(...moll, ...lyle, '>ombra__lc_dray_room', 'Sit with him', 'Ask him about the Lamp', 'Tell him who the Lamp is');
    expect(o.holds('lcTold', 'party')).toBe(true);
    expect(o.holds('lcEstranged', 'party')).toBe(true);
    expect(o.measure('heat', 'party')).toBeGreaterThanOrEqual(1);
    await o.play('=day 5 19:10');
    expect(o.j.offers('Remind him of the Ninth Bell')).toBe(false);
    await o.play('>ombra__drip_landing', '=day 6 08:05');
    await o.play('Wait');
    expect(o.page).toContain('furled');
    expect(o.holds('lcOutcome', 'party')).toBe(false);
  }, 180000);

  it('left alone they pass each other on the Cuff in strangers\' spares and the letters go on', async () => {
    const o = await start('a', 'warrior');
    await o.play('^To the Customs Steps', '>ombra__drip_landing', '=day 5 22:30');
    expect(o.holds('lcSwapPassed', 'party')).toBe(true);
    expect(o.holds('lcOutcome', 'party')).toBe(false);
    expect(o.holds('roundDone', 'party', 'r_lovers')).toBe(false);
    expect(o.page).toContain('half a mile away');
  }, 180000);

  it('a forged letter makes him brave and the meeting hollow; confessed, it is forgiven', async () => {
    const forged = await start('a');
    await forged.play(...moll, ...lyle, '>ombra__lc_dray_room', 'Sit with him', 'Ask him about the Lamp', '?Write him a letter in the Lamp');
    expect(forged.holds('lcForged', 'party')).toBe(true);
    expect(forged.holds('lcCosWilling', 'party')).toBe(true);
    expect(forged.measure('lcCourage', 'party')).toBe(3);
    await forged.play(...swap.slice(1), dark);
    expect(forged.holds('lcMetDark', 'party')).toBe(true);
    expect(forged.holds('loversTogether', 'party')).toBe(false);

    const told = await start('a');
    await told.play(...moll, ...lyle, '>ombra__lc_dray_room', 'Sit with him', 'Ask him about the Lamp', '?Write him a letter in the Lamp', 'Tell him the letter was yours');
    expect(told.holds('lcConfessed', 'party')).toBe(true);
    await told.play(...swap.slice(1), dark);
    expect(told.holds('loversTogether', 'party')).toBe(true);
  }, 180000);
});

// Every person is in one place; every end of a thread implies what it should; the page names no ids and no unfilled
// slots.
const random = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
};
const people = ['cosimo', 'lamb', 'sweet', 'ostler', 'penhallow', 'lc_wyn', 'lc_tam', 'lc_ned', 'lc_kit', 'lc_keyman', 'lc_gudge'];
const invariants = (o: Ombra) => {
  const h = (n: string) => o.holds(n, 'party');
  for (const p of people) {
    const at = o.j.campaign.world.related('at').filter(r => r.args[0] === `ombra__${p}`);
    expect(at.length).toBeLessThanOrEqual(1);
  }
  if (h('lcOutcome')) { expect(h('loversMet')).toBe(true); expect(o.holds('roundDone', 'party', 'r_lovers')).toBe(true); }
  if (h('loversTogether')) { expect(h('loversRevealed')).toBe(true); expect(h('lcOutcome')).toBe(true); }
  if (h('lcByLaugh')) { expect(h('loversTogether')).toBe(true); }
  expect(h('lcMerged') && h('lcFuneral')).toBe(false);
  expect(h('lcWedded') && h('lcFuneral')).toBe(false);
  expect(h('lcPatentO') && h('lcPatentP')).toBe(false);
  expect(h('lcSealed') && h('lcBurned')).toBe(false);
  if (h('lcSurrendered')) { expect(h('lcLettersStopped')).toBe(true); }
  if (h('lcSweetBack')) { expect(h('lcSweetNew')).toBe(false); }
  // A Pair is in the boat only on the Swap night, and the boat is gone with the outcome.
  if (h('lcOutcome')) { expect(o.at('cosimo')).not.toBe('ombra__lc_cuff'); }
  const page = o.j.taken.at(-1)?.page ?? '';
  expect(page).not.toMatch(/ombra__|\{[a-z_?]+\}|undefined|NaN/);
};
const wander = async (o: Ombra, seed: string, steps: number) => {
  const next = random(seed);
  for (let i = 0; i < steps && o.running; i++) {
    const offered = o.j.choices()
      .filter(c => !/Set down here|Give to|Make camp|prepare spells|Prepare spells|Drop|Take$/.test(c.label));
    if (!offered.length) { break; }
    const waits = offered.filter(c => /Wait › (An hour|Until)/.test(c.label));
    const pool = waits.length && next() < 0.15 ? waits : offered.filter(c => !/^Wait/.test(c.label));
    const c = (pool.length ? pool : offered)[Math.floor(next() * (pool.length || offered.length))]!;
    try { await o.j.perform(c.command, c.label, c.grave); } catch (e) {
      if (o.running) { throw new Error(`${seed} step ${i} ${c.label}: ${String(e)}`); }
    }
    invariants(o);
  }
};
describe('The Book of Faces: local.kyr, wandered', () => {
  for (const [who, cls, seed] of [['a bard', 'bard', 'w1'], ['a thief', 'thief', 'w2'], ['a warrior', 'warrior', 'w3']] as const) {
    it(`${who}: 200 random offered choices from the Gate, after the first night in the Drip, and the invariants hold`, async () => {
      const o = await start(seed, cls);
      await o.play('^To the Customs Steps', '>ombra__drip_landing');
      await wander(o, seed, 200);
    }, 180000);
  }
  it('from the fifth evening, the Swap, taken at random', async () => {
    const o = await start('w4');
    await o.play(...moll, ...lyle, ...cosimo, '=day 5 19:10', '>ombra__drip_landing');
    await wander(o, 'w4', 120);
  }, 180000);
});

describe('The Book of Faces: what became of them', () => {
  it('left alone for nine days, the closing account tells each of them, and a thread done changes what it says', async () => {
    const o = await start('a');
    await o.play('^To the Customs Steps');
    await o.until(8 * 144 + 12 * 6 + 20);
    const page = o.page;
    for (const line of ['Of Cosimo Dray', 'Of Rill Ketch', 'Of Hester Lyle', 'Of Maud Orrell and Silas Haskew', 'Of Wyn Orrell and Tam Haskew', 'Of Barnaby Sweet', 'Of Old Gudge']) {
      expect(page).toContain(line);
    }
    expect(page).toContain('turned to the wall');
    expect(page).toContain('Ned Orrell carries his arm in a sling');
    expect(page).not.toContain('Of Cosimo Dray: he was married');

    const wed = await start('a');
    await wed.play(...moll, ...lyle, ...cosimo);
    await rill(wed);
    await wed.play(...swap, dark);
    await wed.until(8 * 144 + 12 * 6 + 20);
    expect(wed.page).toContain('he was married in the spring');
    expect(wed.page).toContain('she dictates no more letters');
  }, 240000);
});
