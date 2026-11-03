import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';
import { PlaySession } from '../src/session/play-session';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Invariants, type Violation } from '../src/autoplay/invariants';

// The Wet Stage (data/adventures/book-of-faces/bard.kyr): the Licence, the Censor's Cue and the Lampoon. The module
// names persons that other authors own (Peck, Rill, the Warden), so on a branch that has not been merged with theirs
// the campaign does not load; OMBRA_CAMPAIGN names a campaign with stubs for them. The tests skip, loudly, where the
// module cannot be loaded for that reason, and nowhere else.
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const loads = await (async () => {
  try { await Ombra.start(campaign, 'probe', Ombra.one('bard')); return true; } catch (e) {
    if (/unknown|peck|rill|lacke|Duplicate entity/i.test((e as Error).message)) { console.warn(`ombra-bard: skipped: ${(e as Error).message.split('\n')[0]}`); return false; }
    throw e;
  }
})();
const t = (name: string, fn: () => Promise<void>) => (loads ? it : it.skip)(name, fn, 240000);

const start = (seed = 'ombra') => Ombra.start(campaign, seed, Ombra.one('bard', undefined, 'human', 'Tamsin'));

// A face from the Annex for the Masked Hours: three coin, back at the Ninth Bell.
const wear = (face: string) => ['>ombra__annex_counter', '^Talk to Ferris Moll', `Rent the ${face}`, '^Take your leave', `Put on the ${face}`];
const talk = (who: string, ...then: string[]) => [`^Talk to ${who}`, ...then, '^Take your leave'];
// From the pit at nine in the evening to the prompt-corner for the Reader's hour (he comes on at ten).
const slit = (day: number) => [`=day ${day} 21:00`, '>ombra__bd_prompt', `=day ${day} 22:10`, 'Wait behind the slit', `=day ${day} 23:30`];

// A check that may go either way is tried again, an hour at a time, until it holds.
async function until(o: Ombra, holds: () => boolean, step: string, tries = 8) {
  for (let i = 0; i < tries && !holds(); i++) { await o.play(`?${step}`); }
  expect(holds()).toBe(true);
}

describe('The Wet Stage: the licence', () => {
  t('is kept by the Reader\'s seal, which a company with no charm and no learning can have: a Crow, and a stranger who does not know', async () => {
    const o = await start();
    await o.play(...wear('Crow'), '>ombra__stage_pit', '=day 1 09:10', ...talk('Master Orlick', 'Show him the Crow', 'Let him put three jokes to you',
      'Tell him you cannot tell whom', 'Ask him to seal the season'));
    expect(o.holds('bd_sealed', 'wet_stage')).toBe(true);
    expect(o.measure('bd_ludd_regard', 'party')).toBe(2);
    await o.until(144 * 3 + 30);
    expect(o.holds('bd_kept', 'wet_stage')).toBe(true);
    expect(o.holds('bd_revoked', 'wet_stage')).toBe(false);
    expect(o.page).toContain('like a hen on an egg');
    // Persistence: a licence kept is kept on the fifth day and the Moths are where they were.
    await o.play('=day 5 10:00');
    expect(o.holds('bd_kept', 'wet_stage')).toBe(true);
    expect(o.at('bd_crake')).toBe('ombra__stage_pit');
  });

  t('is withdrawn at noon on the fourth day if nobody acts, and the Moths go', async () => {
    const o = await start();
    await o.play('=day 4 11:00');
    expect(o.at('bd_crake')).toBe('ombra__stage_pit');
    await o.play('=day 4 13:00');
    expect(o.holds('bd_revoked', 'wet_stage')).toBe(true);
    expect(o.page).toContain('a salt-barge with a bucket in it');
    expect(o.at('bd_crake')).toBe('ombra__offstage');
    expect(o.at('orme')).toBe('ombra__stage_green_room');
  });

  t('is kept by twelve coin to the manager, and a Reader who is the company\'s friend can have it back after it is lost', async () => {
    const o = await start('fee');
    await o.play('=day 1 21:00', '>ombra__stage_green_room', ...talk('Madame Orme', 'Ask her why the manager is up'), 'Give her the licence-fee');
    // The company has fourteen coin and twelve of them are the fee.
    expect(o.holds('bd_fee_paid', 'wet_stage')).toBe(true);
    expect(o.gold()).toBe(2);
    await o.until(144 * 3 + 30);
    expect(o.holds('bd_kept', 'wet_stage')).toBe(true);

    const p = await start('petition');
    await p.play(...slit(1), '>ombra__bd_stage', ...talk('Master Orlick', 'Tell him you know about the Joke', 'Promise him that you will tell no one'));
    expect(p.measure('bd_ludd_regard', 'party')).toBe(3);
    await p.play('=day 4 13:00');
    expect(p.holds('bd_revoked', 'wet_stage')).toBe(true);
    await p.play('=day 5 13:30');
    expect(p.holds('bd_restored', 'wet_stage')).toBe(true);
    expect(p.page).toContain('I have explained it to him as one would to a child');
  });

  t('is held by the Codicil\'s footnote, put to the Reader by a company that has read it (a lore check, on the footnote and again on the Reader)', async () => {
    const o = await start('codicil');
    await o.play('>ombra__stage_green_room');
    await until(o, () => o.knows('bd_footnote'), 'Read the print under the licence');
    await o.play(...wear('Cockle'), '>ombra__stage_pit', '=day 1 09:10');
    // The Reader is cold to a face that has not been to him as a stranger: the citation does not need his regard.
    await o.play('^Talk to Master Orlick');
    await until(o, () => o.holds('bd_codicil', 'wet_stage'), 'Put the Codicil\'s footnote to him');
    await o.until(144 * 3 + 30);
    expect(o.holds('bd_kept', 'wet_stage')).toBe(true);
    expect(o.page).toContain('It has always said that?');
  });
});

