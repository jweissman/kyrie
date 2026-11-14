import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// An opener led with stands for its talk, never a trade (the runner's blind walk, 15 November: TB-04): "Talk to Mik",
// once he had been spoken to, had been done by a headless player as his first reply, a purchase, and the walk bought
// a coil of rope, a torch and rashers of bacon ten times over. A shop with a shopkeeper who sells.
const shop = `
  Place shop "the shop" is room at 0, 0 indoors.
  Company party "You" of 1 at shop.
  Initially Set quantity(party, gold) to 20.
  Person mik "Mik" at shop { Role "a salter". Ancestry human. Peaceable. Pronouns he. Sells torch for 1 coin from 9. }
  Goal false.`;

describe('an opener led with', () => {
  it('stands for its talk, or a question, never a purchase', async () => {
    const t = await Tiny.start(shop);
    await t.perform('talk_to(t__mik)');
    const people = t.glance.lenses.people;
    const talk = [...people.promoted, ...people.rest].find(a => a.subject === 't__mik');
    expect(talk).toBeDefined();
    expect(talk?.command ?? '').not.toMatch(/^buy_/);
  });
});
