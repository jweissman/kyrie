import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { City, Q, campaign } from './support/quittance';
import type { Journey } from '../src/session/journey';

// The Penny Mutual (pm_) of the Bare Wards: a fund gone, a treasurer forgiven and bought, a notice with a stamp on it.
// Every distinct resolution, and the ways it fails, played by the labels a player sees.
const gap = ['^To the foot of the outer wall', 'Pay the gap boys', '^To Salt Lane'];
const hall = ['^Into the Penny Mutual', 'Talk to Keturah', 'what became of the treasurer', 'Take your leave'];
const trail = ['^Out to Salt Lane', 'Follow the cart-grease', '^To the garret over the oven-yard', 'Talk to Prudence', 'why she ran', 'Take your leave'];
const home = ['Tell Prudence Ouseley that the club', 'Hold the stamped notice', '^To Salt Lane', '^Into the Penny Mutual', 'Talk to Keturah',
  'Prudence Ouseley is at the door'];
const has = (j: Journey, rel: string, ...a: string[]) => City.has(j, rel, 'party', ...a);
const have = (j: Journey, rel: string, who: string) => j.holds(Q(rel), Q(who));
const dying = (j: Journey) => j.measure(Q('pm_dying'), Q('wardsfolk'));
const gold = City.gold;

