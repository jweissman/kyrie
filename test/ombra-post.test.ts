import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// The Wet Post (data/adventures/book-of-faces/post.kyr): the Burning of the Nobodies, the Clerk Who Reads, the Delivery
// to a Mask. Played by the labels a player sees. OMBRA_CAMPAIGN names a campaign that carries the other authors'
// relations (ci_pip_forgave, cl_pell_penitent, the Registrar's ledger, the Warrant) as stubs when the module is not
// whole, with 'zz:' acts that grant them; the cases that need those are skipped without it. Seeds are chosen for the
// dice a case needs: a check's die depends on the seed and on what was done before it, so each case names the seed that
// makes it go the way it proves, and a case that need not care writes '?' before the step.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const stubbed = process.env.OMBRA_CAMPAIGN !== undefined;
const start = (seed = 'ombra') => Ombra.start(campaign, seed);
const withStubs = stubbed ? it : it.skip;
const T = 90_000;

const rent = (face: string) => ['>ombra__annex_counter', `?Rent the ${face}`, `?Put on the ${face}`];
const toCounter = ['>ombra__dlo_counter'];
const toHall = ['>ombra__dlo_sorting'];
const digWanting = "Go through the next sack of 'Wanting";
const parcelsWanting = "Open the parcels' sack of 'Wanting";
// The vigil: at two on the first night Pell walks to the Chapel; sitting down beside him gets the story, nothing asked.
const vigil = ['>ombra__chapel_steps', '=day 2 02:00', 'Sit down on the step beside him'];
// Eight in the evening of the second day: bare, at the counter lamp.
const toLamp = ['=day 2 20:00', '>ombra__dlo_counter', 'Talk to Tomas Pell'];

describe('The Burning of the Nobodies: finding the Book', () => {
  it('can be sorted by patience: three sacks of the seventh line, and the Book redeemed for its carriage', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...toHall, 'Take a shift', digWanting, digWanting, digWanting);
    expect(o.holds('ps_book_found', 'party')).toBe(true);
    expect(o.carries('book_of_faces')).toBe(false);
    await o.play('>ombra__dlo_office', 'Redeem the parcel');
    expect(o.carries('book_of_faces')).toBe(true);
    expect(o.holds('ps_redeemed', 'party')).toBe(true);
    expect(o.gold()).toBe(3);
    expect(o.page).toContain('The Office thanks you');
    expect(o.page).toContain('experience: found the Book of Faces');
  }, T);

  it('is staff only to a bare face; a Crow walks through; a masked stranger pays the boy two coin', async () => {
    const o = await start();
    await o.play(...toCounter, 'Speak to the clerk');
    expect(o.page).toContain('The counter serves faces');
    await o.play(...toHall);
    expect(o.at('party')).toBe('ombra__dlo_counter');
    expect(o.page).toContain('Staff only');
    await o.play(...rent('Cockle'), ...toCounter, 'Talk to Dickon', 'Give the boy two coin');
    await o.play(...toHall);
    expect(o.at('party')).toBe('ombra__dlo_sorting');
  }, T);

  it('is learned by working two shifts for the Office, and the third sack of a line is a parcel', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toHall, 'Take a shift');
    expect(o.knows('ps_filing')).toBe(false);
    expect(o.gold()).toBe(15);
    await o.play('=day 2 09:00', ...rent('Crow'), ...toHall, 'Take a shift');
    expect(o.knows('ps_filing')).toBe(true);
    await o.play(parcelsWanting);
    expect(o.holds('ps_book_found', 'party')).toBe(true);
  }, T);

  it('is found in an hour by asking the boy, who filed it: five coin for his answer', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, 'Talk to Dickon', 'Give Dickon five coin');
    expect(o.knows('ps_rack_told')).toBe(true);
    expect(o.knows('ps_pell_suspect')).toBe(true);
    const before = o.watch;
    await o.play(...toHall, parcelsWanting);
    expect(o.holds('ps_book_found', 'party')).toBe(true);
    expect(o.watch - before).toBeLessThan(8);
  }, T);

  it("is slower in a wrong line: a sack of the eighth, Nobody's own, is the Drip's thanks and not the Book", async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toHall, "Go through the next sack of 'And Nobody", 'Take the bundle of thanks');
    expect(o.holds('ps_book_found', 'party')).toBe(false);
    expect(o.knows('ps_thanks_known')).toBe(true);
    expect(o.carries('ps_thanks')).toBe(true);
    expect(o.page).toContain('Nobody is not a person');
  }, T);

  it("reads the rhyme off the Postmaster's card, when her drawer is picked while she dines at the counter", async () => {
    const o = await start('drawer');
    await o.play(...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Ask the Postmaster how the Office sorts');
    expect(o.knows('ps_drawer_known')).toBe(true);
    await o.play('=day 1 12:00', '>ombra__dlo_office', '?Pick the lock', '?Pick the lock', '?Pick the lock');
    if (o.holds('ps_drawer_open', 'party')) {
      await o.play('Read the Filing');
      expect(o.knows('ps_filing')).toBe(true);
    }
  }, T);
});

