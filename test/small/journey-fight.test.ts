import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Tactics } from '../../src/tactics';
import type { Battle } from '../../src/battle';

// A fight met on a journey is the player's to fight: a journey (travel:) had handed each leg to the automatic
// controller, so Wynn struck at Tenebraetumulo's door and the fight was won with no choice put (M21's playability
// list, PL-02). A verge, and rats on the green that go for whoever comes there.
const byre = `
  Place vale "the vale" is settlement.
  Place verge "the verge" is room within vale at 0, 0 outdoors.
  Place green "the green" is room within vale at 1, 0 outdoors.
  Passage lane "the lane" is path between verge and green.
  Company party "You" of 1 at verge.
  Person rats "the rats" at green {
    Role "rats in the long grass". Species rat. Numbers 2. Level 1. Temperament ambush. Lair green.
  }
  Goal false.`;
class Player {
  static asked = 0;
  static async fight(battle: Battle) { Player.asked++; return Tactics.choose(battle.state, battle.legalCommands()); }
}
describe('a journey that ends in a fight', () => {
  it('puts the fight to the controller the journey was set out with', async () => {
    const t = await Tiny.start(byre);
    const event = await t.session.leg('travel:t__green', Player.fight.bind(Player));
    expect(t.session.journeyed?.legs.map(l => l.said)).toEqual(['Take the lane to the green']);
    expect(event.combat.some(e => e.type === 'end')).toBe(true);
    expect(Player.asked).toBeGreaterThan(0);
  });
});
