import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

// The Bakery Inspection (q_bakery.kyr): the survey is at noon on the second day (watch 312), the cover lapses at
// midnight after (watch 384). Each approach is played by the labels a player sees; checks use fixed seeds.
const party = (classId: string, n = 3) => Array.from({ length: n }, (_, i) => ({ name: `${classId}${i}`, raceId: 'human', classId }));
type J = Awaited<ReturnType<typeof City.start>>;
const bakehouse = [...City.honest, '^To Brick Lane', '^Into Tolliver', '^To Tolliver.s bakehouse'];
const has = (j: J, r: string, ...a: string[]) => City.has(j, r, ...a);
const bk = (j: J, r: string) => has(j, r, 'bk_bakery');

describe('The Bakery Inspection', () => {
  it('is found in the lane by its smell, in the shop by its notice, and on the Slate by its claim', async () => {
    const j = await City.start();
    await j.play(...City.honest, '^To Brick Lane', '^Into Tolliver');
    expect(City.pages(j)).toContain('warm bread smell');
    expect(City.knows(j, 'bk_survey')).toBe(true);
    const k = await City.start();
    await k.play(...City.slip);
    expect(City.knows(k, 'bk_claim')).toBe(true);
  }, 60000);

  it('fixing the flue to the pattern (trapwork) passes the survey and puts the Lent coal out; the cost is felt after', async () => {
    const j = await City.start('e', { party: party('thief') });
    await j.play(...bakehouse, 'Take out the old damper and bring the flue to the Ordinance');
    expect(bk(j, 'bk_pass')).toBe(true);
    expect(bk(j, 'bk_coal_dead')).toBe(true);
    expect(has(j, 'bk_flue_fixed', 'party')).toBe(true);
    expect(City.state(j, 'bk_oven', 'bk_cold')).toBe(true);
    expect(City.page(j)).toContain('quiet');
    // the Inspector comes, and passes it, and the Phoenix cover holds
    await j.play('=312');
    expect(bk(j, 'bk_judged')).toBe(true);
    expect(bk(j, 'bk_failed')).toBe(false);
    // the hearth is not offered to the Night
    expect(has(j, 'coalSource', 'bakehouse')).toBe(false);
    expect(has(j, 'keeper', 'brick')).toBe(false);
    // Gwen is changed, in the room and in what she says
    await j.play('Share a ration with Old Mother Tolliver');
    expect(City.knows(j, 'd_oven_coal')).toBe(true);
    await j.play('Tell Gwen Tolliver what the line over her oven says');
    expect(City.said(j)).toContain('It was lent');
    expect(bk(j, 'bk_coal_dead')).toBe(true);
    await j.play('=330');
    await j.play('Ask Gwen Tolliver how the oven is');
    expect(City.said(j)).toContain('used to come down and it was waiting');
    await j.play('^To Tolliver.s shop', '^To Tolliver.s bakehouse');
    expect(City.page(j)).toContain('hand flat on the oven door');
    // and the Phoenix is paid for a chimney fire on the fifth morning
    await j.play('=570');
    expect(bk(j, 'bk_flash_told')).toBe(true);
  }, 90000);

  it('the same fix by brawn, with a sledge, and a failed fix that wrecks the flue and leaves the other doors open', async () => {
    const a = await City.start('quittance', { party: party('warrior') });
    await a.play(...bakehouse, 'Break out the old throat with a sledge');
    expect(bk(a, 'bk_coal_dead')).toBe(true);
    // a thief's hand that fails: soot, no pass, no coal lost; the fix is not offered twice, the other doors are open
    const b = await City.start('quittance', { party: party('thief') });
    await b.play(...bakehouse, 'Take out the old damper');
    expect(bk(b, 'bk_flue_wrecked')).toBe(true);
    expect(bk(b, 'bk_pass')).toBe(false);
    expect(bk(b, 'bk_coal_dead')).toBe(false);
    expect(b.offers('Take out the old damper')).toBe(false);
    expect(b.offers('Spend the morning at the ovens')).toBe(true);
    expect(City.page(b)).toContain('soot');
    await b.play('^To Tolliver.s shop', '^To Tolliver.s bakehouse');
    expect(b.taken.at(-1)!.told).toContain('brick has been laid out on the peel');
    await b.play('=312');
    expect(bk(b, 'bk_failed')).toBe(true);
  }, 60000);

  it('once the line is known the fix says what it costs, and asks twice', async () => {
    const j = await City.start('quittance', { party: party('thief') });
    await j.play(...bakehouse, 'Share a ration with Old Mother Tolliver');
    expect(j.offers('though the line says LENT')).toBe(true);
    expect(j.offers('bring the flue to the Ordinance.s pattern$')).toBe(false);
    await j.play('Take out the old damper and bring the flue to the Ordinance.s pattern, though the line says LENT');
    expect(j.taken.at(-1)!.grave).toContain('lent and not given');
  }, 60000);

  it('the line can be read by lore, by rites, or had from the old woman for a shared ration', async () => {
    const m = await City.start('quittance', { party: party('mage') });
    await m.play(...bakehouse, 'Wipe the soot from the line');
    expect(City.knows(m, 'd_oven_coal')).toBe(true);
    expect(City.knows(m, 'd_lent_coal')).toBe(true);
    const c = await City.start('a', { party: party('cleric') });
    await c.play(...bakehouse, 'Lay a hand on the stone under the line');
    expect(City.knows(c, 'd_oven_coal')).toBe(true);
    // a failed reading is one try, and the old woman is still there
    // (A seed whose dice the reading fails by: a mage's spellbook adds to her lore since the owner's ruling on tools.)
    const f = await City.start('j', { party: party('mage') });
    await f.play(...bakehouse, 'Wipe the soot from the line');
    expect(City.knows(f, 'd_oven_coal')).toBe(false);
    expect(f.offers('Wipe the soot')).toBe(true);
    const r = await City.start('quittance', { party: party('ranger') });
    await r.play(...bakehouse);
    expect(r.offers('Wipe the soot')).toBe(false);
    expect(r.offers('Lay a hand on the stone')).toBe(false);
    await r.play('Share a ration with Old Mother Tolliver');
    expect(City.knows(r, 'd_oven_coal')).toBe(true);
    expect(City.knows(r, 'd_lent_coal')).toBe(true);
  }, 60000);

  it('cooking with Gwen and handing the Inspector a hot loaf passes it with the coal alive; then Gwen is told, and trusts the company with the Night', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...bakehouse, 'Ask Gwen Tolliver what the Inspector is like');
    expect(City.knows(j, 'bk_bread_hint')).toBe(true);
    await j.play('Spend the morning at the ovens');
    expect(has(j, 'bk_bread', 'party')).toBe(true);
    expect(City.gold(j)).toBe(18 - 3 - 3);
    await j.play('=306');
    expect(j.at(Q('bk_gudgeon'))).toBe(Q('bakehouse'));
    await j.play('Hand Mr Gudgeon a hot loaf');
    expect(bk(j, 'bk_pass')).toBe(true);
    expect(has(j, 'bk_by_bread', 'party')).toBe(true);
    await j.play('=312');
    expect(bk(j, 'bk_judged')).toBe(true);
    expect(bk(j, 'bk_coal_dead')).toBe(false);
    expect(j.at(Q('bk_gudgeon'))).toBe(Q('phoenix_floor'));
    // Gwen: where she learned to bank a fire; the line; what it means
    await j.play('Ask Gwen Tolliver where she learned to bank a fire');
    expect(City.knows(j, 'd_lent_coal')).toBe(true);
    await j.play('Share a ration with Old Mother Tolliver');
    await j.play('Tell Gwen Tolliver what the line over her oven says');
    expect(has(j, 'bk_trusted', 'party')).toBe(true);
    expect(has(j, 'coalSource', 'bakehouse')).toBe(true);
    expect(has(j, 'keeper', 'brick')).toBe(true);
    await j.play('^To Tolliver.s shop', '^To Tolliver.s bakehouse');
    expect(City.page(j)).toContain('YOURS');
  }, 90000);
});

