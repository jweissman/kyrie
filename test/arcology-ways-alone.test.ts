import { describe, expect, it } from 'bun:test';
import { Alone } from './support/alone';
import { Placed } from './support/placed';
import type { Journey } from '../src/session/journey';

// The Numbered House's own rooms (data/situations/arcology), as a targeted scenario: the situation's module on the
// shared rules, its imports bound to a host of a few lines instead of a generated country (see Alone). These cases had
// each drawn kahitude for a room of the House (test/arcology-ways); what needs the country itself (the arch by the
// brook a placement binds, the town's shrine and its priest) stays there.
const host = `
  Place upland "the moor" is wilderness at 0, 0.
  Place below "below the House" is room within upland at 0, 0 outdoors.
  Place town "Hythe" is settlement.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place taproom "the taproom" is room within town at 1, 0.
  Place shrine "the shrine" is room within town at 0, 1.
  Person innkeeper "Mag" at taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Company party "You" of 1 at green.`;
class House {
  static a(x: string) { return x === 'party' || x.includes('__') ? x : `arcology__${x}`; }
  static is(j: Journey, rel: string, ...args: string[]) { return j.holds(rel, ...args.map(x => this.a(x))); }
  static n(j: Journey, rel: string, ...args: string[]) { return j.measure(rel, ...args.map(x => this.a(x))); }
  static async at(room: string, calling = 'warrior'): Promise<Journey> {
    const a = await Alone.start({ id: 'arcology', bundle: '../../data/situations/arcology/module.json', host,
      exports: ['upland', 'below', 'green', 'shrine', 'innkeeper', 'taproom'],
      imports: { land: 'upland', outside: 'below', gossip: 'green', shrine: 'shrine', keeper: 'innkeeper',
        first_taproom: 'taproom', first_keeper: 'innkeeper' },
      party: [{ name: 'Mira', raceId: 'human', classId: calling }] });
    expect([a.costs.region, a.costs.world]).toEqual([undefined, undefined]);
    Placed.at(a.journey, `arcology__${room}`);
    return a.journey;
  }
}

describe('the Numbered House alone: its ways round the Count', () => {
  it('lets one who can climb go up the Ledge, past the Lodge and the Usher, to the Terrace by the narrow stair', async () => {
    const j = await House.at('landing', 'monk');
    await j.play('To the Goat Ledge');
    expect(j.at('party')).toMatch(/ledge$/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
    await j.play('To the Terrace of Tiers');
    expect(j.at('party')).toMatch(/terrace$/);
    expect(House.is(j, 'counted', 'party')).toBe(false);
  });
  it('shows the hull from the Ledge to anyone', async () => {
    const j = await House.at('ledge', 'ranger');
    expect(j.seen()).toMatch(/curved wall of dark metal/);
    await j.play('Wait › A while');
    expect(House.is(j, 'knows', 'party', 'hull_seen')).toBe(true);
  });
  it('counts the company on the Roll, in chalk found at the Landing, and reopens the count', async () => {
    const j = await House.at('landing', 'mage');
    await j.play('Search here', 'a stub of the survey’s chalk: Take');
    Placed.at(j, 'arcology__drawers');
    await j.play('Write the company’s names in the Roll, in chalk');
    expect(House.is(j, 'counted', 'party')).toBe(true);
    expect(House.is(j, 'rolled', 'house')).toBe(true);
    expect(House.n(j, 'hum', 'house')).toBeGreaterThanOrEqual(1);
  });
  it('shows the ring in the sky from the roof', async () => {
    const j = await House.at('ring_walk', 'mage');
    expect(j.seen()).toMatch(/great ring stands on edge/);
    await j.play('Wait › A while');
    expect(House.is(j, 'knows', 'party', 'ring_seen')).toBe(true);
  });
  it('vents the seed-vault before the door is safe: dead air stands behind it until the wheel is turned', async () => {
    const j = await House.at('roots');
    expect(House.is(j, 'state', 'vault_air', 'foul')).toBe(true);
    await j.play('Turn the vent-wheel');
    await j.play('Wait › A while');
    expect(House.is(j, 'state', 'vault_air', 'clean')).toBe(true);
  });
});

describe('the Numbered House alone: the Marshal’s key and the bronze ring', () => {
  it('makes the keepers tolerate whoever holds the key', async () => {
    const j = await House.at('bay', 'thief');
    j.roll('pass');
    await j.play('Draw the winding-key out of the Marshal’s back', 'Wait › A while');
    expect(House.is(j, 'tolerates', 'keepers', 'party')).toBe(true);
    expect(House.is(j, 'tolerates', 'usher', 'party')).toBe(true);
  });
  it('sets the bronze ring by the surveyors’ plate and a lit candle at night, when the sun will not do', async () => {
    const j = await House.at('landing', 'mage');
    await j.play('Search here', 'the surveyors’ signal-plate: Take');
    Placed.at(j, 'arcology__reckoning');
    await j.play('=22:00');
    expect(House.is(j, 'state', 'bronze_ring', 'unset')).toBe(true);
    await j.play('a candle: Light');
    expect(j.offers('Throw lamplight onto the ring’s mark')).toBe(true);
    await j.play('Throw lamplight onto the ring’s mark with the surveyors’ plate');
    expect(House.is(j, 'state', 'disc', 'risen')).toBe(true);
  });
});
