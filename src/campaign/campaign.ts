import { RandomStreams } from '../random-streams';
import { CommandResolutions } from './command-resolution';
import { Aftermath } from './aftermath';
import { FieldUse } from './field-use';
import { FieldResolver } from './field-resolver';
import { ObservationText } from '../lang/observation-text';
import { Operators } from './operators';
import { CompanyChoices } from './company-choices';
import { Perceptions } from './perceptions';
import { ModuleBundle, type BundleRequest } from './module-bundle';
import type { BundleSource } from './bundle-source';
import { ModuleInstallations } from './module-installations';
import { Agency } from './agency';
import { CreatureFacts } from './creature-facts';
import { Progression } from './progression';
import type { InstalledModule, CampaignActor, CampaignDefinition } from './definition';
import { ModuleWriter } from '../lang/module-writer';
import { ModuleCompiler } from '../lang/module-compiler';
import { CreatureStore } from '../creature-store';
import { LoadCache } from './load-cache';
import { CombatProjection } from '../combat-projection';
import { Battle } from '../arena';
import { Content, type CreatureGenerationContext } from '../content';
import type { CombatEvent, Fighter } from '../model';
import type { Instance, Module, WorldState } from '../lang/module';
import { World } from '../lang/world';
import { Planner, type Operator } from './planner';
import { RuntimeCapabilities } from './runtime-capabilities';
import { Overlays } from '../overlays';
import { CampaignTick } from './campaign-tick';
import { WatchLoop, type WatchHost } from './watch-loop';

