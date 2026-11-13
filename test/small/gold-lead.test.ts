import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A place the aim followed names, been to already, is the aim's only while something there would bring the aim about
// with what the company has; otherwise the gold is on the next lead, an act that tells where what the aim waits on is
// to be had (review-mitigations U1, the lead's ruling of 13 November; M21's playability list, PL-13). On Gothgiba's
// waterside the gold had gone back to the fevered child's bailey, with no herbs to give, beside "Ask Harbek where
// willow grows". The fever in miniature (data/goings-on/fever, data/generation/town/errands.kyrt): a mother on the
// green who wants willow bark, a waterman who knows where it grows, and the willows at the ford.
const fever = `
  Place hythe "Hythe" is settlement.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place water "the waterside at Hythe" is room within hythe at 1, 0 outdoors.
  Place ford "the ford below Hythe" is room within hythe at 2, 0 outdoors.
  Passage lane "the lane to the water" is path between green and water.
  Passage bank "the bank path" is path between water and ford.
  Company party "You" of 1 at green.
  Relation dosed(group).
  Person mother "the child's mother" at green {
    Role "the child's mother". Peaceable. Pronouns she. Wants willow_bark.
  }
  Rule dosed_by when keeps(mother, ?i) and not dosed(mother) { Assert dosed(mother). }
  Person waterman "Harbek" at water { Role "a waterman, mending a net". Ancestry human. Peaceable. Pronouns he. }
  Entity willows: fact "Willows grow by the water at the ford: willow bark breaks a fever.".
  Initially Assert leadsTo(willows, ford).
  Topic where_willow with waterman "Ask Harbek where willow grows" when not knows(actor, willows) {
    Says "'There's a good stand at the ford,' says Harbek. 'Strip the bark, not the wood.'".
    On discuss { Assert knows(actor, willows). }
  }
  Thing willow_stand "the willows" at ford is scenery { State growing "Willows lean over the water.". }
  Initially Assert grows(willow_stand).
  Item bark "a strip of willow bark" is willow_bark in willow_stand.
  Initially Assert crop(bark, willow_stand).
  Objective fever when not dosed(mother) toward mother "A child on {green} has a fever; it needs willow bark.".
  Goal false.`;

describe('gold on the next lead', () => {
  it('is on the question that tells where what the aim waits on grows, not on the way back to its place', async () => {
    const t = await Tiny.start(fever);
    await t.follow('fever').play('To the waterside at Hythe');
    const gold = t.glance.acts.filter(a => a.continues);
    expect(gold.map(a => a.subject)).toEqual(['t__waterman']);
    expect(gold[0]!.for).toBe('t__where_willow');
    expect(t.glance.acts.find(a => /green/.test(a.label))?.continues).toBeUndefined();
  });
});
