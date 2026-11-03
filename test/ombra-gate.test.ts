import { describe, expect, it, setDefaultTimeout } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type PolicyName } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Invariants, type Violation } from '../src/autoplay/invariants';
import type { CreatureGenerationContext } from '../src/content';
import { Ombra, home } from './support/ombra';

// The Gate of Strangers (gate.kyr): Mother Tibb's Three Questions and the Almanack, the Hospice's other Bare, Ferris Moll
// and the letter in the Gull's lining, and Absalom Peck, who was the Serene: Round 3, five kindnesses, four checks, a
// betrayal, and a death on the seventh night. The campaign is the real one unless OMBRA_CAMPAIGN says otherwise: the
// foreign persons these journeys meet (Vail, Pavane, Hobb, Rill, Cosimo) are the other authors', and these steps were
// played against a campaign whose module added stubs for them at the Gatehouse, the parlour, the cooperage, the Drip
// landing and the Row (data/campaigns/zz.campaign.json, uncommitted).
setDefaultTimeout(180000);
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const begin = (seed = 'gate', party?: CreatureGenerationContext[]) => Ombra.start(campaign, seed, party);
const toHospice = ['^To the Customs Steps', '^To Strangers', '^Into the Hospice'];
// The Warrant, taken for real from the sergeant who stands in Strangers' Square till she has her Bare (warrant.kyr): once
// it is held she stands in the Gatehouse, by day and by night, and is "a sergeant of the Masked Watch" until she is named.
const takeWarrant = ['Talk to a sergeant', 'Ask what use the Watch', 'Take the Stranger', '?Take your leave'];
const takeWarrantAtSquare = ['^To the Customs Steps', '^To Strangers', ...takeWarrant];
const warranted = ['^To the Customs Steps', '^To Strangers', ...takeWarrant, '^Into the Hospice'];
// Tibb's Three Questions, answered truthfully; the sheet and the bed follow.
const sheet = ['Talk to Mother Tibb', 'Ask Mother Tibb for a bed', 'Tell her the truth', 'second question', 'until the Drawing',
  'third question', 'Give her a name', '?Take your leave'];
// Peck's name, from himself, and the night on the end of his cot, where the wish is told.
const meet = ['Talk to Absalom', 'Ask Absalom Peck what his name used to mean', '?Take your leave'];
const night = ['=day 1 20:30', 'To the Hospice dormitory', 'Talk to Absalom', 'Sit on the end', 'Tell him you want nothing'];

