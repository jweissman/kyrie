import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A place gone through doing nothing is not led back to (CompanyRecall.idle), unless what the aim followed asks is to
// be done there: a curious walker in the laboratory went twice into Mik's shop without asking him about the rats, and
// from the chapel nothing led back to Mik for the rest of the walk (the laboratory's lost turns, Gate 1).
const town = `
  Place town "Lowmouth" is settlement.
  Place green "the landing" is room within town at 1, 0 outdoors.
  Place shop "Mik's salt-house" is room within town at 0, 0 indoors.
  Place chapel "the chapel" is room within town at 2, 0 indoors.
  Passage shop_door "the shop door" is door between green and shop.
  Passage chapel_door "the chapel door" is door between green and chapel.
  Company party "You" of 1 at green.
  Person mik "Mik" at shop { Role "a salter". Ancestry human. Peaceable. Pronouns he. }
  Entity rats: fact "Rats in the corn-store.". Relation asked(group).
  Topic rats_ask with mik "Ask Mik about the rats" when not asked(actor) once {
    Says "'Rats,' says Mik.". On discuss { Assert asked(actor). }
  }
  Objective job when not asked(party) toward mik "Ask Mik about the rats.".
  Goal false.`;

describe('a place gone through doing nothing', () => {
  it('is led back to where the aim followed is to be done there', async () => {
    const t = await Tiny.start(town);
    t.follow('job');
    for (let n = 0; n < 2; n++) {
      await t.perform('go(t__shop_door,t__shop)');
      await t.perform('go(t__shop_door,t__green)');
    }
    await t.perform('go(t__chapel_door,t__chapel)');
    expect(t.gold.map(a => a.label)).toEqual([expect.stringMatching(/landing|salt-house/)]);
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
});
