import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The House of Marchbank: ranks learnt by travelling, ledgers read in pieces, a reckoning from any three, and answers.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const party = (j: Journey) => j.campaign.world.one('at', 'party');

// Dacey Hoe's second column; then Port Ness by the Dorothea, with her cabin shelf read on the way, and the Clerk paid.
const threeLeaves = async () => {
  const j = await Journey.start(campaign, 's1');
  j.assert(k('seaQuiet'), k('hull'));
  await j.play('^To Tolleth quay', '^Into the harbourmaster', 'Ask Dacey Hoe what the second column', '^Out to');
  expect(j.measure(k('leaves'), 'party')).toBe(1);
  await j.play('Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Port Ness',
    'Pay Captain Bascom four', "^To the Dorothea's waist", '^To the quarterdeck', "^To the captain's cabin");
  j.roll('pass');
  await j.play("Read the ledgers on Bascom's cabin shelf");
  j.roll();
  expect(j.holds(k('leafDorothea'), 'party')).toBe(true);
  await j.play('^To the quarterdeck', "^To the Dorothea's waist", '=150', '^To Port Ness pier', '^To Salt Row', '^Into the House', 'Pay Ewart Pym three coin');
  expect(j.measure(k('leaves'), 'party')).toBe(3);
  return j;
};

describe('The House of Marchbank', () => {
  it('lets a company read three ledgers in three places and learn what the House is doing', async () => {
    const j = await threeLeaves();
    await j.play('Lay the House.s leaves side by side');
    expect(j.holds(k('reckoned'), 'party')).toBe(true);
    expect(j.holds('knows', 'party', k('house_plan'))).toBe(true);
    expect(j.holds('holding', 'party', k('dorothea_copy')) || j.holds('holding', 'party', 'dorothea_copy')).toBe(true);
    // Fewer than three, no reckoning.
    const two = await Journey.start(campaign, 's1');
    await two.play('^To Tolleth quay', '^Into the harbourmaster', 'Ask Dacey Hoe what the second column');
    expect(two.matches('Lay the House.s leaves').length).toBe(0);
  }, 400000);

  it('has the Factor, pressed with her own ledgers, undo the Ness bond herself, and then the Principal comes to the quay', async () => {
    const j = await threeLeaves();
    await j.play('Lay the House.s leaves side by side', '^Out to', 'Lay the House.s reckoning before Ysolde Stannard');
    expect(j.holds(k('lampLit'), k('lamp_ness'))).toBe(true);
    expect(j.measure(k('freed'), 'party')).toBe(1);
    expect(j.page).toContain('undo a bond');
    // Home on the Dorothea. The Principal comes down to the quay, and the harbourmaster is shown the reckoning.
    await j.play('^To Port Ness pier', "^To the Dorothea's waist", '=450', '^To Tolleth quay');
    expect(j.holds(k('principalMet'), 'party')).toBe(true);
    expect(party(j)).toBe(k('quay'));
    await j.play('Ask Josselin Marchbank why the House leases lights', '^Into the harbourmaster', 'Lay the House.s reckoning before Dacey Hoe', '^Out to');
    expect(j.holds(k('houseExposed'), 'party')).toBe(true);
    expect(j.measure(k('holdUntil'), k('hull'))).toBeGreaterThan(j.campaign.state.elapsed ? 0 : -1);
    expect(j.page).toContain('NO LIGHT, NO PREMIUM');
    await j.play('Tell him the copy is also with Dacey Hoe');
    expect(j.holds(k('principalLeft'), 'party')).toBe(true);
  }, 600000);

  it('lets the company sell the copy to the Principal for forty crowns, and then the harbourmaster cannot be shown it', async () => {
    const j = await threeLeaves();
    await j.play('Lay the House.s leaves side by side', '^Out to', '^To Port Ness pier', "^To the Dorothea's waist", '=450', '^To Tolleth quay');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Hear what Josselin Marchbank offers', "Take the Principal.s forty crowns");
    expect(j.holds(k('silenced'), 'party')).toBe(true);
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 40);
    await j.play('^Into the harbourmaster');
    expect(j.matches('Lay the House.s reckoning before Dacey Hoe').length).toBe(0);
  }, 600000);

  it('teaches the ranks at three desks and the colour of each book', async () => {
    const j = await Journey.start(campaign, 's1');
    j.assert(k('seaQuiet'), k('hull'));
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else');
    expect(j.page).toContain('colour of their books');
    await j.play('^Out to|^Into the Anchor', 'Talk to Corwin Latch');
    expect(j.page).toContain('blue cuff');
  }, 300000);
});
