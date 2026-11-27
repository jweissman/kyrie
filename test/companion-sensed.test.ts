import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
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
  // The one on the green who would come along (AT-08, 19 November) is there unless set aside: the Gregarious reach is
  // measured on the traveller at the inn alone.
  static async start(alone = false) {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }], standing: [] }, NodeBundleSource.shared), c = s.campaign, hand = 'region__s1_u_hand';
    const away = { kind: 'retract' as const, call: ModuleWriter.call('at', hand, c.world.one('at', hand)!) };
    if (alone) { c.commitWorld(c.world.apply([away])); }
    return s;
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
    // Each with the one perceived nearest along it (Sensed.who, which the way's row names: OR-68). Not Anselm at the
    // shrine (perceived since the adventure branch's integration, 12 November): his asking waits on the company's
    // knowing of the wayfarer, and until then nothing there can have him (test/small/aspect-truth, 19 November).
    expect(g.glance.sensed?.every(x => !!x.who)).toBe(true);
    expect(g.glance.sensed?.map(({ who: _, ...x }) => x)).toEqual([
      { to: 'region__s1_taproom', aspect: 'companionship', far: 1 }]);
    // Only a way there says so (the Go mark's companion is on its row: the owner, 17 November), never an asking of
    // someone elsewhere; the hand here on the green is asked here.
    expect(g.glance.acts.filter(a => a.aspects.includes('companionship') && a.subject !== 'region__s1_u_hand')
      .every(a => !!a.exit)).toBe(true);
    expect(g.glance.acts.find(a => a.subject === 'region__s1_u_hand')?.aspects).toContain('companionship');
    expect(g.glance.lenses!.places.aspects).toContain('companionship');
    expect(g.glance.lenses!.places.promoted.filter(p => p.aspects.includes('companionship')).every(p => !!p.exit)).toBe(true);
    // From the salt-house the inn is two places off, and the hand on the green one.
    Inn.put(c, 'region__s1_shop');
    expect(Glanced.of(s).glance.sensed).toEqual([
      { to: 'region__s1_green', aspect: 'companionship', far: 1, who: 'region__s1_u_hand' }]);
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
  it('three places off for a Gregarious company, in the same world, the traveller alone', async () => {
    const s = await Inn.start(true), c = s.campaign, world = Inn.facts(c);
    Inn.put(c, 'region__s1_shop');
    expect(Glanced.of(s).glance.sensed).toBeUndefined();
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('capable', 'party', 'gregarious') }]));
    expect(Glanced.of(s).glance.sensed?.map(({ who: _, ...x }) => x)).toEqual([
      { to: 'region__s1_green', aspect: 'companionship', far: 2 }]);
    expect(Inn.facts(c)).toBe(world);
  }, 120000);
});
