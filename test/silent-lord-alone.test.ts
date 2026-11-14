import { describe, expect, it } from 'bun:test';
import { KeepAlone } from './support/keep-alone';
import { Placed } from './support/placed';

// The darker side of the keep (data/situations/silent-lord/malice.kyr), as a targeted scenario: the situation's own
// module on the shared rules, its imports bound to a host of a few lines instead of a generated country (see Alone).
// These cases had each drawn a1's country and waited in it (test/silent-lord-malice, about 19 CI-minutes for ten
// cases); they test the situation's rules, which do not need the country, and start here in under half a second. What
// needs the generated site itself (the wicket's bar, the rider's tracks at the keep's foot) stays in that spec. A
// spec puts the company down with `Placed.at` only to skip a walk; where it is given a fact it says so.
const k = KeepAlone.id;
const Keep = KeepAlone;

describe('the silent lord alone: malice, and the signal before it', () => {
  it('warns a company that counts the lord’s trays: Thole’s Hands bar the ward, and the toll settles it', async () => {
    const j = await Keep.at('ward');
    j.assert('befriended', k('ansel'), 'party'); // (given as a fact: Ansel has his own cases, and would fight first)
    Placed.knows(j, k('lord_trays'));
    await j.play('=day 10 18:40');
    for (let i = 0; i < 12 && !/counted trays/.test(j.page); i++) { await j.play('=+1'); }
    expect(Placed.holds(j, 'peaceable', k('hands'))).toBe(false);
    expect(j.page).toMatch(/counted trays/);
    expect(j.page).toMatch(/A fee, for the trouble you have caused/);
  }, 120000);
  it('falls on a warned company that sleeps unbarred at the dead watch, and is balked by a barred door', async () => {
    const j = await Keep.at('guest');
    j.assert('hands_told', k('house'));
    await j.play('Wedge the door with the bench', '=day 11 02:10');
    expect([Keep.holds(j, 'hands_balked', k('house')), Placed.holds(j, 'dead', 'party')]).toEqual([true, false]);
    const j2 = await Keep.at('guest');
    j2.assert('hands_told', k('house'));
    expect(await j2.play('=day 11 02:10')).toMatch(/Don.t get up/);
    expect(Placed.holds(j2, 'assails', k('hands'), 'party') || Placed.holds(j2, 'dead', 'party')
      || !Placed.holds(j2, 'peaceable', k('hands'))).toBe(true);
  }, 120000);
  it('takes a swordsman for the king’s champion: told the truth he laughs and becomes a friend', async () => {
    const j = await Keep.at('ward');
    await j.play('=+1', '=+1');
    expect(Placed.holds(j, 'warned', k('ansel'), 'party')).toBe(true);
    await j.play('Tell .* you are not the king.s champion');
    expect(Keep.holds(j, 'befriended', k('ansel'), 'party')).toBe(true);
    expect(Placed.holds(j, 'tolerates', k('hands'), 'party') || Keep.knows(j, 'hands_known')).toBe(true);
    expect(Placed.holds(j, 'peaceable', k('ansel'))).toBe(true);
  }, 120000);
  it('lets the same mistake be played out as a duel to the first fall', async () => {
    const j = await Keep.at('ward');
    await j.play('=+1', '=+1', 'Say you are, and ask him what his cause is');
    expect(j.latest).toMatch(/beaten, and yield/);
    expect(Keep.holds(j, 'befriended', k('ansel'), 'party')).toBe(true);
  }, 120000);
  it('sets a bitter cup before a company that has learned too much, warned of by the dog, the cook and a cleric', async () => {
    const j = await Keep.at('kitchen', 'cleric');
    j.assert('befriended', k('ansel'), 'party'); // (given as a fact, as above)
    j.assert('tolerates', k('doorward'), 'party'); // (the door-ward at the solar stair is his own old fight)
    Placed.knows(j, k('lord_dead'));
    await j.play('=day 10 19:00', '>keep__hall', '=+1');
    expect(Keep.holds(j, 'cup_set', k('house'))).toBe(true);
    await j.play('=+1');
    expect(j.page).toMatch(/old dog has come in/);
    expect(j.page).toMatch(/Almonds/);
    await j.play('Pour the cup out');
    expect(Keep.holds(j, 'cup_done', k('house'))).toBe(true);
  }, 120000);
  it('lets a cleric who has read the oath release the household from it, so that the castellan will speak', async () => {
    const j = await Keep.at('chapel', 'cleric');
    await j.play('Wait › A while');
    expect(Keep.knows(j, 'oath_known')).toBe(true);
    j.assert('befriended', k('chaplain'), 'party');
    await j.play('Have .* say the office of release');
    expect(Keep.holds(j, 'castellan_ready', k('house'))).toBe(true);
  }, 120000);
  it('lets a warrior read the garrison at dawn, and the marshal answer to it', async () => {
    const j = await Keep.at('ward', 'warrior', '=day 10 05:30');
    await j.play('Wait › A while', 'Wait › A while');
    expect(Keep.knows(j, 'garrison_read')).toBe(true);
    await j.play('Tell .* you know his garrison');
    expect(Keep.holds(j, 'befriended', k('marshal'), 'party')).toBe(true);
  }, 120000);
});

describe('the silent lord alone moves without the company', () => {
  it('presses the levy on the first green from the eighth day, and the keep falls on the twelfth if nobody enters', async () => {
    const j = await Keep.at('', 'warrior', '');
    await j.play('=day 9 10:00');
    expect(Keep.state(j, 'levy_post')).toBe(k('pressed'));
    await j.play('=day 13 12:00');
    expect(Keep.holds(j, 'reckoned', k('house'))).toBe(true);
    expect(Keep.state(j, 'banner')).toBe(k('usurped'));
    expect(Keep.state(j, 'levy_post')).toBe(k('raised'));
  }, 120000);
});
