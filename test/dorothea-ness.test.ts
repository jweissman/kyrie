import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Port Ness: the salt island, the House's counting-room, and the Ness Light on the House's book.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const party = (j: Journey) => j.campaign.world.one('at', 'party');
const ness = async (seed = 's1') => {
  const j = await Journey.start(campaign, seed);
  j.assert(k('seaQuiet'), k('hull'));
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else',
    'Ask Captain Bascom to put in at Port Ness', 'Pay Captain Bascom four', "^To the Dorothea's waist", '=150', '^To Port Ness pier');
  return j;
};
const toRoom = (j: Journey) => j.play('^To Salt Row', '^Into the House');

describe('Port Ness', () => {
  it('shows a salt island with a House on it: faces, a chart with a loose pin, and a ranks lesson from the Clerk', async () => {
    const j = await ness();
    expect(j.page).toContain('key-and-ring');
    await j.play('^To Salt Row');
    expect(j.page).toContain('THE HOUSE OF MARCHBANK');
    await j.play('Talk to Ysolde Stannard');
    expect(j.page).toContain('Factor');
    await j.play('^Into the House');
    expect(j.page).toContain('fourth pin');
    await j.play('Ask Ewart Pym how the House is arranged');
    expect(j.holds(k('knowsRanks'), 'party')).toBe(true);
    expect(j.page).toContain('Prentice, in grey boards');
  }, 300000);

  it('lets the company pay Kit Skail\'s bond at the Clerk\'s desk and light the Ness Light', async () => {
    const j = await ness();
    await toRoom(j);
    expect(j.holds(k('houseHolds'), k('lamp_ness'))).toBe(true);
    await j.play('Pay Kit Skail.s eighteen coin');
    expect(j.holds(k('houseHolds'), k('lamp_ness'))).toBe(false);
    expect(j.holds(k('lampLit'), k('lamp_ness'))).toBe(true);
    expect(j.measure(k('freed'), 'party')).toBe(1);
    await j.play('^Out to', '^To the foot of the Ness Light', '^To the Ness Light.s lantern');
    expect(j.page).toContain('hard white flame');
  }, 300000);

  it('lets the thief take the bond out of the strongbox, and a failed attempt shuts the counting-house door on the company', async () => {
    const ok = await ness();
    await toRoom(ok);
    ok.roll('pass');
    await ok.play("Take Kit Skail.s bond out of the Factor.s strongbox");
    ok.roll();
    expect(ok.holds(k('lampLit'), k('lamp_ness'))).toBe(true);
    expect(ok.holds(k('missingBond'), 'party')).toBe(true);
    const bad = await ness();
    await toRoom(bad);
    bad.roll('fail');
    await bad.play("Take Kit Skail.s bond out of the Factor.s strongbox");
    bad.roll();
    expect(bad.holds(k('marked'), 'party')).toBe(true);
    expect(bad.holds(k('lampLit'), k('lamp_ness'))).toBe(false);
        expect(bad.matches('^Into the House').length).toBe(0);
  }, 300000);

  it('reads the Clerk\'s day-book for three coin or on a plain word, and not at all if the word fails', async () => {
    const j = await ness();
    await toRoom(j);
    j.roll('fail');
    await j.play('Tell Ewart Pym what a clerk');
    j.roll();
    expect(j.holds(k('leafNess'), 'party')).toBe(false);
    await j.play('Pay Ewart Pym three coin');
    expect(j.holds(k('leafNess'), 'party')).toBe(true);
    expect(j.measure(k('leaves'), 'party')).toBe(1);
  }, 300000);

  it('has a lighter home for a company left on the pier, at four coin', async () => {
    const j = await ness();
    await j.play('^To Salt Row', '^To Port Ness pier');
    await j.play('=+1');
    await j.play('=400');
    expect(j.holds(k('strandedNess'), 'party')).toBe(true);
    await j.play('Take a place on the salt lighter');
    expect(party(j)).toBe(k('quay'));
  }, 300000);
});