describe('The Wet Stage: Madame Orme', () => {
  t('gives her prompt-book to a company that held her lamp and patched her roof, and needs no charm to do either', async () => {
    const o = await start('orme');
    await o.play('=day 1 21:00', '>ombra__stage_flies', 'Hire the rigger', '>ombra__stage_green_room',
      '^Talk to Madame Orme', 'Ask her why the manager', 'Hold the lamp', 'Tell her you mean to give her a play');
    expect(o.holds('bd_commissioned', 'party')).toBe(true);
    expect(o.carries('bd_prompt_book')).toBe(true);
    expect(o.measure('bd_orme_warm', 'party')).toBe(2);
    // A thing given is given: the book is still carried and she does not give it twice, two days on.
    await o.play('^Take your leave', '=day 3 10:00');
    expect(o.carries('bd_prompt_book')).toBe(true);
    expect(o.holds('bd_commissioned', 'party')).toBe(true);
  });

  t('is moved, when the company is a player, by being given her cue: the Pump, and a pail that is not there', async () => {
    const o = await start('cue');
    await o.play('=day 1 21:00', '>ombra__stage_green_room', '^Talk to Madame Orme', 'Hold the lamp', 'Ask her about the year', '^Take your leave',
      '^Talk to Pantaloon Tarrow', 'Ask him what the manager used', '^Take your leave', '^Talk to Madame Orme');
    expect(o.knows('bd_pump_known')).toBe(true);
    await until(o, () => o.holds('bd_orme_plays', 'party'), 'Give her her cue');
    expect(o.measure('bd_orme_warm', 'party')).toBe(3);
    await o.play('Tell her you mean to give her a play');
    expect(o.carries('bd_prompt_book')).toBe(true);
    expect(o.page).toContain('Where did she go?');
  });

  t('will not say a word to a bare face by day, nor to a customer more than the bill, nor to a Moth less than a colleague', async () => {
    const o = await start('registers');
    await o.play('>ombra__stage_pit', '^Talk to Madame Orme', 'Speak to her');
    expect(o.page).toContain('The house is shut to the Bare till six');
    expect(o.j.offers('Ask her what is playing')).toBe(false);
    await o.play('^Take your leave', ...wear('Cockle'), '>ombra__stage_pit', '^Talk to Madame Orme', 'Ask her what is playing');
    expect(o.page).toContain('Master Dibble');
    expect(o.j.offers('Tell her you are of the profession')).toBe(false);
  });

  t('plays the Moths\' side by day and the manager\'s by night: the same question has two answers', async () => {
    const o = await start('night');
    await o.play(...wear('Moth'), '>ombra__stage_pit', '^Talk to Madame Orme', 'Tell her you are of the profession');
    expect(o.j.offers('Give her a speech')).toBe(true);
    await o.play('^Take your leave', '=day 1 21:00', '>ombra__stage_green_room', '^Talk to Madame Orme');
    expect(o.j.offers('Tell her you are of the profession')).toBe(false);
    expect(o.j.offers('Ask her why the manager')).toBe(true);
    expect(o.j.offers('Speak to her')).toBe(false);
  });
});

