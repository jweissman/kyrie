import { describe, expect, it } from 'bun:test';
import { Ombra } from './support/ombra';

// Counting Row (data/adventures/book-of-faces/counting.kyr): the short pound (Round 5) and the Lock-tax (Round 6), played
// by the labels a player sees. OMBRA_CAMPAIGN points the run at a campaign that carries stubs for the persons other
// authors own; it defaults to the real one.
const campaign = process.env.OMBRA_CAMPAIGN ?? 'data/campaigns/the-book-of-faces.campaign.json';
const warrior = (seed = 'a') => Ombra.start(campaign, seed);
const thief = (seed = 'a') => Ombra.start(campaign, seed, Ombra.one('thief', 'criminal', 'human', 'Wren'));

// A check that may go either way: tried again, an hour on, until the thing it is for holds.
async function press(g: Ombra, label: string, done: () => boolean, tries = 10) {
  for (let i = 0; i < tries && !done(); i++) {
    await g.play(`?${label}`);
    if (!done()) { await g.play('?Wait › An hour'); }
  }
  expect(done()).toBe(true);
}
// A face from the Annex, put on, for the Masked Hours.
async function face(g: Ombra, name = 'Heron') {
  await g.play('>ombra__annex_counter', `Rent the ${name}`, `Put on the ${name}`);
}
// The Warrant, taken from the Sergeant at the Customs Steps before anything else is done (the real campaign does not
// begin with it held; the author's stub did).
const warranted = async (g: Ombra) => { await g.play('>ombra__gate_square', 'Talk to', 'Ask what use the Watch has', 'Take the Stranger'); expect(g.holds('warrantHeld', 'party')).toBe(true); };
const done = (g: Ombra, round: string) => g.holds('roundDone', 'party', round);
const bard = (seed = 'a') => Ombra.start(campaign, seed, Ombra.one('bard', undefined, 'human', 'Lyle'));

// The Heron clerk's sleeve is watched at noon, when the Warden walks the Exchange floor and she eats at her desk; a
// glance she notices spoils the day, and the next noon is another try.
async function copies(g: Ombra) {
  for (let d = 1; d <= 4 && !g.knows('ct_fenn_copies'); d++) {
    await g.play(`=day ${d} 08:00`);
    await face(g);
    await g.play('>ombra__locks_office', `=day ${d} 12:00`, '?Ask whether the strongroom', '?Watch her sleeve');
  }
  expect(g.knows('ct_fenn_copies')).toBe(true);
}
// By night, bare, in her room: told that the company knows, and an hour of nothing said.
async function fennTrust(g: Ombra) {
  await copies(g);
  const night = Math.floor(g.watch / 144) + 1;
  await g.play(`=day ${night} 21:00`, '>ombra__ct_fenn_room', 'Tell her you know she copies', 'Sit with her through her evening', 'Ask her to say what she has seen');
  expect(g.knows('lacke_taxed')).toBe(true);
}
// The Warden at home: his night is long, and he is let in.
async function atLacke(g: Ombra, night: number) {
  await g.play(`=day ${night} 21:00`, '>ombra__ct_locks_parlour');
}

