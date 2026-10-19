import { AbilityUse } from './ability-use';
import { CreatureStore, type CreatureLease } from './creature-store';
import { CombatProjection } from './combat-projection';
import { Content } from './content';
import { Expressions } from './expressions';
import { Effects, type EffectContext } from './effects';
import { Targeting } from './targeting';
import type { ArenaAbility } from './lang/parse';
import type { BattleState, CombatEvent, Command, EncounterParticipant, Fighter, Outcome, Scenario } from './model';

export class Battle {
  private fighters: Fighter[];
  private abilities: ArenaAbility[];
  private expressions: Expressions;
  private content: Content;
  private cursor = 0;
  private turn = 1;
  private outcome: Outcome | null = null;
  private history: CombatEvent[] = [];
  constructor(scenario: Scenario, seed: string, private maxTurns = 500, private lease?: CreatureLease) {
    if (!Number.isSafeInteger(maxTurns) || maxTurns < 1) { throw new Error('Invalid turn limit'); }
    this.fighters = structuredClone(scenario.combatants);
    this.abilities = structuredClone(scenario.abilities);
    try { this.validate(); } catch (error) { this.lease?.release(); throw error; }
    if (!this.lease) {
      const store = new CreatureStore(this.fighters.map(f => {
        const creature = CombatProjection.creature(f);
        creature.state.conditions = creature.state.conditions.filter(c => Effects.status(c.id).lifetime === 'persistent');
        return creature;
      }));
      this.lease = store.acquire(this.fighters.map(f => f.id));
    }
    this.fighters.sort((a, b) => b.speed - a.speed);
    this.expressions = new Expressions(`${seed}:combat`);
    this.content = new Content(`${seed}:summons`);
    this.finishIfEliminated();
    if (!this.outcome) {
      this.cursor = this.fighters.findIndex(f => f.hp > 0);
      this.startTurn();
    }
    this.commit();
  }
  static encounter(store: CreatureStore, participants: Pick<EncounterParticipant, 'creatureId' | 'team'>[],
    options: { seed: string; abilities?: ArenaAbility[]; maxTurns?: number }): Battle {
    const lease = store.acquire(participants.map(p => p.creatureId));
    try {
      const combatants = participants.map((p, i) => CombatProjection.fighter(lease.creatures[i]!, p.team));
      return new Battle({ id: 'encounter', combatants, abilities: options.abilities ?? Content.abilities },
        options.seed, options.maxTurns ?? 500, lease);
    } catch (error) { lease.release(); throw error; }
  }
  get participants(): EncounterParticipant[] {
    return this.fighters.map(f => CombatProjection.participant(f,
      f.statuses.filter(s => Effects.status(s.id).lifetime === 'encounter')));
  }
  private commit() {
    if (!this.lease) { return; }
    const creatures = this.lease.creatures.map(original => {
      const fighter = this.fighters.find(f => f.id === original.id)!;
      const creature = CombatProjection.creature(fighter, original);
      creature.state.conditions = creature.state.conditions.filter(c => Effects.status(c.id).lifetime === 'persistent');
      return creature;
    });
    this.lease.commit(creatures);
    if (this.outcome) { this.lease.release(); this.lease = undefined; }
  }
  close() {
    if (!this.outcome) { this.finish('escaped', 'retreat'); this.commit(); }
  }
  private validate() {
    const ids = new Set(this.fighters.map(f => f.id));
    if (ids.size !== this.fighters.length || !ids.size) { throw new Error('Combatants need unique IDs'); }
    const abilityIds = this.abilities.map(a => a.id);
    if (new Set(abilityIds).size !== abilityIds.length) { throw new Error('Abilities need unique IDs'); }
    for (const f of this.fighters) {
      if (![f.hp, f.maxHp, f.speed, f.strength, f.mana, f.maxMana].every(n => Number.isSafeInteger(n) && n >= 0)
        || f.maxHp < 1 || f.hp > f.maxHp || f.mana > f.maxMana || !['fighters', 'goblins'].includes(f.team)
        || f.abilities.some(id => !abilityIds.includes(id))) { throw new Error(`Invalid combatant ${f.id}`); }
      f.statuses.forEach(s => Effects.status(s.id));
    }
    for (const ability of this.abilities) {
      if (!ability.effects.length) { throw new Error(`Empty ability ${ability.id}`); }
      for (const n of [ability.cost ?? 0, ability.cooldown ?? 0]) {
        if (!Number.isSafeInteger(n) || n < 0) { throw new Error('Invalid ability cost/cooldown'); }
      }
      ability.effects.forEach(effect => Effects.validate(effect, abilityIds));
    }
  }
  get state(): BattleState {
    return { combatants: structuredClone(this.fighters), turn: this.turn,
      actor: this.outcome ? '' : this.fighters[this.cursor]!.id, outcome: this.outcome };
  }
  get events(): CombatEvent[] { return structuredClone(this.history); }
  legalCommands(): Command[] {
    if (this.outcome) { return []; }
    const actor = this.fighters[this.cursor]!;
    return this.abilities.filter(a => actor.abilities.includes(a.id) && (a.cost ?? 0) <= actor.mana
      && !(actor.cooldowns[a.id] ?? 0)).flatMap(ability => {
      const selected = ability.effects.filter(effect => Targeting.selected(effect.target));
      if (ability.effects.some(effect => !Targeting.candidates(effect.target, actor, this.fighters).length)) {
        return [];
      }
      const targets = selected.length ? this.fighters.filter(target => selected.every(effect =>
        Targeting.candidates(effect.target, actor, this.fighters).some(f => f.id === target.id))) : [actor];
      return targets.map(target => ({ actor: actor.id, ability: ability.id, target: target.id }));
    });
  }
  step(command: Command): CombatEvent[] {
    const valid = this.legalCommands().some(c =>
      c.actor === command.actor && c.ability === command.ability && c.target === command.target);
    if (!valid) { throw new Error('Illegal combat command'); }
    const actor = this.fighters[this.cursor]!;
    const ability = this.abilities.find(a => a.id === command.ability)!;
    const start = this.history.length;
    const context: EffectContext = { actor, fighters: this.fighters, turn: this.turn, events: this.history,
      content: this.content, abilities: this.abilities.map(a => a.id), retreat: false, location: null };
    if (actor.abilitySources?.[ability.id]) { context.source = actor.abilitySources[ability.id]; }
    AbilityUse.perform(ability, command.target, this.expressions, context);
    if (context.retreat || context.location) { this.finish('escaped', 'retreat'); }
    else { this.finishIfEliminated(); }
    if (!this.outcome) { this.advance(); }
    this.commit();
    return structuredClone(this.history.slice(start));
  }
  private advance() {
    if (this.turn >= this.maxTurns) { this.finish('draw', 'turn-limit'); return; }
    do { this.cursor = (this.cursor + 1) % this.fighters.length; } while (this.fighters[this.cursor]!.hp === 0);
    this.turn++;
    this.startTurn();
  }
  private startTurn() {
    // Forced status turns also count against the limit. Iterate to avoid recursive stun/death chains.
    while (!this.outcome) {
      const actor = this.fighters[this.cursor]!;
      actor.guarding = false;
      for (const id of Object.keys(actor.cooldowns)) {
        actor.cooldowns[id] = Math.max(0, actor.cooldowns[id]! - 1);
      }
      let skip = false;
      for (const active of actor.statuses) {
        const status = Effects.status(active.id);
        skip ||= status.skip;
        if (active.clock === 'owner-turn') { continue; }
        if (active.clock === 'world-time' || active.clock === 'until-removed') { continue; }
        if (status.damage && actor.hp > 0) {
          Effects.hp(actor, status.damage, { actor, fighters: this.fighters, turn: this.turn,
            events: this.history, content: this.content, abilities: [], retreat: false, location: null });
        }
        active.remaining--;
      }
      Effects.advance(actor, 'owner-turn', { fighters: this.fighters, turn: this.turn,
        events: this.history, content: this.content, abilities: [], retreat: false, location: null });
      actor.statuses = actor.statuses.filter(s => {
        if (s.remaining > 0) { return true; }
        this.history.push({ type: 'expire', turn: this.turn, actor: actor.id, target: actor.id, detail: s.id });
        return false;
      });
      this.finishIfEliminated();
      if (this.outcome || (actor.hp > 0 && !skip)) { return; }
      this.history.push({ type: 'skip', turn: this.turn, actor: actor.id });
      if (this.turn >= this.maxTurns) { this.finish('draw', 'turn-limit'); return; }
      do { this.cursor = (this.cursor + 1) % this.fighters.length; } while (this.fighters[this.cursor]!.hp === 0);
      this.turn++;
    }
  }
  private finishIfEliminated() {
    const teams = new Set(this.fighters.filter(f => f.hp > 0).map(f => f.team));
    if (teams.size < 2) { this.finish(teams.values().next().value ?? 'draw', 'elimination'); }
  }
  private finish(outcome: Outcome, reason: 'elimination' | 'turn-limit' | 'retreat') {
    this.outcome = outcome;
    this.history.push({ type: 'end', turn: this.turn, outcome, reason });
  }
}
