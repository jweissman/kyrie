import { Content } from './content';
import { Effects } from './effects';
import { ItemCatalog } from './item-catalog';
import type { BattleState, Command, Fighter } from './model';

// The automatic controller's choice: score each legal command, take the best. Ties are broken explicitly, never by
// catalog order: first by the position of the ability in the actor's own ability list (its weapon attack last), then by
// the target's identifier.
export class Tactics {
  private static resistance(target: Fighter, type: string): number {
    const r = Effects.modifiers(target).resistances ?? {};
    return (r.all ?? 0) + (r[type] ?? (Content.rules.physicalDamage.includes(type) ? r.physical ?? 0 : 0));
  }
  static score(state: BattleState, command: Command): number {
    const actor = state.combatants.find(f => f.id === command.actor)!;
    const target = state.combatants.find(f => f.id === command.target)!;
    // A thing carried to use up is scored as what using it does (see ItemCatalog.use).
    const ability = Content.abilities.find(a => a.id === command.ability) ?? ItemCatalog.used(command.ability)!;
    let score = 0;
    for (const effect of ability.effects) {
      switch (effect.kind) {
        case 'attack': case 'damage': case 'drain': {
          score += 10 + (effect.target === 'enemies' || effect.target === 'random enemies' ?
            state.combatants.filter(f => f.team !== actor.team && f.hp > 0).length * 5 : 0);
          score += Math.max(0, 8 - target.hp);
          const type = effect.kind === 'attack' ? actor.equipment?.weapon?.type ?? 'bludgeoning'
            : effect.kind === 'damage' ? effect.damageType : effect.damageType ?? 'necrotic';
          score -= 10 * Tactics.resistance(target, type);
          break;
        }
        case 'heal': score += Math.min(target.maxHp - target.hp, 10) * 3; break;
        case 'revive': score += 40; break;
        case 'remove': score += target.statuses.some(s => s.id === effect.status) ? 20 : 0; break;
        case 'apply':
          if (Effects.skips(effect.status)) { score += 18; }
          else if (!target.statuses.some(s => s.id === effect.status)) { score += 6; }
          break;
        default: break;
      }
    }
    return score - (ability.cost ?? 0);
  }
  private static rank(order: string[], command: Command): number {
    const i = order.indexOf(command.ability);
    return i < 0 ? order.length : i;
  }
  // Ties broken by the targets' ids as written, not as the host's language sorts them (a reader in Tallinn saw another
  // enemy struck: the architecture review's H6).
  static order(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
  static choose(state: BattleState, legal: Command[]): Command {
    const actor = state.combatants.find(f => f.id === state.actor)!;
    const order = [...actor.abilities, 'melee', 'ranged'];
    const ranked = legal.map(command => ({ command, score: Tactics.score(state, command) }))
      .sort((a, b) => b.score - a.score || Tactics.rank(order, a.command) - Tactics.rank(order, b.command)
        || Tactics.order(a.command.target, b.command.target));
    if (!ranked[0]) { throw new Error('No legal tactical command'); }
    return ranked[0].command;
  }
}