export type { ModuleStatus, CampaignState, NpcDecision, CampaignSave, CampaignEvent } from './campaign-types';
import type { CampaignState, CampaignSave, CampaignEvent } from './campaign-types';
export class Campaign implements WatchHost {
  private compiled: Module;
  get module(): Module { return this.compiled; }
  private current: Omit<CampaignState, 'party' | 'creatures'>;
  private creatures = new CreatureStore();
  private log: CampaignEvent[] = [];
  private encounter = 0;
  private definition?: CampaignDefinition;
  private observations: Record<string, number> = {};
  private executing = false;
  // A campaign is a composition of installed modules (see Campaign.load); restore() resumes a save.
  constructor(seed: string, instance: Instance, saved?: CampaignSave) {
    if (saved) {
      this.compiled = structuredClone(saved.module); this.definition = structuredClone(saved.definition);
      this.current = structuredClone(saved.state); this.creatures = new CreatureStore(saved.creatures);
      this.log = structuredClone(saved.events); this.encounter = saved.encounter;
      this.observations = structuredClone(saved.observations);
      // A save from before demand grounding holds grounded actions; its schemas are in the definition.
      if (saved.actionFormat !== 'schemas' && this.definition?.schemas) {
        this.compiled.actions = this.definition.schemas;
      }
      new ModuleCompiler(RuntimeCapabilities.signatures).validate(this.module);
      if (this.definition) {
        const projected = CreatureFacts.project(this.world, this.definition.actors, this.creatures);
        if (projected.key() !== this.world.key()) { throw new Error('Inconsistent saved creature facts'); }
      }
      return;
    }
    if (!instance.campaign) { throw new Error('A campaign is a composition of installed modules'); }
    this.definition = structuredClone(instance.campaign);
    const content = new Content(`${seed}:campaign`);
    this.compiled = structuredClone(instance.module);
    for (const entry of this.definition.creatures) {
      const creature = (entry.seed ? new Content(entry.seed) : content).createCreature(entry.id, entry.context, entry.seed ? 'self' : entry.id);
      creature.state.gold += entry.gold;
      this.creatures.insert(creature);
    }
    const player = this.definition.actors.find(a => a.player);
    if (!player) { throw new Error('Campaign needs a player actor'); }
    const inhabitants: Record<string, string[]> = {};
    for (const actor of this.definition.actors) { inhabitants[actor.id] = [...actor.members]; }
    this.current = { seed, world: structuredClone(instance.world), partyIds: [...player.members],
      inhabitants, elapsed: 0, deadline: instance.budget, outcome: 'active' };
    CreatureFacts.initialize(this.world, this.definition.actors, this.creatures);
    this.refresh(); this.observe();
    this.updateOutcome();
  }
  // Loading is deterministic in (source, path, seed, party), so later loads fork the first.
  private static loads = new LoadCache<Campaign>();
  static async load(path: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[]): Promise<Campaign> {
    return (await this.loads.get(source, JSON.stringify([path, seed, party ?? null]),
      () => this.assemble(path, seed, source, party && structuredClone(party)))).fork();
  }
  private static arrays<T extends object>(o: T): T {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? [...v as unknown[]] : v])) as T;
  }
  // A fork shares compiled operators and definition records, which are never mutated after loading, behind fresh
  // top-level arrays, and copies all mutable state.
  private fork(): Campaign {
    const copy = Object.create(Campaign.prototype) as Campaign, arrays = Campaign.arrays;
    Object.assign(copy, { compiled: arrays(this.compiled), definition: this.definition && arrays(this.definition),
      current: structuredClone(this.current), creatures: new CreatureStore(this.creatures.snapshot),
      log: structuredClone(this.log), encounter: this.encounter, observations: structuredClone(this.observations),
      executing: false });
    return copy;
  }
  private static async assemble(path: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[]): Promise<Campaign> {
    const manifest = await ModuleBundle.campaign(path, source);
    party ??= manifest.party;
    let campaign: Campaign | undefined;
    for (const request of manifest.modules) {
      if (campaign) { await campaign.install(request, source); }
      else {
        const draft = await ModuleBundle.load(request, { seed }, source);
        if (party) { CompanyChoices.apply(draft, party); }
        Overlays.declareGear(draft.instance);
        campaign = new Campaign(seed, ModuleInstallations.prepare(undefined, draft, 0));
      }
    }
    campaign!.compiled.name = manifest.name;
    return campaign!;
  }
  async install(request: BundleRequest, source: BundleSource): Promise<void> {
    this.installBoundary();
    if (!this.definition?.installations) { throw new Error('Install modules into a bundle-based campaign'); }
    const startedAt = this.current.elapsed;
    const draft = await ModuleBundle.load(request, { seed: this.current.seed,
      elapsed: this.current.elapsed, installed: this.definition.installations }, source);
    this.installBoundary();
    if (this.current.elapsed !== startedAt) { throw new Error('Campaign advanced while loading module; retry installation'); }
    Overlays.declareGear(draft.instance);
    const next = ModuleInstallations.prepare({ module: this.module, world: this.current.world,
      budget: this.current.deadline, campaign: this.definition }, draft, this.current.elapsed);
    const { actors, store, world } = ModuleInstallations.populate(next, this.definition.actors, this.creatures);
    this.compiled = next.module; this.definition = next.campaign; this.creatures = store;
    this.commit(world); this.current.deadline = next.budget;
    for (const actor of actors) { this.current.inhabitants[actor.id] = [...actor.members]; }
    this.updateOutcome();
  }
  private installBoundary() {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Install only between commands'); }
  }
  get installations(): InstalledModule[] { return structuredClone(this.definition?.installations ?? []); }
  get schemas(): Operator[] { return structuredClone(this.definition?.schemas ?? []); }
  get actors(): CampaignActor[] { return structuredClone(this.definition?.actors ?? []); }
  explain() {
    if (!this.definition || this.executing) { return []; }
    return this.definition.actors.filter(a => !a.player)
      .map(actor => Agency.explain(this.world, actor, this.operators));
  }
  get playerActor(): string | undefined { return this.definition?.actors.find(a => a.player)?.id; }
  get persistent(): boolean { return !!this.definition; }
  get running(): boolean {
    return this.party.some(c => c.hp > 0) && (this.persistent || this.current.outcome === 'active');
  }
  // A save holds action schemas; operators are grounded on demand, so every save is compact.
  save(_compact = false): CampaignSave {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Save only between campaign commands'); }
    return structuredClone({ version: 1, actionFormat: 'schemas' as const, module: this.module,
      definition: this.definition, state: this.current,
      creatures: this.creatures.snapshot, events: this.log, encounter: this.encounter,
      observations: this.observations });
  }
  static restore(saved: CampaignSave): Campaign {
    if (saved.version !== 1) { throw new Error('Unsupported campaign save'); }
    return new Campaign(saved.state.seed,
      { module: saved.module, world: saved.state.world, budget: saved.state.deadline }, saved);
  }
  get state(): CampaignState {
    return { ...structuredClone(this.current), party: this.party, creatures: this.creatures.snapshot,
      ...(this.definition?.installations
        ? { modules: Progression.statuses(this.installations, this.world, this.observations) } : {}),
      ...(this.definition ? { outcomes: Progression.outcomes(this.world, this.definition),
        developments: Object.entries(this.observations).map(([id, elapsed]) => ({ id, elapsed })) } : {}) };
  }
  // What presentation reads many times a turn, without the copies state makes. Never change it.
  get readout() { return { ...this.current as Readonly<typeof this.current>, creatures: this.creatures.live }; }
  private get party(): Fighter[] {
    return this.current.partyIds.map(id => CombatProjection.fighter(this.creatures.get(id), 'fighters'));
  }
  get events(): CampaignEvent[] { return structuredClone(this.log); }
  // Worlds are immutable; one is built per distinct state object (and module) rather than per access.
  private viewed?: { state: WorldState; module: Module; world: World };
  private commit(world: World) {
    const state = world.snapshot;
    this.current.world = state;
    this.viewed = { state, module: this.module, world };
  }
  get world(): World {
    const v = this.viewed;
    if (v && v.state === this.current.world && v.module === this.module) { return v.world; }
    const world = new World(this.module, this.current.world);
    this.viewed = { state: this.current.world, module: this.module, world };
    return world;
  }
  private applicable?: { world: World; player: CampaignActor | undefined; actions: Operator[] };
  // Actions are grounded on demand against the current module and controllers.
  private grounded?: { module: Module; length: number; actors: CampaignActor[] | undefined; operators: Operators };
  get operators(): Operators {
    const g = this.grounded, actors = this.definition?.actors;
    if (g?.module === this.module && g.length === this.module.actions.length && g.actors === actors) {
      return g.operators;
    }
    const operators = new Operators(this.module, actors);
    this.grounded = { module: this.module, length: this.module.actions.length, actors, operators };
    return operators;
  }
  operator(id: string): Operator | undefined { return this.operators.get(id); }
  available(): Operator[] {
    if (!this.running || this.executing) { return []; }
    const player = this.definition?.actors.find(a => a.player), world = this.world;
    const memo = this.applicable;
    if (memo?.world === world && memo.player === player) { return structuredClone(memo.actions); }
    const actions = this.operators.applicable(world, player?.id)
      .filter(action => !player || player.allActions || player.actions.includes(action.schema ?? action.id));
    this.applicable = { world, player, actions };
    return structuredClone(actions);
  }
  plan(moduleId?: string) {
    if (!this.persistent && this.current.outcome === 'failure') { return null; }
    const player = this.definition?.actors.find(actor => actor.player);
    const installed = moduleId ? this.installations.find(m => m.id === moduleId) :
      this.installations.find(m => !this.world.test(m.goal));
    if (moduleId && !installed) { throw new Error('Unknown module'); }
    return Planner.search(this.world, installed?.goal ?? this.module.goal, this.moves.bind(this, player), {
      maxNodes: 2000,
      timeRemaining: (installed ? installed.deadline ?? Infinity : this.current.deadline) - this.current.elapsed,
    });
  }
  private moves(player: CampaignActor | undefined, world: World): Operator[] {
    return this.operators.applicable(world, player?.id).filter(a => !player || (!a.resolve
      && (player.allActions || player.actions.includes(a.schema ?? a.id))));
  }
  encounterBattle(actionId: string): Battle {
    const action = this.operator(actionId);
    if (action?.resolve?.name !== 'combat') { throw new Error('Action does not resolve a combat encounter'); }
    const seed = this.randomSeed(action, 'combat'), group = action.resolve.args[0]!;
    const attacker = action.actor && this.definition ?
      this.definition.actors.find(a => a.id === action.actor) : undefined;
    return Battle.encounter(this.creatures, [
      ...(attacker?.members ?? this.current.partyIds).map(creatureId => ({ creatureId, team: 'fighters' as const })),
      ...this.current.inhabitants[group]!.map(creatureId => ({ creatureId, team: 'goblins' as const })),
    ], { seed });
  }

  private action(id: string): Operator {
    const action = this.available().find(candidate => candidate.id === id);
    if (!action) { throw new Error(`Unavailable campaign action: ${id}`); }
    return action;
  }
  execute(id: string, play: (battle: Battle) => void = Campaign.autofight): CampaignEvent {
    const action = this.action(id), checkpoint = this.checkpoint();
    this.executing = true;
    let battle: Battle | undefined;
    try {
      battle = action.resolve?.name === 'combat' ? this.encounterBattle(id) : undefined;
      if (battle) { play(battle); }
      return this.complete(action, checkpoint, battle);
    } catch (error) { this.rollback(battle, checkpoint); throw error; }
    finally { this.executing = false; }
  }
  async executeAsync(id: string, play: (battle: Battle) => Promise<void>): Promise<CampaignEvent> {
    const action = this.action(id), checkpoint = this.checkpoint();
    this.executing = true;
    let battle: Battle | undefined;
    try {
      battle = action.resolve?.name === 'combat' ? this.encounterBattle(id) : undefined;
      if (battle) { await play(battle); }
      return this.complete(action, checkpoint, battle);
    } catch (error) { this.rollback(battle, checkpoint); throw error; }
    finally { this.executing = false; }
  }
  private checkpoint() {
    return { creatures: this.creatures.snapshot, current: structuredClone(this.current),
      observations: structuredClone(this.observations), events: this.log.length, encounter: this.encounter };
  }
  // A command that throws commits nothing: combat damage taken before the error is discarded with it.
  private rollback(battle: Battle | undefined, checkpoint: ReturnType<Campaign['checkpoint']>) {
    battle?.close();
    this.creatures = new CreatureStore(checkpoint.creatures); this.current = checkpoint.current;
    this.observations = checkpoint.observations; this.log.length = checkpoint.events;
    this.encounter = checkpoint.encounter;
  }
  private complete(action: Operator, checkpoint: ReturnType<Campaign['checkpoint']>, battle?: Battle): CampaignEvent {
    if (battle && !battle.state.outcome) { throw new Error('Encounter must finish before campaign resolution'); }
    const combat = battle?.events ?? [];
    this.settle(action, battle, combat);
    const held = !battle || battle.state.outcome === 'fighters'
      || battle.events.some(e => e.type === 'end' && e.fled?.team === 'goblins');
    let success = held && CommandResolutions.survived(action,
      this.creatures.snapshot, this.definition?.actors, this.module.entities);
    const causal = this.module.relations.some(r => r.name === 'witnessedAttack');
    // An activity that can be interrupted takes effect when it has run its course; anything else takes effect now.
    const before = this.world, deferred = !!action.interrupt;
    if (!deferred) { this.apply(action, success); }
    if (this.definition) { this.refresh(); }
    this.commit(Aftermath.record(before, this.world, action, combat));
    this.resolutions(combat, true);
    let response = success && action.report ? ObservationText.render(action.report, this.world) : undefined;
    if (!success && action.resolve?.name === 'expose') {
      response = 'The hazard brings down the exposed adventurer. The company does not cross; the injury is permanent until treated.';
    }
    const { npc, happenings, interrupted } = WatchLoop.pass(this, action, before, combat);
    if (deferred) { success &&= !interrupted; this.apply(action, success); }
    if (interrupted) { response = interrupted; }
    if (!interrupted && !this.shelter(action, combat)) {
      success = false;
      response = 'Your shelter becomes unsafe before recovery is complete. Time and the shared ration are spent, but health and mana are not restored.';
    }
    if (success && !CommandResolutions.survived(action, this.creatures.snapshot,
      this.definition?.actors, this.module.entities)) {
      success = false;
      response = 'The company can no longer act. Injuries and deaths remain; the attempt has failed.';
    }
    this.resolutions(combat, false);
    const after = this.world;
    if (action.resolve) { this.encounter++; }
    this.updateOutcome();
    const event: CampaignEvent = { action: action.id, elapsed: this.current.elapsed, result: success ? 'success' : 'failure',
      changes: CampaignTick.diff(before, after), combat: combat.filter(e => e.visibility !== 'private'),
      ...(response ? { response } : {}),
      ...(this.definition ? { npc } : {}) };
    if (causal) {
      event.resolution = CommandResolutions.receipt(action,
        { creatures: checkpoint.creatures, world: checkpoint.current.world, elapsed: checkpoint.current.elapsed },
        { creatures: this.creatures.snapshot, world: this.current.world, elapsed: this.current.elapsed },
        { events: combat, success, sequence: this.log.length });
    }
    const perceptions = Perceptions.after(this.module, { before, after, player: this.playerActor, happenings });
    const seen = Perceptions.witness(this.module, this.world, this.playerActor, perceptions);
    if (seen.changes.length) { this.commit(this.world.apply(seen.changes)); event.changes.push(...seen.noted); }
    if (perceptions) { event.perceptions = [...perceptions, ...seen.told]; }
    this.log.push(event);
    return structuredClone(event);
  }
  // A fight won is worth its experience; what the command resolves (other than a fight or a rest) happens now.
  private settle(action: Operator, battle: Battle | undefined, combat: CombatEvent[]) {
    const won = battle?.state.outcome === 'fighters' || combat.some(e => e.type === 'end' && e.fled?.team === 'goblins');
    if (won && action.resolve?.name === 'combat') {
      const opponent = action.resolve.args[0]!;
      FieldUse.award(this.creatures, this.current.partyIds, this.world,
        { opponent, members: this.current.inhabitants[opponent] ?? [], events: combat });
    }
    if (action.resolve && !['combat', 'recover', 'rough'].includes(action.resolve.name)) {
      combat.push(...this.field(action));
    }
  }
  // A rest recovers the company at its end, if the shelter is still safe; whether it was.
  private shelter(action: Operator, combat: CombatEvent[]): boolean {
    if (action.resolve?.name !== 'recover' && action.resolve?.name !== 'rough') { return true; }
    const site = action.bindings?.site;
    const safe = !!site && (action.schema !== 'rest' || this.world.test(ModuleWriter.call('restful', site)))
      && !this.world.test(ModuleWriter.call('closed', site));
    if (safe) { combat.push(...this.field(action)); this.refresh(); }
    return safe;
  }
  private randomSeed(action: Operator, domain: string): string {
    return RandomStreams.command(this.current.seed, domain, { installations: this.definition?.installations,
      operator: this.operator.bind(this), history: this.log }, action);
  }
  private field(action: Operator): CombatEvent[] {
    return FieldResolver.resolve(action, { module: this.module, creatures: this.creatures, world: this.world,
      actors: this.definition?.actors ?? [], seed: this.randomSeed(action, 'field') });
  }
  get tickState() { return { definition: this.definition!, creatures: this.creatures, current: this.current }; }
  applyAction(action: Operator, success = true) { this.apply(action, success); }
  refreshProjection() { this.refresh(); }
  recordObservations() { this.observe(); }
  commitWorld(world: World) { this.commit(world); }
  advanceWatch(combat: CombatEvent[]) {
    this.current.elapsed++;
    if (FieldUse.advance(this.creatures, this.current.elapsed, combat,
      { world: this.world, actors: this.definition?.actors ?? [], player: this.playerActor })) { this.refresh(); }
    if (this.definition) { this.commit(this.world.apply(CampaignTick.clock(this.world, this.current.elapsed))); }
  }
  settleWatch(combat: CombatEvent[]) {
    this.commit(Progression.check(this.world, this.definition!, this.current.elapsed));
    this.resolutions(combat, false);
    this.observe();
  }
  private apply(action: Operator, success: boolean) {
    const before = this.world, after = before.apply(success ? action.success : action.failure);
    if (this.definition) { CreatureFacts.commitMoney(before, after, this.definition.actors, this.creatures); }
    this.commit(after);
  }
  // Experience changes what members may train; the facts must agree with the store before anything is saved.
  private resolutions(events: CombatEvent[], own: boolean) {
    if (!this.definition) { return; }
    Progression.resolutions(this.world, this.definition, this.observations, { elapsed: this.current.elapsed,
      store: this.creatures, party: this.current.partyIds, events, own });
    this.refresh();
  }
  // The projection is a function of creatures, actors and the relations it writes; skip it when none has changed.
  private projected?: { store: CreatureStore; stamp: string; actors: CampaignActor[]; module: Module };
  private refresh() {
    if (!this.definition) { return; }
    const p = this.projected, { creatures: store, definition: { actors } } = this;
    if (p?.store === store && p.actors === actors && p.module === this.module
      && p.stamp === CreatureFacts.stamp(this.world, store)) { return; }
    this.commit(CreatureFacts.project(this.world, actors, store));
    this.projected = { store, stamp: CreatureFacts.stamp(this.world, store), actors, module: this.module };
  }
  private observe() {
    if (!this.definition) { return; }
    for (const [id, active] of Object.entries(Progression.outcomes(this.world, this.definition))) {
      if (active && this.observations[id] === undefined) { this.observations[id] = this.current.elapsed; }
    }
  }
  // Campaigns are open-ended: installed situations report outcomes; the campaign itself does not end.
  private updateOutcome() { this.current.outcome = 'active'; this.observe(); }
  static autofight(battle: Battle) { while (!battle.state.outcome) { battle.step(battle.chosen()); } }
}