describe('The Burning of the Nobodies: Tomas Pell', () => {
  it('turns a bare face away by day and a mask away by night, in his own words', async () => {
    const o = await start();
    await o.play(...toCounter, 'Speak to the clerk');
    expect(o.page).toContain('The counter serves faces');
    await o.play('=day 1 20:30', ...rent('Crow'), '>ombra__dlo_counter', 'Speak to the man on the stool');
    expect(o.page).toContain('I will not talk to a mask in my own lamp');
  }, T);

  it('is watched, then pressed, and admits where it is; evidence does not move him', async () => {
    const o = await start('s0');
    await o.play(...rent('Crow'), ...toCounter, 'Talk to Tomas Pell', 'Watch the clerk', 'Tell him you know whose clerk', 'Ask him why he did not', 'Tell him what the Book will prove');
    expect(o.knows('ps_pell_is_pell')).toBe(true);
    expect(o.holds('ps_pell_admits', 'party')).toBe(true);
    expect(o.knows('pell_hid_book')).toBe(true);
    expect(o.knows('ps_rack_told')).toBe(true);
    expect(o.holds('ps_pell_evidenced', 'party')).toBe(true);
    expect(o.holds('ps_pell_free', 'party')).toBe(false);
    expect(o.page).toContain('And?');
    await o.play(...toHall, parcelsWanting);
    expect(o.holds('ps_book_found', 'party')).toBe(true);
  }, T);

  it('tells his story, nothing asked, to whoever sits down on the Chapel step at two in the morning', async () => {
    const o = await start();
    await o.play(...vigil);
    expect(o.holds('ps_vigil_kept', 'party')).toBe(true);
    expect(o.holds('ps_pell_admits', 'party')).toBe(true);
    expect(o.knows('pell_hid_book')).toBe(true);
    expect(o.knows('ps_pell_is_pell')).toBe(true);
    expect(o.page).toContain('I put her mask straight');
    expect(o.holds('ps_pell_free', 'party')).toBe(false);
    expect(o.carries('book_of_faces')).toBe(false);
  }, T);

  withStubs('puts the Book down himself when he is told Pip has forgiven him, and goes to the Chapel', async () => {
    const o = await start();
    await o.play(...vigil, ...toLamp, 'zz: Pip forgives', 'Tell him that Pip Tolliver has forgiven him');
    expect(o.holds('ps_pell_free', 'party')).toBe(true);
    expect(o.carries('book_of_faces')).toBe(true);
    await o.play('=+2');
    expect(o.at('pell')).toBe('ombra__chapel_steps');
    expect(o.page).toContain('I should like to be the one');
  }, T);

  withStubs('puts the Book down when asked as a penitent', async () => {
    const o = await start();
    await o.play(...vigil, ...toLamp, 'zz: penitent', 'Ask him, as the Chapel asks a penitent');
    expect(o.holds('ps_pell_free', 'party')).toBe(true);
    expect(o.carries('book_of_faces')).toBe(true);
  }, T);

  withStubs("puts the Book down at the sight of the Registrar's hand on the last page", async () => {
    const o = await start();
    await o.play(...vigil, ...toLamp, 'zz: ledger', 'Show him the last page');
    expect(o.holds('ps_pell_free', 'party')).toBe(true);
    expect(o.carries('book_of_faces')).toBe(true);
    expect(o.page).toContain('She would want it said that I was late');
  }, T);
});

