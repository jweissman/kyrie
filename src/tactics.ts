import { Content } from './content';
import type { BattleState, Command } from './model';

export class Tactics {
  static choose(state: BattleState, legal: Command[]): Command {
    const actor = state.combatants.find(f => f.id === state.actor)!;
    const ranked = legal.map(command => {
      const target = state.combatants.find(f => f.id === command.target)!;
      const ability = Content.abilities.find(a => a.id === command.ability)!;
      let score = 0;
      for (const effect of ability.effects) {
        switch (effect.kind) {
          case 'damage': case 'drain': {
            score += 10 + (effect.target === 'enemies' ?
              state.combatants.filter(f => f.team !== actor.team && f.hp > 0).length * 5 : 0);
            score += Math.max(0, 8 - target.hp);
            const type = effect.kind === 'damage' ? effect.damageType : 'necrotic';
            score -= 10 * Content.resistance(target.raceId, type);
            if (command.ability === 'ambush' || command.ability === 'bolt') { score += 5; }
            break;
          }
          case 'heal': score += Math.min(target.maxHp - target.hp, 10) * 3; break;
          case 'revive': score += 40; break;
          case 'remove': score += target.statuses.some(s => s.id === effect.status) ? 20 : 0; break;
          case 'apply':
            if (effect.status === 'stunned') { score += 18; }
            else if (!target.statuses.some(s => s.id === effect.status)) { score += 6; }
            break;
          default: break;
        }
      }
      return { command, score: score - (ability.cost ?? 0) };
    }).sort((a, b) => b.score - a.score);
    if (!ranked[0]) { throw new Error('No legal tactical command'); }
    return ranked[0].command;
  }
}
