import { MechanicsText } from '../presentation/mechanics-text';
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
import type { CombatantRow, CombatScreen } from './screen-types';

// Encounter projection for the game screen. Abilities and targets come from Battle.legalCommands only.
export class CombatModel {
  static build(battle: Battle, prior: CombatEvent[] = []): CombatScreen {
    const state = battle.state, actor = state.combatants.find(f => f.id === state.actor);
    const ours = !!actor && battle.playerControls(actor.id);
    const choices = ours && !state.outcome ? CombatChoices.actions(battle.legalCommands(), Content.abilities) : [];
    return {
      turn: state.turn, actor: state.actor, actorName: actor?.name ?? '', ours, outcome: state.outcome,
      foes: state.combatants.filter(f => f.team !== 'fighters').map(f => this.row(f, state)),
      allies: state.combatants.filter(f => f.team === 'fighters').map(f => this.row(f, state)),
      abilities: choices.map(c => ({ id: c.ability.id, name: this.named(c.ability, actor),
        text: MechanicsText.full(c.ability, actor && Effects.context(actor)),
        cost: c.ability.cost ?? 0, price: MechanicsText.price(c.ability),
        cooldown: c.ability.cooldown ?? 0, scope: c.scope,
        ...(c.ability.spell ? { spell: { level: c.ability.spell.level,
          ready: (actor?.ready ?? []).flat().filter(id => id === c.ability.id).length } } : {}),
        targets: c.requiresTarget ? c.commands.map(cmd => this.target(c.ability, actor!, cmd.target!, state)) : [] })),
      order: (state.order ?? []).map(id => this.name(state, id)),
      laws: [...new Set(state.combatants.flatMap(f => f.statuses.map(s => s.id)).filter(id => ConditionSense.law(id)))]
        .map(id => ({ name: ConditionSense.name(id), text: Canon.conditions[id]!.description })),
      log: [...prior, ...battle.events].map(e => this.line(e, state)).filter(line => !!line).slice(-40),
      exchanges: CombatTelling.exchanges([...prior, ...battle.events], state).slice(-12),
    };
  }
  private static row(f: BattleState['combatants'][number], state: BattleState): CombatantRow {
    const race = Content.races[f.raceId as keyof typeof Content.races]?.name ?? f.raceId;
    const klass = f.classId ? Content.classes[f.classId as keyof typeof Content.classes]?.name ?? f.classId : '';
    const worn = f.statuses.filter(s => !ConditionSense.law(s.id));
    return { id: f.id, name: f.name, line: [race, klass].filter(Boolean).join(' ').toLowerCase(), hp: f.hp, maxHp: f.maxHp,
      mana: f.mana, maxMana: f.maxMana, ...(f.maxSlots ? { slots: [...f.slots ?? []], maxSlots: [...f.maxSlots] } : {}),
      // A place's law is everyone's and is told once for the fight, not worn by each.
      statuses: worn.filter(s => !ConditionSense.helps(s.id)).map(s => ConditionSense.name(s.id)),
      boons: worn.filter(s => ConditionSense.helps(s.id)).map(s => ConditionSense.name(s.id)),
      acting: f.id === state.actor,
      down: f.hp === 0, ...f.team === 'fighters' ? {} : this.reading(f, state) };
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
    return { id, name: target?.name ?? id, ...against ? { against } : {} };
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
    const ability = Content.abilities.find(a => a.id === command.ability)?.name ?? command.ability;
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
    if (!weapon) { return ability.name; }
    return ability.id === 'melee' ? `Strike with the ${weapon}` : ability.id === 'ranged' ? `Shoot with the ${weapon}` : ability.name;
  }
}
