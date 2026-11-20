import { describe, expect, it } from 'bun:test';
import { Alone } from '../support/alone';
import type { Journey } from '../../src/session/journey';

// The King's Players go with a line (WM-09, split from WM-01; Mission 20's R4-E: "they leave without a line"): freed,
// they go out on the west road at first light, told in the town, and gone then, in sight of the company or not; the
// green told as empty only once it is. The players' going-on alone on a host of a few lines (see Alone).
const host = `
  Place town "Hythe" is settlement.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place taproom "the taproom" is room within town at 1, 0.
  Place shrine "the shrine" is room within town at 0, 1.
  Person keeper "Mag" at taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Person priest "Father Ned" at shrine { Role "the priest". Ancestry human. Peaceable. Pronouns he. }
  Person trader "Wat" at green { Role "a merchant". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at green.`;
const going = 'goes out of Hythe on the west road';
class Players {
  static async start(): Promise<Journey> {
    const a = await Alone.start({ id: 'players', bundle: '../../data/goings-on/players/module.json', host,
      exports: ['town', 'green', 'keeper', 'priest', 'trader'],
      imports: { town: 'town', green: 'green', keeper: 'keeper', priest: 'priest', trader: 'trader' } });
    a.journey.assert('reckoned', 'gosse');
    return a.journey;
  }
}

describe('the players freed', () => {
  it('go out on the west road at first light before the company on the green, with a line, and are gone', async () => {
    const j = await Players.start();
    const told = await j.play('Wait › Until dark', 'Wait › Until first light');
    expect(told).toContain(going);
    expect(j.holds('gone', 'gosse')).toBe(true);
    expect(j.at('gosse')).toBeUndefined();
    expect(j.at('wagon')).toBeUndefined();
    expect(j.seen()).toContain('wheel-ruts');
  });
  it('are told going to a company elsewhere in the town', async () => {
    const j = await Players.start();
    j.put('party', 'taproom');
    expect(await j.play('Wait › Until dark', 'Wait › Until first light')).toContain(going);
    expect(j.at('gosse')).toBeUndefined();
  });
});
