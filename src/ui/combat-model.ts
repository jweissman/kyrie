import { MechanicsText } from '../presentation/mechanics-text';
import { Narration } from '../presentation/narration';
import { Effects } from '../effects';
import { Canon } from '../canon/canon';
import { Content } from '../content';
import { ConditionSense } from '../presentation/condition-sense';
import type { Battle } from '../battle';
import { Fighting } from '../rules/fighting';
import type { BattleState, CombatEvent, Fighter } from '../model';
import type { ArenaAbility } from '../lang/parse';
import { CombatChoices } from './combat-choices';
import { CombatPresenter } from './combat-presenter';
import { CombatTelling } from './combat-telling';
import { Tactics } from '../tactics';
import { DangerSense } from '../presentation/danger-sense';
import { ItemCatalog } from '../item-catalog';
import { ItemNames } from '../item-names';
import type { CombatantRow, CombatScreen } from './screen-types';
import type { Face } from '../paintings/company-portraits';

// Encounter projection for the game screen. Abilities and targets come from Battle.legalCommands only. Who is in the
// fight is called as the company knows them (called, from BandNames): "the second of the agile bone hounds", as the
// place and the account afterwards call it, never "Knitted bone hound 2". The company's own are shown by their
// portraits (faces, by id: see CompanyPortraits), where they have one.
export class CombatModel {
  static build(battle: Battle, called?: ReadonlyMap<string, string>, faces?: ReadonlyMap<string, Face>): CombatScreen {
    const state = this.called(battle.state, called), actor = state.combatants.find(f => f.id === state.actor);
    const ours = !!actor && battle.playerControls(actor.id);
    const choices = ours && !state.outcome ? CombatChoices.actions(battle.legalCommands(), battle.repertoire) : [];
    return {
      turn: state.turn, actor: state.actor, actorName: actor?.name ?? '', ours, outcome: state.outcome,
      foes: state.combatants.filter(f => f.team !== 'fighters').map(f => this.row(f, state)),
      allies: state.combatants.filter(f => f.team === 'fighters').map(f => this.row(f, state, faces?.get(f.id))),
      abilities: choices.map(c => ({ id: c.ability.id, name: this.named(c.ability, actor),
        text: MechanicsText.full(c.ability, actor && Effects.context(actor)),
        cost: c.ability.cost ?? 0, price: MechanicsText.price(c.ability),
        cooldown: c.ability.cooldown ?? 0, scope: c.scope,
        rank: Math.max(...c.commands.map(command => Tactics.score(state, command))),
        ...(c.ability.spell ? { spell: { level: c.ability.spell.level,
          ready: (actor?.ready ?? []).flat().filter(id => id === c.ability.id).length } } : {}),
        targets: c.requiresTarget ? c.commands.map(cmd => this.target(c.ability, actor!, cmd.target!, state)) : [],
        ...c.ability.effects.some(e => e.kind === 'flee') ? { odds: battle.flight() } : {},
        ...actor?.stock?.[c.ability.id] ? { carried: actor.stock[c.ability.id]!.length } : {} })),
      ...battle.opening && !state.outcome ? { moment: battle.opening, reckoned: DangerSense.of(battle).text } : {},
      // Who is still to act this round: not those who have fallen since it began (play 8's "then the second of the
      // risen dead", down).
      order: (state.order ?? []).filter((id, i) => !i || state.combatants.some(f => f.id === id && f.hp > 0))
        .map(id => this.name(state, id)),
      laws: [...new Set(state.combatants.flatMap(f => f.statuses.map(s => s.id)).filter(id => ConditionSense.law(id)))]
        .map(id => ({ name: ConditionSense.name(id), text: Canon.conditions[id]!.description })),
      log: battle.events.map(e => this.line(e, state)).filter(line => !!line).slice(-40),
      round: battle.events.filter(e => e.type === 'initiative').length,
      exchanges: CombatTelling.exchanges(battle.events, state).map((t, n) => ({ n, ...t })),
    };
  }
  private static called(state: BattleState, called?: ReadonlyMap<string, string>): BattleState {
    if (!called) { return state; }
    return { ...state, combatants: state.combatants.map(f => ({ ...f, name: called.get(f.id) ?? f.name })),
      ...state.departed ? { departed: state.departed.map(f => ({ ...f, name: called.get(f.id) ?? f.name })) } : {} };
  }
  // A fight that has ended, as its page holds it until the player goes on: how each side stands, and what the
  // command told after each of its fights ended, before another began (the end, and the experience gained).
  static ended(battle: Battle, told: CombatEvent[], called?: ReadonlyMap<string, string>,
    faces?: ReadonlyMap<string, Face>): CombatScreen {
    const lines: string[] = [], state = this.called(battle.state, called);
    let over = false;
    for (const e of told) {
      over = e.type === 'end' || (over && e.type !== 'initiative');
      if (over && e.type !== 'action') { lines.push(CombatPresenter.format(e, state)); }
    }
    return { ...this.build(battle, called, faces), after: [...new Set(Narration.tidy(lines.filter(Boolean)))] };
  }
  private static row(f: BattleState['combatants'][number], state: BattleState, face?: Face): CombatantRow {
    const race = Content.race(f.raceId)?.name ?? f.raceId;
    const klass = f.classId ? Content.classes[f.classId as keyof typeof Content.classes]?.name ?? f.classId : '';
    const worn = f.statuses.filter(s => !ConditionSense.law(s.id));
    return { id: f.id, name: f.name, line: [race, klass].filter(Boolean).join(' ').toLowerCase(), hp: f.hp, maxHp: f.maxHp,
      mana: f.mana, maxMana: f.maxMana, ...(f.maxSlots ? { slots: [...f.slots ?? []], maxSlots: [...f.maxSlots] } : {}),
      // A place's law is everyone's and is told once for the fight, not worn by each.
      statuses: worn.filter(s => !ConditionSense.helps(s.id)).map(s => ConditionSense.name(s.id)),
      boons: worn.filter(s => ConditionSense.helps(s.id)).map(s => ConditionSense.name(s.id)),
      acting: f.id === state.actor,
      down: f.hp === 0, ...face ? { face } : {}, ...f.team === 'fighters' ? {} : this.reading(f, state) };
  }
  // What the company can read off a foe: what it means to do this round, and what it shrugs off or fears.
  private static reading(f: Fighter, state: BattleState): Pick<CombatantRow, 'intent' | 'defenses'> {
    const intent = this.intent(f, state), defenses = this.defenses(f);
    return { ...intent ? { intent } : {}, ...defenses ? { defenses } : {} };
  }
  // The blow a foe declared as the round began, one it starts winding up, or a wound-up blow about to land. A foe
  // that has acted this round shows only a blow it is still winding up.
  private static intent(f: Fighter, state: BattleState): string | undefined {
    const pending = (state.order ?? []).includes(f.id), shown = pending ? state.intents?.[f.id] : f.windup;
    if (!shown || f.hp === 0) { return undefined; }
    const ability = Content.abilities.find(a => a.id === shown.ability);
    const name = ability ? this.named(ability, f) : shown.ability;
    const target = shown.target && shown.target !== f.id ? ` → ${this.name(state, shown.target)}` : '';
    if (!pending) { return `winding up ${name}${target}`; }
    if (f.windup) { return `lands ${name}${target}`; }
    return `${ability?.windup ? 'winds up ' : ''}${name}${target}`;
  }
  private static defenses(f: Fighter): string {
    const r = Effects.modifiers(f).resistances ?? {}, all = Object.entries(r);
    return ([['immune to', all.filter(([, v]) => v >= 1)], ['resists', all.filter(([, v]) => v > 0 && v < 1)],
      ['vulnerable to', all.filter(([, v]) => v < 0)]] as const)
      .filter(([, kinds]) => kinds.length).map(([verb, kinds]) => `${verb} ${kinds.map(([k]) => k).join(', ')}`)
      .join(' · ');
  }
  // A target as an ability would meet it: its name, and whether it is immune to, resists or is vulnerable to the
  // damage the ability deals.
  private static target(ability: ArenaAbility, actor: Fighter, id: string, state: BattleState) {
    const target = state.combatants.find(f => f.id === id);
    const types = ability.effects.flatMap(e => e.kind === 'damage' || e.kind === 'drain' ? [e.damageType ?? 'necrotic']
      : e.kind === 'attack' ? [actor.equipment.weapon.type] : []);
    const defender = target && Effects.modifiers(target), physical = Content.rules.physicalDamage;
    const strongest = (defender ? types.map(t => Fighting.mitigate(0, t, { bonus: 0, defender, physical }).resistance)
      : []).sort((a, b) => Math.abs(b) - Math.abs(a))[0] ?? 0;
    const against = strongest >= 1 ? 'immune' : strongest > 0 ? 'resists' : strongest < 0 ? 'vulnerable' : '';
    const blow = target && ability.effects.some(e => e.kind === 'attack');
    const odds = blow ? Fighting.chance(Effects.combatant(actor), Effects.combatant(target)) : undefined;
    return { id, name: target?.name ?? id, ...against ? { against } : {}, ...odds !== undefined ? { odds } : {} };
  }
  private static name(state: BattleState, id: string): string {
    return state.combatants.find(f => f.id === id)?.name ?? id;
  }
  // Readable consequences first; the dice arithmetic stays available in the developer chronicle.
  static line(e: CombatEvent, state: BattleState): string {
    const line = this.said(e, state);
    return line && line.charAt(0).toUpperCase() + line.slice(1);
  }
  private static said(e: CombatEvent, state: BattleState): string {
    if (e.type === 'attack') {
      const verb = e.success ? e.critical ? 'critically hits' : 'hits' : e.evaded ? 'is evaded by' : 'misses';
      return `${this.name(state, e.actor)} ${verb} ${this.name(state, e.target)} (rolled ${e.die}, needed ${e.need}).`;
    }
    if (e.type === 'initiative') { return `The order: ${e.order.map(o => this.name(state, o.id)).join(', ')}.`; }
    if (e.type === 'damage') {
      const kind = e.damageType ? ` ${e.damageType}` : '';
      const resistance = e.modifiers?.resistance ?? 0;
      if (resistance === 1) { return `${this.name(state, e.target)} is immune to${kind} damage → ${e.hp} HP.`; }
      const defense = resistance > 0 ? `; resists ${Math.round(resistance * 100)}%`
        : resistance < 0 ? `; vulnerable +${Math.round(-resistance * 100)}%` : '';
      const adjustment = `${e.modifiers?.critical ? `; critical ×${e.modifiers.critical}` : ''}`
        + `${e.modifiers?.halfSave ? '; save halves' : ''}`;
      return `${this.name(state, e.target)} takes ${e.amount}${kind} damage (roll ${e.rolled}${adjustment}${defense}) → ${e.hp} HP.`;
    }
    if (e.type === 'heal') { return `${this.name(state, e.target)} recovers ${e.amount} → ${e.hp} HP.`; }
    if (e.type === 'save') {
      const against = e.kind && e.kind !== e.stat ? ` the ${e.kind} save` : '';
      return `${this.name(state, e.target)} ${e.success ? 'resists' : 'fails to resist'}${against} (${e.stat ?? 'save'} ${e.rolled} vs ${e.difficulty}).`;
    }
    if (e.type === 'action' && e.source?.kind !== 'trap') { return this.act(e.command, state); }
    return CombatPresenter.format(e, state);
  }
  // What someone did, as a sentence: "Nell strikes at Nettle with the dagger", "Hulda uses Cleave on Gristle".
  private static act(command: { actor: string; ability: string; target?: string }, state: BattleState): string {
    const actor = state.combatants.find(f => f.id === command.actor), name = this.name(state, command.actor);
    const target = command.target && command.target !== command.actor ? this.name(state, command.target) : '';
    const weapon = this.weapon(actor);
    if (command.ability === 'melee') { return `${name} strikes at ${target}${weapon ? ` with the ${weapon}` : ''}`; }
    if (command.ability === 'ranged') { return `${name} shoots at ${target}${weapon ? ` with the ${weapon}` : ''}`; }
    const carried = ItemCatalog.used(command.ability)?.name;
    const ability = carried ? ItemNames.called(carried) : Content.abilities.find(a => a.id === command.ability)?.name
      ?? command.ability;
    return `${name} uses ${ability}${target ? ` on ${target}` : ''}`;
  }
  private static weapon(f?: Fighter): string {
    const w = f?.equipment?.weapon;
    return w && !w.natural ? w.name.toLowerCase() : '';
  }
  // The plain attacks are named for the weapon in hand.
  private static named(ability: { id: string; name: string }, actor?: Fighter): string {
    const weapon = this.weapon(actor), natural = actor?.equipment?.weapon?.natural ? actor.equipment.weapon.name : '';
    // A beast's own weapon is its attack: Bite, Claws.
    if (natural && ability.id === 'melee') { return natural.charAt(0).toUpperCase() + natural.slice(1); }
    // Something carried to use up is used: "Use alchemist's fire", "Use a healing potion".
    if (actor?.stock?.[ability.id]) { return `Use ${ItemNames.called(ability.name)}`; }
    if (!weapon) { return ability.name; }
    return ability.id === 'melee' ? `Strike with the ${weapon}` : ability.id === 'ranged' ? `Shoot with the ${weapon}` : ability.name;
  }
}
