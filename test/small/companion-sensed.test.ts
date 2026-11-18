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
    expect(t.glance.sensed).toEqual([{ to: 't__taproom', aspect: 'companionship', far: 1, who: 't__ysolde' }]);
    // Only a way there says so (the Go mark's companion is on its row: the owner, 17 November), never an asking.
    expect(t.glance.acts.filter(a => a.aspects.includes('companionship')).every(a => !!a.exit)).toBe(true);
    expect(t.glance.lenses!.places.aspects).toContain('companionship');
    expect(t.glance.lenses!.places.promoted.filter(p => p.aspects.includes('companionship')).every(p => !!p.exit)).toBe(true);
    // And the way's row says who (the owner, 17 November: the lens's companion icon had no one on its rows): someone,
    // until the company knows her; then Ysolde.
    const row = () => t.look().glance.lenses!.places.promoted.find(p => p.aspects.includes('companionship'))?.note;
    expect(row()).toBe('someone who might go with you');
    t.campaign.commitWorld(t.world.apply([{ kind: 'assert', call: ModuleWriter.call('acquainted', 't__ysolde', 'party') }]));
    expect(row()).toBe('Ysolde, who might go with you');
    t.journey.put('party', 't__shop');
    expect(t.look().glance.sensed).toBeUndefined();
    t.journey.put('party', 't__taproom');
    const her = t.look().glance.acts.find(a => a.subject === 't__ysolde');
    expect(her?.why).toBe('companion');
    expect(her?.aspects).toContain('companionship');
    expect(facts(t)).toBe(world);
  });
  // And it follows the world as it changes (the owner, 17 November, FM-05: an icon must be something the player can
  // find and act on): once she is no longer in the taproom, its way promises no one, and the way to where she is now
  // does, by her row.
  it('follows her: the way she left promises no one, the way to where she is, her', async () => {
    const t = await Tiny.start(lane);
    t.journey.put('t__ysolde', 't__shop');
    t.look();
    const g = t.glance, row = (to: string) => g.lenses!.places.promoted.find(p => p.choice.includes(to));
    expect(g.sensed?.map(x => x.to)).toEqual(['t__shop']);
    expect(row('t__taproom')?.aspects.includes('companionship') ?? false).toBe(false);
    expect(row('t__shop')?.note).toBe('someone who might go with you');
  });
  it('three places off for a Gregarious company', async () => {
    const t = await Tiny.start(lane), world = facts(t);
    t.journey.put('party', 't__shop');
    t.campaign.commitWorld(t.world.apply([{ kind: 'assert', call: ModuleWriter.call('capable', 'party', 'gregarious') }]));
    expect(t.look().glance.sensed).toEqual([{ to: 't__green', aspect: 'companionship', far: 2, who: 't__ysolde' }]);
    expect(facts(t)).toBe(world);
  });
});
