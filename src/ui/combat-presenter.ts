import { FictionalTime } from '../campaign/fictional-time';
import voiced from '../../data/voice/conditions.json';
import { Content } from '../content';
import { Canon } from '../canon/canon';
import type { BattleState, CombatEvent } from '../model';
import { ItemCatalog } from '../item-catalog';
import { ItemNames } from '../item-names';
import { Counted } from '../presentation/counted';
import { DefenseTelling } from './defense-telling';

export class CombatPresenter {
  // A condition's own words for starting or running out ("{target} holds up a light."), if it has them.
  // In the condition's own words, else the voice table's (data/voice/conditions.json): never its name and duration
  // ("Hild gains inspired for 3h": the cold playtest, CO-10).
  static told(id: string, when: 'begins' | 'ends'): string | undefined {
    const resolved = Canon.resolve('conditions', id), voice = voiced.conditions as Record<string, Record<string, string>>;
    return Canon.conditions[resolved]?.[when] ?? voice[resolved]?.[when] ?? voice[id]?.[when];
  }
  // The dice behind a blow, for the chronicle: the roll, then each adjustment. A foe's hit points are not said: how it
  // stands is told in words on its card (the owner, 7 November); only one of the company's is counted here.
  private static damage(event: Extract<CombatEvent, { type: 'damage' | 'heal' }>, target: string,
    foe: boolean): string {
    const m = event.modifiers;
    const parts = m ? [m.critical ? `critical +${m.critical}` : '', m.halfSave ? 'save halves' : '',
      m.bonus ? `bonus ${m.bonus >= 0 ? '+' : ''}${m.bonus}` : '',
      // Said as what it is, not as the engine's fraction ("resistance -100%": the second fresh playtest, M19-121).
      m.resistance ? m.resistance > 0 ? m.resistance >= 1 ? 'no harm to it' : `${Math.round(m.resistance * 100)}% resisted`
        : m.resistance <= -1 ? 'double, it is vulnerable' : `${Math.round(-m.resistance * 100)}% more, it is vulnerable` : '', m.reduction ? `reduction ${m.reduction}` : '',
      m.absorbed ? `${m.absorbed} absorbed` : '', ...DefenseTelling.detail(event)].filter(Boolean) : [];
    // A killing blow is told by its weight ("for 13"); what it took beyond what was left is said, so that the two agree
    // (round 10, both players: "for 13" over "takes 1 slashing damage (roll 13)").
    const spent = event.type === 'damage' && event.hp === 0 && event.amount < event.rolled + (m?.bonus ?? 0)
      && !m?.resistance && !m?.reduction && !m?.absorbed;
    const calculation = [`roll ${event.rolled}`, ...parts, ...spent ? [`${event.amount} was all it had left`] : []].join(', ');
    return `${target} takes ${event.amount} ${event.damageType === 'true' ? '' : event.damageType ?? ''} damage (${foe ? '' : `${event.hp} HP; `}${calculation}).`;
  }
  // A mending, or a regeneration stopped (the fire that stopped it, said as what it is).
  private static healed(event: Extract<CombatEvent, { type: 'damage' | 'heal' }>, target: string, foe: boolean): string {
    if (event.stoppedBy) { return `${target}: ${DefenseTelling.detail(event).join(', ')}.`; }
    return `${target} recovers ${event.amount} HP${foe ? '' : ` (${event.hp} HP)`}.`;
  }
  // Two or more of a thing given are said as many ("2 flasks of lamp oil"), a thing's name being capitalised as the
  // catalog has it; a count of something else (experience, spell slots) as it is.
  private static counted(event: { detail?: string; amount?: number }): string {
    const what = event.detail ?? '';
    return (event.amount ?? 0) > 1 && /^[A-Z]/.test(what) ? Counted.plural(`${what.charAt(0).toLowerCase()}${what.slice(1)}`)
      : what;
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
    const terms = [`${event.stat} ${event.modifier}`, ...event.trained ? [`${event.skill} ${event.trained}`] : [],
      ...event.tool && event.using ? [`${ItemCatalog.get(event.using).name.toLowerCase()} ${event.tool}`] : []];
    if (event.unrolled) {
      return `${actor} ${event.success ? 'needs no luck for it' : 'has no chance of it'} (${event.skill}: `
        + `${event.success ? 'at worst' : 'at best'} ${event.rolled} against ${event.difficulty}).`;
    }
    return `${actor} ${event.success ? 'makes' : 'fails'} the ${event.skill} check (${[`d20 ${event.die}`, ...terms]
      .join(' + ')} = ${event.rolled} against ${event.difficulty}).`;
  }
  private static foe(event: { target: string }, state: BattleState): boolean {
    return state.combatants.find(f => f.id === event.target)?.team === 'goblins';
  }
  // dice: whether a blow's rolls are said ("rolled 5, needed 14"): the chronicle's, not a scene's (see blows in
  // ActionFeedbackView: a flight had been told with them).
  static format(event: CombatEvent, state: BattleState, dice = true): string {
    const known = [...state.combatants, ...state.departed ?? []];
    const actor = 'actor' in event ? known.find(f => f.id === event.actor)?.name ?? event.actor : '';
    const target = 'target' in event ? known.find(f => f.id === event.target)?.name ?? event.target : '';
    switch (event.type) {
      case 'action': {
        const name = state.combatants.find(f => f.id === event.command.actor)?.name ?? event.command.actor;
        const ability = Content.abilities.find(a => a.id === event.command.ability)?.name ?? event.command.ability;
        if (event.source?.kind === 'trap') { return `${event.source.name ?? ability} triggers.`; }
        // A blow is told by its hit or miss, not as "uses Melee Attack" before it (register M19-121).
        if (['melee', 'ranged'].includes(event.command.ability) && !event.source) { return ''; }
        const carried = event.source?.kind === 'item' && ItemCatalog.used(event.command.ability);
        return `${name} uses ${carried ? ItemNames.called(event.source!.name ?? ability)
          : event.source?.kind === 'item' ? event.source.name ?? ability : ability}.`;
      }
      case 'damage': return this.damage(event, target, this.foe(event, state));
      case 'heal': return this.healed(event, target, this.foe(event, state));
      case 'death': return `${actor} falls.`;
      case 'defend': return `${actor} guards.`;
      case 'intercept': return `${actor} steps in front of ${target} and takes it.`;
      case 'windup': return `${actor} ${event.detail}, ready to strike ${target} next turn.`;
      case 'interrupt': return `${actor} loses the ${event.detail.toLowerCase()} it was gathering.`;
      case 'skip': return `${actor} cannot act.`;
      case 'random': return `${actor} is not in their right mind, and does whatever comes first.`;
      case 'attack': return `${actor} ${event.success ? event.critical ? 'critically hits' : 'hits' : event.evaded
        ? 'is evaded by' : 'misses'} ${target}${dice ? ` (rolled ${event.die}, needed ${event.need})` : ''}.`;
      case 'flee': return event.success ? `${actor} gets away.` : `${actor} tries to get away, and cannot.`;
      case 'initiative': return `Initiative: ${event.order.map(o => `${state.combatants.find(f => f.id === o.id)?.name ?? o.id}`
        + ` ${o.roll}`).join(', ')}.`;
      // A foe's death save is nothing to the player ("the rat fails the death save … against 25": the owner, 8
      // November).
      case 'save': return event.kind === 'death' && this.foe(event, state) ? '' : this.save(event, target);
      case 'check': return this.check(event, actor);
      case 'status': if (this.told(event.detail, 'begins')) { return this.told(event.detail, 'begins')!.replace('{target}', target); }
        return `${target} gains ${event.detail} `
        + (event.clock === 'until-removed' ? 'until removed.' : event.clock === 'world-time'
          ? `for ${FictionalTime.duration(event.amount ?? 0)}.` : `for ${event.amount ?? 0} turns.`);
      case 'remove': return `${target} loses ${event.detail}.`;
      case 'expire': return this.told(event.detail, 'ends')?.replace('{target}', target) ?? `${target}'s ${event.detail} expires.`;
      // One beaten in a bout to yielding gets up again, beaten (see Morale).
      case 'revive': return event.detail === 'comes round' ? `${target} comes round, with ${event.amount ?? 0} HP.`
        : event.detail === 'yields' ? `${target} is beaten, and yields.` : `${target} returns with ${event.amount ?? 0} HP.`;
      case 'gain': return event.amount === undefined ? `${target}: ${event.detail}.`
        : event.detail?.startsWith('level ') ? `${target} reaches ${event.detail} (+${event.amount} HP).`
          // One thing taken into the hands ("Ivo gains 1 the deeds of the held", "Ama gains 1 Davy's red coat") is a
          // thing taken, not a count gained.
          : event.amount === 1 && event.detail !== 'experience' && /^(the|a|an) |\w['’]s /i.test(event.detail ?? '')
            ? `${target} takes ${event.detail}.` : `${target} gains ${event.amount} ${this.counted(event)}.`;
      // By the ability's name, never its id ("Krex learns true_sight": round 11, T).
      case 'learn': return `${target} learns ${Content.abilities.find(a => a.id === event.detail)?.name ?? event.detail}.`;
      case 'summon': return `${actor} calls ${event.detail}.`;
      case 'dismiss': return `${event.detail} goes back whence it came.`;
      case 'react': return `${actor} answers ${target}.`;
      case 'travel': return `${actor} travels to ${event.detail}.`;
      // In the page's words, not the engine's ("Your company withdraws from the encounter": play 7).
      case 'end': return event.outcome === 'fighters' ? 'The fight is won.' :
        event.outcome === 'goblins' ? event.reason === 'yielded' ? 'You are beaten, and yield.' : 'The fight is lost.' :
          event.outcome !== 'escaped' ? 'The fight ends with neither side the better.'
            : event.fled?.team === 'goblins'
              ? `${state.combatants.find(f => f.id === event.fled!.actor)?.name ?? event.fled.actor} flees the fight.`
              : 'You are clear of the fight.';
    }
  }
}
