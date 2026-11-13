import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// What someone could wield is said of the company alone, which equips what it carries (belongings.kyr's equip_item, its
// only reader): said of every creature, it had been three facts in four of a generated world (Mission 21,
// world/construction.md §6). One who joins is said to be able to wield what they can; one who has not joined is not.
const green = `
  Place green "the green" is room outdoors.
  Company party "You" of 1 at green.
  Person wenna "Wenna" at green { Role "a girl with a bow". Ancestry human. Peaceable. Pronouns she. }
  Topic wenna_come with wenna "Ask Wenna whether she would come along" when true once {
    Says "'If you're going past the mill,' says Wenna, 'I'm coming.'".
    On discuss { Assert willing(wenna, actor). }
  }
  Observe green_scene at green when true "A green.".
  Goal false.`;
const wields = (t: Tiny) => [...new Set(t.world.related('proficient').map(f => f.args[0]!))].sort();
// The company's members, and Wenna, by the references the facts name them by.
const company = (t: Tiny) => t.world.related('memberOf').filter(f => f.args[1] === 'party').map(f => f.args[0]!).sort();
const wenna = (t: Tiny) => t.world.related('memberOf').find(f => /wenna/.test(f.args[0]!))!.args[0]!;

describe('what someone could wield', () => {
  it('is said of the company, and of one who joins it, and of no one else', async () => {
    const t = await Tiny.start(green);
    expect(company(t)).toHaveLength(1);
    expect(wields(t)).toEqual(company(t));
    expect(wields(t)).not.toContain(wenna(t));
    await t.play('Talk to Wenna', 'Ask Wenna whether she would come along', '?Take your leave');
    await t.play('Ask Wenna to join the company');
    expect(company(t)).toHaveLength(2);
    expect(wields(t)).toEqual(company(t));
    expect(wields(t)).toContain(wenna(t));
  });
});
