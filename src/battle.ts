import { Canon } from './canon/canon';
import { Spellcasting } from './rules/spellcasting';
import { AbilityUse } from './ability-use';
import { CreatureStore, type CreatureLease } from './creature-store';
import { CombatProjection } from './combat-projection';
import { Content } from './content';
import { Expressions } from './expressions';
import { Effects, type EffectContext } from './effects';
import { Targeting } from './targeting';
import { Fighting } from './rules/fighting';
import { Tactics } from './tactics';
import type { ArenaAbility } from './lang/parse';
import type { BattleState, CombatEvent, Command, EncounterParticipant, Fighter, Outcome, Scenario, Team } from './model';

// Orsino's combat loop (Combat.round and Combat.turn): each round everyone rolls initiative (d20 + DEX modifier +
// initiative bonus) and every untimed condition ticks down; on its turn a creature's cooldowns tick, a creature with
// noActions loses the turn, and after acting its conditions' turn-end effects happen.
export class Battle {
  private fighters: Fighter[];
  // Foes that fled the fight: gone from it, but still themselves when it is over.
  private departed: Fighter[] = [];
  private abilities: ArenaAbility[];
  private expressions: Expressions;
  private content: Content;
  private order: string[] = [];
  private cursor = 0;
  private turn = 1;
  private outcome: Outcome | null = null;
  private history: CombatEvent[] = [];
  // What each creature on the other side means to do this round, decided as the round begins.
  private intents = new Map<string, Command>();
  // Actions left in the current turn (Orsino's attacksPerTurn with extraAttacksPerTurn), and the one thing a creature
  // acting at random has fallen on doing.
  private actions = 1;
  private impulse?: Command;
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
    // Combat.setUp: whatever the fighters carry into the fight that acts as it begins (Orsino's onCombatStart).
    for (const f of [...this.fighters]) { AbilityUse.hooks(f, 'onCombatStart', f, this.context(f)); }
    if (!this.outcome) { this.round(); this.startTurn(); }
    this.commit();
  }
  static encounter(store: CreatureStore, participants: Pick<EncounterParticipant, 'creatureId' | 'team'>[],
    options: { seed: string; abilities?: ArenaAbility[]; maxTurns?: number; environment?: string; laws?: string[] }):
    Battle {
    const lease = store.acquire(participants.map(p => p.creatureId));
    try {
      // The laws of the place hold for everyone in the fight, for as long as it lasts.
      const laws = (options.laws ?? []).filter(id => Canon.conditions[id]).map(id => ({ id, remaining: 1, clock: 'until-removed' as const }));
      const combatants = participants.map((p, i) => {
        const f = CombatProjection.fighter(lease.creatures[i]!, p.team);
        return { ...f, statuses: [...f.statuses, ...laws.filter(l => !f.statuses.some(s => s.id === l.id))],
          ...options.environment ? { environment: options.environment } : {} };
      });
      return new Battle({ id: 'encounter', combatants, abilities: options.abilities ?? Content.abilities },
        options.seed, options.maxTurns ?? 500, lease);
    } catch (error) { lease.release(); throw error; }
  }
  get participants(): EncounterParticipant[] {
    return [...this.fighters, ...this.departed].map(f => CombatProjection.participant(f,
      f.statuses.filter(s => Effects.status(s.id).lifetime === 'encounter')));
  }
  private commit() {
    if (!this.lease) { return; }
    const creatures = this.lease.creatures.map(original => {
      const fighter = [...this.fighters, ...this.departed].find(f => f.id === original.id)!;
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
      actor: this.outcome ? '' : this.order[this.cursor]!, outcome: this.outcome,
      ...(this.intents.size ? { intents: Object.fromEntries([...this.intents].map(([id, c]) => [id, { ...c }])) } : {}),
      order: this.order.slice(this.cursor),
      ...this.departed.length ? { departed: this.departed.map(f => ({ id: f.id, name: f.name })) } : {} };
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
    const usable = this.abilities.filter(a => known.includes(a.id) && Spellcasting.affordable(actor, a)
      && !(actor.cooldowns[a.id] ?? 0)
      && (a.spell?.level ?? a.level ?? 0) <= Fighting.maxSpellLevel(actor.level)
      && !(a.spell && m.noSpellcasting)
      && (!a.requires?.status || actor.statuses.some(s => s.id === a.requires!.status))
      && (!a.requires?.notStatus || !actor.statuses.some(s => s.id === a.requires!.notStatus))
      && (!a.requires?.interceptWeapon || actor.equipment?.weapon?.intercept === true));
    const compel = actor.statuses.map(s => Effects.status(s.id).compel).find(c => c && usable.some(a => a.id === c));
    return compel ? usable.filter(a => a.id === compel) : usable;
  }
  legalCommands(): Command[] {
    if (this.outcome) { return []; }
    if (this.impulse?.actor === this.actor().id) { return [{ ...this.impulse }]; }
    return this.commandsFor(this.actor());
  }
  // Orsino's control: the company commands its own unless they are turned (charmed); domination hands control to the
  // other side, so a dominated foe is the company's to command and a dominated companion is not.
  playerControls(id: string): boolean {
    const f = this.fighters.find(x => x.id === id);
    if (!f) { return false; }
    const m = Effects.modifiers(f);
    return (f.team === 'fighters' && !m.changeAllegiance) !== !!m.controlledActions;
  }
  // A creature acting at random (Orsino's randomActions) falls on one of the things it could do.
  private impulsive(actor: Fighter) {
    delete this.impulse;
    if (!Effects.modifiers(actor).randomActions) { return; }
    const legal = this.commandsFor(actor);
    if (!legal.length) { return; }
    this.impulse = legal[this.expressions.number(`1d${legal.length}`) - 1]!;
    this.history.push({ type: 'random', turn: this.turn, actor: actor.id });
  }
  // The automatic choice for whoever acts now: a creature carries out the intent it declared when the round began
  // if it still can (its target may have fallen, or it may be compelled), and otherwise does the best it can.
  chosen(): Command {
    const legal = this.legalCommands(), intent = this.intents.get(this.actor().id);
    if (intent && legal.some(c => c.ability === intent.ability && c.target === intent.target)) { return { ...intent }; }
    return Tactics.choose(this.state, legal);
  }
  // Each creature on the other side decides what it means to do as the round begins, on what it can see then; the
  // company sees those intents and can answer them before they land. One winding up a blow means to land it.
  private declare() {
    this.intents.clear();
    for (const f of this.fighters.filter(x => x.hp > 0 && x.team !== 'fighters')) {
      const legal = this.commandsFor(f);
      const wound = f.windup && legal.find(c => c.ability === f.windup!.ability && c.target === f.windup!.target);
      if (f.windup && !wound) { delete f.windup; }
      if (legal.length) { this.intents.set(f.id, wound ?? Tactics.choose({ ...this.state, actor: f.id }, legal)); }
    }
  }
  private winding(actor: Fighter, command: Command): boolean {
    return !!actor.windup && actor.windup.ability === command.ability && actor.windup.target === command.target;
  }
  // Whom an effect can be aimed at, of the kind it needs when the whole ability needs one.
  private reachable(effect: ArenaAbility['effects'][number], actor: Fighter, kind: boolean): Fighter[] {
    return Targeting.candidates(effect.target, actor, this.fighters)
      .filter(f => !kind || f.traits?.includes(effect.targetTrait!));
  }
  private commandsFor(actor: Fighter): Command[] {
    const taunters = actor.statuses.filter(s => Effects.status(s.id).forceTarget && s.by)
      .map(s => s.by!).filter(id => this.fighters.some(f => f.id === id && f.hp > 0));
    const commands = this.usable(actor).flatMap(ability => {
      const selected = ability.effects.filter(effect => Targeting.selected(effect.target));
      // An ability that only works on one kind of creature (charm on people, turn undead on the dead) is offered
      // only against that kind, and not at all when there is none.
      const kind = ability.effects.every(effect => effect.targetTrait);
      if (ability.effects.some(effect => !this.reachable(effect, actor, kind).length)) { return []; }
      const targets = selected.length ? this.fighters.filter(target => selected.every(effect =>
        this.reachable(effect, actor, kind).some(f => f.id === target.id))) : [actor];
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
    // A creature on the other side winds up a big blow before it lands: this turn it gathers itself.
    if (ability.windup && actor.team !== 'fighters' && !this.winding(actor, command)) {
      actor.windup = { ...command };
      this.history.push({ type: 'windup', turn: this.turn, actor: actor.id, target: command.target, detail: ability.windup });
      this.endTurn(actor);
      if (!this.outcome) { this.advance(); }
      this.commit();
      return structuredClone(this.history.slice(start));
    }
    delete actor.windup;
    const context = this.context(actor);
    if (actor.abilitySources?.[ability.id]) { context.source = actor.abilitySources[ability.id]; }
    AbilityUse.perform(ability, command.target, this.expressions, context);
    if (context.retreat || context.location) { this.finish('escaped', 'retreat', { actor: actor.id, team: actor.team }); }
    else { this.finishIfEliminated(); }
    // A creature with actions left this turn (hasted) acts again before its turn ends, if it has anything to do.
    if (!this.outcome && actor.hp > 0 && --this.actions > 0 && !actor.statuses.some(s => Effects.skips(s.id))
      && this.commandsFor(actor).length) {
      this.impulsive(actor);
      this.commit();
      return structuredClone(this.history.slice(start));
    }
    if (!this.outcome) { this.endTurn(actor); }
    if (!this.outcome) { this.advance(); }
    this.commit();
    return structuredClone(this.history.slice(start));
  }
  private context(actor?: Fighter): EffectContext {
    return { ...actor ? { actor } : {}, fighters: this.fighters, turn: this.turn, events: this.history,
      content: this.content, abilities: this.abilities.map(a => a.id), retreat: false, location: null,
      expressions: this.expressions, hook: AbilityUse.hooks.bind(AbilityUse),
      lapse: AbilityUse.lapse.bind(AbilityUse) };
  }
  // Combat.turn's onTurnEnd hooks: the turn-end effects of the conditions the actor holds.
  private endTurn(actor: Fighter) {
    for (const s of actor.statuses.filter(c => !c.clock)) { Effects.periodic(actor, s.id, s.source, this.context()); }
    this.finishIfEliminated();
  }
  // Combat.round: initiative for every living creature, then every untimed condition ticks down and expires at zero.
  private round() {
    this.rout();
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
    this.declare();
  }
  // Combat.round: a foe that has turned to flight leaves before anyone rolls, and what it summoned goes with it.
  private rout() {
    for (const f of this.fighters.filter(x => x.hp > 0 && x.team !== 'fighters' && Effects.modifiers(x).flee)) {
      for (const g of [f, ...this.fighters.filter(s => s.summoner === f.id)]) {
        this.fighters.splice(this.fighters.indexOf(g), 1);
        if (!g.summoner) { this.departed.push(g); }
      }
      this.history.push({ type: 'flee', turn: this.turn, actor: f.id, success: true });
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
  // A kind's own actions a turn (Orsino's monsterAttacksPerTurn: an owlbear's two, a dragon's three); one for people.
  static actionsOf(f: Fighter): number {
    return Canon.isSpecies(f.raceId) ? Canon.creature(f.raceId).statistics?.actions ?? 1 : 1;
  }
  private startTurn() {
    while (!this.outcome) {
      const actor = this.actor();
      for (const id of Object.keys(actor.cooldowns)) { actor.cooldowns[id] = Math.max(0, actor.cooldowns[id]! - 1); }
      this.standDown(actor);
      this.finishIfEliminated();
      if (this.outcome) { return; }
      if (actor.hp > 0 && !actor.statuses.some(s => Effects.skips(s.id))) {
        this.actions = Math.max(1, Battle.actionsOf(actor) + (Effects.modifiers(actor).extraAttacksPerTurn ?? 0));
        this.impulsive(actor);
        return;
      }
      // A creature that loses its turn loses the blow it was winding up.
      if (actor.windup) {
        this.history.push({ type: 'interrupt', turn: this.turn, actor: actor.id, target: actor.windup.target,
          detail: this.abilities.find(a => a.id === actor.windup!.ability)?.name ?? actor.windup.ability });
        delete actor.windup;
      }
      this.history.push({ type: 'skip', turn: this.turn, actor: actor.id });
      if (this.turn >= this.maxTurns) { this.finish('draw', 'turn-limit'); return; }
      do {
        this.cursor++;
        if (this.cursor >= this.order.length) { this.round(); }
        this.turn++;
      } while (!this.actor() || this.actor().hp === 0);
    }
  }
  // A guard stands over a companion until the guard's own next turn.
  private standDown(guard: Fighter) {
    for (const f of this.fighters) {
      f.statuses.filter(s => Battle.guarding(s, guard)).forEach(s => { s.remaining = 0; });
      Effects.expire(f, s => Battle.guarding(s, guard), this.context());
    }
  }
  private static guarding(s: Fighter['statuses'][number], guard: Fighter): boolean {
    return s.by === guard.id && Effects.status(s.id).guard === true;
  }
  private finishIfEliminated() {
    const teams = new Set(this.fighters.filter(f => f.hp > 0).map(f => f.team));
    if (teams.size < 2) { this.finish(teams.values().next().value ?? 'draw', 'elimination'); }
  }
  private finish(outcome: Outcome, reason: 'elimination' | 'turn-limit' | 'retreat', fled?: { actor: string; team: Team }) {
    this.outcome = outcome;
    this.history.push({ type: 'end', turn: this.turn, outcome, reason, ...(fled ? { fled } : {}) });
  }
}
