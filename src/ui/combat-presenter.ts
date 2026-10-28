import { FictionalTime } from '../campaign/fictional-time';
import { Content } from '../content';
import { Canon } from '../canon/canon';
import type { BattleState, CombatEvent } from '../model';

export class CombatPresenter {
  // A condition's own words for starting or running out ("{target} holds up a light."), if it has them.
  static told(id: string, when: 'begins' | 'ends'): string | undefined {
    return Canon.conditions[Canon.resolve('conditions', id)]?.[when];
  }
  // The dice behind a blow, for the chronicle: the roll, then each adjustment.
  private static damage(event: Extract<CombatEvent, { type: 'damage' | 'heal' }>, target: string): string {
    const m = event.modifiers;
    const parts = m ? [m.critical ? `critical +${m.critical}` : '', m.halfSave ? 'save halves' : '',
      m.bonus ? `bonus ${m.bonus >= 0 ? '+' : ''}${m.bonus}` : '',
      m.resistance ? `resistance ${Math.round(m.resistance * 100)}%` : '', m.reduction ? `reduction ${m.reduction}` : '',
      m.absorbed ? `${m.absorbed} absorbed` : ''].filter(Boolean) : [];
    const calculation = [`roll ${event.rolled}`, ...parts].join(', ');
    return `${target} takes ${event.amount} ${event.damageType ?? ''} damage (${event.hp} HP; ${calculation}).`;
  }
  private static save(event: Extract<CombatEvent, { type: 'save' }>, target: string): string {
    if (event.immune) { return `${target} is immune (${event.kind}).`; }
    const terms = event.die === undefined ? `${event.rolled}` : [`d20 ${event.die}`, `${event.stat} ${event.modifier}`,
      ...event.level !== undefined ? [`level ${event.level}`] : [], ...event.bonus ? [`bonus ${event.bonus}`] : []]
      .join(' + ') + ` = ${event.rolled}`;
    return `${target} ${event.success ? 'passes' : 'fails'} the ${event.kind ?? event.stat ?? ''} save (${terms} `
      + `against ${event.difficulty}${event.limit ? '; three saves already made' : ''}).`;
  }
  private static check(event: Extract<CombatEvent, { type: 'check' }>, actor: string): string {
    if (!event.actor) { return `None of you can try it (${event.skill}).`; }
    const terms = [`${event.stat} ${event.modifier}`, ...event.trained ? [`${event.skill} ${event.trained}`] : []];
    if (event.unrolled) {
      return `${actor} ${event.success ? 'needs no luck for it' : 'has no chance of it'} (${event.skill}: `
        + `${event.success ? 'at worst' : 'at best'} ${event.rolled} against ${event.difficulty}).`;
    }
    return `${actor} ${event.success ? 'makes' : 'fails'} the ${event.skill} check (${[`d20 ${event.die}`, ...terms]
      .join(' + ')} = ${event.rolled} against ${event.difficulty}).`;
  }
  static format(event: CombatEvent, state: BattleState): string {
    const known = [...state.combatants, ...state.departed ?? []];
    const actor = 'actor' in event ? known.find(f => f.id === event.actor)?.name ?? event.actor : '';
    const target = 'target' in event ? known.find(f => f.id === event.target)?.name ?? event.target : '';
    switch (event.type) {
      case 'action': {
        const name = state.combatants.find(f => f.id === event.command.actor)?.name ?? event.command.actor;
        const ability = Content.abilities.find(a => a.id === event.command.ability)?.name ?? event.command.ability;
        if (event.source?.kind === 'trap') { return `${event.source.name ?? ability} triggers.`; }
        return `${name} uses ${event.source?.kind === 'item' ? event.source.name ?? ability : ability}.`;
      }
      case 'damage': return this.damage(event, target);
      case 'heal': return `${target} recovers ${event.amount} HP (${event.hp} HP).`;
      case 'death': return `${actor} falls.`;
      case 'defend': return `${actor} guards.`;
      case 'intercept': return `${actor} steps in front of ${target} and takes it.`;
      case 'windup': return `${actor} ${event.detail}, ready to strike ${target} next turn.`;
      case 'interrupt': return `${actor} loses the ${event.detail.toLowerCase()} it was gathering.`;
      case 'skip': return `${actor} cannot act.`;
      case 'random': return `${actor} is not in their right mind, and does whatever comes first.`;
      case 'attack': return `${actor} ${event.success ? event.critical ? 'critically hits' : 'hits' : event.evaded
        ? 'is evaded by' : 'misses'} ${target} (d20 ${event.die}, needing ${event.need}: THAC0 less AC ${event.armorClass}`
        + ` less to-hit ${event.toHit}).`;
      case 'flee': return event.success ? `${actor} gets away.` : `${actor} tries to get away, and cannot.`;
      case 'initiative': return `Initiative: ${event.order.map(o => `${state.combatants.find(f => f.id === o.id)?.name ?? o.id}`
        + ` ${o.roll}`).join(', ')}.`;
      case 'save': return this.save(event, target);
      case 'check': return this.check(event, actor);
      case 'status': if (this.told(event.detail, 'begins')) { return this.told(event.detail, 'begins')!.replace('{target}', target); }
        return `${target} gains ${event.detail} `
        + (event.clock === 'until-removed' ? 'until removed.' : event.clock === 'world-time'
          ? `for ${FictionalTime.duration(event.amount ?? 0)}.` : `for ${event.amount ?? 0} turns.`);
      case 'remove': return `${target} loses ${event.detail}.`;
      case 'expire': return this.told(event.detail, 'ends')?.replace('{target}', target) ?? `${target}'s ${event.detail} expires.`;
      case 'revive': return event.detail === 'comes round' ? `${target} comes round, with ${event.amount ?? 0} HP.`
        : `${target} returns with ${event.amount ?? 0} HP.`;
      case 'gain': return event.amount === undefined ? `${target}: ${event.detail}.`
        : event.detail?.startsWith('level ') ? `${target} reaches ${event.detail} (+${event.amount} HP).`
          // One thing taken into the hands ("Ivo gains 1 the deeds of the held") is a thing taken, not a count gained.
          : event.amount === 1 && event.detail !== 'experience' && /^(the|a|an) /i.test(event.detail ?? '')
            ? `${target} takes ${event.detail}.` : `${target} gains ${event.amount} ${event.detail}.`;
      case 'learn': return `${target} learns ${event.detail}.`;
      case 'summon': return `${actor} calls ${event.detail}.`;
      case 'dismiss': return `${event.detail} goes back whence it came.`;
      case 'react': return `${actor} answers ${target}.`;
      case 'travel': return `${actor} travels to ${event.detail}.`;
      // In the page's words, not the engine's ("Your company withdraws from the encounter": play 7).
      case 'end': return event.outcome === 'fighters' ? 'The fight is won.' :
        event.outcome === 'goblins' ? 'The fight is lost.' :
          event.outcome !== 'escaped' ? 'The fight ends with neither side the better.'
            : event.fled?.team === 'goblins'
              ? `${state.combatants.find(f => f.id === event.fled!.actor)?.name ?? event.fled.actor} flees the fight.`
              : 'You are clear of the fight.';
    }
  }
}