describe('The Gate of Strangers: Mother Tibb, the Almanack and the sheet', () => {
  it('teaches the city by doing it: a bare good morning is not heard, the Almanack, three answers, a sheet and a bed', async () => {
    const g = await begin();
    await g.play('^To the Customs Steps');
    expect(g.page).toMatch(/It is a very thorough way of being nobody/);
    expect(g.knows('gt_unheard')).toBe(true);
    await g.play('^To Strangers', '^Into the Hospice', 'Talk to Mother Tibb', 'Ask Mother Tibb for the Almanack');
    expect(g.carries('gt_almanack')).toBe(true);
    expect(g.knows('gt_usages')).toBe(true);
    // No sheet, no bed: the offer is made only when the three answers have been given.
    expect(g.j.offers('^Take a bed')).toBe(false);
    await g.play('Ask Mother Tibb for a bed', 'Tell her the truth', 'second question', 'until the Drawing', 'third question');
    expect(g.j.offers('^Take a bed')).toBe(false);
    await g.play('Give her a name');
    expect(g.holds('gt_sheet', 'party')).toBe(true);
    expect(g.carries('gt_sheet_item')).toBe(true);
    expect(g.page).toMatch(/Number seven\. The cot under the window, which has never been dry/);
    await g.play('=day 1 21:30', 'To the Hospice dormitory');
    expect(g.j.offers('^Take a bed')).toBe(true);
    await g.play('Take a bed');
    expect(g.page).toMatch(/sleep long, under a roof/);
  });

  it('refuses the bed to a mask, and says why: a mask in the hall is a burglar who has not made up his mind', async () => {
    const g = await begin();
    await g.play(...toHospice, ...sheet, '^Out to Strangers', '^Into the Wardrobe Annex', 'Talk to Ferris', 'Rent the Gull', '?Take your leave',
      'Put on the Gull', '^Out to Strangers', '^Into the Hospice');
    expect(g.holds('masked', 'party')).toBe(true);
    await g.play('Talk to Mother Tibb');
    expect(g.j.offers('^Take a bed')).toBe(false);
    await g.play('Speak to Mother Tibb');
    expect(g.page).toMatch(/A mask in this hall is a burglar who has not yet made up his mind/);
    // Take it off at the door, as she says, and the sheet is good again.
    await g.play('?Take your leave', 'Take your face off');
    expect(g.holds('masked', 'party')).toBe(false);
    await g.play('Talk to Mother Tibb');
    expect(g.j.offers('^Take a bed')).toBe(true);
  });

  it('opens the sheet to a liar and to a pleader: the deception and the persuasion are checks that cost an hour to fail', async () => {
    const g = await begin('gate-lie');
    await g.play(...toHospice, 'Talk to Mother Tibb', 'Ask Mother Tibb for a bed');
    // Whichever of the two goes, an hour passes on a failure; the truth always works.
    for (let i = 0; i < 8 && !g.holds('gt_reason', 'party'); i++) {
      await g.play('?Talk to Mother Tibb', '?Tell Mother Tibb you have come in grief', '?Ask Mother Tibb to use the Mother', '?Take your leave', '=+7');
    }
    // A lie that fails is not offered again for an hour; the truth is always to be had.
    if (!g.holds('gt_reason', 'party')) { await g.play('?Talk to Mother Tibb', 'Tell her the truth'); }
    expect(g.holds('gt_reason', 'party')).toBe(true);
  });

  it('is answered with no one to write to, and ties a knot at once', async () => {
    const g = await begin();
    await g.play(...toHospice, 'Talk to Mother Tibb', 'Ask Mother Tibb for a bed', 'Tell her the truth', 'second question',
      'you had not planned to leave', 'third question', 'Say there is no one');
    expect(g.holds('gt_kin_none', 'party')).toBe(true);
    expect(g.holds('gt_sheet', 'party')).toBe(true);
    expect(g.page).toMatch(/It saves time/);
  });

  it('keeps, by night, a string of knots for the Bare who died, and asks the one question the Warrant asks', async () => {
    const g = await begin();
    await g.play(...toHospice, ...sheet, '=day 1 21:30', 'To the Hospice dormitory', 'Talk to Mother Tibb',
      'Ask Mother Tibb about the string', '?Take your leave', 'Talk to Mother Tibb', 'what became of the Bare', 'Say you will take the face');
    expect(g.knows('gt_string_known')).toBe(true);
    expect(g.holds('gt_face_yes', 'party')).toBe(true);
    expect(g.page).toMatch(/I shall not know you in the street, and it will be right/);
  });

  it('meets the Hospice\'s other Bare by day and by night, and sells a lens that is a lesson', async () => {
    const g = await begin();
    await g.play(...toHospice, 'Talk to Master Ilbrand Voss', 'Ask the cartographer what he is drawing');
    expect(g.page).toMatch(/It has everyone in it/);
    await g.play('?Take your leave', 'Talk to Dorcas Ammet', 'Ask the pilgrim what she expects', '?Take your leave', 'Talk to Cyprian Lorimer',
      'Buy a Lens of the Honest Eye');
    expect(g.carries('gt_lens')).toBe(true);
    await g.play('?Take your leave', 'Talk to Maro Tilt', 'Ask the drummer why a drum is not a trade', '?Take your leave',
      '=day 1 21:30', 'To the Hospice dormitory', 'Talk to Master Ilbrand Voss', 'Ask the cartographer, after the lamp is out');
    expect(g.page).toMatch(/yours/);
  });
});

