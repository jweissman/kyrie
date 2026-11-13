import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

// What the world offers, what a company perceives of it, and what can be done are kept apart (the owner, 11 November):
// beside the taproom, a company perceives someone there who might join it, and can do nothing about it from there; two
// places off, nothing, unless it has a Gregarious reach (three places: given here as a capability); in the taproom she
// is led with as a companion. Perceiving changes nothing in the world. The rule on a lane of three places;
// test/companion-sensed.test.ts keeps it in a generated country's first town.
const lane = `
  Place stow "Stow" is settlement.
  Place shop "the chandler's" is room within stow at 0, 0.
  Place green "the green" is room within stow at 1, 0 outdoors.
  Place taproom "the taproom of the Bell" is room within stow at 2, 0.
  Passage shop_door "the shop door" is door between shop and green.
  Passage bell_door "the Bell's door" is door between green and taproom.
  Company party "You" of 1 at green.
  Person ysolde "Ysolde" at taproom { Role "a traveller with a pack". Ancestry human. Peaceable. Pronouns she. }
  Topic ysolde_come with ysolde "Ask Ysolde whether she would come along" when true once {
    Says "'Far enough to see the river,' says Ysolde.".
    On discuss { Assert willing(ysolde, actor). }
  }
  Goal false.`;
const facts = (t: Tiny) => JSON.stringify(['willing', 'travelsWith'].map(r => t.world.related(r)))
  + t.world.one('at', 't__ysolde');

describe('a companion perceived, on a lane of three', () => {
  it('one place off, as a way to look, never as the act; not two places off; and there, led with', async () => {
    const t = await Tiny.start(lane), world = facts(t);
    expect(t.glance.sensed).toEqual([{ to: 't__taproom', aspect: 'companionship', far: 1 }]);
    expect(t.glance.acts.some(a => a.aspects.includes('companionship'))).toBe(false);
    t.journey.put('party', 't__shop');
    expect(t.look().glance.sensed).toBeUndefined();
    t.journey.put('party', 't__taproom');
    const her = t.look().glance.acts.find(a => a.subject === 't__ysolde');
    expect(her?.why).toBe('companion');
    expect(her?.aspects).toContain('companionship');
    expect(facts(t)).toBe(world);
  });
  it('three places off for a Gregarious company', async () => {
    const t = await Tiny.start(lane), world = facts(t);
    t.journey.put('party', 't__shop');
    t.campaign.commitWorld(t.world.apply([{ kind: 'assert', call: ModuleWriter.call('capable', 'party', 'gregarious') }]));
    expect(t.look().glance.sensed).toEqual([{ to: 't__green', aspect: 'companionship', far: 2 }]);
    expect(facts(t)).toBe(world);
  });
});