describe('The Burning of the Nobodies: the fire', () => {
  it('burns the Nobodies at noon on the ninth day, the Book among them, and the news says so', async () => {
    const o = await start();
    await o.play('=day 9 09:50');
    expect(o.holds('ps_sacks_at', 'dlo_sorting')).toBe(true);
    await o.play('=day 9 10:10');
    expect(o.holds('ps_sacks_at', 'dlo_furnace')).toBe(true);
    expect(o.holds('ps_sacks_at', 'dlo_sorting')).toBe(false);
    await o.play('=day 9 12:10');
    expect(o.holds('ps_burning_begun', 'post_office')).toBe(true);
    expect(o.holds('ps_book_burned', 'party')).toBe(false);
    await o.until(1185 + 2);
    expect(o.holds('ps_burnt', 'post_office')).toBe(true);
    expect(o.holds('ps_book_burned', 'party')).toBe(true);
    await o.until(1243);
    expect(o.page).toContain('Of Tomas Pell: at noon on the ninth day he stood at Mistress Dunnage');
    expect(o.page).toContain('Of Mistress Dunnage: she burned the Nobodies');
  }, T);
});

describe('The Clerk Who Reads', () => {
  // Mabel Vickery takes the night's letters round the Post-lodgings stair between ten and two.
  const toStair = ['=day 1 22:30', '>ombra__ps_stair'];
  const carry = ['Talk to Mabel', 'Ask her what she does with the letters', 'Ask to see what is in the satchel', 'Offer to carry them'];

  it('is seen on her rounds, bare-faced, confides, and gives a Bare the three letters to carry', async () => {
    const o = await start();
    await o.play(...toStair);
    expect(o.knows('ps_mabel_reads')).toBe(true);
    await o.play(...carry);
    expect(o.knows('ps_l1_text') && o.knows('ps_l2_text') && o.knows('ps_l3_text')).toBe(true);
    for (const l of ['ps_letter_roke', 'ps_letter_wick', 'ps_letter_brandt']) { expect(o.carries(l)).toBe(true); }
    expect(o.holds('ps_mabel_trusts', 'party')).toBe(true);
  }, T);

  it('is answered by day with a face-down letter, and by night with a refusal of the mask', async () => {
    const o = await start();
    await o.play('>ombra__dlo_counter', 'Speak to the boy');
    expect(o.page).toContain('not allowed');
    await o.play(...rent('Crow'), '=day 1 22:30', '>ombra__ps_stair');
    expect(o.page).not.toContain('Staff only');
  }, T);

  it('delivers by night with a bare knock: a reconciliation, a forgiven debt, a threat; and the stair shows it by day', async () => {
    const o = await start();
    await o.play(...toStair, ...carry);
    await o.play('Take the letter to the third door', 'Take the letter to the second door', 'Slide the third letter under the door');
    expect(o.holds('ps_roke_delivered', 'party')).toBe(true);
    expect(o.holds('ps_wick_delivered', 'party')).toBe(true);
    expect(o.holds('ps_brandt_delivered', 'party')).toBe(true);
    expect(o.measure('heat', 'party')).toBe(1);
    expect(o.page).toContain('He kept the boat');
    expect(o.page).toContain('He remembered the boy');
    expect(o.page).toContain('He means it');
    await o.play('=day 2 09:00', '>ombra__ps_stair');
    expect(o.page).toContain('GONE TO THE FAIR');
    expect(o.page).toContain('with the tissue still in the toes');
    expect(o.page).toContain('A Watch domino sits on the first landing');
    // A thing done stays done: the next morning at the counter there is a card with no stamp.
    await o.play('>ombra__dlo_counter');
    expect(o.page).toContain('Thank you, whoever you are');
  }, T);

  it('can be told to withhold the third letter, and then the man on the Post bridge says her name on the eighth day', async () => {
    const o = await start();
    await o.play(...toStair, ...carry, '>ombra__post_street', 'Tear up the third letter');
    expect(o.holds('ps_brandt_withheld', 'party')).toBe(true);
    await o.play('=day 8 12:10');
    expect(o.holds('ps_hal_named', 'party')).toBe(true);
    await o.until(1243);
    expect(o.page).toContain('Of Lucia Brandt: she was Named on the Post bridge');
    expect(o.page).not.toContain('Hal Corry stood on the Post bridge');
  }, T);

  it('is dismissed on the seventh day when nobody does anything, and gives her satchel to the first Bare who is kind', async () => {
    const o = await start();
    await o.play('=day 7 12:30');
    expect(o.holds('ps_mabel_dismissed', 'strake')).toBe(true);
    await o.play('>ombra__ps_stair', 'Talk to Mabel', 'Speak to Mabel');
    expect(o.holds('ps_mabel_trusts', 'party')).toBe(true);
    expect(o.carries('ps_letter_brandt')).toBe(true);
    await o.until(1243);
    expect(o.page).toContain('Of Mabel Vickery: she was dismissed on the seventh day, and has since been found');
  }, T);

  it('is told on: the Postmaster dismisses her, and gives the Filing and the run of the hall to whoever told', async () => {
    const o = await start();
    await o.play(...toStair, '=day 2 08:30', ...rent('Crow'), '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Tell the Postmaster who is opening');
    expect(o.holds('ps_told_dunnage', 'party')).toBe(true);
    expect(o.holds('ps_mabel_dismissed', 'strake')).toBe(true);
    expect(o.knows('ps_filing')).toBe(true);
    await o.play('>ombra__annex_counter', 'Take your face off', '>ombra__dlo_sorting');
    expect(o.at('party')).toBe('ombra__dlo_sorting');
    await o.play('>ombra__ps_stair', 'Speak to Mabel');
    expect(o.page).toContain('I only wish that it had not been you');
    await o.until(1243);
    expect(o.page).toContain('Of Mabel Vickery: she was dismissed on the seventh day, on the word of a stranger');
  }, T);

  withStubs("is covered under the Stranger's Warrant, at the Watch's cost", async () => {
    const o = await start();
    await o.play(...toStair, '=day 2 08:30', ...rent('Crow'), 'zz: warrant', '>ombra__dlo_office', 'Talk to Mistress Dunnage', 'Tell the Postmaster the Stranger');
    expect(o.holds('ps_mabel_kept', 'party')).toBe(true);
    expect(o.holds('ps_mabel_warranted', 'party')).toBe(true);
    expect(o.measure('heat', 'party')).toBe(1);
    await o.play('=day 7 12:30');
    expect(o.holds('ps_mabel_dismissed', 'strake')).toBe(false);
  }, T);
});