describe('The Bakery Inspection, continued', () => {
  it('told without having helped, Gwen asks what the company wants for it, and nothing is lit for the Night', async () => {
    const j = await City.start('quittance', { party: party('mage') });
    await j.play(...bakehouse, 'Wipe the soot from the line', 'Tell Gwen Tolliver what the line over her oven says');
    expect(City.said(j)).toContain('what is it you');
    expect(has(j, 'bk_trusted', 'party')).toBe(false);
    expect(has(j, 'coalSource', 'bakehouse')).toBe(false);
  }, 60000);

  it('a borrowed surveyor (Ianthe Corbett of the Guild) climbs the flue on the day and certifies it', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...City.honest, '^To Brick Lane', '^Into Tolliver', '^Out to Brick Lane', '^To the fire-house yard', '^To Surety Hill', '^Into the Corbett house', 'Ask Ianthe Corbett to look at the flue');
    expect(has(j, 'bk_ianthe', 'party')).toBe(true);
    await j.play('=308');
    expect(j.at(Q('ianthe'))).toBe(Q('bakehouse'));
    expect(City.said(j, 0)).toContain('The Guild so certifies');
    await j.play('=314');
    expect(bk(j, 'bk_judged')).toBe(true);
    expect(bk(j, 'bk_pass')).toBe(true);
    expect(has(j, 'bk_by_ianthe', 'party')).toBe(true);
    expect(bk(j, 'bk_coal_dead')).toBe(false);
    await j.play('=330');
    expect(j.at(Q('ianthe'))).toBe(Q('guild_hall')); // back at her post: the Surveyor's hours take her from the bakehouse to the Guild
  }, 90000);

  it('twelve coin in the margin passes it too, and Mr Gudgeon writes the sum down', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...City.honest, '^To Brick Lane', ...['^To Gate Plaza', '^To the Brokers', '^To Policy Row', '^Into Phoenix House'], 'Slip Mr Gudgeon twelve coin');
    expect(bk(j, 'bk_pass')).toBe(true);
    expect(has(j, 'bk_bribed_gudgeon', 'party')).toBe(true);
    expect(City.gold(j)).toBe(3);
    expect(bk(j, 'bk_coal_dead')).toBe(false);
  }, 60000);

  it('the Committee of Exceptions registers the oven as an ancient hearth, with a licence, the line and a loaf, and the Phoenix learns of it', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...City.slip, '^Out to Policy Row', '^To the Brokers', '^To Gate Plaza', '^To Brick Lane', '^Into Tolliver', '^To Tolliver.s bakehouse', 'Spend the morning at the ovens', 'Share a ration with Old Mother Tolliver');
    expect(j.offers('Form 44-B')).toBe(false);
    await j.play('^To Tolliver.s shop', '^Out to Brick Lane', '^To Gate Plaza', '^To the Brokers', '^To Policy Row', '^Into Phoenix House');
    const before = City.regard(j, 'phoenix');
    await j.play('Lodge Form 44-B');
    expect(bk(j, 'bk_pass')).toBe(true);
    expect(has(j, 'bk_exempt', 'party')).toBe(true);
    expect(has(j, 'bk_registered', 'party')).toBe(true);
    expect(City.regard(j, 'phoenix')).toBe(before + 1);
    await j.play('Ask Mr Brundle who reads the Register');
    expect(City.said(j)).toContain('reader of lists');
  }, 90000);

  it('left alone, the oven fails at noon, the cover lapses at midnight, the Phoenix takes down its bird, and the bakery stands on its coal', async () => {
    const j = await City.start();
    await j.play(...bakehouse, '=312');
    expect(bk(j, 'bk_failed')).toBe(true);
    expect(City.said(j)).toContain('The cover lapses');
    await j.play('=386');
    expect(bk(j, 'bk_lapsed')).toBe(true);
    expect(bk(j, 'bk_coal_dead')).toBe(false);
    await j.play('^To Tolliver.s shop');
    expect(City.page(j)).toContain('pale square where the Phoenix');
    await j.play('=570');
    expect(bk(j, 'bk_flash_told')).toBe(false);
    await j.play('^Out to Brick Lane');
    expect(City.page(j)).toContain('no mark over its door');
  }, 90000);

  it('a lapse can be answered after the fact only until midnight: a reprieve between the survey and the lapse, nothing after', async () => {
    const a = await City.start('quittance', { party: party('ranger') });
    await a.play(...bakehouse, 'Spend the morning at the ovens', '=312');
    expect(bk(a, 'bk_failed')).toBe(true);
    await a.play('^To Tolliver.s shop', '^Out to Brick Lane', '^To Gate Plaza', '^To the Brokers', '^To Policy Row', '^Into Phoenix House', 'Hand Mr Gudgeon a hot loaf');
    expect(bk(a, 'bk_pass')).toBe(true);
    expect(bk(a, 'bk_reprieved')).toBe(true);
    await a.play('=390');
    expect(bk(a, 'bk_lapsed')).toBe(false);
    const b = await City.start('quittance', { party: party('ranger') });
    await b.play(...bakehouse, 'Spend the morning at the ovens', '=390');
    expect(bk(b, 'bk_lapsed')).toBe(true);
    await b.play('^To Tolliver.s shop', '^Out to Brick Lane', '^To Gate Plaza', '^To the Brokers', '^To Policy Row', '^Into Phoenix House');
    expect(b.offers('Hand Mr Gudgeon a hot loaf')).toBe(false);
  }, 90000);

  it('after the lapse the company can nail one of Ma Gedge\'s plates over the door: a mark of one\'s own', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...City.honest, '^To Brick Lane', '^To Dyers. Alley', 'Ask Mr Dabney what he is hunting', '^Into the die-works', 'Warn Ma Gedge');
    expect(has(j, 'fg_trusted', 'party')).toBe(true);
    await j.play('Buy a finished bird');
    expect(j.offers('Nail one of Ma Gedge')).toBe(false);
    await j.play('=390', '^Out to Dyers. Alley', '^To Brick Lane', '^Into Tolliver');
    expect(bk(j, 'bk_lapsed')).toBe(true);
    await j.play('Nail one of Ma Gedge');
    expect(has(j, 'bk_own_mark', 'party')).toBe(true);
    expect(City.page(j)).toContain('correct to the last feather');
  }, 90000);
});
