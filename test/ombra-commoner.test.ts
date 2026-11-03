import { describe, expect, it } from 'bun:test';
import { Ombra } from './support/ombra';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// A Trade of One's Own (data/adventures/book-of-faces/commoner.kyr): the Ferry, the Lamp and the Chandler's stall, three
// beats each and a mask; then the Trades' procession at the Drawing. A check's die depends on seed and history, so a step
// that may go either way is tried again after a little while (`attempt`).
const campaign = process.env.OMBRA_CAMPAIGN ?? 'data/campaigns/the-book-of-faces.campaign.json';
const start = (calling = 'monk', seed = 'commoner') => Ombra.start(campaign, seed, Ombra.one(calling, undefined, 'human', 'Wren'));
type Store = { acquire(ids: string[]): { creatures: { state: { gold: number } }[]; commit(c: unknown): void; release(): void } };
const give = (g: Ombra, coin: number) => {
  const store = (g.j.campaign as unknown as { creatures: Store }).creatures;
  const lease = store.acquire(g.j.campaign.state.partyIds);
  try { lease.creatures[0]!.state.gold += coin; lease.commit(lease.creatures); } finally { lease.release(); }
  g.j.campaign.refreshProjection();
};
type Camp = { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
// A fact set by hand, to stand a finale on the state its arcs would have left (the Drawing is nine days away).
const set = (g: Ombra, name: string, ...args: string[]) => {
  const c = g.j.campaign as unknown as Camp;
  c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call(`ombra__${name}`, ...args.map(a => (a === 'party' ? a : `ombra__${a}`))) }]));
};
const attempt = async (g: Ombra, step: string, done: () => boolean, tries = 10, wait = 'Wait › A while') => {
  for (let i = 0; i < tries && !done(); i += 1) { await g.play(`?${step}`); if (!done()) { await g.play(wait); } }
  expect(done()).toBe(true);
};
const face = async (g: Ombra, name: string) => g.play('>ombra__annex_counter', `Rent the ${name}`, `Put on the ${name}`);

describe('A Trade of One\'s Own: the Ferry', () => {
  const toTested = async (g: Ombra) => {
    await face(g, 'Gull');
    await g.play('>ombra__drip_landing', 'Ask Rill Ketch whether the Patience could use a second oar');
    expect(g.holds('cm_ferry_asked', 'party')).toBe(true);
    await attempt(g, 'Learn the Cuff', () => g.holds('cm_began', 'party', 'cm_t_ferry'));
    await attempt(g, 'Take the Patience\'s oars across', () => g.holds('cm_tested', 'party', 'cm_t_ferry'));
    await g.play('Wait › A while');
    expect(g.at('cm_dill')).toBe('ombra__drip_landing');
  };

  it('the Cuff, the oars, and a copyist who cannot pay: his penny taken as a fare, and the Gull is yours for good', async () => {
    const g = await start('monk'); give(g, 20);
    await toTested(g);
    await g.play('Pay the old copyist\'s fare for him');
    expect(g.holds('cm_fare_penny', 'party')).toBe(true);
    expect(g.at('cm_dill')).toBe('ombra__offstage');
    // the offer is the steward's, by day, in a Gull's domino: the morning after
    await g.play('=day 2 10:00');
    await face(g, 'Gull');
    await g.play('>ombra__drip_landing');
    const purse = g.gold();
    await g.play('Take the Ferrymen\'s Guild\'s offer');
    expect(g.holds('cm_in', 'party', 'cm_t_ferry')).toBe(true);
    expect(g.carries('cm_hook')).toBe(true);
    expect(g.gold()).toBe(purse + 8);
    expect(g.measure('cm_trades', 'party')).toBe(1);
    expect(g.measure('goodwill', 'face_gull')).toBeGreaterThanOrEqual(2);
    // it is not rented: it does not go back at the Ninth Bell
    await g.play('=day 2 21:00');
    expect(g.holds('holdsFace', 'party', 'face_gull')).toBe(true);
    expect(g.holds('fitted', 'party', 'face_gull')).toBe(true);
    // Mother Tibb notices
    await g.play('>ombra__hospice_hall', 'Say that you have a trade');
    expect(g.holds('cm_tibb_told', 'party')).toBe(true);
  }, 240000);

  it('carried for nothing it is charity, and Rill says so; the Guild\'s wage may be taken and the mask refused', async () => {
    const g = await start('monk'); give(g, 20);
    await toTested(g);
    await g.play('Carry the old copyist across for nothing');
    expect(g.holds('cm_fare_free', 'party')).toBe(true);
    expect(g.page).toContain('Nobody rides free in my boat');
    await g.play('=day 2 10:00');
    await face(g, 'Gull');
    await g.play('>ombra__drip_landing', 'Take the oar\'s wage and the boat-hook');
    expect(g.holds('cm_kept_bare', 'party', 'cm_t_ferry')).toBe(true);
    expect(g.holds('cm_in', 'party', 'cm_t_ferry')).toBe(false);
    expect(g.carries('cm_hook')).toBe(true);
    await g.play('=day 2 23:00');
    expect(g.holds('holdsFace', 'party', 'face_gull')).toBe(false);
  }, 240000);

  it('by the Guild\'s table, the fare is taken and the copyist walks', async () => {
    const g = await start('monk'); give(g, 10);
    await toTested(g);
    await g.play('Take the old copyist\'s fare, as the Guild\'s table says');
    expect(g.holds('cm_fare_book', 'party')).toBe(true);
    await g.play('=day 9 23:30');
    expect(g.page).toContain('Of Bertram Dill: he left his button');
  }, 240000);
});