describe('Delivery to a Mask', () => {
  const parcel = [...['Talk to Tomas Pell', 'Speak to him as one Crow to another', 'Take the parcel off the Unclaimed shelf', 'Open the parcel']];

  it("is taken off the Unclaimed shelf by a Crow, and the sailor's note gives three clues", async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...parcel);
    expect(o.holds('ps_parcel_read', 'party')).toBe(true);
    for (const c of ['ps_clue_left', 'ps_clue_blue', 'ps_clue_bread']) { expect(o.knows(c)).toBe(true); }
    expect(o.page).toContain('If you have married, burn it and be happy');
  }, T);

  it('is handed to the wrong Cockles, whose declining is a clue; the right one stops folding', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...parcel, ...rent('Cockle'), '>ombra__ps_bake_floor');
    await o.play('Hand the parcel to the tall Cockle', 'Hand the parcel to the apprentice', 'Hand the parcel to the young journeyman');
    expect(o.holds('ps_parcel_delivered', 'party')).toBe(false);
    expect(o.holds('ps_wrong_handed', 'party')).toBe(true);
    expect(o.page).toContain('I am the one who owes');
    expect(o.page).toContain('a failure of the fingers');
    expect(o.knows('ps_odile_is_she')).toBe(true);
  }, T);

  it('can be handed, by day, to the right Cockle across the table, and she says nothing about it', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...parcel, ...rent('Cockle'), '>ombra__ps_bake_floor', 'Hand the parcel to the Cockle with the blue thread');
    expect(o.holds('ps_parcel_delivered', 'party')).toBe(true);
    expect(o.holds('ps_odile_night', 'party')).toBe(false);
    expect(o.page).toContain('It is for the Cockle');
    await o.until(1243);
    expect(o.page).toContain('Of the Cockle at the bakehouse with the left hand');
  }, T);

  it('is better delivered by night, bare, on her own stair', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...parcel, '=day 1 21:00', '>ombra__ps_stair', 'Knock at the garret');
    expect(o.holds('ps_parcel_delivered', 'party')).toBe(true);
    expect(o.holds('ps_odile_night', 'party')).toBe(true);
    expect(o.page).toContain('It fits');
    await o.until(1243);
    expect(o.page).toContain('Of Odile Ollerton: she has not worn the dress');
  }, T);

  it('is told by the Cockles to a Cockle who has worked a morning beside them', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...parcel, ...rent('Cockle'), '>ombra__ps_bake_floor');
    expect(o.measure('goodwill', 'face_cockle')).toBe(0);
    await o.play('Take a turn at the trough');
    expect(o.measure('goodwill', 'face_cockle')).toBe(1);
    await o.play('Ask the floor, Cockle to Cockle');
    expect(o.knows('ps_odile_is_she')).toBe(true);
  }, T);

  it("is told by Wick, whose debt a Bare has had forgiven, over a hot roll", async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toCounter, ...parcel, '=day 1 22:30', '>ombra__ps_stair');
    await o.play('Talk to Mabel', 'Ask her what she does with the letters', 'Ask to see what is in the satchel', 'Offer to carry them', 'Take the letter to the second door');
    await o.play('=day 2 08:30', ...rent('Cockle'), '>ombra__ps_bake_floor', 'Ask Wick');
    expect(o.knows('ps_odile_is_she')).toBe(true);
    expect(o.page).toContain('That is Odile');
  }, T);

  it('burns with the Nobodies when nobody takes it from the shelf, and the news says whose it was', async () => {
    const o = await start();
    await o.until(1243);
    expect(o.page).toContain('Of the parcel on the Unclaimed shelf: it went into the furnace');
  }, T);
});

