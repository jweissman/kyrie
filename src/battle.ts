import { AbilityUse } from './ability-use';
import { CreatureStore, type CreatureLease } from './creature-store';
import { CombatProjection } from './combat-projection';
import { Content } from './content';
import { Expressions } from './expressions';
import { Effects, type EffectContext } from './effects';
import { Targeting } from './targeting';
import { Fighting } from './rules/fighting';
import type { ArenaAbility } from './lang/parse';
import type { BattleState, CombatEvent, Command, EncounterParticipant, Fighter, Outcome, Scenario } from './model';

// Orsino's combat loop (Combat.round and Combat.turn): each round everyone rolls initiative (d20 + DEX modifier +
// initiative bonus) and every untimed condition ticks down; on its turn a creature's cooldowns tick, a creature with
// noActions loses the turn, and after acting its conditions' turn-end effects happen.
export class Battle {
  private fighters: Fighter[];
  private abilities: ArenaAbility[];
  private expressions: Expressions;
  private content: Content;
  private order: string[] = [];
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
    this.expressions = new Expressions(`${seed}:combat`);
    this.content = new Content(`${seed}:summons`);
    this.finishIfEliminated();
    if (!this.outcome) { this.round(); this.startTurn(); }
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
      if (!ability.effects.length && ability.id !== 'wait') { throw new Error(`Empty ability ${ability.id}`); }
      for (const n of [ability.cost ?? 0, ability.cooldown ?? 0]) {
        if (!Number.isSafeInteger(n) || n < 0) { throw new Error('Invalid ability cost/cooldown'); }
      }
      ability.effects.forEach(effect => Effects.validate(effect, abilityIds));
    }
  }
  get state(): BattleState {
    return { combatants: structuredClone(this.fighters), turn: this.turn,
      actor: this.outcome ? '' : this.order[this.cursor]!, outcome: this.outcome };
  }
  get events(): CombatEvent[] { return structuredClone(this.history); }
  private actor(): Fighter { return this.fighters.find(f => f.id === this.order[this.cursor])!; }
  // What a creature may do: the abilities it knows plus melee or ranged from its weapon (Orsino's validActions),
  // except a spell or levelled skill above ⌈level / 2⌉, a spell without a slot or under noSpellcasting, an ability on
  // cooldown, or one whose condition (a status, an intercepting weapon) is unmet. A compelled creature must use its
  // compelled ability; a taunted one must target its taunter.
  usable(actor: Fighter): ArenaAbility[] {
    // Orsino's pcTurn also offers every player-side combatant Wait and Flee.
    const known = [...actor.abilities, actor.equipment?.weapon?.missile ? 'ranged' : 'melee',
      ...actor.team === 'fighters' ? ['wait', 'flee'] : []];
    const m = Effects.modifiers(actor);
    const usable = this.abilities.filter(a => known.includes(a.id) && (a.cost ?? 0) <= actor.mana
      && !(actor.cooldowns[a.id] ?? 0)
      && (a.spell?.level ?? a.level ?? 0) <= Fighting.maxSpellLevel(actor.level)
      && !(a.spell && m.noSpellcasting)
      && (!a.requires?.status || actor.statuses.some(s => s.id === a.requires!.status))
      && (!a.requires?.interceptWeapon || actor.equipment?.weapon?.intercept === true));
    const compel = actor.statuses.map(s => Effects.status(s.id).compel).find(c => c && usable.some(a => a.id === c));
    return compel ? usable.filter(a => a.id === compel) : usable;
  }
  legalCommands(): Command[] {
    if (this.outcome) { return []; }
    const actor = this.actor();
    const taunters = actor.statuses.filter(s => Effects.status(s.id).forceTarget && s.by)
      .map(s => s.by!).filter(id => this.fighters.some(f => f.id === id && f.hp > 0));
    const commands = this.usable(actor).flatMap(ability => {
      const selected = ability.effects.filter(effect => Targeting.selected(effect.target));
      if (ability.effects.some(effect => !Targeting.candidates(effect.target, actor, this.fighters).length)) {
        return [];
      }
      const targets = selected.length ? this.fighters.filter(target => selected.every(effect =>
        Targeting.candidates(effect.target, actor, this.fighters).some(f => f.id === target.id))) : [actor];
      return targets.map(target => ({ actor: actor.id, ability: ability.id, target: target.id }));
    });
    const forced = commands.filter(c => taunters.includes(c.target));
    return forced.length ? forced : commands;
  }
  step(command: Command): CombatEvent[] {
    const valid = this.legalCommands().some(c =>
      c.actor === command.actor && c.ability === command.ability && c.target === command.target);
    if (!valid) { throw new Error('Illegal combat command'); }
    const actor = this.actor();
    const ability = this.abilities.find(a => a.id === command.ability)!;
    const start = this.history.length;
    const context = this.context(actor);
    if (actor.abilitySources?.[ability.id]) { context.source = actor.abilitySources[ability.id]; }
    AbilityUse.perform(ability, command.target, this.expressions, context);
    if (context.retreat || context.location) { this.finish('escaped', 'retreat'); }
    else { this.finishIfEliminated(); }
    if (!this.outcome) { this.endTurn(actor); }
    if (!this.outcome) { this.advance(); }
    this.commit();
    return structuredClone(this.history.slice(start));
  }
  private context(actor?: Fighter): EffectContext {
    return { ...actor ? { actor } : {}, fighters: this.fighters, turn: this.turn, events: this.history,
      content: this.content, abilities: this.abilities.map(a => a.id), retreat: false, location: null,
      expressions: this.expressions, hook: AbilityUse.hooks.bind(AbilityUse) };
  }
  // Combat.turn's onTurnEnd hooks: the turn-end effects of the conditions the actor holds.
  private endTurn(actor: Fighter) {
    for (const s of actor.statuses.filter(c => !c.clock)) { Effects.periodic(actor, s.id, s.source, this.context()); }
    this.finishIfEliminated();
  }
  // Combat.round: initiative for every living creature, then every untimed condition ticks down and expires at zero.
  private round() {
    const living = this.fighters.filter(f => f.hp > 0);
    const rolls = living.map(f => {
      const m = Effects.modifiers(f);
      return { id: f.id, roll: Fighting.d20(() => this.expressions.number('1d20'), m)
        + Fighting.statMod(Effects.scores(f).dexterity) + (m.initiative ?? 0) };
    });
    rolls.sort((a, b) => b.roll - a.roll);
    this.order = rolls.map(r => r.id);
    this.cursor = 0;
    this.history.push({ type: 'initiative', turn: this.turn, order: rolls });
    for (const f of living) {
      for (const s of f.statuses.filter(c => !c.clock)) { s.remaining--; }
      Effects.expire(f, s => !s.clock, this.context());
    }
  }
  private advance() {
    do {
      if (this.turn >= this.maxTurns) { this.finish('draw', 'turn-limit'); return; }
      this.cursor++;
      if (this.cursor >= this.order.length) { this.round(); }
      this.turn++;
    } while (!this.actor() || this.actor().hp === 0);
    this.startTurn();
  }
  // Combat.turn's start: cooldowns tick; a creature with noActions loses the turn.
  private startTurn() {
    while (!this.outcome) {
      const actor = this.actor();
      for (const id of Object.keys(actor.cooldowns)) { actor.cooldowns[id] = Math.max(0, actor.cooldowns[id]! - 1); }
      this.finishIfEliminated();
      if (this.outcome) { return; }
      if (actor.hp > 0 && !actor.statuses.some(s => Effects.skips(s.id))) { return; }
      this.history.push({ type: 'skip', turn: this.turn, actor: actor.id });
      if (this.turn >= this.maxTurns) { this.finish('draw', 'turn-limit'); return; }
      do {
        this.cursor++;
        if (this.cursor >= this.order.length) { this.round(); }
        this.turn++;
      } while (this.actor().hp === 0);
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
