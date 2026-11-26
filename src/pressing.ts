import type { Battle } from './battle';
import type { Command } from './model';
import { Tactics } from './tactics';
import { PressOn } from './press-on';

// A client's pressing on through its fights: each fight's rule kept from when it was first pressed on, so that what it
// has said it does not say again when pressed on once more.
export class Pressing {
  private readonly rules = new WeakMap<Battle, PressOn>();
  // Why the last turn asked of it was handed back, if it was.
  halted?: string;
  halt(battle: Battle, called?: ReadonlyMap<string, string>): string | undefined {
    const rule = this.rules.get(battle) ?? PressOn.from(battle.view);
    this.rules.set(battle, rule);
    return rule.halt(battle, called);
  }
  // This turn of the company's, pressing on: fought by its own tactics with what uses up nothing carried, or handed
  // back with why. Not pressing on, it is the player's.
  next(battle: Battle, pressing: boolean, called?: ReadonlyMap<string, string>):
    { command?: Command; halted?: string } {
    const halted = pressing ? this.halt(battle, called) : undefined;
    this.halted = halted;
    return !pressing || halted ? { ...halted ? { halted } : {} }
      : { command: Tactics.choose(battle.state, battle.plain(battle.legalCommands())) };
  }
}