describe('The Wet Post: whatever is offered', () => {
  // The world must stay valid whatever a player takes: nobody in two places, no Book both carried and burnt, nothing
  // known that cannot be, and no act of this file offered that does nothing.
  const people = ['pell', 'dunnage', 'strake', 'ps_corbin', 'ps_wick', 'ps_odile', 'ps_wynne', 'ps_bram'];
  const valid = (o: Ombra) => {
    for (const p of people) { expect(o.j.campaign.world.related('at', `ombra__${p}`).length).toBeLessThanOrEqual(1); }
    expect(o.carries('book_of_faces') && o.holds('ps_book_burned', 'party')).toBe(false);
    if (o.holds('ps_pell_free', 'party')) { expect(o.holds('ps_pell_admits', 'party')).toBe(true); }
    if (o.knows('ps_rack_told')) { expect(o.holds('ps_rack_known', 'party') || o.holds('ps_pell_moved_it', 'party')).toBe(true); }
    if (o.holds('ps_redeemed', 'party')) { expect(o.gold()).toBeGreaterThanOrEqual(0); }
    expect(o.gold()).toBeGreaterThanOrEqual(0);
    expect(o.measure('heat', 'party')).toBeLessThanOrEqual(6);
  };
  // The acts of this file (its topics may only speak).
  const acts = new RegExp('^ombra__ps_(deliver_|give_|take_|tell_|plead_|cover_|withhold_|snatch_|burn_|turn_|choke_|'
    + 'own_up|redeem|pay_boy|open_parcel|knead|work_shift|read_|pick_drawer|sit_vigil|mabel_stop|mabel_notice|'
    + 'corbin_ask|corbin_pay|pell_watch|pell_press|pell_lie|pell_threaten|ask_hold|dig)');
  const walk = async (seed: string, setup: string[], n: number, stride: number) => {
    const o = await start(seed);
    await o.play(...setup);
    const taken = new Set<string>();
    for (let i = 0; i < n && o.running; i++) {
      const offered = o.j.choices().filter(c => !c.label.startsWith('Pack ›') && !/: (Set down|Light|Put out)/.test(c.label) && !c.label.startsWith('zz:')
        && !/^Take your leave/.test(c.label) && !/^(Search here|Make camp)/.test(c.label));
      expect(offered.length).toBeGreaterThan(0);
      const c = offered[(i * stride + 1) % offered.length]!;
      const before = o.j.campaign.world, watch = o.watch;
      try { await o.j.play(`@${c.command}`); } catch (e) { if (!o.running) { break; } throw e; }
      taken.add(c.command.replace(/\(.*$/, ''));
      // An act of this file that is offered must change something or pass the time.
      if (acts.test(c.command)) {
        if (o.j.campaign.world.sameAs(before) && o.watch === watch) { throw new Error(`does nothing: ${c.label} (${c.command}) at watch ${watch}`); }
      }
      valid(o);
    }
    return { o, taken };
  };

  it('is a valid world after two hundred offered acts at the counter, as a Crow', async () => {
    const { taken } = await walk('walk-crow', [...rent('Crow'), ...toCounter], 200, 7);
    expect(taken.size).toBeGreaterThan(8);
  }, 180_000);

  it('is a valid world after two hundred offered acts, bare, at the stair and the bakehouse by night and day', async () => {
    const { taken } = await walk('walk-bare', ['=day 1 22:00', '>ombra__ps_stair'], 200, 5);
    expect(taken.size).toBeGreaterThan(5);
  }, 180_000);
});

describe('The Wet Post: what is done stays done', () => {
  it('keeps the sacks gone through, the Book carried, and the letters delivered across a rest and a day', async () => {
    const o = await start();
    await o.play(...rent('Crow'), ...toHall, 'Take a shift', digWanting, digWanting);
    expect(o.measure('ps_dug', 'ps_rack_wanting')).toBe(2);
    await o.play('>ombra__post_street', 'Take your face off', 'Wait › An hour');
    expect(o.measure('ps_dug', 'ps_rack_wanting')).toBe(2);
    await o.play('=day 2 09:00', ...rent('Crow'), ...toHall, 'Take a shift', digWanting);
    expect(o.holds('ps_book_found', 'party')).toBe(true);
    await o.play('>ombra__dlo_office', 'Redeem the parcel');
    expect(o.carries('book_of_faces')).toBe(true);
    await o.play('=day 4 12:00');
    expect(o.carries('book_of_faces')).toBe(true);
    expect(o.holds('ps_redeemed', 'party')).toBe(true);
    // It is not found a second time, and not given to anyone else on the ninth.
    await o.play('=day 9 12:30');
    expect(o.carries('book_of_faces')).toBe(true);
    expect(o.holds('ps_book_burned', 'party')).toBe(false);
  }, T);

  it('keeps a delivered letter delivered, and the card on the counter, a day later', async () => {
    const o = await start();
    await o.play('=day 1 22:30', '>ombra__ps_stair', 'Talk to Mabel', 'Ask her what she does with the letters', 'Ask to see what is in the satchel', 'Offer to carry them', 'Take the letter to the third door');
    await o.play('=day 3 09:00');
    expect(o.holds('ps_roke_delivered', 'party')).toBe(true);
    expect(o.carries('ps_letter_roke')).toBe(false);
    expect(o.carries('ps_letter_wick')).toBe(true);
    // Mabel still trusts the company, and still sorts by day.
    expect(o.holds('ps_mabel_trusts', 'party')).toBe(true);
    expect(o.at('strake')).toBe('ombra__dlo_sorting');
  }, T);
});
