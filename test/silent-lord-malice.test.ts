import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { Keep } from './support/keep';

// The darker side of the keep (data/situations/silent-lord/malice.kyr): the quiet watch, the young man with a sword, a
// cup, what each calling sees, and a crisis that moves without the company. A spec puts the company down with
// `Placed.at` only to skip a walk; where it is given a fact (a thing learned) it says so.
const k = Keep.id;

describe('the silent lord: malice, and the signal before it', () => {
  it('warns a company that counts the lord’s trays: Thole’s Hands bar the ward, and the toll settles it', async () => {
    const j = await Keep.start();
    await Keep.arrive(j, 'ward');
    Placed.knows(j, k('lord_trays'));
    await j.play('=day 10 19:00', 'Wait › A while');
    expect(Keep.holds(j, 'peaceable', k('hands'))).toBe(false);
    expect(Keep.holds(j, 'warned', k('hands'), 'party')).toBe(true);
    expect(j.page).toMatch(/counts its trays|counted trays/);
    j.coin(10);
    await j.play('Pay .* the price named');
    expect(Keep.holds(j, 'tolerates', k('hands'), 'party')).toBe(true);
  }, 600000);

  it('falls on a warned company that sleeps unbarred at the dead watch, and is balked by a barred door', async () => {
    const j = await Keep.start();
    await Keep.arrive(j, 'guest');
    j.assert('hands_told', k('house'));
    await j.play('Wedge the door with the bench');
    await j.play('=day 11 02:10');
    expect(Keep.holds(j, 'hands_balked', k('house'))).toBe(true);
    expect(Placed.holds(j, 'dead', 'party')).toBe(false);
    const j2 = await Keep.start('warrior');
    await Keep.arrive(j2, 'guest');
    j2.assert('hands_told', k('house'));
    const told = await j2.play('=day 11 02:10');
    expect(told).toMatch(/Don.t get up/);
    expect(Keep.holds(j2, 'assails', k('hands'), 'party') || Placed.holds(j2, 'dead', 'party') || !Keep.holds(j2, 'peaceable', k('hands'))).toBe(true);
  }, 900000);

  it('takes a swordsman for the king’s champion: told the truth he laughs and becomes a friend, whose word turns the Hands aside', async () => {
    const j = await Keep.start();
    await Keep.arrive(j, 'ward');
    await j.play('Wait › A while');
    expect(Keep.holds(j, 'warned', k('ansel'), 'party')).toBe(true);
    await j.play('Tell .* you are not the king.s champion');
    expect(Keep.holds(j, 'befriended', k('ansel'), 'party')).toBe(true);
    expect(Keep.holds(j, 'tolerates', k('hands'), 'party') || Keep.knows(j, 'hands_known')).toBe(true);
    expect(Keep.holds(j, 'peaceable', k('ansel'))).toBe(true);
  }, 600000);

  it('lets the same mistake be played out as a duel to the first fall', async () => {
    const j = await Keep.start();
    await Keep.arrive(j, 'ward');
    await j.play('Wait › A while');
    await j.play('Say you are, and ask him what his cause is');
    expect(j.page).toMatch(/herald called my uncle indisposed/);
  }, 600000);

  it('sets a bitter cup before a company that has learned too much, and the dog, the cook and a cleric’s nose warn of it before the cup is drunk', async () => {
    const j = await Keep.start('cleric');
    await Keep.arrive(j, 'kitchen');
    Placed.knows(j, k('lord_dead'));
    await j.play('=day 10 19:00', '>keep__hall', 'Wait › A while');
    expect(Keep.holds(j, 'cup_set', k('house'))).toBe(true);
    expect(j.seen()).toMatch(/old dog has come in/);
    expect(j.seen()).toMatch(/Almonds/);
    await j.play('Pour the cup out');
    expect(Keep.holds(j, 'cup_done', k('house'))).toBe(true);
  }, 600000);

  it('lets a thief who has read the gate lift the wicket’s bar without a bribe or a bell', async () => {
    const j = await Keep.start('thief');
    await Keep.arrive(j, 'gatehouse');
    await j.play('Wait › A while');
    expect(Keep.knows(j, 'wire_seen')).toBe(true);
    const site = await Keep.site();
    await j.play('=day 10 23:00');
    Placed.at(j, `region__${site}`);
    j.roll('pass');
    await j.play('Have .* lift the wicket');
    j.roll();
    expect(Keep.holds(j, 'night_open', k('house'))).toBe(true);
  }, 600000);

  it('lets a cleric who has read the oath release the household from it, so that the castellan will speak at the feast', async () => {
    const j = await Keep.start('cleric');
    await Keep.arrive(j, 'chapel');
    await j.play('Wait › A while');
    expect(Keep.knows(j, 'oath_known')).toBe(true);
    j.assert('befriended', k('chaplain'), 'party');
    await j.play('Have .* say the office of release');
    expect(Keep.holds(j, 'castellan_ready', k('house'))).toBe(true);
  }, 600000);

  it('lets a warrior read the garrison at dawn, and the marshal answer to it', async () => {
    const j = await Keep.start();
    await j.play('=day 10 05:30');
    Placed.at(j, k('ward'));
    await j.play('Wait › A while');
    await j.play('Wait › A while');
    expect(Keep.knows(j, 'garrison_read')).toBe(true);
    await j.play('Tell .* you know his garrison');
    expect(Keep.holds(j, 'befriended', k('marshal'), 'party')).toBe(true);
  }, 600000);

  it('lets a ranger read the rider’s tracks in the ditch, and the marshal call the Hands off', async () => {
    const j = await Keep.start('ranger');
    await Keep.arrive(j, 'ward');
    const site = await Keep.site();
    Placed.at(j, `region__${site}`);
    expect(j.seen()).toMatch(/soft soles/);
    Placed.knows(j, k('tracks_seen'));
    Placed.at(j, k('ward'));
    await j.play('Tell .* the rider was taken in the ditch');
    expect(Keep.holds(j, 'tolerates', k('hands'), 'party')).toBe(true);
  }, 600000);
});

describe('the silent lord moves without the company', () => {
  it('presses the levy on the first green from the eighth day, and the keep falls to the herald’s master on the twelfth if nobody enters', async () => {
    const j = await Keep.start();
    await j.play('=day 9 10:00');
    expect(Keep.state(j, 'levy_post')).toBe(k('pressed'));
    await j.play('=day 13 12:00');
    expect(Keep.holds(j, 'reckoned', k('house'))).toBe(true);
    expect(Keep.state(j, 'banner')).toBe(k('usurped'));
    expect(Keep.state(j, 'levy_post')).toBe(k('raised'));
  }, 900000);
});