describe('A Trade of One\'s Own: the Lamp', () => {
  it('lit in order, a pump mended, and a gill of oil: paid for out of your own purse; the Owl is yours, and Jory trusts you', async () => {
    const g = await start('warrior'); give(g, 30);
    await face(g, 'Owl');
    await g.play('>ombra__lamp_yard', 'Ask Jory Wickham whether an Owl\'s pole could use');
    expect(g.holds('cm_lamp_asked', 'party')).toBe(true);
    await g.play('=17:30', '?Light the Drip\'s round');
    for (let day = 2; day <= 6 && !g.holds('cm_began', 'party', 'cm_t_lamp'); day += 1) {
      await g.play(`=day ${day} 08:30`, '>ombra__annex_counter', 'Rent the Owl', 'Put on the Owl', '>ombra__lamp_yard', `=day ${day} 17:30`, '?Light the Drip\'s round');
    }
    expect(g.holds('cm_began', 'party', 'cm_t_lamp')).toBe(true);
    expect(g.holds('dr_jory_trusts', 'party')).toBe(true);
    // the next morning, in a face rented afresh
    await g.play('=day 7 08:30', '>ombra__annex_counter', 'Rent the Owl', 'Put on the Owl', '>ombra__lamp_yard');
    await attempt(g, 'Mend the lamp-yard\'s oil-pump', () => g.holds('cm_tested', 'party', 'cm_t_lamp'), 12, 'Wait › An hour');
    const purse = g.gold();
    await g.play('Fill the lamps full, and buy the lamp-boys');
    expect(g.holds('cm_oil_paid', 'party')).toBe(true);
    expect(g.gold()).toBe(purse - 6);
    await g.play('Take the Owls\' offer');
    expect(g.holds('cm_in', 'party', 'cm_t_lamp')).toBe(true);
    expect(g.carries('cm_snuffer')).toBe(true);
  }, 240000);

  it('the Owls take their domino back from one who breaks their strike', async () => {
    const g = await start('bard'); give(g, 20);
    await g.play('=day 8 09:00');
    set(g, 'cm_in', 'party', 'cm_t_lamp');
    await g.play('Wait › A while');
    expect(g.measure('cm_trades', 'party')).toBe(1);
    set(g, 'dr_strike_broken', 'party');
    await g.play('Wait › A while');
    expect(g.measure('cm_trades', 'party')).toBe(0);
    expect(g.holds('cm_in', 'party', 'cm_t_lamp')).toBe(false);
  }, 240000);
});

describe('A Trade of One\'s Own: the Chandler\'s stall, and the Procession', () => {
  it('the stock tallied, a thief turned away with a word, the ounce made up, and the Cockle yours: a worker\'s body for three trades', async () => {
    const g = await start('mage'); give(g, 30);
    await face(g, 'Cockle');
    await g.play('>ombra__bread_market', 'Ask Mistress Crumb whether the stall wants');
    await attempt(g, 'Tally the stall', () => g.holds('cm_began', 'party', 'cm_t_chandler'), 8, 'Wait › A while');
    await g.play('=11:30');
    expect(g.at('cm_teale')).toBe('ombra__bread_market');
    await g.play('?Watch the customer at the wicks');
    if (g.holds('cm_thief_seen', 'party')) {
      await g.play('Tell the mild man quietly');
      expect(g.holds('cm_thief_let', 'party')).toBe(true);
    } else {
      expect(g.holds('cm_stall_robbed', 'party')).toBe(true);
    }
    expect(g.holds('cm_tested', 'party', 'cm_t_chandler')).toBe(true);
    const purse = g.gold();
    await g.play('Weigh every pound honest, and make up the ounce');
    expect(g.holds('cm_weight_paid', 'party')).toBe(true);
    expect(g.gold()).toBe(purse - 5);
    await g.play('Buy a sack of barley at the stall');
    expect(g.measure('dr_supply', 'party')).toBe(3);
    await g.play('Take Mistress Crumb\'s offer');
    expect(g.holds('cm_in', 'party', 'cm_t_chandler')).toBe(true);
    expect(g.carries('cm_scale')).toBe(true);
    // three trades' work, in a body that has earned it: the third is what the endowment asks
    set(g, 'cm_in', 'party', 'cm_t_ferry'); set(g, 'cm_in', 'party', 'cm_t_lamp');
    await g.play('Wait › A while');
    expect(g.measure('cm_trades', 'party')).toBe(3);
    await g.play('Have Wren take on the work of three trades');
    expect(g.holds('cm_body_endowed', 'party')).toBe(true);
  }, 240000);

  it('two trades that took you in and a city that is not on strike: the Procession is ready, and walks into the Urn Hall on the ninth night', async () => {
    const g = await start('warrior'); give(g, 10);
    set(g, 'cm_in', 'party', 'cm_t_ferry'); set(g, 'cm_in', 'party', 'cm_t_lamp'); set(g, 'holdsFace', 'party', 'face_gull'); set(g, 'fitted', 'party', 'face_gull');
    await g.play('Wait › A while');
    expect(g.holds('handReady', 'party', 'hand_procession')).toBe(false);
    expect(g.holds('arcBegun', 'party', 'hand_procession')).toBe(true);
    set(g, 'dr_strike_settled', 'party');
    await g.play('Wait › A while');
    expect(g.holds('handReady', 'party', 'hand_procession')).toBe(true);
    await g.play('Put on the Gull', '=day 9 19:00', '>ombra__urn_hall');
    await g.play('Walk the Trades\' procession');
    expect(g.holds('handPlayed', 'party', 'hand_procession')).toBe(true);
    expect(g.measure('handWay', 'hand_procession')).toBe(2);
    expect(g.page).toContain('It is not a rising. It is a presence.');
  }, 240000);

  it('a company with one trade, or with the strike unsettled, is not offered the Procession', async () => {
    const g = await start('warrior');
    set(g, 'cm_in', 'party', 'cm_t_ferry');
    await g.play('Wait › A while');
    expect(g.holds('handReady', 'party', 'hand_procession')).toBe(false);
    set(g, 'cm_in', 'party', 'cm_t_lamp');
    await g.play('Wait › A while');
    expect(g.holds('handReady', 'party', 'hand_procession')).toBe(false);
  }, 240000);
});

