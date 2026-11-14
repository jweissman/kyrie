import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { Rivals } from './support/rivals';

// The Collegium of the Measured Road in the Numbered House (data/situations/arcology/rivals.kyr): a rival expedition on
// its own clock, what it changes, and what a company of each calling can do about it. A spec puts the company down with
// `Placed.at` only to skip the walk, never to bypass the mechanism it is about.

// Part of arcology-rivals.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 20 minutes there (Mission 20's landing).
describe('what each calling reads in the House', () => {
  it('a scholar reads the numbering of the Row and the Drawer Gallery’s ring', async () => {
    const j = await Rivals.start('mage');
    Placed.at(j, 'arcology__row');
    expect(j.seen()).toMatch(/numbered in sixes/);
    Placed.at(j, 'arcology__drawers');
    await j.play('Wait › A while');
    expect(j.seen()).toMatch(/ring has six notches/);
  }, 120000);

  it('a ranger reads the owlbear’s line and goes round it', async () => {
    const j = await Rivals.start('ranger');
    Placed.at(j, 'arcology__foot');
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'knows', 'party', 'owl_runs')).toBe(true);
    expect(Rivals.is(j, 'warned', 'owlbear', 'party')).toBe(true);
    await j.play('Take the owlbear.s line');
    expect(Rivals.is(j, 'tolerates', 'owlbear', 'party')).toBe(true);
  }, 120000);

  it('a cleric sees the dead tenants’ shift at dusk, and asks them to wind the weights', async () => {
    const j = await Rivals.start('cleric');
    await j.play('=day 2 21:00');
    Placed.at(j, 'arcology__terrace');
    expect(j.seen()).toMatch(/figures of grey light file out/);
    Placed.at(j, 'arcology__gantry');
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'knows', 'party', 'shift_known')).toBe(true);
    await j.play('Have .* say the office for the tenants');
    expect(Rivals.is(j, 'state', 'winch_a', 'wound')).toBe(true);
    expect(Rivals.is(j, 'state', 'winch_b', 'wound')).toBe(true);
  }, 120000);

  it('a company with the surveyors’ plate flashes the drowned city and is answered: WAIT', async () => {
    const j = await Rivals.start();
    await j.play('=day 2 12:00');
    j.give('arcology__mirror');
    Placed.at(j, 'arcology__ring_walk');
    await j.play('Flash the surveyors');
    expect(Rivals.is(j, 'knows', 'party', 'tower_answers')).toBe(true);
    expect(Rivals.is(j, 'state', 'ring_sight', 'answered')).toBe(true);
  }, 120000);
});
