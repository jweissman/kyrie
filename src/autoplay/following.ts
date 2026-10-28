import type { Battle } from '../battle';
import type { Command } from '../model';
import { Tactics } from '../tactics';

// A fight's recorded choices, followed while they are legal; the game's tactics after.
export class Following {
  private readonly queue: Command[];
  constructor(recorded: Command[]) { this.queue = structuredClone(recorded); }
  readonly next = (battle: Battle): Promise<Command> => {
    const legal = battle.legalCommands(), next = this.queue[0];
    if (next && legal.some(c => c.actor === next.actor && c.ability === next.ability && c.target === next.target)) {
      this.queue.shift();
      return Promise.resolve(next);
    }
    return Promise.resolve(Tactics.choose(battle.state, battle.plain(legal)));
  };
}
