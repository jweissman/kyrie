import { Content } from '../content';
import { ConditionSense } from '../presentation/condition-sense';
import { CombatPresenter } from './combat-presenter';
import type { BattleState, CombatEvent, Fighter } from '../model';

export interface Telling { text: string; detail: string }
type Of<T extends CombatEvent['type']> = Extract<CombatEvent, { type: T }>;
type Harm = Extract<CombatEvent, { type: 'damage' | 'heal' }>;

// A fight as the company sees it: each exchange (someone acts, and what follows from it) told in a sentence or two,
// "Elen hits the boar with the spear, for 4. The boar is bleeding." The dice stay with the exchange, for whoever
// looks closer, and nothing is said that a watcher could not see.
export class CombatTelling {
  static exchanges(events: CombatEvent[], state: BattleState): Telling[] {
    const groups: CombatEvent[][] = [];
    for (const e of events) {
      if (e.type === 'initiative') { continue; }
      if (e.type === 'action' || !groups.length) { groups.push([e]); } else { groups.at(-1)!.push(e); }
    }
    return groups.map(g => this.tell(g, state)).filter(t => t.text);
  }
  private static tell(group: CombatEvent[], state: BattleState): Telling {
    const told = new CombatTelling(state), [first, ...rest] = group;
    const sentences = first?.type === 'action' ? [told.act(first, rest), ...told.after(rest)] : told.after(group);
    return { text: sentences.filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      detail: group.map(e => CombatPresenter.format(e, state)).filter(l => !l.startsWith('Initiative')).join(' ') };
  }
  private constructor(private readonly state: BattleState) {}
  private fighter(id: string): Fighter | undefined {
    return [...this.state.combatants, ...(this.state.departed ?? []) as Fighter[]].find(f => f.id === id);
  }
  // A creature named in a sentence: "a reedbank boar" is "the reedbank boar" once it is in the fight.
  private name(id: string): string { return (this.fighter(id)?.name ?? id).replace(/^an? /, 'the '); }
  private weapon(id: string): string {
    const w = this.fighter(id)?.equipment?.weapon;
    return w ? w.name.toLowerCase() : '';
  }
  // What someone did and how it landed: a blow struck, a shot, an ability used.
  private act(action: Of<'action'>, rest: CombatEvent[]): string {
    const c = action.command, actor = this.name(c.actor);
    if (action.source?.kind === 'trap') { return `${action.source.name ?? 'A trap'} goes off.`; }
    const attack = rest.find((e): e is Of<'attack'> => e.type === 'attack');
    const damage = rest.find((e): e is Harm => e.type === 'damage' && (!attack || e.target === attack.target));
    if ((c.ability === 'melee' || c.ability === 'ranged') && attack) { return this.blow(c.ability, attack, damage); }
    const ability = Content.abilities.find(a => a.id === c.ability)?.name ?? c.ability;
    if (c.ability === 'wait') { return `${actor} waits.`; }
    const target = c.target && c.target !== c.actor ? ` on ${this.name(c.target)}` : '';
    const landed = attack ? attack.success ? `, and it lands${damage ? `, for ${damage.amount}` : ''}` : ', and misses' : '';
    return `${actor} uses ${ability}${target}${landed}.`;
  }
  private blow(kind: string, attack: Of<'attack'>, damage?: Harm): string {
    const actor = this.name(attack.actor), target = this.name(attack.target), weapon = this.weapon(attack.actor);
    const natural = this.fighter(attack.actor)?.equipment?.weapon?.natural;
    const how = natural ? `${actor}'s ${weapon}` : actor;
    if (!attack.success) {
      if (attack.evaded) { return `${target} slips aside from ${natural ? how : `${actor}'s ${weapon || 'blow'}`}.`; }
      return natural ? `${how} misses ${target}.` : `${actor} ${kind === 'ranged' ? 'shoots at' : 'strikes at'} ${target}`
        + ` and misses.`;
    }
    const verb = attack.critical ? natural ? 'catches' : 'lands a telling blow on' : natural ? 'catches' : kind === 'ranged'
      ? 'shoots' : 'hits';
    const with_ = natural || !weapon ? '' : ` with the ${weapon}`;
    return `${how} ${verb} ${target}${with_}${damage ? `, for ${damage.amount}` : ''}.`;
  }
  // What followed: harm and healing not already told, conditions taken or shaken off, who fell or got away.
  private after(events: CombatEvent[]): string[] {
    const blow = events.find((e): e is Of<'attack'> => e.type === 'attack');
    const told = blow && events.find(e => e.type === 'damage' && e.target === blow.target);
    return events.filter(e => e !== told).map(e => this.consequence(e)).filter((s): s is string => !!s);
  }
  private consequence(e: CombatEvent): string | undefined {
    switch (e.type) {
      case 'damage': return e.modifiers?.resistance === 1 ? `${this.name(e.target)} is not harmed by it.`
        : `${this.name(e.target)} takes ${e.amount}${e.damageType ? ` ${e.damageType}` : ''}.`;
      case 'heal': return e.amount ? `${this.name(e.target)} recovers ${e.amount}.` : undefined;
      case 'save': return e.success && !e.immune ? `${this.name(e.target)} shakes it off.`
        : e.immune ? `${this.name(e.target)} is untouched by it.` : undefined;
      case 'status': return this.condition(e.target, e.detail);
      case 'death': return `${this.name(e.actor)} falls.`;
      case 'defend': return `${this.name(e.actor)} stands on guard.`;
      case 'flee': return e.success ? `${this.name(e.actor)} gets away.` : `${this.name(e.actor)} tries to get away, and cannot.`;
      case 'expire': return CombatPresenter.told(e.detail, 'ends')?.replace('{target}', this.name(e.target));
      case 'end': case 'attack': case 'action': case 'initiative': case 'remove': return undefined;
      default: return CombatPresenter.format(e, this.state);
    }
  }
  // "The boar is bleeding", in the condition's own words when it has them.
  private condition(target: string, id: string): string {
    const own = CombatPresenter.told(id, 'begins');
    if (own) { return own.replace('{target}', this.name(target)); }
    const name = ConditionSense.name(id).toLowerCase();
    return /(ed|ing)\b/.test(name.split(' ')[0]!) ? `${this.name(target)} is ${name}.`
      : `${this.name(target)} is under ${name}.`;
  }
}
