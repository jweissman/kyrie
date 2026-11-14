import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A question asked and answered is not what its asker is led for again (the coordinator's household walk, 15
// November: "Ask Wat about Father" asked, answered, and still the kitchen's first act). Kin led for the company's own
// errand are led for the next thing to ask them, or not for a question at all.
const kitchen = `
  Place kitchen "the kitchen" is room at 0, 0 indoors.
  Company party "You" of 1 at kitchen.
  Person brother "Wat" at kitchen { Role "your brother". Ancestry human. Peaceable. Pronouns he. }
  Initially Assert kin(party, brother).
  Topic father with brother "Ask Wat about Father" when true {
    Says "'He took the cart to the fair at Brough,' says Wat.".
  }
  Topic cart with brother "Ask Wat about the cart" when true {
    Says "'It came back on its own,' says Wat.".
  }
  Goal false.`;

describe('a question asked and answered', () => {
  it('is no longer what its asker is led for: the next question is', async () => {
    const t = await Tiny.start(kitchen);
    const wat = () => t.glance.acts.find(a => a.subject === 't__brother');
    expect(wat()?.for).toBe('t__father');
    await t.perform('t__father');
    expect(wat()?.for).toBe('t__cart');
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
});
