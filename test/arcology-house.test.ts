import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The Numbered House (data/situations/arcology, data/scenarios/arcology.scenario.json): a standing scenario, so every
// first country holds one. These specs play its mechanisms by the page's own labels. A spec sets the company down in
// a room with `Placed.at` only to skip the walk there, never to bypass what the room does; where a spec asserts a fact
// to reach a later room (the lift mended, the Roll written in) the mechanism that makes it so has its own spec.
class House {
  static readonly seeds = ['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4', 'kite'];
  // Names of the House's own, in full: its states are named like the region's (open, read, low), so a short name
  // would be taken for the region's.
  static a(x: string) { return x === 'party' || x.includes('__') ? x : `arcology__${x}`; }
  static is(j: Journey, rel: string, ...args: string[]) { return j.holds(rel, ...args.map(x => this.a(x))); }
  static n(j: Journey, rel: string, ...args: string[]) { return j.measure(rel, ...args.map(x => this.a(x))); }
  // A fact made so for the test is seen by the page after the next command, so a short wait follows it.
  static async set(j: Journey, rel: string, ...args: string[]) {
    j.assert(rel, ...args.map(x => this.a(x)));
    await j.play('Wait › A while');
  }
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] });
    const p = w.report.placements.find(x => x.scenario === 'arcology');
    return { w, p, text: [...(w.source as unknown as { files: Map<string, string> }).files.values()].join('\n') };
  }
  static async start(seed = 'kahitude', cls = 'warrior') {
    return Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: cls }] }, NodeBundleSource.shared));
  }
  static async at(room: string, seed = 'kahitude', cls = 'warrior', lit = true) {
    const j = await this.start(seed, cls);
    Placed.at(j, `arcology__${room}`, lit);
    return j;
  }
  // Which of the stair's three orders this country's House keeps, and the plates that strike it.
  static order(j: Journey): string[] {
    const plates: Record<string, string[]> = { pat_a: ['Strike the middle disc', 'Strike the small disc', 'Strike the great disc'],
      pat_b: ['Strike the great disc', 'Strike the small disc', 'Strike the middle disc'],
      pat_c: ['Strike the small disc', 'Strike the middle disc', 'Strike the great disc'] };
    return plates[['pat_a', 'pat_b', 'pat_c'].find(p => House.is(j, 'pattern', 'treads', p))!]!;
  }
  static hum(j: Journey) { return this.n(j, 'hum', 'house'); }
}

// Part of arcology.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 20 minutes there (Mission 20's landing).
describe('the Hanging Garden', () => {
  it('puts a company to sleep by day, is learned from the Gardener, who gives wet cloth, and is safe at night', async () => {
    const j = await House.at('terrace', 'kahitude', 'warrior');
    expect(j.offers('Tie wet cloth')).toBe(false);
    await j.play('Ask the Gardener about the bell-lilies', 'Ask the Gardener for something to tie over your faces');
    expect(j.offers('Tie wet cloth over your mouths and go through')).toBe(true);
    await j.play('Tie wet cloth over your mouths and go through', 'To the Hanging Garden');
    expect(j.at('party')).toMatch(/garden$/);
    const sleeper = await House.at('terrace', 'kahitude', 'warrior');
    await sleeper.play('To the Hanging Garden');
    expect(sleeper.offers('Lie as you are')).toBe(true);
    const night = await House.at('terrace', 'kahitude', 'warrior');
    await night.play('=21:00');
    expect(House.is(night, 'state', 'blossoms', 'folded')).toBe(true);
    await night.play('To the Hanging Garden');
    expect(night.at('party')).toMatch(/garden$/);
  }, 420000);
});

describe('the Question Hall and its hum', () => {
  it('answers by device, raises the hum with each answer, posts the keepers across the arches at four and turns them at six', async () => {
    const j = await House.at('hall', 'kahitude', 'mage');
    expect(House.hum(j)).toBe(0);
    for (const q of ['steps', 'a disc and a hand', 'a notched ring', 'a row of dots']) {
      await j.play(`Ask the tablet marked with ${q}`);
    }
    expect(House.hum(j)).toBe(4);
    expect(House.is(j, 'state', 'keepers', 'posted')).toBe(true);
    expect(j.takes('To the Drawer Gallery')).toBe(false);
    expect(House.is(j, 'peaceable', 'keepers')).toBe(true);
    await j.play('Wait › An hour');
    await j.play('Wait › An hour');
    await j.play('Wait › An hour');
    expect(House.hum(j)).toBeLessThanOrEqual(2);
    expect(House.is(j, 'state', 'keepers', 'niched')).toBe(true);
    expect(j.takes('To the Drawer Gallery')).toBe(true);
  }, 420000);

  it('breaks its peace if the closed eye is asked: the keepers turn and, past eight, the Marshal wakes and comes', async () => {
    const j = await House.at('hall', 'kahitude', 'mage');
    expect(j.offers('Ask the tablet marked with a closed eye')).toBe(true);
    for (const q of ['steps', 'a disc and a hand', 'a notched ring', 'a row of dots']) {
      await j.play(`Ask the tablet marked with ${q}`);
    }
    await j.play('Ask the tablet marked with a closed eye');
    expect(House.hum(j)).toBeGreaterThanOrEqual(8);
    expect(House.is(j, 'peaceable', 'keepers')).toBe(false);
    expect(House.is(j, 'state', 'marshal', 'roused')).toBe(true);
    expect(House.is(j, 'assails', 'marshal', 'party')).toBe(true);
  }, 420000);

  it('is quiet to those it has counted: no keeper is turned on a counted company however loud', async () => {
    const j = await House.at('hall', 'kahitude', 'mage');
    await House.set(j, 'counted', 'party');
    await House.set(j, 'tolerates', 'keepers', 'party');
    await House.set(j, 'tolerates', 'marshal', 'party');
    for (const q of ['steps', 'a disc and a hand', 'a notched ring', 'a row of dots', 'a door behind a door', 'a closed eye']) {
      await j.play(`Ask the tablet marked with ${q}`);
    }
    expect(House.is(j, 'assails', 'keepers', 'party')).toBe(false);
    expect(House.is(j, 'assails', 'marshal', 'party')).toBe(false);
  }, 420000);
});