describe('The Wet Stage: the Censor\'s Cue', () => {
  const toReader = (day = 1) => [...slit(day), '>ombra__bd_stage', '^Talk to Master Orlick', 'Tell him you know about the Joke'];

  t('is settled by a promise: he is heard, unseen, through the slit, and kept silent about, and he shows the chest', async () => {
    const o = await start('keep');
    await o.play(...slit(1));
    expect(o.knows('bd_ludd_scene')).toBe(true);
    expect(o.page).toContain('You are not cold. I keep it warm.');
    await o.play('>ombra__bd_stage', '^Talk to Master Orlick', 'Tell him you know about the Joke', 'Promise him that you will tell no one');
    expect(o.holds('bd_ludd_trusts', 'party')).toBe(true);
    expect(o.knows('bd_cuts_known')).toBe(true);
    expect(o.page).toContain('every joke the Wet Stage was not let to speak');
    // The Lampoon is the better for a Reader who is on the company's side: the cut is lifted, and a friend's advice is
    // given.
    expect(o.measure('bd_craft', 'party')).toBe(3);
    await o.play('Ask him to seal the season');
    expect(o.holds('bd_sealed', 'wet_stage')).toBe(true);
    // He promised nothing, and was promised: the betrayal, if there is one, is the company's, and comes at the Lampoon.
    await o.play('^Take your leave', '=day 2 12:00');
    expect(o.holds('bd_ludd_trusts', 'party')).toBe(true);
  });

  t('is settled by a reading: the company plays the Joke opposite him, cold, and he is written into the play', async () => {
    const o = await start('read');
    await o.play(...toReader());
    await until(o, () => o.holds('bd_written_in', 'party'), 'Ask to read the Joke');
    expect(o.measure('bd_ludd_regard', 'party')).toBe(3);
    expect(o.measure('bd_craft', 'party')).toBe(4);
    expect(o.page).toContain('That is what it is for');
    expect(o.holds('bd_has', 'bd_t_cutscene')).toBe(true);
  });

  t('is settled, if the company is cruel, by a threat: he seals whatever he is given, and does not look up again', async () => {
    const o = await start('leash');
    await o.play(...toReader());
    await until(o, () => o.holds('bd_ludd_leashed', 'party'), 'Tell him that the Warden would like to hear');
    expect(o.holds('bd_sealed', 'wet_stage')).toBe(true);
    expect(o.holds('bd_ludd_sour', 'party')).toBe(true);
    expect(o.measure('bd_craft', 'party')).toBe(2);
    expect(o.j.offers('Promise him that you will tell no one')).toBe(false);
  });

  t('is settled, if the company is careless, by telling the manager: he is dismissed by morning and the play is not cut at all', async () => {
    const o = await start('expose');
    await o.play(...slit(1), '>ombra__stage_green_room', '^Talk to Madame Orme', 'Tell her about the Reader');
    expect(o.holds('bd_ludd_exposed', 'party')).toBe(true);
    await o.play('^Take your leave', '=day 2 12:00');
    expect(o.holds('bd_ludd_gone', 'party')).toBe(true);
    expect(o.page).toContain('It is the worst silence the Wet Stage has ever kept');
    expect(o.measure('bd_craft', 'party')).toBe(3);
    await o.play('=day 2 23:30');
    expect(o.at('ludd')).toBe('ombra__bd_stage');
  });

  t('is seen through, by day, by a Crow: the margins are jokes, and the Reader gives a stranger three to read', async () => {
    const o = await start('crow');
    await o.play(...wear('Crow'), '>ombra__stage_pit', '=day 1 09:10', '^Talk to Master Orlick', 'Show him the Crow');
    expect(o.knows('bd_margins_known')).toBe(true);
    expect(o.page).toContain('Also because I laughed');
    expect(o.j.offers('Tell him you cannot tell whom')).toBe(false);
    await o.play('Let him put three jokes to you');
    expect(o.j.offers('Tell him you cannot tell whom')).toBe(true);
    expect(o.j.offers('Tell him truthfully')).toBe(false);
    expect(o.j.offers('Tell him the three jokes are about a locksmith')).toBe(false);
  });

  t('does not answer a bare face by day, and does not answer a masked one with a seal until he has been a stranger to it', async () => {
    const o = await start('cold');
    await o.play('=day 1 09:10', '>ombra__stage_pit', '^Talk to Master Orlick', 'Speak to him');
    expect(o.page).toContain('an answer to your face');
    expect(o.j.offers('Ask him to seal')).toBe(false);
    expect(o.j.offers('Ask him what he is cutting')).toBe(false);
  });
});

