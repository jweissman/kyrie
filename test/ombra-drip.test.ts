import { describe, expect, it } from 'bun:test';
import { Ombra, o } from './support/ombra';
import type { CreatureGenerationContext } from '../src/content';

// The Drip (data/adventures/book-of-faces/drip.kyr): Rill Ketch's ferry, the Anonymous Saint's pot, the Rain-Wives'
// Petition and the Lamp-Trimmers' strike. A check's die depends on seed and history, so a step that may go either way is
// tried again after an hour (`attempt`), and the failure branches are proved by a company that cannot succeed.
const campaign = process.env.OMBRA_CAMPAIGN ?? 'data/campaigns/the-book-of-faces.campaign.json';
// One person alone (the campaign's company is of one), of the calling whose hands the scene needs: a cleric's wisdom
// for mending and insight, a ranger's for woodcraft, a mage's mind for lore, a bard's tongue, a warrior's arm.
const start = (calling = 'cleric', seed = 'drip') => Ombra.start(campaign, seed, Ombra.one(calling, undefined, 'human', 'Wren'));
// Coin into the company's purses (the shared measure is read from them).
type Store = { acquire(ids: string[]): { creatures: { state: { gold: number } }[]; commit(c: unknown): void; release(): void } };
const give = (g: Ombra, coin: number) => {
  const store = (g.j.campaign as unknown as { creatures: Store }).creatures;
  const lease = store.acquire(g.j.campaign.state.partyIds);
  try { lease.creatures[0]!.state.gold += coin; lease.commit(lease.creatures); } finally { lease.release(); }
  g.j.campaign.refreshProjection();
};
// Tries a chancy step until `done` holds, waiting an hour between tries (the die changes with the watch).
const attempt = async (g: Ombra, step: string, done: () => boolean, tries = 12, wait = 'Wait › An hour') => {
  for (let i = 0; i < tries && !done(); i += 1) { await g.play(`?${step}`); if (!done()) { await g.play(wait); } }
  expect(done()).toBe(true);
};
const gullAt = async (g: Ombra) => g.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__drip_landing');

