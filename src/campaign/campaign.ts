import { RandomStreams } from '../random-streams'; import { Installed, type InstalledDomain } from '../ports/installed';
import { CampaignAssembly } from './campaign-assembly'; import { CommandResolutions } from './command-resolution';
import { Aftermath } from './aftermath'; import { FieldUse } from './field-use'; import { PlaneLaws } from './plane-laws';
import { ActionParts } from '../lang/action-parts'; import { Operators } from './operators'; import { Shelter } from './shelter';
import { FieldResolver } from './field-resolver'; import { Perceptions } from './perceptions'; import { Costs } from '../costs';
import { ModuleBundle, type BundleRequest } from './module-bundle'; import type { BundleSource } from './bundle-source';
import { ModuleInstallations } from './module-installations'; import { CanonInstall } from './canon-install';
import { CreatureFacts } from './creature-facts'; import { Progression } from './progression';
import type { InstalledModule, CampaignActor, CampaignDefinition, CampaignInstance } from './definition';
import { KeptReading, ModuleCompiler, WorldReads } from '../lang';
import { ModuleWriter } from '../lang/module-writer';
import { CreatureStore } from '../creature-store'; import { HeldConditions } from './held-conditions';
import { CommittedWorld } from './committed-world'; import { Endings } from '../lang/endings';
import { Projection } from './projection'; import { CampaignGrounding } from './campaign-grounding';
import type { Creature } from '../creature'; import { Membership, type LiveCache } from './membership';
import { CampaignPlan } from './campaign-plan'; import { Battle } from '../arena';
import { LoadCache, type Assembly } from './load-cache'; import { CombatProjection } from '../combat-projection';
import { Content, type CreatureGenerationContext } from '../content';
import type { CombatEvent, Fighter } from '../model'; import type { Module } from '../lang/module';
import { World } from '../lang/world'; import { Beside } from './beside'; import { Checks } from '../rules/checks';
import type { Operator } from './planner'; import { RuntimeCapabilities } from './runtime-capabilities';
import { EngineDeclarations } from './engine-declarations'; import { Spoils } from './spoils'; import { CampaignTick } from './campaign-tick'; import { Mercy } from './mercy';
import { WatchLoop, type WatchHost } from './watch-loop'; import { Environment } from './environment';
import { Journey } from './journey'; import type { ItemCatalog } from '../item-catalog';
import { ActionTime } from './action-time'; import { Engagement } from './engagement';
import type { VocabularyContext } from '../lang';

