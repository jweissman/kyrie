import type { ArenaAbility } from '../lang/parse';
import type { Command } from '../model';
import { Targeting } from '../targeting';
import { Positions } from '../rules/positions';

export interface ActionChoice { ability: ArenaAbility; commands: Command[]; requiresTarget: boolean; scope: string }
export class CombatChoices {
  static actions(legal: Command[], abilities: ArenaAbility[]): ActionChoice[] {
    const choices: ActionChoice[] = [];
    for (const ability of abilities) {
      const commands = legal.filter(command => command.ability === ability.id);
      if (!commands.length) { continue; }
      // An area is aimed too: at where one of the foes stands (see Positions).
      const requiresTarget = ability.effects.some(effect => Targeting.selected(effect.target))
        || !!Positions.area(ability);
      const scopes = [...new Set(ability.effects.map(effect => effect.target))];
      choices.push({ ability, commands, requiresTarget, scope: requiresTarget ? 'choose target' : scopes.join(', ') });
    }
    return choices;
  }
  static target(choice: ActionChoice, id: string): Command {
    const command = choice.commands.find(candidate => candidate.target === id);
    if (!command) { throw new Error('Target is not eligible for the selected action'); }
    return { ...command };
  }
}