describe('The Wet Stage: Finch and Tarrow', () => {
  t('Finch writes again when Tarrow\'s scraps are laid on a dry table and he is left alone with them; the elegy\'s ending is the company\'s to choose', async () => {
    const o = await start('finch');
    await o.play('=day 1 21:00', '>ombra__stage_flies', ...talk('Ambrose Finch', 'Ask him what happened a year ago'));
    expect(o.knows('bd_finch_block')).toBe(true);
    await o.play('>ombra__stage_green_room', ...talk('Pantaloon Tarrow', 'Sit with him in the green room', 'Be his house', 'Ask him about the paper in his hat'));
    expect(o.carries('bd_scraps')).toBe(true);
    await o.play('>ombra__stage_flies', '^Talk to Ambrose Finch');
    // The leak: without a dry table the scraps are left, and he will not write under the drip.
    expect(o.j.offers('Lay Tarrow.s scraps on his dry')).toBe(false);
    await o.play('^Take your leave', 'Hire the rigger', '^Talk to Ambrose Finch', 'Lay Tarrow.s scraps on his dry');
    expect(o.holds('bd_finch_moved', 'party')).toBe(true);
    expect(o.holds('bd_finch_alone', 'party')).toBe(true);
    expect(o.j.offers('Tell him who the Treasurer was')).toBe(false);
    await o.play('Let the elegy end on the water');
    expect(o.holds('bd_elegy_water', 'party')).toBe(true);
    expect(o.holds('bd_has', 'bd_t_elegy_w')).toBe(true);
    // Once ended, it is ended: the other endings are not offered.
    expect(o.j.offers('Let the elegy end on the Serene')).toBe(false);
  });

  t('Finch is read his own first stanza by a company that can fit the scraps (lore) and read them (performance); and his Candid tracts are tale for a farce', async () => {
    const o = await start('stanza');
    await o.play('=day 1 21:00', '>ombra__stage_flies', ...talk('Ambrose Finch', 'Ask him what happened a year ago'),
      '>ombra__stage_green_room', ...talk('Pantaloon Tarrow', 'Sit with him in the green room', 'Ask him about the paper in his hat'), '>ombra__stage_flies');
    await until(o, () => o.knows('bd_stanza_known'), 'Lay Tarrow.s forty scraps out');
    expect(o.page).toContain('and the mothers counted the lamps');
    await o.play('^Talk to Ambrose Finch');
    await until(o, () => o.holds('bd_finch_moved', 'party'), 'Read him his own first stanza');
    expect(o.holds('bd_finch_alone', 'party')).toBe(false);
    await o.play('Ask him what the Candid');
    expect(o.knows('bd_candid_known')).toBe(true);
    expect(o.holds('bd_has', 'bd_t_candid')).toBe(true);
  });

  t('Tarrow\'s Walnut is done for a house of one, in the dark, and the clown teaches the company to fall', async () => {
    const o = await start('walnut');
    await o.play('=day 1 21:00', '>ombra__stage_green_room', ...talk('Pantaloon Tarrow', 'Sit with him in the green room'));
    expect(o.j.offers('Have him teach')).toBe(false);
    await o.play('^Talk to Pantaloon Tarrow', 'Be his house');
    expect(o.holds('bd_quist_happy', 'party')).toBe(true);
    expect(o.holds('bd_has', 'bd_t_stock')).toBe(true);
    await o.play('Have him teach');
    expect(o.holds('bd_pratfall_given', 'party')).toBe(true);
    expect(o.j.offers('Have him teach')).toBe(false);
  });

  t('keep their registers: a bare face is passed by, a Moth is a colleague, and the poet cannot be seen but in his flies', async () => {
    const o = await start('registers2');
    await o.play('>ombra__stage_flies', '^Talk to Ambrose Finch', 'Speak to him');
    expect(o.page).toContain('is at home');
    expect(o.j.offers('Ask him what happened a year ago')).toBe(false);
    await o.play('^Take your leave', ...wear('Moth'), '>ombra__stage_flies', '^Talk to Ambrose Finch', 'Ask him what he is writing');
    expect(o.page).toContain('only residence');
    expect(o.j.offers('Ask him what happened a year ago')).toBe(false);
    await o.play('^Take your leave', '>ombra__stage_pit', '^Talk to Tobiah Venable', 'Ask him why he does the Warden');
    expect(o.knows('bd_crake_dad')).toBe(true);
  });
});