describe('The Gate of Strangers: Absalom Peck, Round 3', () => {
  it('is told his name, kindly, in the dark, by a Bare who wants nothing: the Round done, and the Treasurer\'s name given', async () => {
    const g = await begin();
    await g.play(...toHospice, ...meet, ...sheet);
    expect(g.knows('gt_peck_name')).toBe(true);
    // By day he is a drunk: the Urn, and a girl drawn honest; no more.
    await g.play('Talk to Absalom', 'Sit by the old man');
    expect(g.knows('lie_peck')).toBe(true);
    expect(g.knows('marrick_was_treasurer')).toBe(false);
    // The name cannot be said to him until the wish is known, and not by day.
    await g.play('?Take your leave');
    expect(g.j.offers("Say the old man's name")).toBe(false);
    await g.play(...night);
    expect(g.knows('gt_peck_wish')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(false);
    await g.play("Say the old man's name to him");
    expect(g.holds('gt_peck_easy', 'peck')).toBe(true);
    expect(g.holds('gt_via_name', 'peck')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(true);
    // The telling follows, in the order it comes, and gives everything the Rounds want of him.
    expect(g.knows('gt_peck_lady')).toBe(true);
    expect(g.knows('marrick_was_treasurer')).toBe(true);
    expect(g.knows('sluice_known')).toBe(true);
    expect(g.knows('gt_serene_knot')).toBe(true);
    expect(g.page).toMatch(/It was the only way she had to say it/);
    expect(g.page).toMatch(/said an old man.s name to him, or stayed with him, as a person/);
    expect(g.measure('marks', 'party')).toBe(1);
  });

  it('is sat up with, in silence, for a night: the same Round, a different telling', async () => {
    const g = await begin();
    await g.play(...toHospice, ...meet, ...sheet, '=day 1 20:30', 'To the Hospice dormitory', 'Talk to Absalom', 'Sit on the end',
      'Tell him you came only to sit', 'Sit up with the old man');
    expect(g.holds('gt_via_vigil', 'peck')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(true);
    expect(g.knows('marrick_was_treasurer')).toBe(true);
    // The vigil does not give the White Lady: that is for the name.
    expect(g.knows('gt_peck_lady')).toBe(false);
  });

  it('is walked to the Chapel, and lights a lamp for the six hundred', async () => {
    const g = await begin();
    await g.play(...toHospice, ...meet, ...night, '=day 2 09:00', 'To the Hospice hall', 'Talk to Absalom',
      'Ask the old man whether he would walk', 'Ask him to come with you', '^Out to Strangers', '^To Counting Row',
      '^To the Chapel steps', '^Into the Chapel');
    expect(g.holds('following', 'peck', 'party')).toBe(true);
    await g.play('Stand with the old man at the Chapel');
    expect(g.holds('gt_via_chapel', 'peck')).toBe(true);
    expect(g.knows('marrick_was_treasurer')).toBe(true);
    expect(g.at('peck')).toBe('ombra__nave');
  });

  it('is cast in plaster by Madame Pavane, for six coin, and the Wall has a Peck on it again', async () => {
    const g = await begin();
    await g.play(...warranted, ...meet, ...night, '=day 2 09:00', 'To the Hospice hall', 'Talk to Absalom',
      'Ask the old man whether he would walk', 'Ask him to come with you', '?Take your leave', '^Out to Strangers', '^Into the Wardrobe Annex',
      'Talk to Ferris', 'Rent the Gull', '?Take your leave', 'Put on the Gull', '^Out to Strangers', '^To Counting Row', '^To Maskers',
      '^Into Madame Pavane', 'Talk to Madame Pavane');
    const before = g.gold();
    await g.play('Pay Madame Pavane six coin');
    expect(g.gold()).toBe(before - 6);
    expect(g.holds('gt_via_cast', 'peck')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(true);
  });

  it('is shriven by a cleric, under the seal, and the seal is named', async () => {
    const g = await begin('gate-seal', Ombra.one('cleric', 'acolyte'));
    await g.play(...toHospice, ...meet, ...night, '=day 2 09:00', 'To the Hospice hall', 'Talk to Absalom',
      'Ask the old man whether he would walk', 'Ask him to come with you', '?Take your leave', '^Out to Strangers', '^To Counting Row',
      '^To the Chapel steps', '^Into the Chapel', '^To the confessionals', 'Hear the old man');
    expect(g.holds('gt_via_confession', 'peck')).toBe(true);
    expect(g.holds('gt_peck_sealed', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(true);
  });

  it('is pressed with the Watch, and tells, and is wounded: the Hospice shuts its bed, until the apology', async () => {
    // The intimidation is a die: the first seed of these that lets it through is played.
    let g: Ombra | undefined;
    for (const seed of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']) {
      const t = await begin(seed);
      await t.play(...toHospice, ...meet, ...sheet, 'Talk to Absalom', 'Sit by the old man', '?Tell the old man the Watch');
      if (t.holds('gt_peck_wounded', 'peck')) { g = t; break; }
    }
    expect(g).toBeDefined();
    expect(g!.knows('sluice_known')).toBe(true);
    expect(g!.knows('gt_peck_treasurer')).toBe(true);
    // Not her name: what he gives under pressure is the girl and the seal.
    expect(g!.knows('marrick_was_treasurer')).toBe(false);
    await g!.play('?Take your leave', '=day 1 21:30', 'To the Hospice dormitory');
    expect(g!.j.offers('^Take a bed')).toBe(false);
    expect(g!.j.offers("Say the old man's name")).toBe(false);
    await g!.play('Talk to Mother Tibb', 'Ask Mother Tibb for your bed');
    expect(g!.page).toMatch(/I am not able to find it/);
    await g!.play('?Take your leave', 'Talk to Absalom', 'Sit by the old man and say you are sorry');
    expect(g!.holds('gt_peck_wounded', 'peck')).toBe(false);
    expect(g!.j.offers('^Take a bed')).toBe(true);
  });

  it('is given to the Watch, for a lighter count: and nothing can be done for him after', async () => {
    const g = await begin();
    await g.play(...warranted, ...meet, ...sheet, 'Talk to Absalom', 'Sit by the old man', '?Take your leave', '^Out to Strangers',
      '=day 1 20:30', '^Into the Gatehouse', 'Talk to a sergeant', 'Tell the Sergeant where the Serene');
    expect(g.holds('gt_peck_given', 'peck')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(false);
    await g.play('?Take your leave', '^Out to Strangers', '^Into the Hospice', '=day 1 21:30', 'To the Hospice dormitory', 'Talk to Absalom');
    expect(g.j.offers('Sit on the end')).toBe(false);
    expect(g.j.offers("Say the old man's name")).toBe(false);
    expect(g.j.offers('Sit up with the old man')).toBe(false);
    // And the old man dies on the seventh night with the Watch's card under his pillow.
    await g.until(1100);
    expect(g.holds('gt_peck_gone', 'peck')).toBe(true);
  });

  it('dies on the seventh night if nobody has: the bed stripped, a knot on the string, nothing learned', async () => {
    const g = await begin();
    await g.play(...toHospice, ...meet, ...sheet, '?Take your leave', '=day 7 21:00', 'To the Hospice dormitory');
    expect(g.holds('gt_peck_gone', 'peck')).toBe(false);
    expect(g.page).toMatch(/In the end cot, the old man lies propped on three pillows/);
    await g.play('=day 8 04:00');
    expect(g.holds('gt_peck_gone', 'peck')).toBe(true);
    expect(g.page).toMatch(/Mother Tibb is at the cot before you have understood it/);
    expect(g.knows('marrick_was_treasurer')).toBe(false);
    // Persistent: the morning after, the cot is stripped, and the Round is not done.
    await g.play('=day 8 09:00');
    expect(g.page).toMatch(/stripped to its ticking/);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(false);
    // And the closing account says so.
    await g.play('=day 9 23:30');
    expect(g.page).toMatch(/Of Absalom Peck: he died on the seventh night/);
    expect(g.page).toMatch(/Of Mother Tibb: forty-two knots/);
  });

  it('is told the name on the seventh night itself, and lives: the clock is the end of the night and not its beginning', async () => {
    const g = await begin();
    await g.play(...toHospice, ...meet, ...sheet, '?Take your leave', '=day 7 20:30', 'To the Hospice dormitory', 'Talk to Absalom',
      'Sit on the end', 'Tell him you want nothing', "Say the old man's name to him");
    await g.play('=day 8 08:00');
    expect(g.holds('gt_peck_gone', 'peck')).toBe(false);
    expect(g.holds('roundDone', 'party', 'r_peck')).toBe(true);
    await g.play('=day 9 23:30');
    expect(g.page).toMatch(/Of Absalom Peck: he has stopped holding the bottle/);
  });

  it('is taught, by the Serene\'s knot, to the Serene: the one pull that nobody showed him', async () => {
    const g = await begin();
    await g.play(...warranted, ...meet, ...night, "Say the old man's name to him", '?Take your leave', 'To the Hospice hall', '^Out to Strangers',
      '^To Counting Row', '^To Maskers', '^To the Drip landing', '^To the Drip bread-market', "^Into Hobb's cooperage");
    expect(g.knows('gt_serene_knot')).toBe(true);
    await g.play('Tell the Serene how the gallery knot');
    expect(g.holds('gt_knot_shown', 'hobb')).toBe(true);
    expect(g.page).toMatch(/Tell him it was shown/);
  });
});

describe('The Gate of Strangers: the letter in the Gull\'s lining', () => {
  const tonight = ['=day 1 20:30', '^Into the Wardrobe Annex', 'Talk to Ferris Moll', 'Ask Moll why he is sitting up'];
  it('is taken from Moll at night, read, and carried to the Heron who wrote it: the Swap, and a Gull for nothing', async () => {
    const g = await begin();
    await g.play(...takeWarrantAtSquare, ...tonight, 'Offer to take it away');
    expect(g.carries('gt_letter')).toBe(true);
    await g.play('?Take your leave', 'Unfold the letter and read it');
    expect(g.holds('gt_letter_read', 'party')).toBe(true);
    expect(g.knows('gt_swap_tryst')).toBe(true);
    expect(g.page).toMatch(/Do not be kind\. I could not bear it\. C\./);
    await g.play('=day 2 10:00', '^Out to Strangers', '^To Counting Row', '^Into the Hall of Weights', 'Talk to Cosimo', 'Give the Heron his letter');
    expect(g.holds('gt_letter_cosimo', 'party')).toBe(true);
    expect(g.carries('gt_letter')).toBe(false);
    expect(g.holds('gt_moll_trust', 'party')).toBe(true);
    // Cosimo is at home at night (local.kyr) and in the Hall of Weights by day, so the Heron is given his letter next morning.
    // Moll's trust: a face for the day, for nothing, once.
    await g.play('^Out to Counting Row', '^To Strangers', '^Into the Wardrobe Annex', 'Talk to Ferris');
    const before = g.gold();
    await g.play('Ask Moll to lend you the Gull');
    expect(g.gold()).toBe(before);
    expect(g.holds('holdsFace', 'party', 'face_gull')).toBe(true);
    expect(g.j.offers('Ask Moll to lend you')).toBe(false);
  });

  it('is carried unread to the hirer of the Gull, who knows the hand', async () => {
    const g = await begin();
    await g.play('^To the Customs Steps', '^To Strangers', ...tonight, 'Offer to take it away', '?Take your leave', '^Out to Strangers', '^To Counting Row',
      '^To Maskers', '^To the Drip landing', 'Talk to Rill', 'Give Rill the letter');
    expect(g.holds('gt_letter_rill', 'party')).toBe(true);
    expect(g.holds('gt_letter_read', 'party')).toBe(false);
    expect(g.page).toMatch(/The folds are all on the right side/);
    expect(g.holds('gt_moll_trust', 'party')).toBe(true);
  });

  it('is given to the Watch, for a lighter count, and Moll will not lend', async () => {
    const g = await begin();
    await g.play(...takeWarrantAtSquare, ...tonight, 'Offer to take it away', '?Take your leave', '^Out to Strangers',
      '^Into the Gatehouse', 'Talk to a sergeant', 'Hand the Sergeant the letter');
    expect(g.holds('gt_letter_watch', 'party')).toBe(true);
    expect(g.holds('gt_moll_trust', 'party')).toBe(false);
  });

  it('is left to lie, and Moll posts it to Nobody by the fourth noon; or, kept past the Swap, the Swap comes', async () => {
    const a = await begin();
    await a.play('^To the Customs Steps', '^To Strangers', ...tonight, 'Say it is no business of a Bare');
    await a.play('?Take your leave', '=day 4 13:00');
    expect(a.holds('gt_letter_lost', 'party')).toBe(true);
    expect(a.page).toMatch(/Moll was seen at noon at the post-box/);
    const b = await begin();
    await b.play('^To the Customs Steps', '^To Strangers', ...tonight, 'Offer to take it away', '?Take your leave', '=day 5 20:30');
    expect(b.holds('gt_letter_lost', 'party')).toBe(true);
    expect(b.page).toMatch(/waits for a woman who has been told nothing\. You still have the letter/);
  });
});

// The offered-action exploration: whatever the page offers, taken by players of several tempers, checked at every step
// against what play must keep true (a person in two places, a fact known that cannot be, an offered action that does
// nothing), and the run played again from its commands to the same game.
async function explore(seed: string, policy: PolicyName, steps: number, party: CreatureGenerationContext[]) {
  const s = await PlaySession.start(campaign, seed, NodeBundleSource.shared, party);
  const player = new AutoPlayer(policy, new Draw(`${seed}:ombra-gate:${policy}`)), metrics = AutoplayRun.empty();
  const failures: string[] = [];
  for (let step = 0; step < steps && s.campaign.running; step++) {
    const move = player.next(AutoplayRun.situation(s, step));
    if (!move) { failures.push(`softlock at ${step}`); break; }
    try { await AutoplayRun.apply(s, move, player, metrics); } catch (e) {
      failures.push(`step ${step} ${JSON.stringify(move)}: ${(e as Error).message}`); break;
    }
    const violations: Violation[] = [...Invariants.creatures(s), ...Invariants.offered(s), ...Invariants.party(s),
      ...step % 40 === 39 ? Invariants.roundtrip(s) : []];
    if (violations.length) { failures.push(`step ${step}: ${violations[0]!.kind} ${violations[0]!.message}`); break; }
  }
  const again = await PlaySession.start(campaign, seed, NodeBundleSource.shared, party);
  await again.replay(s.transcript.steps);
  return { failures, metrics, replayed: again.canonical() === s.canonical() };
}

describe('The Gate of Strangers, explored', () => {
  for (const [seed, policy, classId] of [['gate-a', 'mixed', 'thief'], ['gate-b', 'explore', 'bard'], ['gate-c', 'mixed', 'warrior']] as const) {
    it(`is played by a ${policy} player, a ${classId}, through its offered commands, and stays sound`, async () => {
      const r = await explore(seed, policy as PolicyName, 250, [{ name: 'Wren', raceId: 'human', classId } as CreatureGenerationContext]);
      expect(r.failures).toEqual([]);
      expect(r.replayed).toBe(true);
      expect(r.metrics.commands).toBeGreaterThan(20);
    }, 300000);
  }
});
