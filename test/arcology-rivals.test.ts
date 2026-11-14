import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { Rivals } from './support/rivals';

// The Collegium of the Measured Road in the Numbered House (data/situations/arcology/rivals.kyr): a rival expedition on
// its own clock, what it changes, and what a company of each calling can do about it. A spec puts the company down with
// `Placed.at` only to skip the walk, never to bypass the mechanism it is about. The situation alone (SituationAlone:
// its own module on a host written from its imports, a third of a second a start where each case drew a country);
// the company is put down below the works (`outside`), as on arriving at the Bend.

describe('the Collegium of the Measured Road goes down the House on its own clock', () => {
  it('goes in on the third day, with or without the company: the Prior and the hands at the Landing, the stair still sounding', async () => {
    const j = await Rivals.bend();
    expect(Rivals.n(j, 'rivalStage', 'house')).toBe(1);
    expect(Rivals.at(j, 'quill')).toMatch(/landing$/);
    expect(Rivals.at(j, 'crew')).toMatch(/landing$/);
    expect(Rivals.is(j, 'state', 'treads', 'sounding')).toBe(true);
  }, 120000);

  it('wedges the stair, winds the capstans and asks the tablets, a stage at a time, and what it does stays done', async () => {
    const j = await Rivals.bend();
    await Rivals.stage(j, 2);
    expect(Rivals.is(j, 'state', 'treads', 'stilled')).toBe(true);
    expect(Rivals.is(j, 'wedged', 'house')).toBe(true);
    expect(Rivals.at(j, 'quill')).toMatch(/terrace$/);
    await Rivals.stage(j, 3);
    expect(Rivals.is(j, 'state', 'winch_a', 'wound')).toBe(true);
    expect(Rivals.is(j, 'state', 'winch_b', 'wound')).toBe(true);
    expect(Rivals.n(j, 'limit', 'deck')).toBe(20);
    expect(Rivals.at(j, 'crew')).toMatch(/bridge_mid$/);
    await Rivals.stage(j, 4);
    expect(Rivals.at(j, 'quill')).toMatch(/hall$/);
    expect(Rivals.n(j, 'hum', 'house')).toBeGreaterThanOrEqual(4);
    expect(Rivals.is(j, 'state', 'keepers', 'posted')).toBe(true);
  }, 600000);

  it('prises the drawer, takes the governor and writes in the Roll: the counting figure walks to the town, and the company must wind it down', async () => {
    const j = await Rivals.bend();
    await Rivals.stage(j, 5);
    await j.play('=+2');
    expect(Rivals.is(j, 'state', 'drawer', 'open')).toBe(true);
    expect(Rivals.is(j, 'inside', 'governor', 'drawer')).toBe(false);
    expect(Rivals.is(j, 'crewHasGov', 'house')).toBe(true);
    expect(Rivals.is(j, 'rolled', 'house')).toBe(true);
    expect(Rivals.is(j, 'counted', 'party')).toBe(false);
  }, 600000);

  it('breaks camp and goes, taking the governor with it unless bought, shamed out of or robbed from it', async () => {
    const j = await Rivals.bend();
    await Rivals.stage(j, 8);
    expect(Rivals.at(j, 'quill')).toBeUndefined();
    expect(Rivals.at(j, 'crew')).toBeUndefined();
    expect(Rivals.is(j, 'crewHasGov', 'house')).toBe(true);
  }, 900000);

  it('has been through the House by the seventh day, if the company never came: the stair wedged, the governor gone, the Roll written in, the figure at the green by night', async () => {
    const j = await Rivals.start();
    await j.play('=day 7 12:00');
    expect(Rivals.n(j, 'rivalStage', 'house')).toBe(8);
    expect(Rivals.is(j, 'state', 'treads', 'stilled')).toBe(true);
    expect(Rivals.is(j, 'rolled', 'house')).toBe(true);
    expect(Rivals.is(j, 'inside', 'governor', 'drawer')).toBe(false);
  }, 600000);
});

describe('allying with, racing, being robbed by and fighting the expedition', () => {
  it('allies with the Prior over the Prefect’s tablet: she gives a pass, and the hands let the pass-bearer by', async () => {
    const j = await Rivals.bend();
    Placed.at(j, 'arcology__landing');
    j.give('arcology__prefect_tablet');
    await j.play('Ask .* who the Collegium of the Measured Road is');
    await j.play('Show .* the Prefect');
    expect(Rivals.is(j, 'quillAlly', 'party')).toBe(true);
    expect(Rivals.carries(j, 'the Collegium')).toBe(true);
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'tolerates', 'crew', 'party')).toBe(true);
  }, 120000);

  it('is stopped on the bridge by the hands for a toll, and a warrior who has read the line faces it down', async () => {
    const j = await Rivals.bend();
    await Rivals.stage(j, 3);
    Placed.at(j, 'arcology__bridge_mid');
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'warned', 'crew', 'party')).toBe(true);
    expect(j.page).toMatch(/That.s a toll/);
    expect(j.page).toMatch(/That line breaks at the right/);
    expect(Rivals.is(j, 'knows', 'party', 'crew_read')).toBe(true);
    j.roll('pass');
    await j.play('Have .* step out and face Brannock');
    j.roll();
    expect(Rivals.is(j, 'tolerates', 'crew', 'party')).toBe(true);
    expect(Rivals.is(j, 'cowed', 'crew')).toBe(true);
  }, 600000);

  it('lets a thief who reads the pawl turn the Bridge on the toll-takers', async () => {
    const j = await Rivals.bend('thief');
    await Rivals.stage(j, 3);
    Placed.at(j, 'arcology__gantry');
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'knows', 'party', 'pawl_seen')).toBe(true);
    await j.play('Knock the near capstan');
    expect(Rivals.is(j, 'state', 'deck', 'canted')).toBe(true);
    expect(Rivals.at(j, 'crew')).toMatch(/bridge_near$/);
    expect(Rivals.is(j, 'cowed', 'crew')).toBe(true);
  }, 600000);

  it('sells the governor to a company that can pay, and gives it to one that tells him about the man in the cage', async () => {
    const j = await Rivals.bend();
    await Rivals.stage(j, 5);
    await j.play('=+2');
    Placed.at(j, 'arcology__drawers');
    j.coin(30);
    await j.play('Wait › A while');
    if (Rivals.is(j, 'peaceable', 'crew')) { await j.play('Ask .* who they work for'); }
    await j.play('Buy .* governor');
    expect(Rivals.carries(j, 'a brass governor')).toBe(true);
    expect(Rivals.is(j, 'crewHasGov', 'house')).toBe(false);
  }, 600000);

  it('is robbed by the hands of a governor the company holds, unless it pays the toll or hands it over', async () => {
    const j = await Rivals.bend();
    await Rivals.stage(j, 5);
    await j.play('=+2');
    j.give('arcology__governor');
    Placed.at(j, 'arcology__drawers');
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'warned', 'crew', 'party')).toBe(true);
    expect(j.page).toMatch(/toll/);
  }, 600000);
});