export type { ModuleStatus, CampaignState, NpcDecision, CampaignSave, CampaignEvent } from './campaign-types'; import type { CampaignState, CampaignSave, CampaignEvent, Dated, Restored } from './campaign-types';
import { Crossing, type ExecutionContext } from './crossing'; import { SemanticRecords } from '../lang/semantic-record';
import { SavedSchemas } from './saved-schemas'; import { LifeLost } from './life-lost'; import { CampaignCopies } from './campaign-copies';
export class Campaign implements WatchHost {
  private compiled: Module;
  // Its kinds of thing, the catalog's and its modules' own (see ItemCatalog), held by its creatures' store.
  get module(): Module { return this.compiled; } get catalog(): ItemCatalog { return this.creatures.catalog; }
  private current: Omit<CampaignState, 'party' | 'creatures'>;
  private creatures: CreatureStore; private log: CampaignEvent[] = []; private encounter = 0;
  // A check made to come out so, for a test (see Checks.make; Journey.roll).
  forced?: 'pass' | 'fail'; private definition?: CampaignDefinition;
  // command: the command a session has open here, from resolved to committed (what came of it drawn, told, its step
  // kept): no save and no frame is made of it meanwhile (MT-24, command-receipt.md: a save had held the command's world
  // without its step). Set and closed by the session (PlaySession.perform); see closeCommand. fighting: a fight of it
  // waits on the player, whose page is drawn where the fight is (the one frame made mid-command: ScreenModel.build).
  private observations: Record<string, number> = {}; private executing = false; command?: string; fighting = false;
  // The rules it is played under (OR-520): the installation in scope when it was made or restored; it acts within them.
  readonly installation: InstalledDomain = Installed.current(); vocabulary: VocabularyContext;
  within<T>(run: () => T): T { return Installed.within(this.installation, run); }
  // A campaign owns its composed instance. Restore copies and validates a save unless ownership is handed over or
  // trusted.
  constructor(seed: string, instance: CampaignInstance, vocabulary: VocabularyContext,
    options: { restored?: Restored; dated?: Dated } = {}) {
    const { restored, dated } = options;
    this.vocabulary = vocabulary;
    const saved = restored && (restored.owned ? restored.save : structuredClone(restored.save));
    if (saved) {
      // Its own kinds first: the company carries things of them, in a page that may have played nothing yet.
      this.vocabulary.install(saved.module.catalog); this.compiled = saved.module;
      this.definition = SavedSchemas.read(saved);
      this.creatures = CreatureStore.fromKinds(saved.module.catalog, saved.creatures);
      this.current = saved.state; this.log = saved.events; this.encounter = saved.encounter;
      this.observations = saved.observations;
      // A save from before demand grounding holds grounded actions; its schemas are in the definition.
      if (saved.actionFormat !== 'schemas' && this.definition?.schemas) {
        this.compiled.actions = this.definition.schemas;
      }
      if (!restored.trusted) { new ModuleCompiler(RuntimeCapabilities.signatures, true).validate(this.module); }
      if (this.definition && CreatureFacts.saved(this.world, this.live, this.creatures) === 'stale') { this.refresh(); }
      // A game kept by an earlier build may carry its fights' weariness on whoever fought them (HeldConditions).
      if (!restored.trusted && HeldConditions.release(this.creatures)) { this.refresh(); }
      return;
    }
    if (!instance.campaign) { throw new Error('A campaign is a composition of installed modules'); }
    this.definition = instance.campaign; const content = new Content(`${seed}:campaign`);
    this.compiled = instance.module; this.creatures = CreatureStore.fromKinds(instance.module.catalog);
    for (const entry of this.definition.creatures) {
      this.creatures.insert(ModuleInstallations.creature(this.catalog, entry, content));
    }
    const player = this.definition.actors.find(a => a.player);
    if (!player) { throw new Error('Campaign needs a player actor'); }
    const inhabitants = Object.fromEntries(this.definition.actors.map(a => [a.id, [...a.members]]));
    this.current = { seed, world: instance.world, partyIds: [...player.members], inhabitants, elapsed: 0,
      deadline: instance.budget, outcome: 'active', ...Object.fromEntries(Object.entries(dated ?? {}).filter(([, v]) => v)) };
    // The clock reads the hour from the start: how long until dark, until first light, until the day turns.
    this.commit(this.world.apply(CampaignTick.clock(this.world, this.current)));
    CreatureFacts.initialize(this.world, this.definition.actors, this.creatures);
    this.refresh(); CampaignTick.settle(this); this.observe(); this.updateOutcome();
  }
  // Loading is deterministic in (source, path, seed, party), so later loads fork the first, with its own kinds.
  private static loads = new LoadCache<Campaign>();
  // Who for, as a list, or with what is told as each module is taken in (step: the page's progress while it waits; it
  // may throw to give the load up, a start made ready for choices since changed: EngineStarts).
  static load(...a: Parameters<typeof Campaign.loaded>) { return Costs.timed('campaign', () => this.loaded(...a)); }
  static loaded(path: string, seed: string, source: BundleSource, party?: CreatureGenerationContext[] | Assembly) {
    const at: Assembly = Array.isArray(party) ? { party } : party ?? {};
    return this.loads.take(source, { key: JSON.stringify([path, seed, at.party ?? null, Installed.current().id]),
      installation: Installed.current().id }, () => CampaignAssembly.assemble({ path, seed, source,
        at: { ...at, party: at.party && structuredClone(at.party) }, vocabulary: Content.vocabulary() }),
      l => l.fork());
  }
  // Compiled records and the immutable world are shared; arrays, mutable state and the campaign's context are copied.
  // The projection is forked so a copy does not rebuild every actor's unchanged facts (OR-91).
  private fork(): Campaign {
    this.keepFacts();
    const copy = Object.create(Campaign.prototype) as Campaign, arrays = CampaignCopies.arrays, world = this.world;
    const vocabulary = this.vocabulary.fork();
    const compiled = arrays(this.compiled), current = structuredClone(this.current);
    const creatures = new CreatureStore(this.catalog, this.creatures.snapshot), committed = new CommittedWorld();
    const projection = this.projection.forked(world, this.creatures,
      { world: committed.share(current, compiled, world), store: creatures });
    Object.assign(copy, {
      compiled, vocabulary, definition: this.definition && arrays(this.definition), current, creatures,
      log: structuredClone(this.log), encounter: this.encounter, observations: structuredClone(this.observations),
      executing: false, installation: Installed.current(), committed, grounding: new CampaignGrounding(),
      projection });
    return copy;
  }

