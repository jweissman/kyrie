import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// Quiet Hill (data/adventures/book-of-faces/hill.kyr): the Dinner of Spoons on the seventh evening, the Contessa's
// private stair, and the Last Servant of the Palazzo Venn. Each test is one way a company can go about it. A check's
// die depends on the seed and on what was done before, so a step that may fail is written "?" and its seed is pinned.
const start = (seed = 'ombra', cls = 'warrior') => Ombra.start(home, seed, Ombra.one(cls));
const dust = ['>ombra__venn_gallery', 'Offer to help Gaspar dust'];
// Everything that seats the table without a roll: the Venn Book lent by a servant one has dusted with, laid before
// the Contessa, and the steward asked to speak for the House.
const ladle = ['>ombra__tarn_hall', 'Ask what the Contessa wants', ...dust, 'Ask Gaspar about the thick book', '>ombra__tarn_hall',
  'Lay the Venn Book', 'Say that Gaspar may call', '>ombra__venn_gallery', 'Ask Gaspar, who has dusted'];
const dinner = ['>ombra__tarn_dining', '=day 7 18:40', '=day 7 19:30'];

describe('the Dinner of Spoons', () => {
  it('is seated by the Ladle, from a servant, a book and a favour, with no roll and no charm', async () => {
    const o = await start();
    await o.play(...ladle);
    expect(o.holds('hl_ladle_ruled', 'party')).toBe(true);
    expect(o.holds('hl_voice', 'party')).toBe(true);
    expect(o.carries('hl_book')).toBe(true);
    await o.play(...dinner);
    expect(o.page).toContain('The Ladle is called');
    expect(o.holds('hl_dinner_done', 'party')).toBe(true);
    expect(o.holds('hl_feud', 'party')).toBe(false);
    expect(o.holds('hl_end_ladle', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_gaspar')).toBe(true);
    expect(o.measure('marks', 'party')).toBeGreaterThanOrEqual(1);
    expect(o.measure('hl_trust', 'party')).toBeGreaterThanOrEqual(1);
  }, 120_000);

  it('opens the Contessa\'s stair for a voice at the Hearing, and the stair goes to the vestry', async () => {
    const o = await start();
    await o.play(...ladle, ...dinner, '>ombra__tarn_hall', '=day 8 9:00');
    expect(o.j.offers('Ask whether the Contessa will lend')).toBe(true);
    await o.play('Ask whether the Contessa will lend', 'Promise the Contessa your voice');
    expect(o.holds('privateStairOpen', 'party')).toBe(true);
    expect(o.holds('hl_contessa_voice', 'party')).toBe(true);
    expect(o.knows('private_stair_known')).toBe(true);
    await o.play('>ombra__tarn_study', 'To the vestry');
    expect(o.at('party')).toBe('ombra__vestry');
  }, 120_000);

  it('does not offer the stair to a company whose dinner was a duel', async () => {
    const o = await start();
    await o.play(...dinner, '=day 8 8:00');
    expect(o.holds('hl_feud', 'party')).toBe(true);
    expect(o.holds('hl_dinner_done', 'party')).toBe(true);
    expect(o.page).toContain('There is steel');
    expect(o.page).toContain('The Feud is awake');
    expect(o.holds('roundDone', 'party', 'r_gaspar')).toBe(false);
    await o.play('>ombra__tarn_hall');
    expect(o.j.offers('Ask whether the Contessa will lend')).toBe(false);
    expect(o.holds('privateStairOpen', 'party')).toBe(false);
  }, 120_000);

  it('can be seated by a round table, by a company that has beaten her at Spoons and listened to both of them', async () => {
    const o = await start('s2', 'bard');
    await o.play('>ombra__tarn_hall', 'Ask what the Contessa wants', '?Watch her hand', '?Say that she has moved', '?Call her Ismene',
      '>ombra__hill_terrace', '=day 1 12:10', 'Ask Lord Vesper', 'Ask Lady Corm', '>ombra__tarn_hall', '?Put it to her');
    expect(o.holds('hl_beaten', 'party')).toBe(true);
    expect(o.holds('hl_ismene', 'party')).toBe(true);
    expect(o.holds('hl_round_table', 'party')).toBe(true);
    expect(o.knows('hl_vesper_door')).toBe(true);
    expect(o.knows('hl_corm_soup')).toBe(true);
    expect(o.measure('hl_trust', 'party')).toBe(3);
    await o.play('>ombra__tarn_dining', '=day 7 18:40', '=day 7 19:30');
    expect(o.page).toContain('stopped a war with soup');
    expect(o.holds('hl_feud', 'party')).toBe(false);
  }, 120_000);

  it('goes to a duel when the pitch for the round table is refused, on another seed', async () => {
    const o = await start('s3', 'bard');
    await o.play('>ombra__tarn_hall', 'Ask what the Contessa wants', '?Watch her hand', '?Say that she has moved', '?Call her Ismene',
      '>ombra__hill_terrace', '=day 1 12:10', 'Ask Lord Vesper', 'Ask Lady Corm', '>ombra__tarn_hall', '?Put it to her',
      '>ombra__tarn_dining', '=day 7 18:40', '=day 7 19:30');
    expect(o.holds('hl_round_table', 'party')).toBe(false);
    expect(o.holds('hl_feud', 'party')).toBe(true);
  }, 120_000);

  it('can be seated by changing the spoons, and the cheat is found at breakfast', async () => {
    const o = await start('s4', 'thief');
    await o.play('>ombra__tarn_dining', '=day 7 16:00', '?Change the spoons', '=day 7 19:30');
    expect(o.holds('hl_swapped', 'party')).toBe(true);
    expect(o.holds('hl_feud', 'party')).toBe(false);
    expect(o.page).toContain('both absolutely satisfied');
    await o.play('=day 8 8:30');
    expect(o.holds('hl_swap_found', 'party')).toBe(true);
    expect(o.page).toContain('somebody has been at the silver');
    await o.play('>ombra__tarn_hall');
    expect(o.j.offers('Ask whether the Contessa will lend')).toBe(false);
  }, 120_000);

  it('goes wrong for a thief the footman sees', async () => {
    const o = await start('s1', 'thief');
    await o.play('>ombra__tarn_dining', '=day 7 16:00', '?Change the spoons');
    expect(o.holds('hl_swap_caught', 'party')).toBe(true);
    await o.play('=day 7 19:30');
    expect(o.holds('hl_feud', 'party')).toBe(true);
  }, 120_000);
});

describe('the Last Servant', () => {
  it('can end with the curtains, a coin and two days, and nobody told', async () => {
    const o = await start();
    await o.play(...dust, 'Ask Gaspar what the Palazzo wants', '=day 1 20:30', '>ombra__lisbet_room');
    expect(o.holds('hl_lisbet_told', 'party')).toBe(false);
    await o.play('Ask Lisbet to take the curtains');
    expect(o.holds('hl_curtains_hired', 'party')).toBe(true);
    await o.play('>ombra__venn_gallery', '=day 3 16:00');
    expect(o.holds('hl_end_curtains', 'party')).toBe(true);
    expect(o.holds('hl_lisbet_told', 'party')).toBe(false);
    expect(o.holds('roundDone', 'party', 'r_gaspar')).toBe(true);
    expect(o.page).toContain('You hold your head like Miss Orla');
    expect(o.gold()).toBe(8);
  }, 120_000);

  it('can end with a key, the sempstress told, and a reunion in the gallery', async () => {
    const o = await start();
    await o.play(...dust, 'Ask whether there is any family', 'Ask Gaspar whether Miss Orla left anything', '=day 1 20:30',
      '>ombra__lisbet_room', 'Knock, bare');
    expect(o.knows('hl_thimble')).toBe(true);
    expect(o.knows('hl_heir')).toBe(true);
    await o.play('Put the key to Orla');
    expect(o.holds('hl_lisbet_told', 'party')).toBe(true);
    expect(o.carries('hl_orla_key')).toBe(false);
    await o.play('=day 2 10:30');
    expect(o.holds('hl_end_told', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_gaspar')).toBe(true);
    expect(o.at('lisbet')).toBe('ombra__venn_gallery');
    await o.play('=day 2 22:30');
    expect(o.at('lisbet')).toBe('ombra__venn_hall');
  }, 120_000);

  it('can end by the paper, when the Contessa has been sat up with and asked plainly', async () => {
    const o = await start();
    await o.play('>ombra__tarn_hall', 'Ask what the Contessa wants', '>ombra__venn_gallery', 'Ask whether there is any family',
      '=day 1 21:00', '>ombra__tarn_study', 'Sit up with the Contessa');
    expect(o.measure('hl_trust', 'party')).toBe(1);
    await o.play('Say that the Palazzo Venn has a servant', 'Ask the Contessa plainly');
    expect(o.holds('hl_end_sold', 'party')).toBe(true);
    expect(o.holds('roundDone', 'party', 'r_gaspar')).toBe(true);
  }, 120_000);

  it('can end with a kind lie, on a seed where the lie is believed, and be refused on one where it is not', async () => {
    const ok = await start('s5', 'thief');
    await ok.play('>ombra__venn_gallery', 'Ask whether there is any family', '?Tell Gaspar that Miss Orla');
    expect(ok.holds('hl_end_lie', 'party')).toBe(true);
    expect(ok.holds('roundDone', 'party', 'r_gaspar')).toBe(true);
    const no = await start('s1', 'thief');
    await no.play('>ombra__venn_gallery', 'Ask whether there is any family', '?Tell Gaspar that Miss Orla');
    expect(no.holds('hl_end_lie', 'party')).toBe(false);
    expect(no.holds('hl_lied', 'party')).toBe(true);
    expect(no.holds('roundDone', 'party', 'r_gaspar')).toBe(false);
  }, 120_000);

  it('lets a company that dusted with him in see one thing left undone: nothing ends it by leaving it alone', async () => {
    const o = await start();
    await o.play(...dust, '=day 9 23:30');
    expect(o.holds('roundDone', 'party', 'r_gaspar')).toBe(false);
    expect(o.page).toContain('Of Gaspar: the Palazzo Venn is aired on Tuesdays');
    expect(o.page).toContain('Of Lisbet, the sempstress');
  }, 180_000);
});

describe('two registers', () => {
  it('is cold to a bare face by day, a customer to a masked one, and a burglar at night', async () => {
    const bare = await start();
    await bare.play('>ombra__lisbet_room', 'Say good morning to the sempstress');
    expect(bare.page).toMatch(/The Bare don.t buy/);
    expect(bare.j.offers('Ask the sempstress about a hem')).toBe(false);
    const masked = await start();
    await masked.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__lisbet_room', 'Ask the sempstress about a hem');
    expect(masked.knows('hl_thimble')).toBe(true);
    // a rented face goes back at the Ninth Bell, so the company that comes at night is bare and is let in; only a face
    // of one's own would be a burglar's, and the topic waits for one
    await masked.play('=day 1 20:30');
    expect(masked.holds('masked', 'party')).toBe(false);
    expect(masked.j.offers('Knock, in a mask')).toBe(false);
    expect(masked.j.offers('Knock, bare')).toBe(true);
  }, 120_000);

  it('receives the Bare by day, and asks a mask to be taken off', async () => {
    const o = await start();
    await o.play('>ombra__tarn_hall', 'Say you are a stranger');
    expect(o.page).toContain('I shall');
    const m = await start();
    await m.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__tarn_hall', 'Say that you are a Gull');
    expect(m.page).toContain('lampshade');
  }, 120_000);
});

describe('exploring', () => {
  // Takes the offered actions in a fixed pseudo-random order for two hundred steps, with an hour's waiting between,
  // and asks of the world after each that it still makes sense.
  it('never enters a state that cannot be', async () => {
    const o = await start('wander', 'bard');
    let n = 0;
    for (let i = 0; i < 200; i++) {
      const offered = o.j.choices()
        .filter(c => !/^(Pack|a |an |the |some )/i.test(c.full) && !/Set down/.test(c.label) && !/^Wait/.test(c.label));
      if (!offered.length || i % 7 === 6) { await o.play('Wait › An hour'); continue; }
      const c = offered[(i * 13 + 5) % offered.length]!;
      try { await o.play(c.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); n++; } catch (e) { if (!o.running) { break; } throw e; }
      if (o.knows('hl_heir')) { expect(o.knows('hl_orla') && o.knows('hl_thimble')).toBe(true); }
      expect(o.holds('hl_feud', 'party') && o.holds('hl_end_ladle', 'party')).toBe(false);
      expect(o.holds('hl_lisbet_told', 'party') && o.holds('hl_end_lie', 'party')).toBe(false);
      for (const who of ['tarn', 'gaspar', 'lisbet', 'hl_vesper', 'hl_corm', 'wr_elinor', 'wr_ullin']) { expect(o.at(who)).toBeDefined(); }
    }
    expect(n).toBeGreaterThan(40);
    expect(o.page).not.toMatch(/undefined|\{\?/);
  }, 300_000);
});

describe('what is done stays done', () => {
  it('keeps the dusting, the book and the ending across days', async () => {
    const o = await start();
    await o.play(...dust, 'Ask Gaspar about the thick book', '=day 3 9:00');
    expect(o.measure('hl_gaspar_trust', 'party')).toBe(1);
    expect(o.carries('hl_book')).toBe(true);
    expect(o.j.offers('Offer to help Gaspar dust')).toBe(false);
    await o.play('=day 5 9:00');
    expect(o.carries('hl_book')).toBe(true);
    expect(o.knows('hl_ladle_1103')).toBe(true);
  }, 120_000);
});
