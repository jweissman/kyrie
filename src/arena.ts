import { Content } from './content';
import { Battle } from './battle';
import type { Controller, Scenario } from './model';

export { Battle } from './battle';
export type * from './model';

export class Arena {
  static create(seed: string): Scenario {
    const content = new Content(`${seed}:generation`);
    return { id: 'two-versus-two', abilities: structuredClone(Content.abilities), combatants: [
      content.character('fighter', 'fighters-1', 'fighters'),
      content.character('fighter', 'fighters-2', 'fighters'),
      content.creature('goblin', 'goblins-1', 'goblins'),
      content.creature('goblin', 'goblins-2', 'goblins'),
    ] };
  }
  static aggressive: Controller = (state, legal) => {
    const attacks = legal.filter(c => c.ability === 'attack');
    attacks.sort((a, b) => state.combatants.find(f => f.id === a.target)!.hp
      - state.combatants.find(f => f.id === b.target)!.hp);
    const command = attacks[0] ?? legal[0];
    if (!command) { throw new Error('Controller has no legal actions'); }
    return command;
  };
  static simulate(scenario: Scenario, seed: string, controller: Controller = Arena.aggressive, maxTurns = 500) {
    const battle = new Battle(scenario, seed, maxTurns);
    const commands = [];
    while (!battle.state.outcome) {
      const command = controller(battle.state, battle.legalCommands());
      battle.step(command);
      commands.push({ ...command });
    }
    return { state: battle.state, events: battle.events, commands };
  }
  static batch(count = 1000, seed = 'arena') {
    if (!Number.isSafeInteger(count) || count < 1) { throw new Error('Battle count must be a positive integer'); }
    const wins = { fighters: 0, goblins: 0, draw: 0, escaped: 0 };
    let turns = 0, survivors = 0, remainingHp = 0;
    for (let i = 0; i < count; i++) {
      const encounterSeed = `${seed}:${i}`;
      const result = Arena.simulate(Arena.create(encounterSeed), encounterSeed);
      wins[result.state.outcome!]++;
      turns += result.state.turn;
      survivors += result.state.combatants.filter(f => f.hp > 0).length;
      remainingHp += result.state.combatants.reduce((sum, f) => sum + f.hp, 0);
    }
    return { count, seed, wins, fighterWinRate: wins.fighters / count, meanTurns: turns / count,
      meanSurvivors: survivors / count, meanRemainingHp: remainingHp / count };
  }
}
export const createArena = Arena.create;
export const aggressive = Arena.aggressive;
export const simulate = Arena.simulate;
export const batch = Arena.batch;
