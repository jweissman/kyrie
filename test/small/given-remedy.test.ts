import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import type { CreatureStore } from '../../src/creature-store';

// A remedy the world gives the company later, by its kind (`Give antidote to actor.`), is a remedy: the undertown's
// antidote for the spiders' bite had been offered to be handed round and set down, and never used on the companion
// it was for (review A's T91: T24-17). Only the kinds the company carried from the start had been told they are used
// up (ItemTraits). A taproom, a traveller who joins and gives an antidote, and her poisoned.
const taproom = `
  Place taproom "the taproom of the Bell" is room at 0, 0.
  Company party "You" of 1 at taproom.
  Person ysolde "Ysolde" at taproom { Role "a traveller with a pack". Ancestry human. Peaceable. Pronouns she. }
  Topic come with ysolde "Ask Ysolde to come along" when true once {
    Says "'And you'd best have this,' says Ysolde.". On discuss { Assert willing(ysolde, actor). Give antidote to actor. }
  }
  Goal false.`;

describe('a remedy given', () => {
  it('is offered for the companion it would help', async () => {
    const t = await Tiny.start(taproom);
    await t.play('^Ask Ysolde to come along');
    await t.session.leg(t.journey.choices().find(c => /^recruit\(/.test(c.command))!.command);
    const her = t.campaign.readout.partyIds[1]!, lease = (t.campaign as unknown as { creatures: CreatureStore })
      .creatures.acquire([her]);
    try {
      lease.creatures[0]!.state.conditions = [{ id: 'poisoned', remaining: 600, clock: 'world-time' }];
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    await t.session.leg('wait');
    expect(t.look().journey.choices().map(c => c.command)).toContainEqual(expect.stringMatching(/^use_item\(.*ysolde/));
  });
});
