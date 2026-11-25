import { describe, expect, it } from 'bun:test';
import { Alone } from '../support/alone';

// What Gosse tells is testimony (OR-423: a topic opens on what the character has been told): a company that has asked
// him what has happened knows the players' trouble, and may pay the keeper their reckoning and ask the town's three
// about the players without first asking each of them what the matter is in the town (Wending Cross, where Gosse's
// Company is played alone, had made it ask). Before he is asked, the town's talk of the players still waits.
const host = `
  Place town "Hythe" is settlement.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place taproom "the taproom" is room within town at 1, 0.
  Place shrine "the shrine" is room within town at 0, 1.
  Person keeper "Mag" at taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Person priest "Father Ned" at shrine { Role "the priest". Ancestry human. Peaceable. Pronouns he. }
  Person trader "Wat" at green { Role "a merchant". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at green.`;
const start = async () => (await Alone.start({ id: 'players', bundle: '../../data/goings-on/players/module.json', host,
  exports: ['town', 'green', 'keeper', 'priest', 'trader'],
  imports: { town: 'town', green: 'green', keeper: 'keeper', priest: 'priest', trader: 'trader' } })).journey;

describe('the players\' trouble told by Gosse', () => {
  it('opens the reckoning and the town\'s talk of the players, which wait until then', async () => {
    const j = await start();
    j.coin(20);
    expect(j.offers('Ask Wat about the players')).toBe(false);
    await j.play('Ask Gosse what has happened');
    expect(j.offers('Ask Wat about the players')).toBe(true);
    j.put('party', 'shrine');
    expect(j.offers('Ask Father Ned about the players')).toBe(true);
    j.put('party', 'taproom');
    expect(j.offers('Ask Mag about the players stuck here')).toBe(true);
    expect(j.offers("Pay Mag the players' reckoning")).toBe(true);
  });
});