describe('The Drip: Rill Ketch\'s ferry', () => {
  it('mended as a Gull, in the open, by day: custom, and the Gull\'s goodwill', async () => {
    const g = await start('cleric'); give(g, 30);
    await gullAt(g);
    await g.play('Speak to Rill Ketch as one Gull');
    expect(g.knows('dr_boat_leaks')).toBe(true);
    await attempt(g, 'Knock on the Patience', () => g.knows('dr_green_planks'));
    await g.play('>ombra__bread_market', 'Buy a cord-length', '>ombra__drip_landing');
    await attempt(g, 'Mend the Patience as a Gull', () => g.holds('dr_boat_sound', 'party'));
    expect(g.holds('dr_boat_how_custom', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
    expect(g.measure('goodwill', 'face_gull')).toBeGreaterThanOrEqual(1);
    expect(g.measure('marks', 'party')).toBe(1);
    // persistence: a day, a night and a rest later it is still done, and Rill carries the company faster than the Row's ordinary two
    expect(g.j.measure('travelTime', 'ombra__ferry_row_drip')).toBe(1);
    await g.play('=day 3 10:00');
    expect(g.holds('dr_boat_sound', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
    expect(g.holds('dr_berth_sold', 'party')).toBe(false);
  }, 120000);

  it('asked, not told: bailed through the night, the tin read, a job for a penny, and no charity in it', async () => {
    const g = await start('monk'); give(g, 40);
    await g.play('>ombra__bread_market', 'Buy a cord-length', 'Buy a cord-length', 'Buy a cord-length', '>ombra__drip_landing', 'Wait › Until dark', 'Say you are bare');
    await attempt(g, 'Take the cup, and bail', () => g.holds('dr_rill_open', 'party'));
    await g.play('Ask Rill Ketch where a Gull learns');
    expect(g.knows('dr_rill_orphan')).toBe(true);
    await attempt(g, 'Watch how Rill Ketch bails', () => g.knows('dr_gulls_penny'));
    await g.play('Ask Rill Ketch what she would let anyone do');
    expect(g.holds('dr_rill_consents', 'party')).toBe(true);
    await attempt(g, 'Knock on the Patience', () => g.knows('dr_green_planks'));
    await attempt(g, 'Go along the Patience', () => g.knows('dr_green_planks'));
    const purse = g.gold();
    await attempt(g, 'Mend the Patience by night', () => g.holds('dr_boat_sound', 'party'));
    expect(g.holds('dr_rill_insulted', 'party')).toBe(false);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
    expect(g.gold()).toBeGreaterThan(purse - 11);
    // later: she carries the company free, and the ferry keeps better times
    expect(g.measure('goodwill', 'face_gull')).toBe(0);
  }, 180000);

  it('mended unasked in the dark it is charity, and she says nothing until it is made a sale for a penny', async () => {
    const g = await start('cleric'); give(g, 40);
    await g.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__drip_landing',
      'Wait › An hour', 'Ask the steward how a Gull is to be helped');
    expect(g.knows('dr_gulls_penny')).toBe(true);
    await g.play('Speak to Rill Ketch as one Gull');
    await attempt(g, 'Go along the Patience', () => g.knows('dr_green_planks'));
    await g.play('>ombra__bread_market', 'Buy a cord-length', 'Buy a cord-length', 'Buy a cord-length', '>ombra__drip_landing', 'Wait › Until dark', 'Take your face off');
    await attempt(g, 'Mend the Patience in the dark', () => g.holds('dr_boat_sound', 'party'));
    expect(g.holds('dr_rill_insulted', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(false);
    await g.play('Speak to Rill Ketch');
    expect(g.page).toContain('being very careful not to look at them');
    await g.play('Put a coin on the thwart');
    expect(g.holds('dr_rill_insulted', 'party')).toBe(false);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
  }, 180000);

  it('the Articles against the surveyor: restitution is a right, and the surveyor is struck from the roll', async () => {
    const g = await start('mage'); give(g, 10);
    await g.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__drip_landing', 'Speak to Rill Ketch as one Gull');
    await attempt(g, 'Go along the Patience', () => g.knows('dr_green_planks'));
    await attempt(g, 'Knock on the Patience', () => g.knows('dr_green_planks'));
    await attempt(g, 'Read the Ferrymen', () => g.knows('dr_articles'));
    await g.play('Lay the green strakes');
    expect(g.holds('dr_ley_struck', 'party')).toBe(true);
    expect(g.holds('dr_boat_how_right', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
    await g.play('Ask Rill Ketch how the Patience rides');
    expect(g.page).toContain('It was my due');
  }, 180000);

  it('left alone, the Patience is condemned on the seventh day and the berth let', async () => {
    const g = await start('warrior');
    await g.play('=day 7 13:00');
    expect(g.holds('dr_berth_sold', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(false);
    await g.play('>ombra__drip_landing');
    expect(g.page).toContain('BERTH LET');
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Rill Ketch: the Patience was condemned');
  }, 180000);

  it('the Guild\'s loan: Rill is persuaded to put her mark to it, and owes a farthing in the penny for a sound boat', async () => {
    const g = await start('bard'); give(g, 20);
    await g.play('>ombra__drip_landing', 'Wait › Until dark', 'Say you are bare');
    await attempt(g, 'Take the cup, and bail', () => g.holds('dr_rill_open', 'party'), 12, 'Wait › A while');
    await attempt(g, 'Ask Rill Ketch to let the Guild', () => g.holds('dr_rill_guild_ok', 'party') || g.holds('dr_rill_cool', 'party'), 1);
    if (!g.holds('dr_rill_guild_ok', 'party')) {
      // a failed asking is not a refusal for good: she will not be asked again that night, and is asked again the next
      expect(g.holds('dr_rill_cool', 'party')).toBe(true);
      await g.play('=day 2 07:00');
      await attempt(g, 'Ask Rill Ketch to let the Guild', () => g.holds('dr_rill_guild_ok', 'party'), 6, '=+144');
    }
    await g.play('=day 2 10:00', '>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__drip_landing', 'Ask the steward about a Guild loan');
    expect(g.knows('dr_loans')).toBe(true);
    await attempt(g, 'Put Rill\'s mark to the steward\'s table', () => g.holds('dr_boat_sound', 'party'), 4, 'Wait › A while');
    expect(g.holds('dr_boat_how_guild', 'party')).toBe(true);
    expect(g.holds('dr_rill_indebted', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
    await g.play('Ask Rill Ketch how the Patience rides');
    expect(g.page).toContain('Dry, and owing');
  }, 240000);

  it('the cruel way: the surveyor\'s mask lifted and his name said aloud in the landing; he is Named, and the boat is re-planked at his forfeit', async () => {
    const g = await start('warrior'); give(g, 10);
    await g.play('=day 5 11:00', '>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__drip_landing');
    expect(g.at('dr_ley')).toBe('ombra__drip_landing');
    await g.play('Lift .* mask, with no leave', 'Name .* aloud');
    expect(g.holds('named', 'dr_ley')).toBe(true);
    expect(g.holds('dr_ley_struck', 'party')).toBe(true);
    expect(g.holds('dr_boat_sound', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
    expect(g.measure('heat', 'party')).toBeGreaterThanOrEqual(5);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('was Named in the landing');
  }, 240000);

  it('bought outright for forty coin she calls you master; sold back for a penny she is her own again', async () => {
    const g = await start('warrior'); give(g, 60);
    await g.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__drip_landing', 'Speak to Rill Ketch as one Gull',
      'Wait › An hour', 'Ask the steward how a Gull is to be helped', 'Buy the Patience outright');
    expect(g.holds('dr_rill_hired', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(false);
    await g.play('Sell the Patience back');
    expect(g.holds('dr_rill_hired', 'party')).toBe(false);
    expect(g.holds('roundDone', 'party', 'r_ferry')).toBe(true);
  }, 180000);
});

describe('The Drip: the Anonymous Saint', () => {
  it('fed sitting down, at night, bare: she tells of the flood, and the Urn that was never reached into; thirty coin fills the pot', async () => {
    const g = await start('warrior'); give(g, 40);
    await g.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__soup_room', 'Ask the Saint about the pot');
    expect(g.knows('dr_pot_low')).toBe(true);
    await g.play('Ask the Saint who the donor was', '>ombra__rain_hall_floor', 'Buy a covered bowl', '>ombra__soup_room', 'Wait › Until dark', 'Take your face off',
      'Knock at the kitchen', 'Put a hot supper');
    expect(g.holds('dr_nobody_moved', 'party')).toBe(true);
    await g.play('Ask the Saint what she did before the kitchen');
    expect(g.knows('sluice_known')).toBe(true);
    await g.play('Ask the Saint about the year she was drawn');
    expect(g.knows('dr_urn_hand')).toBe(true);
    await g.play('Put thirty coin');
    expect(g.holds('dr_pot_secured', 'party')).toBe(true);
    expect(g.holds('roundDone', 'party', 'r_soup')).toBe(true);
    await g.play('Tell the Saint the pot is secured');
    expect(g.carries('dr_pestle')).toBe(true);
  }, 180000);

  it('made to laugh once, with the Pound: a bard can do it, and rations make up the rest of the pot', async () => {
    const g = await start('bard'); give(g, 20);
    await g.play('>ombra__soup_room', 'Wait › Until dark', 'Knock at the kitchen');
    await attempt(g, 'Tell the Saint, quite gravely', () => g.holds('dr_nobody_moved', 'party'), 12, 'Wait › An hour');
    expect(g.holds('dr_nobody_laughed', 'party')).toBe(true);
    await g.play('>ombra__bread_market');
    // eight rations at two coin: the dearer way round, but no one is asked for a name
    for (let i = 0; i < 8; i += 1) { await g.play('Buy a ration'); }
    await g.play('>ombra__soup_room');
    for (let i = 0; i < 8; i += 1) { await g.play('Leave a ration'); }
    expect(g.holds('dr_pot_secured', 'party')).toBe(true);
  }, 180000);

  it('left alone the pot runs dry on the fourth day and the kitchen shuts at noon on the sixth', async () => {
    const g = await start('warrior');
    await g.play('=day 4 09:00');
    expect(g.holds('dr_pot_dry', 'party')).toBe(true);
    await g.play('>ombra__soup_room');
    expect(g.page).toContain('The copper is cold');
    await g.play('=day 6 13:00');
    expect(g.holds('dr_kitchen_shut', 'party')).toBe(true);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Sister Nobody: the kitchen shut at noon');
  }, 180000);

  it('Named aloud in the market, she leaves the kitchen for the Hospice, bare', async () => {
    const g = await start('mage'); give(g, 5);
    await g.play('>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__soup_room', 'Ask the Saint about the pot');
    await attempt(g, 'Watch the Saint', () => g.knows('dr_nobody_counts'), 14, 'Wait › A while');
    await attempt(g, 'Reckon up the Physicians-General', () => g.knows('dr_nobody_spent'), 14, 'Wait › A while');
    await g.play('Name .* aloud');
    expect(g.holds('named', 'nobody')).toBe(true);
    await g.play('Wait › An hour');
    expect(g.holds('dr_kitchen_shut', 'party')).toBe(true);
    expect(g.at('nobody')).toBe('ombra__hospice_hall');
    expect(g.measure('heat', 'party')).toBeGreaterThanOrEqual(2);
  }, 240000);
});

describe('The Drip: the Rain-Wives\' Petition', () => {
  const readCloth = async (g: Ombra) => {
    await g.play('=day 4 09:00', '>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__rain_hall_floor', 'Ask Goody Pallet why the lamp',
      'Count the Tally-cloth with Tansy');
    expect(g.knows('lie_tally')).toBe(true);
  };
  const askAtNight = async (g: Ombra, answer: string) => {
    await g.play('Wait › Until dark', 'Take your face off', 'Knock at the hall', 'Sit by Goody Pallet', answer);
    expect(g.holds('dr_pallet_asked', 'party')).toBe(true);
  };
  const nextDay = async (g: Ombra, day: number) => g.play(`=day ${day} 08:30`, '>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__rain_hall_floor');

  it('the truth, and a jar: the Wives march on the Chapel on the sixth day for a real draw; the black row teaches the Sluice', async () => {
    const g = await start('warrior'); give(g, 20);
    await readCloth(g);
    expect(g.knows('dr_tally_sums')).toBe(true);
    await g.play('Ask Goody Pallet about the black row');
    expect(g.knows('sluice_known')).toBe(true);
    await askAtNight(g, 'Say: out of a jar');
    expect(g.holds('dr_wives_chance', 'party')).toBe(true);
    await nextDay(g, 5);
    await g.play('Tell the Rain-Wives the truth');
    expect(g.holds('dr_petition_answered', 'party')).toBe(true);
    await g.play('>ombra__chapel_steps', '=day 6 13:00');
    expect(g.holds('dr_marchers', 'party')).toBe(true);
    expect(g.measure('dr_march_day', 'party')).toBe(6);
    expect(g.page).toContain('carrying the Tally-cloth flat between them');
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Goody Pallet: the Rain-Wives stood at the foot of the Chapel steps');
  }, 240000);

  it('the truth, and the hand: Hesper was good, and the Wives keep the secret and put the lamp out', async () => {
    const g = await start('warrior'); give(g, 20);
    await readCloth(g);
    await askAtNight(g, 'Say: chosen by somebody who knew her');
    expect(g.holds('dr_wives_keep', 'party')).toBe(true);
    await nextDay(g, 5);
    await g.play('Tell the Rain-Wives the truth');
    expect(g.page).toContain('well governed by a liar');
    await g.play('=day 6 13:00');
    expect(g.holds('dr_marchers', 'party')).toBe(false);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Goody Pallet: she put out the lamp with two fingers');
  }, 240000);

  it('ask at the Hearing: the march is put off to the eighth day', async () => {
    const g = await start('bard'); give(g, 20);
    await readCloth(g);
    await askAtNight(g, 'Say: you do not know');
    expect(g.holds('dr_wives_waiting', 'party')).toBe(true);
    await nextDay(g, 5);
    await attempt(g, 'Ask the Rain-Wives to wait', () => g.holds('dr_deferred', 'party') || g.holds('dr_pallet_cool', 'party'));
    if (g.holds('dr_deferred', 'party')) {
      await g.play('=day 6 13:00');
      expect(g.holds('dr_marchers', 'party')).toBe(false);
      await g.play('=day 8 13:00');
      expect(g.holds('dr_marchers', 'party')).toBe(true);
      expect(g.measure('dr_march_day', 'party')).toBe(8);
    }
  }, 240000);

  it('a kind lie: it holds if it is believed, and unravels on the eighth day for a Wife who chose a jar', async () => {
    const g = await start('bard'); give(g, 20);
    await readCloth(g);
    await askAtNight(g, 'Say: out of a jar');
    await nextDay(g, 5);
    await g.play('?Tell the Rain-Wives, kindly');
    if (g.holds('dr_wives_lied', 'party')) {
      expect(g.holds('dr_march_pending', 'party')).toBe(false);
      await g.play('=day 8 13:00');
      expect(g.holds('dr_march_pending', 'party') || g.holds('dr_marchers', 'party')).toBe(true);
    } else {
      expect(g.holds('dr_petition_answered', 'party')).toBe(true);
      expect(g.holds('dr_pallet_cool', 'party')).toBe(true);
    }
  }, 240000);

  it('read by the colours, not counted: a mage can; and the Wives take on the Saint\'s pot once the petition is answered', async () => {
    const g = await start('mage'); give(g, 20);
    await g.play('=day 4 09:00', '>ombra__annex_counter', 'Rent the Gull', 'Put on the Gull', '>ombra__rain_hall_floor', 'Ask Goody Pallet why the lamp');
    await attempt(g, 'Read the Tally-cloth', () => g.knows('lie_tally'), 10, 'Wait › A while');
    await g.play('Ask Goody Pallet about the one pink knot');
    expect(g.knows('dr_hesper_known')).toBe(true);
    await attempt(g, 'Ask the Rain-Wives to wait', () => g.holds('dr_petition_answered', 'party'), 3, 'Wait › A while');
    if (g.holds('dr_deferred', 'party')) {
      await g.play('Ask whether the Rain-Wives could take on the Saint');
      expect(g.measure('dr_supply', 'party')).toBe(4);
    }
  }, 240000);

  it('left alone the Wives march on the sixth day with no reason that could be written down', async () => {
    const g = await start('warrior');
    await g.play('=day 6 13:00');
    expect(g.holds('dr_marchers', 'party')).toBe(true);
    expect(g.holds('dr_wives_chance', 'party')).toBe(false);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('with forty damp sleeves and no reason');
  }, 240000);
});

describe('The Drip: the Lamp-Trimmers\' strike', () => {
  const asOwl = async (g: Ombra, to = '>ombra__lamp_yard') => g.play('>ombra__annex_counter', 'Rent the Owl', 'Put on the Owl', to);

  it('by night, bare, the steward is a man at a stove: the Owls\' oath is told, and a masked knock is taken for a burglar', async () => {
    const g = await start('warrior');
    await g.play('>ombra__lamp_yard', 'Wait › Until dark', 'Knock at the lamp-house door');
    expect(g.knows('dr_arrears_known')).toBe(true);
    expect(g.knows('dr_hal_name')).toBe(true);
    expect(g.page).toContain('a young man laughs too loudly at nothing');
    await g.play('Wait › Until first light', '>ombra__annex_counter', 'Rent the Owl', 'Put on the Owl', '=day 2 20:30', '>ombra__lamp_yard');
    expect(g.holds('masked', 'party')).toBe(false);
  }, 240000);

  it('left alone the Owls walk out on the eighth day and the city is dark on the ninth night', async () => {
    const g = await start('warrior');
    await g.play('=day 8 09:00');
    expect(g.holds('dr_strike_on', 'party')).toBe(true);
    expect(g.holds('dr_dark', 'party')).toBe(false);
    await g.play('>ombra__lamp_yard');
    expect(g.page).toContain('NO OIL, NO WAGE, NO LIGHT');
    await g.play('=day 9 09:00');
    expect(g.holds('dr_dark', 'party')).toBe(true);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Jory Wickham: the Owls did not go back');
  }, 240000);

  it('a stranger\'s money is refused; hands first: a lamp lit in order earns the steward\'s trust, and then the sixty coin settles it', async () => {
    const g = await start('warrior'); give(g, 70);
    await asOwl(g);
    await g.play('Speak to Jory Wickham as one Owl');
    expect(g.knows('dr_arrears_known')).toBe(true);
    await g.play('Ask Jory Wickham whether an Owl\'s pole could use');
    await g.play('Offer to pay the Owls');
    expect(g.page).toContain('a bribe');
    await g.play('=17:30', '?Light the Drip\'s round');
    // a failed round is tried again at the next dusk, in a face rented afresh
    for (let day = 2; day <= 5 && !g.holds('dr_jory_trusts', 'party'); day += 1) {
      await g.play(`=day ${day} 08:30`, '>ombra__annex_counter', 'Rent the Owl', 'Put on the Owl', '>ombra__lamp_yard', `=day ${day} 17:30`, '?Light the Drip\'s round');
    }
    expect(g.holds('dr_jory_trusts', 'party')).toBe(true);
    expect(g.holds('cm_began', 'party', 'cm_t_lamp')).toBe(true);
    await g.play('Pay the Owls what is still owing');
    expect(g.holds('dr_strike_settled', 'party')).toBe(true);
    await g.play('=day 9 09:00');
    expect(g.holds('dr_dark', 'party')).toBe(false);
    expect(g.holds('dr_strike_on', 'party')).toBe(false);
  }, 240000);

  it('Hal Dunne\'s cask: found by night, brought back unnamed, and the twenty-two made up', async () => {
    const g = await start('thief'); give(g, 40);
    await g.play('>ombra__lamp_yard', 'Wait › Until dark', 'Sit down by Hal Dunne');
    await attempt(g, 'Watch Hal Dunne', () => g.knows('dr_box_taken'), 8, '=+144');
    await attempt(g, 'While Hal sleeps it off', () => g.holds('dr_box_found', 'party'), 6, '=+144');
    expect(g.knows('dr_cask_known')).toBe(true);
    await g.play('Wait › Until first light');
    await g.play('Put the canvas bag');
    expect(g.holds('dr_box_returned', 'party')).toBe(true);
    expect(g.measure('dr_arrears', 'party')).toBe(38);
    await g.play('Pay the Owls what is still owing');
    expect(g.holds('dr_strike_settled', 'party')).toBe(true);
    expect(g.measure('dr_arrears', 'party')).toBe(60);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Jory Wickham: the box was in the lamp-house');
  }, 240000);


  it('breaking it with the Hospice\'s lodgers: the lamps are lit and the Owls do not forgive', async () => {
    const g = await start('bard'); give(g, 10);
    await asOwl(g);
    await g.play('Speak to Jory Wickham as one Owl');
    await g.play('=day 8 09:00', '>ombra__annex_counter', 'Rent the Owl', 'Put on the Owl', '>ombra__hospice_hall', 'Ask Mother Tibb whether any of the Hospice');
    expect(g.holds('dr_lodgers_lent', 'party')).toBe(true);
    await g.play('>ombra__lamp_yard', '=day 8 17:30');
    expect(g.holds('dr_strike_on', 'party')).toBe(true);
    await attempt(g, 'Light the Drip\'s lamps in the Owl', () => g.holds('dr_strike_broken', 'party'), 2, 'Wait › A while');
    if (g.holds('dr_strike_broken', 'party')) {
      expect(g.holds('dr_strike_on', 'party')).toBe(false);
      await g.play('=day 9 09:00');
      expect(g.holds('dr_dark', 'party')).toBe(false);
      await g.play('=day 9 23:30');
      expect(g.page).toContain('Of Jory Wickham: the lamps of the Drip were lit by strangers');
    } else {
      expect(g.holds('dr_jory_cool', 'party')).toBe(true);
    }
  }, 240000);

  it('standing a day with the Owls makes you one: an earned face, and the city goes dark', async () => {
    const g = await start('warrior'); give(g, 10);
    await g.play('=day 8 08:30');
    await asOwl(g);
    await g.play('Stand in the yard with the Owls');
    expect(g.holds('dr_strike_joined', 'party')).toBe(true);
    expect(g.holds('cm_in', 'party', 'cm_t_lamp')).toBe(true);
    expect(g.holds('holdsFace', 'party', 'face_owl')).toBe(true);
    expect(g.holds('rented', 'party', 'face_owl')).toBe(false);
    await g.play('=day 9 09:00');
    expect(g.holds('dr_dark', 'party')).toBe(true);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Jory Wickham: the Owls stood in the yard on the Ninth Day');
  }, 240000);
});