describe('The short pound (Round 5)', () => {
  it('exposed at the Hall: the market pound borrowed, weighed against the Standard, laid on the Assessor\'s rail', async () => {
    const g = await warrior();
    await face(g);
    await g.play('>ombra__bread_market');
    expect(g.page).toMatch(/hangs the market.s pound/);
    await press(g, 'Ask Cob to lend', () => g.holds('ct_pound_out', 'party'));
    await g.play('>ombra__standard_room');
    await press(g, 'Set the market.s pound against the Standard', () => g.knows('ct_pound_short'));
    expect(g.page).toMatch(/an ounce light/);
    await g.play('>ombra__weights_floor', 'Lodge a Complaint of Short Weight, with the market');
    expect(g.holds('ct_pound_true', 'party')).toBe(true);
    expect(g.holds('ct_pound_exposed', 'party')).toBe(true);
    expect(done(g, 'r_pound')).toBe(true);
    expect(g.measure('marks', 'party')).toBe(1);
    // The face the complaint was lodged in has been thanked, and the Drip pays a farthing for it.
    expect(g.measure('goodwill', 'face_heron')).toBe(1);
    await g.play('>ombra__bread_market');
    expect(g.page).toMatch(/a penny and a farthing/);
  }, 240000);

  it('swapped in the dark: the Second Pound lifted from the Hall, hung on the market hook; the Assessor, told, keeps it', async () => {
    const g = await thief();
    await g.play('=21:00', '>ombra__standard_room');
    await press(g, 'Open the Hall.s reserve case', () => g.holds('ct_second_taken', 'party'));
    await g.play('>ombra__bread_market');
    await press(g, 'Hang the Hall.s Second Pound', () => g.holds('ct_pound_true', 'party'));
    expect(g.holds('ct_pound_swapped', 'party')).toBe(true);
    expect(done(g, 'r_pound')).toBe(true);
    expect(g.holds('ct_pound_exposed', 'party')).toBe(false);
    // The Hall counts its copies in the morning; a company that tells the Assessor spares itself the Watch.
    const heat = g.measure('heat', 'party');
    await g.play('=day 2 08:00');
    await face(g);
    await g.play('>ombra__weights_floor', 'Tell the Assessor where the Second Pound is');
    expect(g.holds('ct_assessor_told', 'party')).toBe(true);
    await g.play('=day 3 10:00');
    expect(g.measure('heat', 'party')).toBeLessThanOrEqual(heat);
    expect(g.holds('ct_pound_true', 'party')).toBe(true);
  }, 300000);

  it('left alone, the Drip rides on its ounce: the slate on the fourth day, the shrug on the seventh, no Mark', async () => {
    const g = await warrior();
    await g.play('>ombra__bread_market', '=day 4 10:00');
    expect(g.page).toMatch(/someone has written 16, and under it, smaller, 15/);
    await g.play('=day 7 10:00');
    expect(g.page).toMatch(/not cheating if everyone has agreed not to look/);
    expect(done(g, 'r_pound')).toBe(false);
    expect(g.holds('ct_pound_true', 'party')).toBe(false);
  }, 300000);

  it('the Assessor is met in her kitchen at night, bare, and asks for her own loaf to be weighed at the Drip\'s beam', async () => {
    const g = await warrior();
    await g.play('=21:00', '>ombra__ct_assessor_kitchen', 'Talk to Hanne Orrow');
    expect(g.page).toMatch(/Hanne Orrow/);
    await g.play('Tell her you have come about the Drip.s bread');
    expect(g.holds('ct_assessor_warm', 'assessor')).toBe(true);
    expect(g.knows('ct_complaint_form')).toBe(true);
    await g.play('Ask her what she would have done');
    expect(g.carries('ct_hers_loaf')).toBe(true);
    // By day, masked, the loaf at the market's beam says what the beam is.
    await g.play('=day 2 08:30');
    await face(g, 'Cockle');
    await g.play('>ombra__bread_market', 'Ask Cob to weigh the Assessor.s loaf');
    expect(g.knows('ct_pound_short')).toBe(true);
    expect(g.page).toMatch(/A pound and an ounce/);
    // Warm, she lodges the complaint on a word.
    await g.play('>ombra__weights_floor');
    await press(g, 'Lodge a Complaint of Short Weight, as one who has sat in her kitchen', () => g.holds('ct_pound_true', 'party'));
    expect(done(g, 'r_pound')).toBe(true);
  }, 300000);

  it('has a Magpie who shows what a reckoning is, and a broker who can be squeezed or bluffed; the bare get the cold thing', async () => {
    const g = await warrior();
    await g.play('=10:00', '>ombra__coffee_room', 'Say something to the tallyman');
    expect(g.page).toMatch(/cold thing he has to say to the Bare/);
    await face(g, 'Magpie');
    await g.play('>ombra__coffee_room', 'Ask the tallyman who gains');
    expect(g.knows('ct_brokers_gain')).toBe(true);
    await g.play('Ask what a tallyman may say about a short till');
    expect(g.knows('ct_reckoning')).toBe(true);
    expect(g.page).toMatch(/A sum has no face/);
    // He is bluffed once: either the hook is seen to by morning, or the lie has a flaw in it and he is too gracious to say.
    await g.play('=10:00');
    await g.play('?Tell him the Assessor weighs the Drip.s bread');
    if (g.holds('ct_marl_bluff_won', 'party')) {
      expect(g.holds('ct_pound_true', 'party')).toBe(true);
      expect(done(g, 'r_pound')).toBe(true);
    } else {
      expect(g.holds('ct_pound_true', 'party')).toBe(false);
    }
  }, 300000);
});

