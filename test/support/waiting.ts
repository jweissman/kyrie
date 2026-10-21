import type { Battle } from '../../src/battle';
import type { Command } from '../../src/model';

// A creature standing by in a test: it defends, or, with defend still recharging (a veteran acts twice a turn), does
// something to itself, so that nothing but the creature under test changes the fight.
export class Waiting {
  static turn(battle: Battle): Command {
    const legal = battle.legalCommands();
    return legal.find(c => c.ability === 'defend') ?? legal.find(c => c.target === c.actor) ?? legal[0]!;
  }
}