describe('The Penny Mutual', () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 120000);

  it('is chalked on the Slate and, as well, said by the chair of the club in her own hall', async () => {
    const slate = await City.start();
    await slate.play(...City.slip);
    expect(City.knows(slate, 'pm_claim')).toBe(true);
    expect(City.knows(slate, 'pt_claim')).toBe(true);
    const hall_ = await City.start();
    await hall_.play(...gap, ...hall);
    expect(City.knows(hall_, 'pm_claim')).toBe(true);                   // no Slate needed
  }, 120000);

  it('finds the treasurer by her trail, brings her home, and tells the club what she was paid to hide', async () => {
    const j = await City.start();
    await j.play(...gap, ...hall, ...trail);
    expect(City.knows(j, 'pm_garret_known')).toBe(true);
    expect(City.knows(j, 'pm_bribed')).toBe(true);
    expect(City.knows(j, 'd_appointed_notice')).toBe(false);          // heard of the notice, not yet seen the stamp
    await j.play(...home);
    expect(City.knows(j, 'd_appointed_notice')).toBe(true);
    expect(City.knows(j, 'd_candlewick_next')).toBe(true);
    expect(j.at(Q('pm_ouseley'))).toBe(Q('penny_hall'));
    const warn = j.taken.length;
    await j.play('Tell the club what she was paid');
    expect(has(j, 'pm_told_club')).toBe(true);
    expect(has(j, 'pm_fund_home')).toBe(true);
    expect(has(j, 'pm_resolved')).toBe(true);
    expect(j.holds(Q('pm_rent_strike'), Q('wardsfolk'))).toBe(true);
    expect(City.said(j, warn)).toContain('WE DO NOT ASK');
    await j.play('Tell Mrs Trendle that Candlewick');                   // trusted (the Gap, and the fund home): believed
    expect(has(j, 'pm_court_warned')).toBe(true);
    await j.play('Ask the Mutual to keep');
    expect(j.holds(Q('keeper'), Q('wards'))).toBe(true);
    await j.play('Take your leave', 'Talk to Prudence', 'whether she will say before the Five');
    expect(have(j, 'witness', 'pm_ouseley')).toBe(true);
    expect(j.measure(Q('witnessCount'), Q('city'))).toBe(1);
    expect(City.regard(j, 'wardsfolk')).toBe(4);                        // the Gap 1, the telling 2, the warning 1
    expect(dying(j)).toBe(9);
    // The hall afterwards says what happened, and the board is covered.
    expect(City.pages(j, warn)).toContain('no one is chairing');          // the hall, as it now is, told as it changed
  }, 120000);

  it('keeps the peace instead: she comes home, the vote stands, nothing is said of the notice', async () => {
    const j = await City.start();
    await j.play(...gap, ...hall, ...trail, ...home, 'Say only that she has come home');
    expect(has(j, 'pm_fund_home')).toBe(true);
    expect(has(j, 'pm_proud')).toBe(true);
    expect(has(j, 'pm_told_club')).toBe(false);
    expect(j.holds(Q('pm_rent_strike'), Q('wardsfolk'))).toBe(false);
    expect(City.knows(j, 'd_candlewick_next')).toBe(true);              // the company knows; the club does not
    await j.play('Ask the Mutual to keep');
    expect(j.holds(Q('keeper'), Q('wards'))).toBe(true);
    await j.play('Take your leave', 'Talk to Prudence');
    expect(j.offers('whether she will say before the Five')).toBe(false); // no witness: she was never asked
    expect(have(j, 'witness', 'pm_ouseley')).toBe(false);
    expect(City.regard(j, 'wardsfolk')).toBe(2);
  }, 120000);

  it('lends the fund against a fire kept for the Night: a company the Gap vouched for is not asked twice', async () => {
    const j = await City.start();
    await j.play(...gap, ...hall.slice(0, 3));
    const purse = gold(j);
    await j.play('Offer the Mutual fourteen coin');
    expect(gold(j)).toBe(purse - 14);
    expect(has(j, 'pm_fund_home')).toBe(true);
    expect(has(j, 'pm_loan')).toBe(true);
    expect(has(j, 'pm_proud')).toBe(true);
    expect(City.knows(j, 'd_appointed_notice')).toBe(false);            // the coin bought the fund, not the truth
    await j.play('Ask the Mutual to keep');
    expect(j.holds(Q('keeper'), Q('wards'))).toBe(true);
    expect(City.regard(j, 'wardsfolk')).toBe(3);
  }, 120000);

  it('puts the coin in the box and says nothing: the fund is home and the club is ashamed', async () => {
    const j = await City.start();
    await j.play(...gap, ...hall.slice(0, 3), 'Put fourteen coin into the empty box');
    expect(has(j, 'pm_fund_home')).toBe(true);
    expect(has(j, 'pm_ashamed')).toBe(true);
    expect(has(j, 'pm_proud')).toBe(false);
    expect(has(j, 'pm_loan')).toBe(false);
    await j.play('Ask the Mutual to keep');                              // not yet: it is not in a position to be asked
    expect(j.holds(Q('keeper'), Q('wards'))).toBe(false);
    expect(City.page(j)).toContain('not in a position');
    expect(City.regard(j, 'wardsfolk')).toBe(2);
  }, 120000);

  // ── The other doors to her, and to the stamp ──────────────────────────────────────────────────────────
  it('a trail that goes cold leads to the market: a pie, a story, and the garret', async () => {
    const j = await City.start('b');
    await j.play(...gap, ...hall, '^Out to Salt Lane', 'Follow the cart-grease');
    expect(City.knows(j, 'pm_garret_known')).toBe(false);               // the trail ran out under the market
    expect(City.said(j)).toContain('someone will know the rest');
    await j.play('=17:00', '^To the Night Market');
    await j.play('Talk to Mother Gammidge', 'Buy an eel-pie');
    expect(City.knows(j, 'pm_garret_known')).toBe(false);
    await j.play('about the Penny Mutual');
    expect(City.knows(j, 'pm_garret_known')).toBe(true);
  }, 120000);

  it('a company the Gap vouched for has the same from the pie-stall for nothing', async () => {
    const j = await City.start('b');
    await j.play(...gap, ...hall, '^Out to Salt Lane', '=17:00', '^To the Night Market', 'Talk to Mother Gammidge', 'about the Penny Mutual');
    expect(City.knows(j, 'pm_garret_known')).toBe(true);
    expect(j.offers('Buy an eel-pie')).toBe(true);
  }, 120000);

  it('the market is empty by day, and says what it thinks of the Offices by night', async () => {
    const j = await City.start();
    await j.play(...gap, '^To the Night Market');
    expect(j.offers('Talk to Mother Gammidge')).toBe(false);
    expect(j.offers('Talk to Old Ferrule')).toBe(false);
    await j.play('=17:00');
    expect(j.offers('Talk to Mother Gammidge')).toBe(true);
    await j.play('Talk to Old Ferrule', 'where the marks come from', 'Gas Company', 'Talk to Hannah Pennifold', 'where she gets the hats');
    expect(City.pages(j).toLowerCase()).toContain('about one time in three');
    await j.play('which captains');
    expect(City.page(j)).toContain('Captain Dree');
  }, 120000);

  it('the deputy can be bought or leaned on; each names the garret, one at a cost', async () => {
    const lane = [...gap, ...hall.slice(0, 3), '^Out to Salt Lane'];
    const bought = await City.start();
    await bought.play(...lane);
    const purse = City.gold(bought);
    await bought.play('Press five coin on Mr Larkworth');
    expect(City.knows(bought, 'pm_garret_known')).toBe(true);
    expect(City.gold(bought)).toBe(purse - 5);
    const leaned = await City.start();
    await leaned.play(...lane, 'Take Mr Larkworth aside');
    // A hand on his collar either names the garret or sends him running to Mr Skelter; never neither.
    expect(City.knows(leaned, 'pm_garret_known') !== leaned.holds(Q('pm_deputy_warned'), 'party')).toBe(true);
  }, 120000);

  it('leaning on the deputy: named garret on one die, Mr Skelter told on the other', async () => {
    const lane = [...gap, ...hall.slice(0, 3), '^Out to Salt Lane'];
    const named = await City.start('quittance');
    await named.play(...lane, 'Take Mr Larkworth aside');
    expect(City.knows(named, 'pm_garret_known')).toBe(true);
    expect(named.holds(Q('pm_deputy_warned'), 'party')).toBe(false);
    const warned = await City.start('a');
    await warned.play(...lane, 'Take Mr Larkworth aside');
    expect(City.knows(warned, 'pm_garret_known')).toBe(false);
    expect(warned.holds(Q('pm_deputy_warned'), 'party')).toBe(true);
    expect(warned.offers('Press five coin')).toBe(true);                  // the other door is still open
  }, 120000);

  // ── The treasurer, by force, by stealth, or not at all ────────────────────────────────────────────────
  const garret = [...gap, ...hall.slice(0, 3), '^Out to Salt Lane', 'Press five coin', '^To the garret'];
  it('stands over her until she hands it over: the fund comes home, but the club is told nothing and she is not a witness', async () => {
    const j = await City.start('quittance');
    await j.play(...garret, 'Stand over Prudence');
    expect(has(j, 'pm_purse')).toBe(true);
    expect(has(j, 'pm_cowed')).toBe(true);
    await j.play('Hold the stamped notice');
    expect(City.knows(j, 'd_candlewick_next')).toBe(true);
    await j.play('^To Salt Lane', '^Into the Penny Mutual', 'Talk to Keturah', 'Lay the recovered purse');
    expect(has(j, 'pm_fund_home')).toBe(true);
    expect(has(j, 'pm_proud')).toBe(true);
    expect(has(j, 'pm_told_club')).toBe(false);
    expect(j.at(Q('pm_ouseley'))).toBe(Q('pm_garret'));                   // still in the garret, still not forgiven in person
    expect(have(j, 'witness', 'pm_ouseley')).toBe(false);
  }, 120000);

  it('when she is not frightened, nothing is lost but the afternoon', async () => {
    const j = await City.start('c');
    await j.play(...garret, 'Stand over Prudence');
    expect(has(j, 'pm_purse')).toBe(false);
    expect(j.at(Q('pm_ouseley'))).toBe(Q('pm_garret'));
    expect(j.offers('While she is out on the stair')).toBe(true);        // the stealthy door is still there
    await j.play('While she is out on the stair');
    expect(has(j, 'pm_robbed')).toBe(true);                              // seed c: the thief's turn comes off
    expect(j.offers('Hold the stamped notice')).toBe(true);
  }, 120000);

  it('a thief who is heard on the stair loses her: she is gone, and the fund with her', async () => {
    const j = await City.start('quittance');
    await j.play(...garret, 'While she is out on the stair');
    expect(has(j, 'pm_gone')).toBe(true);
    expect(j.at(Q('pm_ouseley'))).not.toBe(Q('pm_garret'));
    expect(City.knows(j, 'd_appointed_notice')).toBe(false);
    await j.play('^To Salt Lane', '^Into the Penny Mutual');
    expect(j.offers('Put fourteen coin into the empty box')).toBe(true);  // the only way left to put it right
    await j.play('Put fourteen coin into the empty box');
    expect(has(j, 'pm_fund_home')).toBe(true);
  }, 120000);

  it('she takes the night boat on the second evening if nobody has found her', async () => {
    const j = await City.start();
    await j.play(...gap, ...hall.slice(0, 3), '^Out to Salt Lane', 'Press five coin');
    await j.play('=215');
    expect(j.at(Q('pm_ouseley'))).toBe(Q('pm_garret'));
    await j.play('=217');
    expect(j.at(Q('pm_ouseley'))).not.toBe(Q('pm_garret'));
    expect(has(j, 'pm_gone')).toBe(true);
  }, 120000);

  it('the nine die on the board while the fund is out, three then two then two, and stop when it comes home', async () => {
    const j = await City.start();
    await j.play(...gap, ...hall.slice(0, 3));
    expect(dying(j)).toBe(9);
    await j.play('=day 3 09:00');
    expect(dying(j)).toBe(8);
    await j.play('Put fourteen coin into the empty box');
    expect(dying(j)).toBe(8);
    await j.play('=day 7 09:00');
    expect(dying(j)).toBe(8);                                             // the physic-man has been; nobody else on the board went
    expect(has(j, 'pm_neglected')).toBe(false);
    const late = await City.start();
    await late.play(...gap, '=day 7 09:00');
    expect(dying(late)).toBe(4);
    expect(has(late, 'pm_neglected')).toBe(true);
  }, 120000);

  // ── The warning is believed as the company is trusted ─────────────────────────────────────────────────
  it('a stranger who knows the date of a fire is the one who set it, until the fund is home', async () => {
    const j = await City.start('hat');
    await j.play(...City.honest, '>' + Q('night_market'), '=17:00');
    await j.play('Talk to Hannah Pennifold', 'Buy a stolen clerk.s hat.*for Elen', '^To Salt Lane');
    await j.play('>' + Q('penny_hall'), 'Talk to Keturah', 'what became of the treasurer', 'Take your leave', '^Out to Salt Lane', 'Put on the stolen clerk', 'Hold the stamped notice');
    expect(City.regard(j, 'wardsfolk')).toBe(0);
    await j.play('^Into the Penny Mutual', 'Talk to Keturah', 'Tell Mrs Trendle that Candlewick');
    expect(has(j, 'pm_court_warned')).toBe(false);
    expect(has(j, 'pm_disbelieved')).toBe(true);
    expect(City.page(j)).toContain('the people who set it');
    expect(j.offers('Tell Mrs Trendle that Candlewick')).toBe(false);
    await j.play('Put fourteen coin into the empty box');
    await j.play('Tell Mrs Trendle that Candlewick');
    expect(has(j, 'pm_court_warned')).toBe(true);
  }, 120000);

  it('a plain company lends the fund with the dying man on its side: a ration and an hour by the fire', async () => {
    const j = await City.start();
    await j.play(...City.honest, '>' + Q('penny_hall'), 'Talk to Keturah');
    expect(j.offers('Offer the Mutual fourteen coin')).toBe(false);       // a stranger to the Wards is not lent to
    await j.play('Talk to Josiah Garrowby', 'Give Josiah Garrowby a ration');
    expect(has(j, 'pm_garrowby_for')).toBe(true);
    await j.play('Offer the Mutual fourteen coin');
    expect(has(j, 'pm_loan')).toBe(true);
    expect(City.regard(j, 'wardsfolk')).toBe(2);
    await j.play('Ask the Mutual to keep');
    expect(j.holds(Q('keeper'), Q('wards'))).toBe(true);
  }, 120000);

  it('a plain company argues the loan on one die: a refusal is final, the coin left in the box is not', async () => {
    const won = await City.start('quittance');
    await won.play(...City.honest, '>' + Q('penny_hall'), 'Talk to Keturah', 'Argue to Mrs Trendle');
    expect(has(won, 'pm_loan')).toBe(true);
    expect(has(won, 'pm_fund_home')).toBe(true);
    const lost = await City.start('c');
    await lost.play(...City.honest, '>' + Q('penny_hall'), 'Talk to Keturah', 'Argue to Mrs Trendle');
    expect(has(lost, 'pm_refused_loan')).toBe(true);
    expect(has(lost, 'pm_fund_home')).toBe(false);
    expect(lost.offers('Argue to Mrs Trendle')).toBe(false);              // the ledger is not for sale
    await lost.play('Put fourteen coin into the empty box');             // the silent gift is all that is left
    expect(has(lost, 'pm_ashamed')).toBe(true);
  }, 120000);

  it('a licence is one lever on the deputy, and costs no coin', async () => {
    const j = await City.start();
    await j.play(...City.slip);
    expect(j.holds('carries', 'party', Q('licence_card'))).toBe(true);
    await j.play('>' + Q('penny_hall'), 'Talk to Keturah', 'what became of the treasurer', 'Take your leave', '^Out to Salt Lane');
    const purse = City.gold(j);
    await j.play('Show Mr Larkworth an adjuster');
    expect(City.knows(j, 'pm_garret_known')).toBe(true);
    expect(City.gold(j)).toBe(purse);
  }, 120000);

  it("the clerk's hat gets the sealed form out of the deputy: the stamp seen without meeting the treasurer", async () => {
    const j = await City.start('hat');
    await j.play(...City.honest, '>' + Q('night_market'), '=17:00');
    await j.play('Talk to Hannah Pennifold', 'Buy a stolen clerk.s hat.*for Elen', '^To Salt Lane');
    await j.play('>' + Q('penny_hall'), 'Talk to Keturah', 'what became of the treasurer', 'Take your leave', '^Out to Salt Lane');
    expect(j.offers('Put on the stolen clerk')).toBe(true);
    await j.play('Put on the stolen clerk');
    expect(j.offers('Hold the stamped notice')).toBe(true);
    expect(City.knows(j, 'pm_garret_known')).toBe(true);
    expect(City.knows(j, 'd_candlewick_next')).toBe(false);
    await j.play('Hold the stamped notice');
    expect(City.knows(j, 'd_appointed_notice')).toBe(true);
    expect(City.knows(j, 'd_candlewick_next')).toBe(true);
  }, 120000);
});
