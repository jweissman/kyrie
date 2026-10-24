import { Content } from '../content';
import { ConditionSense } from '../presentation/condition-sense';
import { CombatPresenter } from './combat-presenter';
import { Barks } from '../narrative/barks';
import type { BattleState, CombatEvent, Fighter } from '../model';

// One exchange: what was told, the dice behind it, the round it fell in, and who acted (if anyone did).
export interface Telling { text: string; detail: string; round: number; actor?: string }
type Of<T extends CombatEvent['type']> = Extract<CombatEvent, { type: T }>;
type Harm = Extract<CombatEvent, { type: 'damage' | 'heal' }>;

// A fight as the company sees it: each exchange (someone acts, and what follows from it) told in a sentence or two,
// "Elen hits the boar with the spear, for 4. The boar is bleeding." The dice stay with the exchange, for whoever
// looks closer, and nothing is said that a watcher could not see.
export class CombatTelling {
  static exchanges(events: CombatEvent[], state: BattleState): Telling[] {
    const groups: { round: number; events: CombatEvent[] }[] = [];
    let round = 0;
    for (const e of events) {
      if (e.type === 'initiative') { round++; continue; }
      if (e.type === 'action' || !groups.length) { groups.push({ round: Math.max(1, round), events: [e] }); }
      else { groups.at(-1)!.events.push(e); }
    }
    // What fighters say at the turning points, now and then (see Barks).
    const fighters = [...state.combatants, ...(state.departed ?? []) as Fighter[]];
    const barks = new Barks(fighters, fighters.map(f => f.id).join(','));
    return groups.map((g, n) => this.tell(g.events, g.round, state, barks.of(g.events, n))).filter(t => t.text);
  }
  private static tell(group: CombatEvent[], round: number, state: BattleState, bark?: string): Telling {
    const told = new CombatTelling(state), [first, ...rest] = group;
    const sentences = [...first?.type === 'action' ? [told.act(first, rest), ...told.after(rest)] : told.after(group),
      ...bark ? [bark] : []];
    // Two conditions that come to the same thing ("cannot act") are said once.
    return { text: [...new Set(sentences.filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)))].join(' '),
      detail: group.map(e => CombatPresenter.format(e, state)).filter(l => !l.startsWith('Initiative')).join(' '),
      round, ...first?.type === 'action' ? { actor: first.command.actor } : {} };
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
        : e.damageType && e.damageType !== 'physical' ? `${this.name(e.target)} takes ${e.amount} ${e.damageType} damage.`
          : `${this.name(e.target)} is hurt, for ${e.amount}.`;
      case 'heal': return e.amount ? `${this.name(e.target)} recovers ${e.amount}.` : undefined;
      case 'save': return this.saved(e);
      case 'status': return this.condition(e.target, e.detail);
      case 'death': return `${this.name(e.actor)} falls.`;
      case 'defend': return `${this.name(e.actor)} stands on guard.`;
      case 'flee': return e.success ? `${this.name(e.actor)} gets away.` : `${this.name(e.actor)} tries to get away, and cannot.`;
      case 'expire': return CombatPresenter.told(e.detail, 'ends')?.replace('{target}', this.name(e.target));
      case 'end': case 'attack': case 'action': case 'initiative': case 'remove': return undefined;
      default: return CombatPresenter.format(e, this.state);
    }
  }
  // A save that held: what it held against, when the blow would have left a condition ("shrugs off the bleeding").
  private saved(e: Of<'save'>): string | undefined {
    const who = this.name(e.target), what = e.against ? ConditionSense.name(e.against).toLowerCase() : '';
    // "stunned", "bleeding" are states one is or is not in; "armor shred" is a thing one takes or shrugs off.
    const state = /(ed|ing)$/.test(what.split(' ')[0] ?? '');
    if (e.immune) { return !what ? `${who} is untouched by it.` : state ? `${who} cannot be ${what}.` : `${who} cannot suffer ${what}.`; }
    if (!e.success) { return undefined; }
    return !what ? `${who} shakes it off.` : state ? `${who} is not ${what}.` : `${who} shrugs off the ${what}.`;
  }
  // What befalls someone, where the condition's name is a thing rather than a state ("armor shred", "prone").
  static readonly phrases: Record<string, string> = { prone: '{t} is knocked flat.', shred: "{t}'s armour is torn open.",
    poison: '{t} is poisoned.', silence: '{t} is struck dumb.', slow: '{t} slows.', haste: '{t} quickens.',
    rage: '{t} flies into a rage.', flight: '{t} lifts into the air.', focus: '{t} steadies.', thirst: '{t} is parched.',
    doom: 'Doom settles on {t}.', agony: '{t} doubles over in agony.', fear: '{t} is afraid.', dodge: '{t} is ready to dodge.' };
  // "The boar is bleeding", in the condition's own words when it has them.
  private condition(target: string, id: string): string {
    const own = CombatPresenter.told(id, 'begins');
    if (own) { return own.replace('{target}', this.name(target)); }
    const phrase = CombatTelling.phrases[id];
    if (phrase) { return phrase.replace('{t}', this.name(target)); }
    const name = ConditionSense.name(id).toLowerCase();
    return /(ed|ing)\b/.test(name.split(' ')[0]!) ? `${this.name(target)} is ${name}.`
      : `${this.name(target)} is under ${name}.`;
  }
}