describe('The Lock-tax (Round 6)', () => {
  it('Ashlin, by an hour waited: the key and the testimony, no book; the strongroom opened at noon and the ledger read', async () => {
    const g = await warrior();
    await fennTrust(g);
    expect(g.holds('ct_fenn_trust', 'fenn')).toBe(true);
    expect(g.holds('ct_fenn_yields', 'fenn')).toBe(false);
    // She will not give the book while she can still be the signing hand.
    expect(g.j.matches('Ask her for the book').length).toBe(0);
    await g.play('Ask about the key to the strongroom');
    expect(g.carries('ct_strong_key')).toBe(true);
    const night = Math.floor(g.watch / 144) + 1;
    await g.play(`=day ${night + 1} 12:00`, '>ombra__locks_office', "unlock the strongroom with Ashlin's key", '>ombra__locks_strongroom');
    expect(g.at('party')).toBe('ombra__locks_strongroom');
    await press(g, 'Read the Lock-tax book', () => g.knows('ct_ledger_false'));
    expect(g.page).toMatch(/A half is a custom/);
    expect(g.measure('heat', 'party')).toBe(0);
  }, 300000);

  it('Ashlin, by a form of words: a reckoning has no face; she gives the book, and is not broken in giving it', async () => {
    const g = await warrior();
    await copies(g);
    await g.play('>ombra__coffee_room', 'Ask what a tallyman may say about a short till');
    expect(g.knows('ct_reckoning')).toBe(true);
    // Learned by day, in a Magpie, among the tallymen: the tally-house is open to the faced.
    const day = Math.floor(g.watch / 144) + 1;
    for (let n = day; n <= day + 3 && !g.holds('ct_fenn_yields', 'fenn'); n++) {
      await g.play(`=day ${n} 21:00`, '>ombra__ct_fenn_room', '?Tell her you know she copies', '?Offer her the form of a reckoning');
    }
    expect(g.holds('ct_fenn_yields', 'fenn')).toBe(true);
    expect(g.holds('ct_fenn_cowed', 'fenn')).toBe(false);
    await g.play('Ask her for the book she keeps');
    expect(g.carries('ct_true_book')).toBe(true);
    expect(g.knows('lacke_taxed')).toBe(true);
    expect(g.page).toMatch(/A sum has no face/);
  }, 300000);

  it('Ashlin, frightened with the Warrant: she either gives the book and leaves Ombra, or runs to her sister for two days', async () => {
    const g = await warrior();
    await warranted(g);
    await copies(g);
    const night = Math.floor(g.watch / 144) + 1;
    await g.play(`=day ${night} 21:00`, '>ombra__ct_fenn_room', 'Tell her you know she copies');
    await g.play('Tell her the Warrant will have the signing hand');
    if (g.holds('ct_fenn_yields', 'fenn')) {
      expect(g.holds('ct_fenn_cowed', 'fenn')).toBe(true);
      await g.play('Take the book she holds out');
      expect(g.carries('ct_true_book')).toBe(true);
      expect(g.knows('lacke_taxed')).toBe(true);
      // She is not in the Office the next morning, and does not come back.
      await g.play(`=day ${night + 1} 10:00`, '>ombra__locks_office');
      expect(g.at('fenn')).toBe('ombra__offstage');
      expect(g.measure('marks', 'party')).toBe(0);
    } else {
      expect(g.holds('ct_fenn_bolted', 'fenn')).toBe(true);
      await g.play(`=day ${night + 1} 10:00`);
      expect(g.at('fenn')).toBe('ombra__offstage');
      await g.play(`=day ${night + 2} 10:00`);
      expect(g.holds('ct_fenn_bolted', 'fenn')).toBe(false);
      expect(g.at('fenn')).toBe('ombra__locks_office');
    }
  }, 300000);

  it('Lacke, given a clock that is honestly wrong: he writes it out, and the Round is done with no tongue at all', async () => {
    const g = await warrior();
    await fennTrust(g);
    const day = Math.floor(g.watch / 144) + 1;
    await g.play(`=day ${day + 1} 10:00`, '>ombra__exchange_floor', 'Buy a travelling clock');
    expect(g.gold()).toBeLessThan(14);
    await atLacke(g, day + 1);
    // The gift needs only what he collects: he is not offered it before he has told what the clocks are.
    expect(g.j.matches('Give him the travelling clock').length).toBe(0);
    await g.play('Ask him about the clocks');
    expect(g.j.matches('Give him the travelling clock').length).toBe(1);
    await g.play('Give him the travelling clock');
    expect(g.measure('ct_lacke_end', 'lacke')).toBe(4);
    expect(done(g, 'r_lacke')).toBe(true);
    expect(g.page).toMatch(/eleven minutes a day/);
    // And it stays: a rest, a day on, he is still at home in the mornings, with the Key hung up.
    await g.play(`=day ${day + 2} 10:00`, '>ombra__locks_office');
    expect(g.at('lacke')).toBe('ombra__ct_locks_parlour');
    expect(g.measure('ct_lacke_end', 'lacke')).toBe(4);
    expect(g.measure('marks', 'party')).toBe(1);
  }, 300000);

  it('Lacke, named: his face learned at his own table, and said aloud in the street by day; the Warden is gone from his office', async () => {
    const g = await warrior();
    await atLacke(g, 1);
    expect(g.knows('ct_lacke_face')).toBe(true);
    await g.play('=day 2 08:00');
    await face(g, 'Heron');
    await g.play('>ombra__locks_office', 'Name Ser Corvin Lacke aloud');
    expect(g.holds('named', 'lacke')).toBe(true);
    expect(g.measure('heat', 'party')).toBe(2);
    expect(g.measure('ct_lacke_end', 'lacke')).toBe(1);
    expect(done(g, 'r_lacke')).toBe(true);
    expect(g.page).toMatch(/Lacke.s nineteen years come up the Row/);
  }, 240000);

  it('Lacke, made to laugh by a performer, gives up the Key: worn, it costs heat and the strongroom is open to its wearer', async () => {
    const g = await bard();
    for (let n = 1; n <= 4 && !g.holds('ct_lacke_cracked_laugh', 'lacke'); n++) {
      await atLacke(g, n);
      await g.play('?Ask him about the clocks');
      await press(g, 'Name the maker of the long-case clock', () => g.holds('ct_lacke_warm', 'lacke'));
      await g.play('?Tell him, gravely, the story of the Assessor');
    }
    expect(g.holds('ct_lacke_cracked_laugh', 'lacke')).toBe(true);
    await g.play('Take the Key as the price of the matter going no further');
    expect(g.holds('holdsFace', 'party', 'face_key')).toBe(true);
    expect(g.measure('ct_lacke_end', 'lacke')).toBe(5);
    expect(done(g, 'r_lacke')).toBe(true);
    const next = Math.floor(g.watch / 144) + 2;
    await g.play(`=day ${next} 09:00`, 'Put on the Key');
    expect(g.measure('heat', 'party')).toBeGreaterThanOrEqual(1);
    expect(g.page).toMatch(/The Key sits on your face/);
    await g.play('>ombra__locks_strongroom');
    expect(g.at('party')).toBe('ombra__locks_strongroom');
  }, 300000);

  it('Lacke, threatened: he is either gone before light or has shouted for the Watch; and left alone, he burns his ledger on the sixth day', async () => {
    const g = await warrior();
    await warranted(g);
    await fennTrust(g);
    const day = Math.floor(g.watch / 144) + 1;
    await g.play(`=day ${day + 1} 21:00`, '>ombra__ct_locks_parlour', 'Ask him about the clocks');
    const heat = g.measure('heat', 'party');
    await g.play('?Stand among the clocks and tell him what the Warrant does');
    if (g.measure('ct_lacke_end', 'lacke') === 3) {
      expect(g.holds('ct_lacke_gone', 'lacke')).toBe(true);
      expect(done(g, 'r_lacke')).toBe(true);
    } else {
      expect(g.measure('heat', 'party')).toBe(heat + 2);
      expect(done(g, 'r_lacke')).toBe(false);
    }
  }, 300000);

  it('left alone he is still the Key on the sixth day, and his book is ash: the strongroom no longer teaches', async () => {
    const g = await warrior();
    await g.play('=day 6 13:00');
    expect(g.holds('ct_lacke_burned', 'lacke')).toBe(true);
    expect(g.page).toMatch(/thin brown smoke goes up the Warden.s chimney/);
    expect(g.measure('ct_lacke_end', 'lacke')).toBe(0);
    expect(done(g, 'r_lacke')).toBe(false);
  }, 300000);

  it('speaks the cold thing to the bare by day, and answers a masked knock at night with a window', async () => {
    const g = await warrior();
    await g.play('>ombra__locks_office', 'Talk to', 'Say something to the Key');
    expect(g.page).toMatch(/does not receive/);
    expect(g.j.matches('Ask the Warden how').length).toBe(0);
    await face(g, 'Heron');
    await g.play('>ombra__locks_office', 'Ask the Warden how the city.s locks are kept');
    expect(g.knows('ct_tax_how')).toBe(true);
    // Masked, at night, the stair is open and the door is not: he does not receive burglars.
    await g.play('=21:00', '>ombra__ct_locks_parlour');
    expect(g.page).toMatch(/Ser Corvin Lacke/);
  }, 240000);
});

