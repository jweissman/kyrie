import { FictionalTime } from '../presentation/fictional-time';
import { Content } from '../content';
import type { BattleState, CombatEvent } from '../model';

export class CombatPresenter {
  static format(event: CombatEvent, state: BattleState): string {
    const actor = 'actor' in event ? state.combatants.find(f => f.id === event.actor)?.name ?? event.actor : '';
    const target = 'target' in event ? state.combatants.find(f => f.id === event.target)?.name ?? event.target : '';
    switch (event.type) {
      case 'action': {
        const name = state.combatants.find(f => f.id === event.command.actor)?.name ?? event.command.actor;
        const ability = Content.abilities.find(a => a.id === event.command.ability)?.name ?? event.command.ability;
        if (event.source?.kind === 'trap') { return `${event.source.name ?? ability} triggers.`; }
        return `${name} uses ${event.source?.kind === 'item' ? event.source.name ?? ability : ability}.`;
      }
      case 'damage': {
        const m = event.modifiers;
        const adjustment = `${m?.critical ? `, critical ×${m.critical}` : ''}${m?.halfSave ? ', save halves' : ''}`;
        const calculation = m ? `roll ${event.rolled}${adjustment}, power ${m.power >= 0 ? '+' : ''}${m.power}, `
          + `resistance ${Math.round(m.resistance * 100)}%, armor ${m.armor}${m.guarding ? ', guarding halves' : ''}`
          : `roll ${event.rolled}`;
        return `${target} takes ${event.amount} ${event.damageType ?? ''} damage (${event.hp} HP; ${calculation}).`;
      }
      case 'heal': return `${target} recovers ${event.amount} HP (${event.hp} HP).`;
      case 'death': return `${actor} falls.`;
      case 'defend': return `${actor} guards.`;
      case 'skip': return `${actor} cannot act.`;
      case 'attack': return `${actor} ${event.success ? event.critical ? 'critically hits' : 'hits' : 'misses'} ${target} `
        + `(d20 ${event.die} + ${event.modifier} against ${event.defense}).`;
      case 'save': return `${target} ${event.success ? 'passes' : 'fails'} the ${event.stat ?? ''} save `
        + `(${event.die === undefined ? event.rolled : `${event.die} + ${event.modifier} = ${event.rolled}`} `
        + `against ${event.difficulty}).`;
      case 'status': return `${target} gains ${event.detail} `
        + (event.clock === 'until-removed' ? 'until removed.' : event.clock === 'world-time'
          ? `for ${FictionalTime.duration(event.amount ?? 0)}.` : `for ${event.amount ?? 0} turns.`);
      case 'remove': return `${target} loses ${event.detail}.`;
      case 'expire': return `${target}'s ${event.detail} expires.`;
      case 'revive': return `${target} returns with ${event.amount ?? 0} HP.`;
      case 'gain': return event.amount === undefined ? `${target}: ${event.detail}.` : `${target} gains ${event.amount} ${event.detail}.`;
      case 'learn': return `${target} learns ${event.detail}.`;
      case 'summon': return `${actor} calls a companion.`;
      case 'travel': return `${actor} travels to ${event.detail}.`;
      case 'end': return event.outcome === 'fighters' ? 'Your company wins the encounter.' :
        event.outcome === 'goblins' ? 'The opposition wins the encounter.' :
          event.outcome === 'escaped' ? 'Your company withdraws from the encounter.' : 'The encounter ends without a victor.';
    }
  }
}