// ── The Lampoon ──────────────────────────────────────────────────────────────────────────────────────────────────────
// What the Wet Stage's own people teach, used as material: the Candid's tracts (Finch), Tarrow's Walnut, the Reader's
// chest and the Joke at his door. The city's tales (the Warden's Lock-tax and the rest) come from other authors'
// threads; the last test tries them where the campaign has a way to learn them at once.
type Plan = {
  tales: string[]; aim: string; form: string; sharpen?: string[]; casts?: string[]; rehearse?: string[];
  befriend?: boolean; quist?: boolean;
};
async function compose(o: Ombra, plan: Plan) {
  // Day one, by day: the Moth, and Tarrow's three beats.
  await o.play(...wear('Moth'), '>ombra__stage_pit', ...talk('Pantaloon Tarrow', 'Ask him how a joke is made'));
  // By night: Finch (the scraps, the dry flies), Tarrow (the Walnut), Orme (the lamp, the year, the book).
  await o.play('=day 1 21:00', '>ombra__stage_flies', ...talk('Ambrose Finch', 'Ask him what happened a year ago'),
    '>ombra__stage_green_room', ...talk('Pantaloon Tarrow', 'Sit with him in the green room', 'Be his house', 'Ask him about the paper in his hat'),
    '>ombra__stage_flies', 'Hire the rigger', ...talk('Ambrose Finch', 'Lay Tarrow.s scraps on his dry', 'Let the elegy end on the water', 'Ask him what the Candid'),
    '>ombra__stage_green_room', ...talk('Madame Orme', 'Hold the lamp', 'Ask her about the year the house was shut', 'Tell her you mean to give her a play'));
  // Day two, by day: the Moths and the Pantaloon.
  await o.play('=day 2 09:00', ...wear('Moth'), '>ombra__stage_pit', '^Talk to Tobiah Venable', 'Ask him if the Moths will carry', '^Take your leave');
  if (plan.quist !== false) { await o.play(...talk('Pantaloon Tarrow', 'Ask him to play the Pantaloon')); }
  // Day two, by night: the Reader, through the slit; then the book.
  await o.play(...slit(2), '>ombra__bd_stage', ...talk('Master Orlick', 'Tell him you know about the Joke', 'Promise him that you will tell no one', 'Ask him to seal the season'));
  await o.play('>ombra__bd_prompt');
  for (const tale of plan.tales) { await o.play(`Set down ${tale}`); }
  for (const tale of plan.sharpen ?? []) { await o.play(`Sharpen ${tale}`); }
  await o.play(`Aim the Lampoon at ${plan.aim}`, `Cast the Lampoon as ${plan.form}`);
  for (const cast of plan.casts ?? []) { await o.play(cast); }
  // Day three: the old form and the boards.
  await o.play('=day 3 09:00', ...wear('Moth'), '>ombra__stage_pit');
  for (const step of plan.rehearse ?? []) {
    const block = step.startsWith('Block');
    await o.play(block ? '^Talk to Tobiah Venable' : '^Talk to Pantaloon Tarrow');
    await until(o, () => o.holds(block ? 'bd_reh_a' : 'bd_reh_b', 'party'), step);
    await o.play('^Take your leave');
  }
}
const OWN = ['the Candid\'s tracts', 'Tarrow\'s Walnut', 'the Reader\'s chest', 'the Reader and the Joke'];

