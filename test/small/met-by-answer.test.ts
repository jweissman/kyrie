import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Someone who has answered something put to them has been met (cold play 5, CL-36): Gek gave her job and her key to
// a question asked before any greeting, and spoken to next said "'I don't know you,' says Gek, and waits to be told
// why she should."
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person gek "Gek" at yard { Role "merchant". Ancestry human. Peaceable. Pronouns she. Manner proud. }
  Entity job: fact "Gek wants the rats gone.".
  Topic job_ask with gek "Ask Gek about the rats" when true once {
    Says "'Kill them,' says Gek, and gives you her key.". On discuss { Assert knows(actor, job). }
  }
  Goal false.`;
describe('someone met by an answer', () => {
  it('is spoken to as someone already met', async () => {
    const t = await Tiny.start(yard, { horizon: [] });
    await t.perform('t__job_ask');
    await t.perform('talk_to(t__gek)');
    // A proud one met before (address.again.proud), not "I don't know you" (address.first.proud.2).
    expect(JSON.stringify(t.leaf)).toContain('Gek acknowledges you with the smallest movement of the chin.');
  });
});
