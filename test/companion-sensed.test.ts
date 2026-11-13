import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';
import { Glanced } from './support/glanced';

// What the world offers, what a company perceives of it, and what can be done are kept apart (the owner, 11 November).
// In one world, unchanged, the traveller at Thornhaven's inn could join the company. Where the company stands beside
// the inn, it perceives someone who might join it that way, and can do nothing about it from there; two places off it
// perceives nothing, unless it has a Gregarious reach (three places: a perk not yet in the game, given here as a
// capability); at the inn, she is led with as a companion, with what else she is.
class Inn {
  static async start() {
    return DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }],
      standing: [] },
      NodeBundleSource.shared);
  }
  static put(c: Campaign, place: string) {
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  static facts(c: Campaign): string {
    return JSON.stringify(['willing', 'at', 'travelsWith'].map(r => c.world.related(r).filter(x => x.args[0] !== 'party')));
  }
}

describe('a companion perceived', () => {
  it('one place off, as a way to look, never as the act; not two places off; and at the inn, led with', async () => {
    const s = await Inn.start(), c = s.campaign, world = Inn.facts(c);
    Inn.put(c, 'region__s1_green');
    let g = Glanced.of(s);
    // And someone at the shrine, since the adventure branch's integration (12 November).
    expect(g.glance.sensed).toEqual([{ to: 'region__s1_shrine', aspect: 'companionship', far: 1 },
      { to: 'region__s1_taproom', aspect: 'companionship', far: 1 }]);
    expect(g.glance.acts.some(a => a.aspects.includes('companionship'))).toBe(false);
    Inn.put(c, 'region__s1_shop');
    expect(Glanced.of(s).glance.sensed).toBeUndefined();
    Inn.put(c, 'region__s1_taproom');
    g = Glanced.of(s);
    const her = g.glance.acts.find(a => a.subject === 'region__s1_traveller');
    expect(her?.why).toBe('companion');
    expect(her?.aspects).toContain('companionship');
    // Companionship alone: being someone about the place is no aspect of its own (the owner, 14 November: no pip for
    // personhood), where it had been drawn as companionship and exploration at once.
    expect(her!.aspects).toEqual(['companionship']);
    expect(Inn.facts(c)).toBe(world);
  }, 120000);
  it('three places off for a Gregarious company, in the same world', async () => {
    const s = await Inn.start(), c = s.campaign, world = Inn.facts(c);
    Inn.put(c, 'region__s1_shop');
    expect(Glanced.of(s).glance.sensed).toBeUndefined();
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('capable', 'party', 'gregarious') }]));
    expect(Glanced.of(s).glance.sensed).toEqual([{ to: 'region__s1_green', aspect: 'companionship', far: 2 }]);
    expect(Inn.facts(c)).toBe(world);
  }, 120000);
});
