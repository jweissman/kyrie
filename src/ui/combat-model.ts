import { MechanicsText } from '../presentation/mechanics-text';
import { Effects } from '../effects';
import { Content } from '../content';
import type { Battle } from '../battle';
import type { BattleState, CombatEvent } from '../model';
import { CombatChoices } from './combat-choices';
import { CombatPresenter } from './combat-presenter';
import type { CombatantRow, CombatScreen } from './screen-types';

// Encounter projection for the game screen. Abilities and targets come from Battle.legalCommands only.
export class CombatModel {
  static build(battle: Battle, prior: CombatEvent[] = []): CombatScreen {
    const state = battle.state, actor = state.combatants.find(f => f.id === state.actor);
    const ours = actor?.team === 'fighters';
    const choices = ours && !state.outcome ? CombatChoices.actions(battle.legalCommands(), Content.abilities) : [];
    return {
      turn: state.turn, actor: state.actor, actorName: actor?.name ?? '', ours, outcome: state.outcome,
      foes: state.combatants.filter(f => f.team !== 'fighters').map(f => this.row(f, state)),
      allies: state.combatants.filter(f => f.team === 'fighters').map(f => this.row(f, state)),
      abilities: choices.map(c => ({ id: c.ability.id, name: c.ability.name,
        text: MechanicsText.full(c.ability, actor && Effects.context(actor)),
        cost: c.ability.cost ?? 0, price: MechanicsText.price(c.ability),
        cooldown: c.ability.cooldown ?? 0, scope: c.scope,
        ...(c.ability.spell ? { spell: { level: c.ability.spell.level,
          ready: (actor?.ready ?? []).flat().filter(id => id === c.ability.id).length } } : {}),
        targets: c.requiresTarget ? c.commands.map(cmd => ({ id: cmd.target,
          name: state.combatants.find(f => f.id === cmd.target)?.name ?? cmd.target })) : [] })),
      log: [...prior, ...battle.events].map(e => this.line(e, state)).filter(line => !!line).slice(-40),
      exchanges: this.exchanges([...prior, ...battle.events], state).slice(-12),
    };
  }
  // The log in causal groups: each action (or initiative roll) with everything it caused, in the order it happened.
  static exchanges(events: CombatEvent[], state: BattleState): string[][] {
    const groups: string[][] = [];
    for (const e of events) {
      const line = this.line(e, state);
      if (!line) { continue; }
      if (e.type === 'action' || e.type === 'initiative' || !groups.length) { groups.push([line]); }
      else { groups.at(-1)!.push(line); }
    }
    return groups;
  }
  private static row(f: BattleState['combatants'][number], state: BattleState): CombatantRow {
    const race = Content.races[f.raceId as keyof typeof Content.races]?.name ?? f.raceId;
    const klass = f.classId ? Content.classes[f.classId as keyof typeof Content.classes]?.name ?? f.classId : '';
    return { id: f.id, name: f.name, line: [race, klass].filter(Boolean).join(' ').toLowerCase(), hp: f.hp, maxHp: f.maxHp,
      mana: f.mana, maxMana: f.maxMana, ...(f.maxSlots ? { slots: [...f.slots ?? []], maxSlots: [...f.maxSlots] } : {}),
      statuses: f.statuses.map(s => s.id), acting: f.id === state.actor,
      down: f.hp === 0 };
  }
  private static name(state: BattleState, id: string): string {
    return state.combatants.find(f => f.id === id)?.name ?? id;
  }
  // Readable consequences first; the dice arithmetic stays available in the developer chronicle.
  static line(e: CombatEvent, state: BattleState): string {
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
    if (e.type === 'action' && e.source?.kind !== 'trap') {
      const ability = Content.abilities.find(a => a.id === e.command.ability)?.name ?? e.command.ability;
      const target = e.command.target && e.command.target !== e.command.actor ? ` → ${this.name(state, e.command.target)}` : '';
      return `${this.name(state, e.command.actor)}: ${ability}${target}`;
    }
    return CombatPresenter.format(e, state);
  }
}