  // checked: the joined whole checked now; everyone: every actor's creature facts projected now (by default, when the
  // whole is checked), else nobody's until the campaign next projects them.
  install(request: BundleRequest, source: BundleSource, checked = true, everyone = checked): Promise<void> {
    return Installed.during(this.installation, async () => {
      this.installBoundary();
      if (!this.definition?.installations) { throw new Error('Install modules into a bundle-based campaign'); }
      await CanonInstall.before(this, request, source); const startedAt = this.current.elapsed;
      const { seed, elapsed, canonless } = this.current, vocabulary = this.vocabulary.fork();
      const draft = await ModuleBundle.load(request, { seed, elapsed,
        installed: this.definition.installations, people: this.compiled.entities, canonless,
        kinds: this.compiled.catalog, vocabulary }, source);
      this.vocabulary = vocabulary;
      this.installBoundary();
      if (this.current.elapsed !== startedAt) { throw new Error('Campaign advanced while loading module; retry installation'); }
      EngineDeclarations.declare(draft, CreatureStore.catalogAmong(this.module.catalog, draft.instance.module.catalog));
      const next = ModuleInstallations.prepare({ module: this.module, world: this.current.world, live: this.world,
        budget: this.current.deadline, campaign: this.definition }, draft, this.current.elapsed, checked);
      const { actors, store, world } = ModuleInstallations.populate(next, this.creatures, this.current);
      this.compiled = next.module; this.definition = next.campaign; this.creatures = store;
      this.commit(world); this.current.deadline = next.budget;
      for (const actor of actors) { this.current.inhabitants[actor.id] = [...actor.members]; }
      // Everyone's facts projected, by the campaign's own projection (so that what it asks next is only what changed);
      // or, joined unchecked for a game being assembled, nobody's yet: everyone's once the last is in.
      if (everyone) { this.refresh(); }
      // Settled unless joined unchecked and for its newcomers only, as a game assembled joins all but its last (a start
      // had asked its country's every rule once for each of its 37 installs: 0.6 s; see assemble).
      if (checked || everyone) { CampaignTick.settle(this); } this.updateOutcome();
  }); }
  private installBoundary() {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Install only between commands'); }
  }
  // Read many times a turn (the page's observation reads both), so given as they are, for reading only.
  get installations(): readonly InstalledModule[] { return this.definition?.installations ?? []; }
  get schemas(): Operator[] { return structuredClone(this.definition?.schemas ?? []); }
  get actors(): readonly CampaignActor[] { return this.definition?.actors ?? []; }
  get playerActor(): string | undefined { return this.definition?.actors.find(a => a.player)?.id; }
  get persistent(): boolean { return !!this.definition; }
  // What the world could not take (the canon, in a world kept from before it: see CanonInstall), said for the lint.
  get conflicts(): readonly string[] { return this.definition?.conflicts ?? []; }
  conflict(note: string) { this.definition = { ...this.definition!, conflicts: [...this.conflicts, note] }; }
  // Whether anyone of the company stands, from the live records: read many times a turn (`party` copies each twice);
  // and the one who plays is not dead past raising (LifeLost).
  get running(): boolean {
    const ids = this.current.partyIds, w = this.world;
    return ids.some(id => this.creatures.peek(id).state.hp > 0) && (this.persistent || this.current.outcome === 'active')
      && !Endings.reached(w, this.installations) && !LifeLost.lost(w, this.module.entities, this.creatures, ids[0]);
  }
  // A copy to play on beside this one, between commands: what a save restored would be, without writing the game out
  // and reading it back (a fork: a kept game's round trip had taken a third of a second, its module checked again).
  copy(): Campaign {
    if (this.executing || this.command || this.creatures.hasActiveLeases) { throw new Error('Copy only between campaign commands'); }
    return this.fork();
  }
  // A save holds schemas (operators are grounded on demand); a copy, unless written out at once (live: not to be kept).
  save(_compact = false, live = false): CampaignSave {
    if (this.executing || this.command || this.creatures.hasActiveLeases) { throw new Error('Save only between campaign commands'); }
    this.keepFacts();
    // Written out at once (live), the creatures are given as they are: a copy of every one is what a kept copy needs.
    // Its declarations as written are the compiler's, read again from source, never kept (MT-30: SemanticRecords).
    // Its schemas are its module's actions, written once (SavedSchemas: MT-27).
    const save = { version: 1 as const, actionFormat: 'schemas' as const, module: SemanticRecords.unwritten(this.module),
      ...SavedSchemas.of(this.definition, this.module), state: this.current,
      creatures: live ? this.creatures.live as Creature[] : this.creatures.snapshot, events: this.log,
      encounter: this.encounter, observations: this.observations };
    return live ? save : structuredClone(save);
  }
  static restore(saved: CampaignSave, handed: { owned?: boolean; trusted?: boolean } = {}): Campaign {
    if (saved.version !== 1) { throw new Error('Unsupported campaign save'); }
    return new Campaign(saved.state.seed,
      { module: saved.module, world: saved.state.world, budget: saved.state.deadline }, Content.vocabulary(),
      { restored: { save: saved, ...handed } });
  }
  get state(): CampaignState {
    this.keepFacts();
    return { ...structuredClone(this.current), party: this.fighters, creatures: this.creatures.snapshot,
      ...(this.definition?.installations
        ? { modules: Progression.statuses(this.installations, this.world, this.observations) } : {}),
      ...(this.definition ? { outcomes: Progression.outcomes(this.world, this.definition),
        developments: Object.entries(this.observations).map(([id, elapsed]) => ({ id, elapsed })) } : {}) };
  }
  // Access exposes mutable state outside World; enclosing world-read computations cannot be kept.
  get readout() { WorldReads.all(); return { ...this.current, creatures: this.creatures.live }; }
  get readWorld() { return KeptReading.memo.bind(KeptReading, this.world); }
  // The log, the action schemas and the company as it would fight, likewise without copies. Never change them.
  get history(): readonly CampaignEvent[] { return this.log; } get elapsed(): number { return this.current.elapsed; } get schemaList(): readonly Operator[] { return this.definition?.schemas ?? []; }
  get installed(): string[] { return (this.definition?.installations ?? []).map(m => m.id); }
  get fighters(): Fighter[] { return this.current.partyIds.map(id => CombatProjection.fighter(this.catalog, this.creatures.get(id), 'fighters')); }
  get events() { return structuredClone(this.log); }
  // What the company was told of the last command, kept with it (see Telling): what it has heard is not said again.
  // And what the world said that was held back as told lately (see RuleWords).
  told(voiced: NonNullable<CampaignEvent['voiced']>, unsaid: string[] = []) {
    Object.assign(this.log.at(-1) ?? {}, { voiced }, unsaid.length ? { unsaid } : {}); }
  // The world as last committed (see CommittedWorld): its facts are written into the state only when it is read whole.
  private committed = new CommittedWorld();
  private commit(world: World) { this.committed.commit(this.current, this.module, world); }
  private keepFacts() { this.committed.keep(this.current); }
  get world(): World { return this.committed.of(this.current, this.module); }
  // Actions are grounded on demand against the current module and controllers (see CampaignGrounding).
  private grounding = new CampaignGrounding();
  get operators(): Operators { return this.grounding.operators(this.module, this.definition?.actors); }
  operator(id: string): Operator | undefined { return this.operators.get(id); }
  available(): Operator[] { return structuredClone(this.offered()) as Operator[]; }
  // The actions open to the player now, worked out once for this world: to read without copying. Never change them.
  offered(): readonly Operator[] { return this.asked(o => o.offered(this.world, this.player, this.operators)) ?? []; }
  private get player() { return this.definition?.actors.find(a => a.player); }
  // Asked of the grounding only while the campaign runs and no command is under way.
  private asked<T>(ask: (g: CampaignGrounding) => T): T | undefined {
    return this.running && !this.executing ? Installed.within(this.installation, () => ask(this.grounding)) : undefined;
  }
  plan(moduleId?: string) { return CampaignPlan.plan(this, moduleId); }
  encounterBattle(actionId: string, assault = false): Battle {
    const action = this.operator(actionId);
    if (action?.resolve?.name !== 'combat') { throw new Error('Action does not resolve a combat encounter'); }
    const seed = this.randomSeed(action, 'combat'), group = action.resolve.args[0]!;
    const attacker = action.actor && this.definition ? this.live.find(a => a.id === action.actor) : undefined;
    const members = attacker?.members ?? this.current.partyIds, foes = Beside.foes(this.world, this.readout, group);
    return Battle.encounter(this.creatures, [...members.map(creatureId => ({ creatureId, team: 'fighters' as const })),
      ...foes.map(creatureId => ({ creatureId, team: 'goblins' as const }))],
    { seed, ...Environment.encounter(this.world, this.playerActor, members, group),
      ...assault ? { moment: Engagement.moment(this, group) } : {} });
  }