describe('The Wet Stage: the Lampoon', () => {
  t('is composed of the city\'s stories, aimed, cast and played; a farce of the Candid weakens her movement (a fair night)', async () => {
    const o = await start('lampoon');
    await compose(o, { tales: OWN, aim: 'the Candid', form: 'a farce', rehearse: ['Block the Lampoon'] });
    expect(o.holds('bd_lampoon_ready', 'party')).toBe(true);
    expect(o.holds('handReady', 'party', 'hand_lampoon')).toBe(true);
    expect(o.measure('bd_leaves', 'party')).toBe(4);
    // It cannot be played before the last three nights, or off the boards.
    await o.play('>ombra__bd_stage');
    expect(o.j.offers('Go on: play the Lampoon')).toBe(false);
    await o.play('=day 6 18:00');
    expect(o.j.offers('Go on: play the Lampoon')).toBe(true);
    await o.play('Go on: play the Lampoon');
    expect(o.holds('bd_reacted', 'party')).toBe(true);
    expect(o.holds('bd_flopped', 'party')).toBe(false);
    expect(o.holds('bd_candid_weak', 'party')).toBe(true);
    expect(o.holds('bd_great_night', 'party')).toBe(false);
    expect(o.measure('bd_mood', 'party')).toBe(1);
    expect(o.page).toContain('The Candid enters, in a mask of no mask');
    expect(o.page).toContain('Tamsin gains 75 experience');
    // The manager gives the company the Moth's tongue and a lesson, once.
    await o.play('>ombra__stage_pit', '^Talk to Madame Orme', 'Ask her how the house took it');
    expect(o.carries('bd_tongue')).toBe(true);
    await o.play('Sit for her lesson');
    expect(o.holds('bd_lesson_taken', 'party')).toBe(true);
    expect(o.j.offers('Sit for her lesson')).toBe(false);
    // At the Drawing the Hall has already heard it: the Lampoon counts as played, and costs the Watch's patience
    // nothing.
    await o.play('?^Take your leave', '=day 9 19:00', '>ombra__urn_hall', '=+3');
    expect(o.holds('handPlayed', 'party', 'hand_lampoon')).toBe(true);
    expect(o.measure('handWay', 'hand_lampoon')).toBe(1);
    expect(o.measure('heat', 'party')).toBe(0);
    await o.play('=day 9 23:30');
    expect(o.page).toContain('Of Pantaloon Tarrow: He played the Pantaloon in the Lampoon');
    expect(o.page).toContain('Of the Lampoon: It was a farce of the Candid');
  });

  t('is sharpened with a line that cannot be proved, and a great night follows: it costs a lie, and pays in a kit and a song', async () => {
    const o = await start('great');
    await compose(o, { tales: OWN, aim: 'the Candid', form: 'a farce', sharpen: ['the Candid\'s tracts', 'Tarrow\'s Walnut'],
      rehearse: ['Block the Lampoon', 'Put the Lampoon in the old form'] });
    expect(o.measure('bd_lies', 'party')).toBe(2);
    await o.play('=day 7 18:00', '>ombra__bd_stage', 'Go on: play the Lampoon');
    expect(o.holds('bd_great_night', 'party')).toBe(true);
    expect(o.holds('bd_farce_great', 'party')).toBe(true);
    expect(o.page).toContain('the laugh that does not stop at the end of the line');
    // The Moths' kit is Venable's to give, and he gives it only to a company that made the house laugh.
    await o.play('>ombra__stage_pit', '^Talk to Tobiah Venable', 'Ask him for the Moths');
    expect(o.carries('bd_likeness')).toBe(true);
    await o.play('=day 9 23:30');
    expect(o.page).toContain('In the Row they quote the line you made up as if it were history');
  });

  t('is a flop if it is thin, and costs the company nothing but the night; it is played again, at the Drawing, to the whole Hall, and costs the Watch\'s patience', async () => {
    const o = await start('flop');
    await compose(o, { tales: ['the Candid\'s tracts', 'Tarrow\'s Walnut', 'the Dark Year of the Wet Stage'], aim: 'the Candid', form: 'a farce',
      rehearse: ['Block the Lampoon'] });
    await o.play('=day 6 18:00', '>ombra__bd_stage', 'Go on: play the Lampoon');
    expect(o.holds('bd_flopped', 'party')).toBe(true);
    expect(o.holds('bd_candid_weak', 'party')).toBe(false);
    expect(o.page).toContain('The first laugh does not come');
    expect(o.page).not.toContain('Tamsin gains 75 experience');
    await o.play('>ombra__stage_pit', '^Talk to Madame Orme', 'Ask her how the house took it');
    expect(o.page).toContain('A play is a thing that can be played again');
    expect(o.carries('bd_tongue')).toBe(false);
    // The Stage will not have it twice; the Hall will.
    await o.play('^Take your leave', '=day 7 18:00', '>ombra__bd_stage');
    expect(o.j.offers('Go on: play the Lampoon')).toBe(false);
    await o.play('=day 9 19:00', '>ombra__urn_hall');
    expect(o.j.offers('Play the Lampoon to the Hall')).toBe(true);
    await o.play('Play the Lampoon to the Hall');
    expect(o.holds('handPlayed', 'party', 'hand_lampoon')).toBe(true);
    expect(o.measure('heat', 'party')).toBe(1);
    expect(o.page).toContain('it is not a house at all: it is a city standing in its wet wool');
  });

  t('is an elegy at the Urn, and the Hall is hushed; the elegy ended on the water, which excuses everybody', async () => {
    const o = await start('urn');
    await compose(o, { tales: ['Finch\'s elegy of Cullet Reach, ending on the water', 'the Dark Year of the Wet Stage', 'the Reader and the Joke'],
      aim: 'the Urn', form: 'an elegy', rehearse: ['Block the Lampoon'] });
    await o.play('=day 9 19:00', '>ombra__urn_hall', 'Play the Lampoon to the Hall');
    expect(o.holds('bd_reacted', 'party')).toBe(true);
    expect(o.holds('bd_flopped', 'party')).toBe(false);
    expect(o.holds('bd_urn_mourned', 'party')).toBe(true);
    expect(o.holds('bd_room_angry', 'party')).toBe(false);
    expect(o.measure('bd_mood', 'party')).toBe(2);
    expect(o.measure('handWay', 'hand_lampoon')).toBe(2);
    expect(o.page).toContain('the sound of a thing being forgiven in advance');
    await o.play('=day 9 23:30');
    expect(o.page).toContain('Of Ambrose Finch: He finished the elegy of Cullet Reach, and it ends on the water');
  });

  t('can be aimed at the Warden, or the Urn with its truth, where the city\'s own tales are known (the Warden toppled by a farce, the Urn told)', async () => {
    const o = await start('warden');
    if (!o.j.offers('ZZ: learn the city')) { return; }
    await o.play('ZZ: learn the city');
    await compose(o, { tales: ['the Short Pound', 'the empty Urn', 'the Reader\'s chest', 'the Warden\'s Lock-tax', 'Tarrow\'s Walnut'], aim: 'the Warden of Locks',
      form: 'a farce', sharpen: ['the Short Pound', 'the Reader\'s chest'], rehearse: ['Block the Lampoon', 'Put the Lampoon in the old form'] });
    await o.play('=day 7 18:00', '>ombra__bd_stage', 'Go on: play the Lampoon');
    expect(o.holds('bd_great_night', 'party')).toBe(true);
    expect(o.holds('bd_lacke_laughed', 'party')).toBe(true);
    expect(o.page).toContain('a man in a Magpie domino says the word');
    expect(o.holds('bd_urn_told', 'party')).toBe(false);
    await o.play('=day 9 23:30');
    expect(o.page).toContain('Of the Lampoon: The Warden of Locks was unseated by a joke that was not true');
  });
});

