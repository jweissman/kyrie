import { Content } from '../content';
import { Canon } from '../canon/canon';
import { ConditionSense } from '../presentation/condition-sense';
import { CombatPresenter } from './combat-presenter';
import { Barks } from '../narrative/barks';
import type { BattleState, CombatEvent, Fighter } from '../model';
import { ItemCatalog } from '../item-catalog';
import { ItemNames } from '../item-names';

// One exchange: what was told, the dice behind it, the round it fell in, and who acted (if anyone did).
export interface Telling { text: string; detail: string; round: number; actor?: string }
type Of<T extends CombatEvent['type']> = Extract<CombatEvent, { type: T }>;
type Harm = Extract<CombatEvent, { type: 'damage' | 'heal' }>;

// A fight as the company sees it: each exchange (someone acts, and what follows from it) told in a sentence or two,
// "Elen hits the boar with the spear, for 4. The boar is knocked flat." The dice stay with the exchange, for whoever
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
    const told = new CombatTelling(state, CombatTelling.unlasted(events));
    return groups.map((g, n) => this.tell(g.events, g.round, told, barks.of(g.events, n))).filter(t => t.text);
  }
  private static tell(group: CombatEvent[], round: number, told: CombatTelling, bark?: string): Telling {
    const [first, ...rest] = group;
    const sentences = [...first?.type === 'action' ? [told.act(first, rest), ...told.after(rest)] : told.after(group),
      ...bark ? [bark] : []];
    // Two conditions that come to the same thing ("cannot act") are said once.
    return { text: [...new Set(sentences.filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)))].join(' '),
      detail: group.map(e => CombatPresenter.format(e, told.state)).filter(l => !l.startsWith('Initiative')).join(' '),
      round, ...first?.type === 'action' ? { actor: first.command.actor } : {} };
  }
  // Bleeding is told once it has lasted, as it bleeds ("Bruni bleeds, for 1"), and not as the wound is dealt: a bite
  // in the round a fight ended in had been told "Bruni is bleeding", and the bleeding was gone with the fight before it
  // ever bled; nor is a second bite's held save told, of one bleeding already, as their not bleeding (the cold
  // playtest's "Bruni is bleeding… Bruni is not bleeding" in one round: the register's CMB-02).
  private static unlasted(events: CombatEvent[]): Set<CombatEvent> {
    const unsaid = new Set<CombatEvent>(), bleeding = new Set<string>();
    for (const e of events) {
      if (e.type === 'status' && CombatTelling.bleeds(e.detail)) { unsaid.add(e); bleeding.add(e.target); }
      else if (e.type === 'save' && e.success && bleeding.has(e.target) && CombatTelling.bleeds(e.against)) {
        unsaid.add(e);
      } else if ((e.type === 'expire' || e.type === 'remove') && CombatTelling.bleeds(e.detail)) {
        bleeding.delete(e.target);
      } else if (e.type === 'death') { bleeding.delete(e.actor); }
    }
    return unsaid;
  }
  // A condition that is a wound bleeding: Orsino's bleed, which ends with the fight, and Kyr's, which outlasts it.
  private static bleeds(id?: string): boolean {
    return !!id && Canon.conditions[Canon.resolve('conditions', id)]?.saveKind === 'bleed';
  }
  private constructor(private readonly state: BattleState, private readonly unsaid: ReadonlySet<CombatEvent>) {}
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
    const carried = action.source?.kind === 'item' && ItemCatalog.used(c.ability) ? action.source.name : undefined;
    const ability = carried ? ItemNames.called(carried)
      : Content.abilities.find(a => a.id === c.ability)?.name ?? c.ability;
    if (c.ability === 'wait') { return `${actor} waits.`; }
    const target = c.target && c.target !== c.actor ? ` on ${this.name(c.target)}` : '';
    const landed = attack ? attack.success ? `, and it lands${damage?.amount ? `, for ${damage.amount}` : ''}` : ', and misses' : '';
    // What came to nothing says so: "Ithil uses Soot Cloud." was all a cloud of soot told, with nothing hidden for it
    // to show (the play-structure investigation's PT-23).
    const nothing = !attack && !rest.some(e => e.type !== 'initiative' && e.type !== 'end') ? ', to no effect' : '';
    return `${actor} uses ${ability}${target}${landed}${nothing}.`;
  }
  private blow(kind: string, attack: Of<'attack'>, damage?: Harm): string {
    const actor = this.name(attack.actor), target = this.name(attack.target), weapon = this.weapon(attack.actor);
    const natural = this.fighter(attack.actor)?.equipment?.weapon?.natural;
    const how = natural ? CombatTelling.whose(actor, weapon) : actor;
    // A creature's antlers or claws are many, and miss and catch as many ("Finn's antlers misses": the cold
    // evaluation; "the risen dead's claws catches Maren": play 8).
    const many = natural && /(?<!s)s$/.test(weapon);
    if (!attack.success) {
      if (attack.evaded) { return `${target} slips aside from ${natural ? how : CombatTelling.whose(actor, weapon || 'blow')}.`; }
      return natural ? `${how} ${many ? 'miss' : 'misses'} ${target}.`
        : `${actor} ${kind === 'ranged' ? 'shoots at' : 'strikes at'} ${target} and misses.`;
    }
    const verb = natural ? many ? 'catch' : 'catches' : attack.critical ? 'lands a telling blow on' : kind === 'ranged'
      ? 'shoots' : 'hits';
    const with_ = natural || !weapon ? '' : ` with the ${weapon}`;
    // A blow that does no harm is not told with its nothing ("for 0"); what else it does is told after it.
    return `${how} ${verb} ${target}${with_}${damage?.amount ? `, for ${damage.amount}` : ''}.`;
  }
  // What followed: harm and healing not already told, conditions taken or shaken off, who fell or got away.
  private after(events: CombatEvent[]): string[] {
    const blow = events.find((e): e is Of<'attack'> => e.type === 'attack');
    const told = blow && events.find(e => e.type === 'damage' && e.target === blow.target);
    return events.filter(e => e !== told && !this.unsaid.has(e)).map(e => this.consequence(e))
      .filter((s): s is string => !!s);
  }
  private consequence(e: CombatEvent): string | undefined {
    switch (e.type) {
      // Harm that came to nothing (a save halved it away) is not told as harm.
      // A wound bleeding is told as one (it bled at its own turn's end, after whatever it did: play 8).
      case 'damage': if (!e.amount && e.modifiers?.resistance !== 1) { return undefined; }
        return e.modifiers?.resistance === 1 ? `${this.name(e.target)} is not harmed by it.`
        : e.damageType === 'bleed' ? `${this.name(e.target)} bleeds, for ${e.amount}.`
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
    // What a bleeding wound may come to is said of the wound ("the second of the risen dead is not infected", after
    // its own blow on someone else, read as the blow's: play 8; the register's CMB-02).
    if (e.against === 'infected') { return `${CombatTelling.whose(who, 'wound')} stays clean.`; }
    // Not "is not bleeding", which reads as news of how they are (the cold evaluation).
    if (e.against === 'bleed') { return `${who} does not bleed from it.`; }
    // A save against the harm itself turns the worst of it, not all of it: what it sets going still goes.
    return !what ? `${who} turns the worst of it aside.` : state ? `${who} is not ${what}.` : `${who} shrugs off the ${what}.`;
  }
  // Whose a blow or a wound is: "Naivara's dagger", "the wolves' bite", and of one of a band, "the bite of the second
  // of the agile cave spiders" (it had been "the second of the agile cave spiders's bite": play 9).
  static whose(name: string, thing: string): string {
    if (/^the \w+ of /i.test(name)) { return `the ${thing} of ${name.charAt(0).toLowerCase()}${name.slice(1)}`; }
    return /^the /i.test(name) && /[^siuo]s$/.test(name) ? `${name}' ${thing}` : `${name}'s ${thing}`;
  }
  // What befalls someone, where the condition's name is a thing rather than a state ("armor shred", "prone").
  static readonly phrases: Record<string, string> = { prone: '{t} is knocked flat.', shred: "{t}'s armour is torn open.",
    poison: '{t} is poisoned.', silence: '{t} is struck dumb.', slow: '{t} slows.', haste: '{t} quickens.',
    rage: '{t} flies into a rage.', flight: '{t} lifts into the air.', focus: '{t} steadies.', thirst: '{t} is parched.',
    doom: 'Doom settles on {t}.', agony: '{t} doubles over in agony.', fear: '{t} is afraid.', dodge: '{t} is ready to dodge.',
    infected: "{t}'s wound festers." };
  // "The boar is bleeding", in the condition's own words when it has them.
  private condition(target: string, id: string): string {
    const own = CombatPresenter.told(id, 'begins');
    if (own) { return own.replace('{target}', this.name(target)); }
    const phrase = CombatTelling.phrases[id];
    if (phrase) { return phrase.replace(/\{t\}'s (\w+)/, (_, w: string) => CombatTelling.whose(this.name(target), w)).replace('{t}', this.name(target)); }
    const name = ConditionSense.name(id).toLowerCase();
    return /(ed|ing)\b/.test(name.split(' ')[0]!) ? `${this.name(target)} is ${name}.`
      : `${this.name(target)} is under ${name}.`;
  }
}
