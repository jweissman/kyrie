import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';
import type { World } from '../../src/lang/world';

// A way watched after dark says so before a camp is made on it, or the company goes onto it at night (CL-58): cold
// play 7 camped on the road to Gatesend, Weary with one ration, and the hobs' waylay fell on the camp unannounced. It
// is read from the rule itself, while the rest of what it asks holds: a band lying low says nothing.
const road = (low: string, roll = 'dice(clock)') => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place road "the road" is room at 1, 0 outdoors.
  Place hall "the hobs' hall" is room at 2, 0 indoors.
  Passage gate "the yard gate" is door between yard and road.
  Company party "You" of 1 at yard.
  Relation quiet(group).
  Person raiders "the raiding party" at hall {
    Role "raiders". Ancestry goblin. Calling thief. Level 1. Numbers 3. }
  ${low}
  Rule waylay when at(party, road) and dark() and ${roll} <= 4 and at(raiders, hall) and not quiet(raiders)
    says "Shapes rise out of the dark beside the road." { Assert at(raiders, road). Assert assails(raiders, party). }
  Goal false.`;
const acts = (t: Tiny) => [...t.screen.camp, ...t.screen.exits.flatMap(e => e.acts)]
  .flatMap(a => [a, ...a.children ?? []]);

describe('a way watched after dark', () => {
  it('says who lies in wait there on the camp, and on the way onto it at night', async () => {
    const t = await Tiny.start(road(''));
    expect(acts(t).filter(a => a.grave)).toEqual([]);
    await t.perform('wait_for_dark(party)');
    const onto = acts(t).find(a => a.command?.startsWith('go(') && a.command.includes('t__road'));
    expect(onto?.grave).toBe('The raiding party lie in wait by that way after dark, and it is dark.');
    const c = t.campaign as unknown as { world: World; commit(w: World): void };
    // Put on the road, fed (a tiny company carries no rations), as cold play 7 stood with one.
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 't__road') },
      { kind: 'retract', call: ModuleWriter.call('hungry', 'party') }]));
    t.look();
    const camp = acts(t).find(a => a.command?.startsWith('camp('));
    expect(camp?.grave).toBe('The raiding party lie in wait by this way after dark.');
  });
  // The hobs' waylay rolls the band's fortune on the road for the day since OR-1345: read as a roll the same, so the
  // way is said to be watched whatever that day's fortune is.
  it('says who lies in wait there when the band\'s roll is its fortune on the road', async () => {
    const t = await Tiny.start(road('', 'fortune(raiders, road)'));
    await t.perform('wait_for_dark(party)');
    const onto = acts(t).find(a => a.command?.startsWith('go(') && a.command.includes('t__road'));
    expect(onto?.grave).toBe('The raiding party lie in wait by that way after dark, and it is dark.');
  });
  it('says nothing where the band that would lie in wait is lying low', async () => {
    const t = await Tiny.start(road('Initially Assert quiet(raiders).'));
    await t.perform('wait_for_dark(party)');
    expect(acts(t).filter(a => a.grave)).toEqual([]);
  });
});