describe('The Drip and the Trades: the world never enters an invalid state', () => {
  // From the Drip, in a rented face, takes one of the offered things two hundred times over (a pseudo-random pick, the same
  // each run), and asks that no person be in two places, that nothing be both done and undone, and that the shared facts
  // the other files read stay consistent.
  it('walks the offered actions with no person in two places', async () => {
    const g = await start('bard'); give(g, 80);
    await face(g, 'Gull');
    await g.play('>ombra__drip_landing');
    const people = ['rill', 'nobody', 'rainmother', 'steward', 'dr_brine', 'dr_ley', 'dr_hal', 'dr_gammon', 'dr_tansy', 'cm_crumb', 'cm_dill', 'cm_teale'];
    const never = /Take your face off|Set down|Pack ›|Name .* aloud|Lift .*mask|Buy the Patience|Make camp|Search here|prepare spells|Light$|Put out|Grave/;
    const wanted = /^(To the (Drip|Lamp|Rain|kitchen|Anonymous|cistern|bread|eel|Row quay)|Ask|Speak|Say|Buy|Leave|Take|Put|Tell|Watch|Mend|Fill|Light the|Read|Knock|Go along|Count|Pay|Sell|Carry|Weigh|Tally|Learn|Stand|Sit|Offer|Play|Reckon|Wait › An hour)/;
    const seen = new Set<string>();
    let seed = 7;
    for (let i = 0; i < 200 && g.running; i += 1) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const offered = g.j.choices().filter(c => wanted.test(c.label) && !never.test(c.label));
      if (offered.length === 0) { await g.play('Wait › An hour'); continue; }
      const pick = offered[seed % offered.length]!;
      seen.add(pick.label.replace(/ · .*$/, ''));
      try { await g.play(pick.label.replace(/ · .*$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); } catch { await g.play('Wait › An hour'); }
      for (const p of people) { expect(g.j.campaign.world.related('at', `ombra__${p}`).length).toBeLessThanOrEqual(1); }
      if (g.holds('dr_pot_secured', 'party')) { expect(g.holds('dr_kitchen_shut', 'party') && !g.holds('dr_pot_dry', 'party')).toBe(false); }
      if (g.holds('dr_boat_sound', 'party')) { expect(g.holds('dr_berth_sold', 'party') && g.holds('dr_rill_hired', 'party')).toBe(false); }
      if (g.holds('dr_strike_settled', 'party')) { expect(g.holds('dr_strike_on', 'party')).toBe(false); }
      expect(g.measure('dr_arrears', 'party')).toBeLessThanOrEqual(60);
      if (g.measure('cm_trades', 'party') > 0) { expect(g.holds('cm_in', 'party', 'cm_t_ferry') || g.holds('cm_in', 'party', 'cm_t_lamp') || g.holds('cm_in', 'party', 'cm_t_chandler')).toBe(true); }
      if (i % 25 === 24) { await g.play('>ombra__drip_landing'); }
    }
    if (process.env.OMBRA_DEBUG) { console.log([...seen].join('\n')); }
    expect(seen.size).toBeGreaterThan(8);
  }, 300000);
});