describe('The Wet Stage: explored by a player who takes whatever is offered', () => {
  // A company at the Stage on the first night, with the licence's fee, the lamp, the book and the Reader's confidence,
  // set down before the autoplay laboratory is let to wander through whatever the page then offers: no state it finds
  // may be invalid.
  for (const [seed, policy] of [['pit', 'wander'], ['boards', 'mixed']] as const) {
    t(`stays sound under a ${policy} player, over two hundred offered commands`, async () => {
      const o = await start(`wander-${seed}`);
      await o.play('=day 1 21:00', '>ombra__stage_green_room', ...talk('Madame Orme', 'Hold the lamp'));
      const session = (o.j as unknown as { session: PlaySession }).session;
      const player = new AutoPlayer(policy, new Draw(`${seed}:wet-stage:${policy}`)), metrics = AutoplayRun.empty();
      const failures: string[] = [];
      for (let step = 0; step < 200 && session.campaign.running; step++) {
        const move = player.next(AutoplayRun.situation(session, step));
        if (!move) { failures.push(`softlock at ${step}`); break; }
        try { await AutoplayRun.apply(session, move, player, metrics); } catch (e) { failures.push(`step ${step} ${JSON.stringify(move)}: ${(e as Error).message}`); break; }
        const violations: Violation[] = [
          ...Invariants.creatures(session), ...Invariants.offered(session), ...Invariants.party(session),
        ];
        if (violations.length) { failures.push(`step ${step}: ${violations[0]!.kind} ${violations[0]!.message}`); break; }
      }
      expect(failures).toEqual([]);
      expect(metrics.commands).toBeGreaterThan(20);
    });
  }
});
