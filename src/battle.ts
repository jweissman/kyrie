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
import { ItemCatalog } from './item-catalog';
import type { ArenaAbility } from './lang/parse';
import type { BattleState, CombatEvent, Command, EncounterParticipant, Fighter, Moment, Outcome, Scenario, Team } from './model';

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
  // A fight that came at the company, seen as it began: the company acts first in the first round, and can get back
  // the way it came for certain (PT-10). Rounds begun, and how often the company has tried to run and been held.
  private readonly moment?: Moment;
  private rounds = 0;
  private held = 0;
  constructor(scenario: Scenario, seed: string, private maxTurns = 500, private lease?: CreatureLease) {
    if (!Number.isSafeInteger(maxTurns) || maxTurns < 1) { throw new Error('Invalid turn limit'); }
    this.moment = scenario.moment;
    this.fighters = structuredClone(scenario.combatants);
    // The catalog's abilities are never changed, so a fight over them reads them as they are; others are copied. What
    // the company carries to use up is fought with as abilities of this fight's own (see ItemCatalog.stock).
    const base = scenario.abilities === Content.abilities ? Content.abilities : structuredClone(scenario.abilities);
    const carried = [...new Set(this.fighters.flatMap(f => Object.keys(f.stock ?? {})))]
      .filter(id => !base.some(a => a.id === id)).map(id => structuredClone(ItemCatalog.used(id)!));
    this.abilities = carried.length ? [...base, ...carried] : base;
    try { this.validate(); } catch (error) { this.lease?.release(); throw error; }
    if (!this.lease) {
      const store = new CreatureStore(this.fighters.map(f => {
        const creature = CombatProjection.creature(f);
        creature.state.conditions = creature.state.conditions.filter(c => Battle.kept(c));
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
  // What a fight is fought under that is not the fighters' own (the place's laws, a company's weariness, its
  // readiness for what it waited for) is held by the fight, and goes with it: it is never written back onto a
  // creature. Written back, it stayed for good (weary after a night's sleep), and the next fight added it again, so a
  // weary company's second fight failed with "Invalid creature conditions": the owner's, attacking a raiding party
  // and in a cave gallery, and What Tessary Owes's author's, set upon by the ebb-runners (its friction E3).
  static readonly held = 'encounter';
  static kept(c: { id: string; clock?: string; source?: string }): boolean {
    return Effects.lasting(c) && c.source !== Battle.held;
  }
  private static holding(id: string) { return { id, remaining: 1, clock: 'until-removed' as const, source: Battle.held }; }
  static encounter(store: CreatureStore, participants: Pick<EncounterParticipant, 'creatureId' | 'team'>[],
    options: { seed: string; abilities?: ArenaAbility[]; maxTurns?: number; environment?: string; laws?: string[];
      weary?: string[]; ready?: string[]; moment?: Moment }):
    Battle {
    const lease = store.acquire(participants.map(p => p.creatureId));
    try {
      // The laws of the place hold for everyone in the fight, for as long as it lasts.
      const laws = (options.laws ?? []).filter(id => Canon.conditions[id]).map(id => Battle.holding(id));
      const combatants = participants.map((p, i) => {
        const f = CombatProjection.fighter(lease.creatures[i]!, p.team);
        // Those too long without sleep fight weary; those who drew it out and waited for it meet it ready.
        const tired = options.weary?.includes(p.creatureId) && Canon.conditions.weary ? [Battle.holding('weary')] : [];
        const ready = options.ready?.includes(p.creatureId) && Canon.conditions.ready ? [Battle.holding('ready')] : [];
        // Each once: one carrying it already (a fighter set upon after a fight of its own) does not carry it twice.
        const fresh = [...laws, ...tired, ...ready].filter(l => !f.statuses.some(s => s.id === l.id));
        return { ...f, statuses: [...f.statuses, ...fresh],
          ...options.environment ? { environment: options.environment } : {} };
      });
      return new Battle({ id: 'encounter', combatants, abilities: options.abilities ?? Content.abilities,
        ...options.moment ? { moment: options.moment } : {} }, options.seed, options.maxTurns ?? 500, lease);
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
      creature.state.conditions = creature.state.conditions.filter(c => Battle.kept(c));
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
      && (!a.requires?.interceptWeapon || actor.equipment?.weapon?.intercept === true)
      && (!actor.stock?.[a.id] || actor.stock[a.id]!.length > 0));
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
    const own = this.plain(legal);
    this.impulse = own[this.expressions.number(`1d${own.length}`) - 1]!;
    this.history.push({ type: 'random', turn: this.turn, actor: actor.id });
  }
  // The automatic choice for whoever acts now: a creature carries out the intent it declared when the round began
  // if it still can (its target may have fallen, or it may be compelled), and otherwise does the best it can.
  chosen(): Command {
    const legal = this.legalCommands(), intent = this.intents.get(this.actor().id);
    if (intent && legal.some(c => c.ability === intent.ability && c.target === intent.target)) { return { ...intent }; }
    return Tactics.choose(this.state, this.plain(legal));
  }
  // The commands that use up nothing carried. What is chosen for anyone rather than by the company itself (a turn
  // left to the game's tactics, "auto", the laboratory's players) leaves what it carries to the company's own call.
  plain(legal: Command[]): Command[] {
    const actor = this.fighters.find(f => f.id === legal[0]?.actor);
    const own = legal.filter(c => !actor?.stock?.[c.ability]);
    return own.length ? own : legal;
  }
  // A thing used up in the fight is gone from what its carrier has to use; the next of its kind is what is used after.
  private spend(actor: Fighter, ability: string) {
    const [used, ...rest] = actor.stock?.[ability] ?? [];
    if (!used) { return; }
    actor.stock![ability] = rest; (actor.spent ??= []).push(used);
    if (rest[0]) { actor.abilitySources![ability] = { ...actor.abilitySources![ability]!, id: rest[0] }; }
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
      return this.settled(start);
    }
    delete actor.windup;
    const context = this.context(actor);
    if (actor.abilitySources?.[ability.id]) { context.source = actor.abilitySources[ability.id]; }
    AbilityUse.perform(ability, command.target, this.expressions, context);
    this.spend(actor, ability.id);
    if (actor.team === 'fighters' && ability.effects.some(e => e.kind === 'flee') && !context.retreat) { this.held++; }
    // One foe of several getting away leaves the fight alone, and the rest fight on; the last, or the company, ends
    // it (one wolf of three fleeing ended the fight, and counted as a win over all three: the review's A15).
    if (context.retreat && !context.location && actor.team !== 'fighters' && this.others(actor)) {
      this.depart(actor); this.finishIfEliminated();
    } else if (context.retreat || context.location) { this.finish('escaped', 'retreat', { actor: actor.id, team: actor.team }); }
    else { this.finishIfEliminated(); }
    // A creature with actions left this turn (hasted) acts again before its turn ends, if it has anything to do.
    if (!this.outcome && actor.hp > 0 && --this.actions > 0 && !actor.statuses.some(s => Effects.skips(s.id))
      && this.commandsFor(actor).length) {
      this.impulsive(actor);
      return this.settled(start);
    }
    if (!this.outcome) { this.endTurn(actor); }
    if (!this.outcome) { this.advance(); }
    return this.settled(start);
  }
  // A step done: what it made of the intents declared, the fight kept, and what happened in it.
  private settled(start: number): CombatEvent[] {
    this.redeclare();
    this.commit();
    return structuredClone(this.history.slice(start));
  }
  // An intent made impossible since the round began (its creature taunted onto another, its target fallen) is
  // declared again, as its turn would choose, so that what the company sees coming is what comes (play 8: a revenant
  // taunted by a drover still "meant to use claws on Maren").
  private redeclare() {
    for (const [id, intent] of this.intents) {
      const f = this.fighters.find(x => x.id === id), legal = f && f.hp > 0 ? this.commandsFor(f) : [];
      if (legal.some(c => c.ability === intent.ability && c.target === intent.target)) { continue; }
      if (!legal.length) { this.intents.delete(id); continue; }
      this.intents.set(id, Tactics.choose({ ...this.state, actor: id }, this.plain(legal)));
    }
  }
  // What can be done in this fight: the catalog's abilities, and the things the company carries to use up.
  get repertoire(): ArenaAbility[] { return this.abilities; }
  // The moment before a fight that came at the company closes, its first round: seen, or sprung on it.
  get opening(): Moment | undefined { return this.rounds === 1 ? this.moment : undefined; }
  // The company's chance of getting away if it runs now: sure in the moment, an even chance, then surer each time.
  flight(): number { return this.opening ? 1 : [0.5, 0.75][this.held] ?? 1; }
  private context(actor?: Fighter): EffectContext {
    return { ...actor ? { actor } : {}, ...actor?.team === 'fighters' ? { sure: !!this.opening, tries: this.held } : {},
      fighters: this.fighters, turn: this.turn, events: this.history,
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
    this.rounds++;
    const living = this.fighters.filter(f => f.hp > 0);
    const rolls = living.map(f => {
      const m = Effects.modifiers(f);
      return { id: f.id, roll: Fighting.d20(() => this.expressions.number('1d20'), m)
        + Fighting.statMod(Effects.scores(f).dexterity) + (m.initiative ?? 0) };
    });
    rolls.sort((a, b) => b.roll - a.roll);
    // In the moment, the side that saw the other first goes first, each in the order it rolled.
    if (this.opening) {
      const ours = this.moment === 'seen' ? 1 : -1;
      rolls.sort((a, b) => (this.first(b.id) - this.first(a.id)) * ours);
    }
    this.order = rolls.map(r => r.id);
    this.cursor = 0;
    this.history.push({ type: 'initiative', turn: this.turn, order: rolls });
    for (const f of living) {
      for (const s of f.statuses.filter(c => !c.clock && !c.waits)) { s.remaining--; }
      Effects.expire(f, s => !s.clock, this.context());
    }
    this.declare();
  }
  private first(id: string): number { return Number(this.fighters.find(f => f.id === id)?.team === 'fighters'); }
  // Combat.round: a foe that has turned to flight leaves before anyone rolls, and what it summoned goes with it.
  private rout() {
    for (const f of this.fighters.filter(x => x.hp > 0 && x.team !== 'fighters' && Effects.modifiers(x).flee)) {
      this.depart(f);
      this.history.push({ type: 'flee', turn: this.turn, actor: f.id, success: true });
    }
  }
  private depart(f: Fighter) {
    for (const g of [f, ...this.fighters.filter(s => s.summoner === f.id)]) {
      this.fighters.splice(this.fighters.indexOf(g), 1);
      if (!g.summoner) { this.departed.push(g); }
    }
  }
  // Whether others of its side are still in the fight and standing, not counting what it summoned.
  private others(f: Fighter): boolean {
    return this.fighters.some(x => x !== f && x.team === f.team && x.hp > 0 && x.summoner !== f.id);
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
      // Its turn has come: what others laid on it tells on it now, and runs down from here.
      for (const s of actor.statuses) { delete s.waits; }
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