  // The offered action of that id, if it may be done as it is asked (a way into another hex, only on a journey).
  private action(id: string, via: ExecutionContext): Operator {
    // Its own schema alone grounded, not every action of the world (OR-725).
    const action = structuredClone(this.asked(g => g.one(this.world, this.player, this.operators, id)));
    if (!action) { throw Crossing.withheld(this, id) ?? new Error(`Unavailable campaign action: ${id}`); }
    this.crossing.bound(this, action, via);
    return action;
  }
  execute(id: string, play: (battle: Battle) => void = Campaign.autofight, via: ExecutionContext = {}): CampaignEvent {
    return Installed.within(this.installation, () => {
      const action = this.action(id, via), checkpoint = this.begun = this.checkpoint();
      this.executing = true; let battle: Battle | undefined;
      try {
        battle = action.resolve?.name === 'combat' ? this.encounterBattle(id) : undefined;
        if (battle) { play(battle); }
        const event = this.complete(action, checkpoint, battle), assault = Engagement.assault(this);
        if (!assault) { return structuredClone(this.log.at(-1) ?? event); }
        battle = this.encounterBattle(assault.id, true); play(battle);
        const fight = this.complete(assault, this.checkpoint(), battle);
        return Engagement.after(this, event, fight, assault.bindings!.opponent!);
      } catch (error) { this.rollback(battle, checkpoint); throw error; } finally { this.executing = false; }
  }); }
  executeAsync(id: string, play: (battle: Battle) => Promise<void>, via: ExecutionContext = {}) {
    return Installed.during(this.installation, async () => {
      const action = this.action(id, via), checkpoint = this.begun = this.checkpoint();
      this.executing = true; let battle: Battle | undefined;
      try {
        battle = action.resolve?.name === 'combat' ? this.encounterBattle(id) : undefined;
        if (battle) { await play(battle); }
        const event = this.complete(action, checkpoint, battle), assault = Engagement.assault(this);
        if (!assault) { return structuredClone(this.log.at(-1) ?? event); }
        battle = this.encounterBattle(assault.id, true); await play(battle);
        const fight = this.complete(assault, this.checkpoint(), battle);
        return Engagement.after(this, event, fight, assault.bindings!.opponent!);
      } catch (error) { this.rollback(battle, checkpoint); throw error; } finally { this.executing = false; }
  }); }
  // Made when first asked for: a campaign forked or restored is made without its fields (see fork).
  private crossed?: Crossing;
  get crossing(): Crossing { return this.crossed ??= new Crossing(); }
  // What a command undoes to if it throws, and what its receipt is told against: the world itself and the creature
  // store's records, which are replaced when they change and never changed where they lie, so neither is copied.
  // It holds the module and definition too, so that what came of a command after it (the country beyond it drew,
  // installed) is undone with it (see undo).
  private checkpoint() {
    return { creatures: this.creatures.with(this.catalog, []), world: this.world, compiled: this.compiled,
      current: structuredClone({ ...this.current, world: undefined }), definition: this.definition,
      vocabulary: this.vocabulary.fork(), observations: structuredClone(this.observations),
      events: this.log.length, encounter: this.encounter };
  }
  // The last command undone, with all that came of it: a session whose command failed after the campaign had carried
  // it out (drawing the country beyond) keeps nothing of it (Mission 15's independent audit, F3).
  private begun?: ReturnType<Campaign['checkpoint']>;
  undo() { if (this.begun) { this.rollback(undefined, this.begun); this.begun = undefined; } }
  // The command's world made the campaign's for good, at the session's end, its receipt written (MT-24's third step):
  // until then it is undone whole (undo), after it never.
  closeCommand() { this.command = undefined; this.begun = undefined; this.fighting = false; }
  // A command that throws commits nothing: combat damage taken before the error is discarded with it.
  private rollback(battle: Battle | undefined, checkpoint: ReturnType<Campaign['checkpoint']>) {
    battle?.close();
    this.vocabulary = checkpoint.vocabulary;
    this.compiled = checkpoint.compiled; this.definition = checkpoint.definition;
    this.creatures = checkpoint.creatures; this.current = { ...checkpoint.current, world: this.current.world };
    this.observations = checkpoint.observations; this.log.length = checkpoint.events;
    this.encounter = checkpoint.encounter; this.commit(checkpoint.world);
  }
  private complete(action: Operator, checkpoint: ReturnType<Campaign['checkpoint']>, battle?: Battle): CampaignEvent {
    if (battle && !battle.state.outcome) { throw new Error('Encounter must finish before campaign resolution'); }
    const combat = battle?.events ?? [];
    this.settle(action, battle, combat);
    const held = !battle || battle.state.outcome === 'fighters'
      || battle.events.some(e => e.type === 'end' && e.fled?.team === 'goblins');
    let success = held && Checks.passed(combat) && CommandResolutions.survived(action,
      this.creatures.live, this.definition && this.live, this.module.entities);
    const causal = this.module.relations.some(r => r.name === 'witnessedAttack');
    // An activity that can be interrupted takes effect when it has run its course, a journey when the company
    // arrives, anything else at once.
    const before = this.world, leg = success ? Journey.of(before, action, this.playerActor,
      ActionTime.of(action, before)) : undefined, deferred = !!action.interrupt || !!leg;
    if (!deferred) { this.apply(action, success); }
    if (leg) { this.commit(Journey.depart(this.world, leg)); }
    if (this.definition) { this.refresh(); }
    this.commit(Aftermath.record(before, this.world, action, combat));
    this.resolutions(combat, true);
    let response = ActionParts.told(action, success, this.world);
    if (!success && action.resolve?.name === 'expose' && !action.otherwise) { response = CommandResolutions.downed(action, this.world); }
    const pass = WatchLoop.pass(this, action,
      { before, combat, ...leg ? { journey: { leg, arrive: Journey.arrive.bind(Journey, this, action, leg) } } : {} });
    const { npc, happenings, interrupted } = pass;
    if (deferred && !leg) { success &&= !interrupted; this.apply(action, success); }
    if (leg) { success &&= Journey.landed(this, action, leg, 'turned' in pass); }
    // Cut short, an activity's own words are not said; an act done at once was done, and is told before who fell on the
    // company for it (a warning-off failed had been only "The footpads come at you!": CL-10).
    if (interrupted) { response = !deferred && response ? `${response} ${interrupted}` : interrupted; }
    if (!interrupted && !this.shelter(action, combat, success)) { success = false; response = 'Your shelter becomes unsafe before recovery is complete. Time and the shared ration are spent, but health and mana are not restored.'; }
    const standing = CommandResolutions.survived(action, this.creatures.live, this.definition && this.live,
      this.module.entities);
    if (success && !standing) { success = false; response = 'The company can no longer act. Injuries and deaths remain; the attempt has failed.'; }
    this.resolutions(combat, false);
    const after = this.world;
    if (action.resolve) { this.encounter++; }
    this.updateOutcome();
    const event: CampaignEvent = { action: action.id, elapsed: this.current.elapsed, result: success ? 'success' : 'failure',
      changes: CampaignTick.diff(before, after), combat: combat.filter(e => e.visibility !== 'private'),
      ...(response ? { response } : {}), ...(interrupted ? { cut: true as const } : {}),
      ...(this.definition ? { npc } : {}) };
    if (causal) {
      event.resolution = CommandResolutions.receipt(action,
        { creatures: checkpoint.creatures.live, world: checkpoint.world, elapsed: checkpoint.current.elapsed },
        { creatures: this.creatures.live, world: this.world, elapsed: this.current.elapsed },
        { events: combat, success, sequence: this.log.length });
    }
    const seen = Perceptions.settle(this, { before, after, happenings });
    event.changes.push(...seen.noted); if (seen.perceptions) { event.perceptions = seen.perceptions; }
    // What the rules did in answer to what was learned (see CampaignTick.answer) may have sent someone home.
    if (seen.answered) { this.updateOutcome(); }
    this.log.push(event);
    return structuredClone(event);
  }
  // A fight won is worth the foes it defeated, not one that got away (the architecture review's A15); what the
  // command resolves (other than a fight or a rest) happens now.
  private settle(action: Operator, battle: Battle | undefined, combat: CombatEvent[]) {
    const won = battle?.state.outcome === 'fighters' || combat.some(e => e.type === 'end' && e.fled?.team === 'goblins');
    const taken = battle?.state.outcome === 'goblins' && Mercy.spare(this.world, this.creatures,
      { ...this.current, player: this.playerActor, combat }); if (taken) { this.commit(taken); this.refresh(); }
    const opponent = action.resolve?.args[0];
    if (won && action.resolve?.name === 'combat' && opponent) {
      this.commit(Spoils.won(this.world, this.creatures, { opponent, events: combat, party: this.current.partyIds,
        fallen: Beside.fallen(this.world, this.readout, opponent), company: this.playerActor }));
    }
    if (action.resolve && Membership.resolves(action.resolve)) {
      this.commit(Membership.resolve({ current: this.current, company: this.playerActor, module: this.module,
        world: this.world, creatures: this.creatures }, action.resolve)); this.refresh(); return;
    }
    if (action.resolve && !['combat', 'recover', 'rough'].includes(action.resolve.name) && !action.interrupt) {
      const e = this.field(action); combat.push(...e); PlaneLaws.carry(this.world, this.live, e, w => this.commit(w));
    }
  }

