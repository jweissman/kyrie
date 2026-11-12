import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The Collegium of the Measured Road in the Numbered House (data/situations/arcology/rivals.kyr): a rival expedition on
// its own clock, what it changes, and what a company of each calling can do about it. A spec puts the company down with
// `Placed.at` only to skip the walk, never to bypass the mechanism it is about.
class Rivals {
  static a(x: string) { return x === 'party' || x.includes('__') ? x : `arcology__${x}`; }
  static is(j: Journey, rel: string, ...args: string[]) { return j.holds(rel, ...args.map(x => this.a(x))); }
  static n(j: Journey, rel: string, ...args: string[]) { return j.measure(rel, ...args.map(x => this.a(x))); }
  static async site(seed = 'kahitude') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
    return w.report.placements.find(x => x.scenario === 'arcology')!.bindings.works!;
  }
  static async start(cls = 'warrior', seed = 'kahitude') {
    return Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: cls }] }, NodeBundleSource.shared));
  }
  // The company at the Bend, as it would be on arriving: the expedition's clock starts there.
  static async bend(cls = 'warrior') {
    const j = await this.start(cls);
    Placed.at(j, `region__${await this.site()}`);
    await j.play('=day 3 06:00', 'Wait › A while');
    return j;
  }
  static async stage(j: Journey, n: number) {
    while (this.n(j, 'rivalStage', 'house') < n) { await j.play('=+60'); }
  }
  static at(j: Journey, who: string) { return j.at(this.a(who)); }
  static carries(j: Journey, name: string) { return j.choices().some(c => new RegExp(`^Pack › ${name}`, 'i').test(c.full)); }
}

describe('the Collegium of the Measured Road goes down the House on its own clock', () => {
  it('goes in on the third day, with or without the company: the Prior and the hands at the Landing, the stair still sounding', async () => {
    const j = await Rivals.bend();
    expect(Rivals.n(j, 'rivalStage', 'house')).toBe(1);
    expect(Rivals.at(j, 'quill')).toMatch(/landing$/);
    expect(Rivals.at(j, 'crew')).toMatch(/landing$/);
    expect(Rivals.is(j, 'state', 'treads', 'sounding')).toBe(true);
  }, 300000);

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
  }, 300000);

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

describe('what each calling reads in the House', () => {
  it('a scholar reads the numbering of the Row and the Drawer Gallery’s ring', async () => {
    const j = await Rivals.start('mage');
    Placed.at(j, 'arcology__row');
    expect(j.seen()).toMatch(/numbered in sixes/);
    Placed.at(j, 'arcology__drawers');
    await j.play('Wait › A while');
    expect(j.seen()).toMatch(/ring has six notches/);
  }, 300000);

  it('a ranger reads the owlbear’s line and goes round it', async () => {
    const j = await Rivals.start('ranger');
    Placed.at(j, 'arcology__foot');
    await j.play('Wait › A while');
    expect(Rivals.is(j, 'knows', 'party', 'owl_runs')).toBe(true);
    expect(Rivals.is(j, 'warned', 'owlbear', 'party')).toBe(true);
    await j.play('Take the owlbear.s line');
    expect(Rivals.is(j, 'tolerates', 'owlbear', 'party')).toBe(true);
  }, 300000);

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
  }, 300000);

  it('a company with the surveyors’ plate flashes the drowned city and is answered: WAIT', async () => {
    const j = await Rivals.start();
    await j.play('=day 2 12:00');
    j.give('arcology__mirror');
    Placed.at(j, 'arcology__ring_walk');
    await j.play('Flash the surveyors');
    expect(Rivals.is(j, 'knows', 'party', 'tower_answers')).toBe(true);
    expect(Rivals.is(j, 'state', 'ring_sight', 'answered')).toBe(true);
  }, 300000);
});