describe('the ring in the drawers, the governor, and the lift', () => {
  it('jams on a wrong notch for an hour and the hum, opens on the tablet’s number, and the governor mends the lift for good', async () => {
    const j = await House.at('drawers', 'kahitude', 'mage');
    const target = House.n(j, 'target', 'ring');
    expect(target).toBeGreaterThanOrEqual(2);
    expect(target).toBeLessThanOrEqual(6);
    // One notch short, or one past it on the wheel, is wrong.
    const wrongTurns = target === 2 ? 1 : 0;
    for (let i = 0; i < wrongTurns; i++) { await j.play('Turn the ring one notch'); }
    if (wrongTurns) { await j.play('Press the ring home'); expect(House.is(j, 'state', 'drawer', 'jammed')).toBe(true); expect(House.hum(j)).toBe(1); }
    else { await j.play('Press the ring home'); expect(House.is(j, 'state', 'drawer', 'jammed')).toBe(true); }
    await j.play('Wait › An hour');
    expect(House.is(j, 'state', 'drawer', 'locked')).toBe(true);
    const have = House.n(j, 'notch', 'ring');
    for (let i = have; i !== target; i = i % 6 + 1) { await j.play('Turn the ring one notch'); }
    await j.play('Press the ring home');
    expect(House.is(j, 'state', 'drawer', 'open')).toBe(true);
    await j.play('Take from the drawer of the ring');
    Placed.at(j, 'arcology__cage');
    expect(House.is(j, 'state', 'cage_gear', 'stalled')).toBe(true);
    await j.play('Fit the governor and free the cage');
    expect(House.is(j, 'state', 'cage_gear', 'running')).toBe(true);
    Placed.at(j, 'arcology__terrace');
    expect(j.takes('To the foot of the Great Void')).toBe(true);
  }, 600000);
});

describe('the Reckoning Room and the disc', () => {
  it('answers to the sun at noon, never to the uncounted, and rises for the counted', async () => {
    const j = await House.at('reckoning', 'kahitude', 'mage');
    expect(j.offers('Turn the ring until its mark meets the shaft of light')).toBe(false);
    await j.play('=11:00');
    await j.play('Turn the ring until its mark meets the shaft of light');
    expect(House.is(j, 'state', 'disc', 'risen')).toBe(true);
    expect(j.offers('^To the Quiet Floor$')).toBe(false);
    await House.set(j, 'counted', 'party');
    expect(j.offers('^To the Quiet Floor$')).toBe(true);
  }, 420000);
});

describe('the Quiet Floor', () => {
  it('feeds the counted, makes them tenants, notices when the company has changed, and counts a pocketed spoon as owed', async () => {
    const j = await House.at('table_room', 'kahitude', 'warrior');
    expect(j.offers('Sit down and eat what is laid')).toBe(false);
    await House.set(j, 'counted', 'party');
    await j.play('Sit down and eat what is laid');
    expect(House.is(j, 'tenant', 'party')).toBe(true);
    expect(House.n(j, 'seatedFor', 'party')).toBe(1);
    await j.play('laid silver spoons: Take');
    expect(House.is(j, 'owed', 'party')).toBe(true);
    Placed.at(j, 'arcology__quiet');
    await j.play('Settle the account for the spoon');
    expect(House.is(j, 'owed', 'party')).toBe(false);
  }, 420000);
});

describe('the water', () => {
  it('sends the town its spring when the roofed-house wheel is turned, and costs the Gardener hers', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!;
    const j = await House.at('valves', 'kahitude', 'warrior');
    expect(House.is(j, 'state', 'spring', 'failing')).toBe(true);
    expect(House.is(j, 'state', 'blossoms', 'open')).toBe(true);
    await j.play('Open the wheel with the roofed house');
    expect(House.is(j, 'state', 'spring', 'running')).toBe(true);
    expect(House.is(j, 'state', 'blossoms', 'wilting')).toBe(true);
    Placed.at(j, `region__${town}_shrine`);
    expect(j.offers('Tell')).toBe(true);
    await j.play('the spring will run again');
    expect(House.is(j, 'paid_spring', 'party')).toBe(true);
    Placed.at(j, 'arcology__valves');
    await j.play('Shut the wheel with the roofed house');
    expect(House.is(j, 'state', 'spring', 'failing')).toBe(true);
  }, 420000);

  it('drains the Drowned Level through the tipped bucket: the garden door clears, the eels are stranded, and the brook floods', async () => {
    const j = await House.at('valves', 'a1', 'warrior');
    await j.play('Open the wheel with the tipped bucket', 'Wait › A while');
    expect(House.is(j, 'state', 'waterlevel', 'low')).toBe(true);
    expect(House.is(j, 'state', 'roots_lock', 'clear')).toBe(true);
    expect(House.is(j, 'state', 'eels', 'stranded')).toBe(true);
    expect(House.is(j, 'state', 'culvert_water', 'flowing')).toBe(true);
  }, 420000);
});