  // The actors as they stand, after anyone has joined the company (see Membership).
  private liveCache?: LiveCache;
  private get live(): CampaignActor[] {
    const { actors, cache } = Membership.live(this.definition?.actors ?? [], this.current, this.liveCache);
    this.liveCache = cache;
    return actors;
  }
  // A rest recovers the company at its end, if the shelter is still safe; whether it was.
  // What an activity that can be interrupted brings (a search, its finds) comes, like a rest's recovery, when it has
  // run its course and was not interrupted, not before it is known whether it happened (see settle).
  private shelter(action: Operator, combat: CombatEvent[], success: boolean): boolean {
    const safe = Shelter.safe(action, (r, s) => this.world.test(ModuleWriter.call(r, s))), name = action.resolve?.name;
    const due = safe && (Shelter.rest(action) || (success && !!action.interrupt && !!name && name !== 'combat'));
    if (due) { combat.push(...this.field(action)); this.refresh(); }
    return safe;
  }
  private randomSeed(action: Operator, domain: string): string {
    return RandomStreams.command(this.current.seed, domain, { installations: this.definition?.installations,
      operator: this.operator.bind(this), history: this.log }, action);
  }
  private field(action: Operator): CombatEvent[] {
    return FieldResolver.resolve(action, { module: this.module, creatures: this.creatures, world: this.world,
      actors: this.live, seed: this.randomSeed(action, 'field'), forced: this.forced });
  }
  get tickState() { return { definition: { ...this.definition!, actors: this.live }, creatures: this.creatures,
    current: this.current }; }
  applyAction(action: Operator, success = true) { this.apply(action, success); }
  refreshProjection() { this.refresh(); } recordObservations() { this.observe(); }
  commitWorld(world: World) { this.commit(world); }
  amend(event: CampaignEvent) { this.log[this.log.length - 1] = structuredClone(event); }
  advanceWatch(combat: CombatEvent[], asleep = false) { return Installed.within(this.installation, () => {
      const elapsed = ++this.current.elapsed;
      const scene = { world: this.world, actors: this.live, player: this.playerActor, asleep, seed: this.current.seed };
      const lawful = !!this.definition && PlaneLaws.watch(this.creatures, combat, { ...scene, elapsed });
      if (FieldUse.advance(this.creatures, elapsed, combat, scene) || lawful) { this.refresh(); }
      if (this.definition) { this.commit(this.world.apply(CampaignTick.clock(this.world, this.current))); }
  }); }
  settleWatch(combat: CombatEvent[]) { return Installed.within(this.installation, () => {
      this.commit(Progression.check(this.world, this.definition!, this.current.elapsed));
      this.resolutions(combat, false);
      this.observe();
  }); }
  private apply(action: Operator, success: boolean) {
    const before = this.world, after = Crossing.kept(this, action, before,
      Journey.along(before, before.apply(success ? action.success : action.failure), this.playerActor));
    if (this.definition) { CreatureFacts.commitMoney(before, after, this.live, this.creatures); }
    this.commit(after);
  }
  // Experience changes what members may train; the facts must agree with the store before anything is saved.
  private resolutions(events: CombatEvent[], own: boolean) {
    if (!this.definition) { return; }
    Progression.resolutions(this.world, this.definition, this.observations, { elapsed: this.current.elapsed,
      store: this.creatures, party: this.current.partyIds, events, own });
    this.refresh();
  }
  // Each actor's facts are projected again only when its part of the creatures, actors and world has changed.
  private projection = new Projection();
  private refresh() {
    if (!this.definition) { return; }
    const world = this.world, next = this.projection.refresh(world, this.live, this.creatures);
    if (next !== world) { this.commit(next); }
  }
  private observe() {
    if (!this.definition) { return; }
    for (const [id, active] of Object.entries(Progression.outcomes(this.world, this.definition))) {
      if (active && this.observations[id] === undefined) { this.observations[id] = this.current.elapsed; }
    }
  }
  // Campaigns are open-ended: installed situations report outcomes; the campaign itself does not end.
  private updateOutcome() {
    const { current, module, world, creatures } = this, company = this.playerActor;
    const left = Membership.depart({ current, company, module, world, creatures });
    if (left) { this.commit(left); this.refresh(); } this.current.outcome = 'active'; this.observe();
  }
  static autofight(battle: Battle) { while (!battle.state.outcome) { battle.step(battle.chosen()); } }
}
