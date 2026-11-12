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
describe('the man in the lift cage, and the shrine’s lamp-chain', () => {
  it('is freed by the mended lift, tells where the chain is, goes home when the company comes out, and the priest pays for the chain', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!, site = p!.bindings.works!;
    const j = await House.at('cage', 'kahitude', 'warrior');
    await j.play('Ask Oswy how he came');
    await j.play('Ask Oswy about the brass in his pack');
    expect(House.is(j, 'knows', 'party', 'chain_seen')).toBe(true);
    await j.play('chain: Take', 'the shrine’s lamp-chain: Take').catch(() => undefined);
    await House.set(j, 'state', 'cage_gear', 'running');
    await j.play('Ride the mended lift up with');
    expect(House.is(j, 'following', 'salvager', 'party')).toBe(true);
    Placed.at(j, `region__${site}`);
    await j.play('=+1');
    expect(House.is(j, 'state', 'salvager', 'safe_home')).toBe(true);
    Placed.at(j, `region__${town}_shrine`);
    expect(j.offers('Give')).toBe(true);
  }, 420000);
});

describe('the Service Way', () => {
  it('opens a way from the House to the town’s shrine, for good, and the priest learns of it', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!;
    const j = await House.at('cliff', 'kahitude', 'warrior');
    expect(j.takes('To the')).toBe(true);
    await j.play('Search here');
    await j.play('Draw the bar and heave the slab on its edge');
    expect(House.is(j, 'state', 'slab', 'open')).toBe(true);
    await j.play('Lift the beam from the bronze door');
    Placed.at(j, `region__${town}_shrine`);
    expect(House.is(j, 'state', 'slab', 'open')).toBe(true);
    await j.play('Tell');
    expect(House.is(j, 'paid_slab', 'party')).toBe(true);
  }, 420000);
});

describe('the Marshal, and the figure on the green', () => {
  it('has its key drawn by one who can be quiet, which wins every keeper’s peace and winds down the counter at the green', async () => {
    const { p } = await House.world('kahitude');
    const town = p!.bindings.town!;
    const j = await House.at('bay', 'kahitude', 'thief');
    j.roll('pass');
    await j.play('Draw the winding-key out of the Marshal’s back');
    expect(House.is(j, 'state', 'marshal', 'wound_down')).toBe(true);
    // The Roll, written in chalk, reopens the count: a brass figure walks to the green by night until it is wound down.
    await House.set(j, 'rolled', 'house');
    Placed.at(j, `region__${town}_green`);
    await j.play('=until dark()').catch(() => j.play('Wait › Until dark'));
    await j.play('=+1');
    expect(House.is(j, 'state', 'counter', 'counting')).toBe(true);
    expect(j.at('counter')).toMatch(/green$/);
    await j.play('Wind the counting figure down with the Marshal’s key');
    expect(House.is(j, 'state', 'counter', 'stilled')).toBe(true);
  }, 600000);

  it('makes the keepers tolerate whoever holds the key', async () => {
    const j = await House.at('bay', 'kahitude', 'thief');
    j.roll('pass');
    await j.play('Draw the winding-key out of the Marshal’s back', 'Wait › A while');
    expect(House.is(j, 'tolerates', 'keepers', 'party')).toBe(true);
    expect(House.is(j, 'tolerates', 'usher', 'party')).toBe(true);
  }, 300000);
});

describe('the ways round the Count', () => {
  it('lets one who can climb go up the Ledge, past the Lodge and the Usher, to the Terrace by the narrow stair', async () => {
    const j = await House.at('landing', 'kahitude', 'monk');
    await j.play('To the Goat Ledge');
    expect(j.at('party')).toMatch(/ledge$/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
    await j.play('To the Terrace of Tiers');
    expect(j.at('party')).toMatch(/terrace$/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
  }, 240000);

  it('shows the hull from the Ledge to anyone', async () => {
    const j = await House.at('ledge', 'kahitude', 'ranger');
    expect(j.seen()).toMatch(/curved wall of dark metal/);
    await j.play('Wait › A while');
    expect(House.is(j, 'knows', 'party', 'hull_seen')).toBe(true);
  }, 240000);

  it('enters by the brook for those who found the arch: the sluice-race, in the dark', async () => {
    const { p } = await House.world('kahitude');
    const j = await House.start('kahitude', 'warrior');
    Placed.at(j, `region__${p!.bindings.works}`);
    await j.play('Search here', 'Into the sluice-race');
    expect(j.at('party')).toMatch(/race$/);
  }, 300000);

  it('counts the company on the Roll, in chalk found at the Landing, and reopens the count: the cheap way, with a cost outside', async () => {
    const j = await House.at('landing', 'kahitude', 'mage');
    await j.play('Search here', 'a stub of the survey’s chalk: Take');
    Placed.at(j, 'arcology__drawers');
    await j.play('Write the company’s names in the Roll, in chalk');
    expect(House.is(j, 'counted', 'party')).toBe(true);
    expect(House.is(j, 'rolled', 'house')).toBe(true);
    expect(House.hum(j)).toBeGreaterThanOrEqual(1);
  }, 300000);

  it('shows the ring in the sky from the roof, and leaves the drowned city a view', async () => {
    const j = await House.at('ring_walk', 'kahitude', 'mage');
    expect(j.seen()).toMatch(/great ring stands on edge/);
    await j.play('Wait › A while');
    expect(House.is(j, 'knows', 'party', 'ring_seen')).toBe(true);
  }, 240000);
});

describe('light, air, bait and the Gardener’s gift', () => {
  it('vents the seed-vault before the door is safe: dead air stands behind it until the wheel is turned', async () => {
    const j = await House.at('roots', 'kahitude', 'warrior');
    expect(House.is(j, 'state', 'vault_air', 'foul')).toBe(true);
    await j.play('Turn the vent-wheel');
    await j.play('Wait › A while');
    expect(House.is(j, 'state', 'vault_air', 'clean')).toBe(true);
  }, 240000);

  it('sets the bronze ring by the surveyors’ plate and a lit candle at night, when the sun will not do', async () => {
    const j = await House.at('landing', 'kahitude', 'mage');
    await j.play('Search here', 'the surveyors’ signal-plate: Take');
    Placed.at(j, 'arcology__reckoning');
    await j.play('=22:00');
    expect(House.is(j, 'state', 'bronze_ring', 'unset')).toBe(true);
    await j.play('a candle: Light');
    expect(j.offers('Throw lamplight onto the ring’s mark')).toBe(true);
    await j.play('Throw lamplight onto the ring’s mark with the surveyors’ plate');
    expect(House.is(j, 'state', 'disc', 'risen')).toBe(true);
  }, 300000);

  it('gives rations to the owlbear for peace at the foot of the Void, and the pod to one who has been below', async () => {
    const j = await House.at('foot', 'kahitude', 'warrior');
    expect(j.offers('Leave rations at the edge of the pool for the owlbear')).toBe(true);
    await j.play('Leave rations at the edge of the pool for the owlbear');
    expect(House.is(j, 'tolerates', 'owlbear', 'party')).toBe(true);
    const g = await House.at('terrace', 'kahitude', 'warrior');
    expect(g.offers('Ask the Gardener for a seed-pod')).toBe(false);
    g.assert('been', 'party', 'arcology__roots');
    await g.play('Wait › A while');
    expect(g.offers('Ask the Gardener for a seed-pod of the bells')).toBe(true);
  }, 300000);
});