// A walk through whatever is offered: the world must never hold a person in two places, a fact that cannot be, or a
// Round done twice, however the company wanders among these people.
describe('Counting Row, walked at random', () => {
  it('keeps the world consistent through three hundred offered actions', async () => {
    const g = await Ombra.start(campaign, 'walk', Ombra.one('thief', 'criminal', 'human', 'Wren'));
    let seed = 7;
    const rand = (n: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    const people = ['lacke', 'fenn', 'assessor', 'thole', 'ct_cob', 'ct_tally', 'ct_marl', 'ct_hawker'];
    await g.play('>ombra__row_street');
    for (let i = 0; i < 300 && g.running; i++) {
      const offered = g.j.choices().filter(c => !/^Pack|Set down|Light|Lift .* mask|Name .* aloud|prepare/.test(c.full) && !/Take your leave/.test(c.label));
      if (!offered.length) { break; }
      const pick = offered[rand(offered.length)]!;
      try { await g.j.step(`@${pick.command}`); } catch { /* an act that cannot be done now is not offered next time */ }
      for (const p of people) {
        expect(g.j.campaign.world.related('at', `ombra__${p}`).length).toBeLessThanOrEqual(1);
      }
      // A fact that needs its source has it.
      if (g.knows('lacke_taxed')) {
        expect(g.knows('ct_ledger_false') || g.holds('ct_fenn_trust', 'fenn') || g.holds('ct_fenn_yields', 'fenn')).toBe(true);
      }
      if (done(g, 'r_pound')) { expect(g.holds('ct_pound_true', 'party')).toBe(true); }
      if (done(g, 'r_lacke')) { expect(g.measure('ct_lacke_end', 'lacke')).toBeGreaterThan(0); }
    }
  }, 300000);
});
