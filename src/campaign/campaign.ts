import { RandomStreams } from '../random-streams';
import { CommandResolutions } from './command-resolution';
import { Aftermath } from './aftermath';
import { FieldUse } from './field-use';
import { FieldResolver } from './field-resolver';
import { ObservationText } from '../lang/observation-text'; import { Operators } from './operators';
import { CompanyChoices } from './company-choices';
import { Perceptions } from './perceptions';
import { ModuleBundle, type BundleRequest } from './module-bundle';
import type { BundleSource } from './bundle-source';
import { ModuleInstallations } from './module-installations';
import { CreatureFacts } from './creature-facts'; import { Progression } from './progression';
import type { InstalledModule, CampaignActor, CampaignDefinition } from './definition';
import { ModuleWriter } from '../lang/module-writer'; import { ModuleCompiler } from '../lang/module-compiler';
import { CreatureStore } from '../creature-store';
import { CommittedWorld } from './committed-world'; import { Endings } from '../lang/endings';
import { Projection } from './projection'; import { CampaignGrounding } from './campaign-grounding';
import type { Creature } from '../creature';
import { Membership, type LiveCache } from './membership';
import { CampaignPlan } from './campaign-plan';
import { LoadCache } from './load-cache';
import { CombatProjection } from '../combat-projection';
import { Battle } from '../arena';
import { Content, type CreatureGenerationContext } from '../content';
import type { CombatEvent, Fighter } from '../model'; import type { Instance, Module } from '../lang/module';
import { World } from '../lang/world'; import { Checks } from '../rules/checks';
import type { Operator } from './planner'; import { RuntimeCapabilities } from './runtime-capabilities';
import { Overlays } from '../overlays'; import { CampaignTick } from './campaign-tick'; import { Mercy } from './mercy';
import { WatchLoop, type WatchHost } from './watch-loop'; import { Environment } from './environment';
import { Journey } from './journey'; import { LocalKinds } from '../canon/local-catalog';
import { ActionTime } from './action-time'; import { Engagement } from './engagement';

export type { ModuleStatus, CampaignState, NpcDecision, CampaignSave, CampaignEvent } from './campaign-types';
import type { CampaignState, CampaignSave, CampaignEvent, Restored } from './campaign-types';
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
  // A campaign is a composition of installed modules (see Campaign.load): the instance it is made from is its own,
  // made for it and kept by no one else. restore() resumes a save: copied unless it is handed over (owned), and its
  // module checked unless it is a game this engine kept itself (trusted).
  constructor(seed: string, instance: Instance, restored?: Restored, calendar?: CampaignState['calendar']) {
    const saved = restored && (restored.owned ? restored.save : structuredClone(restored.save));
    if (saved) {
      // Its own kinds first: the company carries things of them, in a page that may have played nothing yet.
      LocalKinds.activate(saved.module.catalog, this); this.compiled = saved.module; this.definition = saved.definition;
      this.current = saved.state; this.creatures = new CreatureStore(saved.creatures);
      this.log = saved.events; this.encounter = saved.encounter;
      this.observations = saved.observations;
      // A save from before demand grounding holds grounded actions; its schemas are in the definition.
      if (saved.actionFormat !== 'schemas' && this.definition?.schemas) {
        this.compiled.actions = this.definition.schemas;
      }
      if (!restored.trusted) { new ModuleCompiler(RuntimeCapabilities.signatures).validate(this.module); }
      if (this.definition) {
        const projected = CreatureFacts.project(this.world, this.live, this.creatures);
        if (!projected.sameAs(this.world)) { throw new Error('Inconsistent saved creature facts'); }
      }
      return;
    }
    if (!instance.campaign) { throw new Error('A campaign is a composition of installed modules'); }
    this.definition = instance.campaign;
    const content = new Content(`${seed}:campaign`);
    this.compiled = instance.module;
    for (const entry of this.definition.creatures) {
      this.creatures.insert(ModuleInstallations.creature(entry, content));
    }
    const player = this.definition.actors.find(a => a.player);
    if (!player) { throw new Error('Campaign needs a player actor'); }
    const inhabitants = Object.fromEntries(this.definition.actors.map(a => [a.id, [...a.members]]));
    this.current = { seed, world: instance.world, partyIds: [...player.members],
      inhabitants, elapsed: 0, deadline: instance.budget, outcome: 'active', ...calendar ? { calendar } : {} };
    // The clock reads the hour from the start: how long until dark, until first light, until the day turns.
    this.commit(this.world.apply(CampaignTick.clock(this.world, this.current)));
    CreatureFacts.initialize(this.world, this.definition.actors, this.creatures);
    this.refresh(); this.observe();
    this.updateOutcome();
  }
  // Loading is deterministic in (source, path, seed, party), so later loads fork the first, with its own kinds.
  private static loads = new LoadCache<Campaign>();
  static async load(path: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[]): Promise<Campaign> {
    const loaded = await this.loads.get(source, JSON.stringify([path, seed, party ?? null]),
      () => this.assemble(path, seed, source, party && structuredClone(party)));
    const fork = loaded.fork(); LocalKinds.activate(loaded.module.catalog, fork); return fork;
  }
  private static arrays<T extends object>(o: T): T {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? [...v as unknown[]] : v])) as T;
  }
  // A fork shares compiled operators and definition records, which are never mutated after loading, behind fresh
  // top-level arrays, and copies all mutable state.
  private fork(): Campaign {
    this.keepFacts();
    const copy = Object.create(Campaign.prototype) as Campaign, arrays = Campaign.arrays;
    Object.assign(copy, { compiled: arrays(this.compiled), definition: this.definition && arrays(this.definition),
      current: structuredClone(this.current), creatures: new CreatureStore(this.creatures.snapshot),
      log: structuredClone(this.log), encounter: this.encounter, observations: structuredClone(this.observations),
      executing: false, committed: new CommittedWorld(), projection: new Projection(),
      grounding: new CampaignGrounding() });
    return copy;
  }
  private static async assemble(path: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[]): Promise<Campaign> {
    LocalKinds.reset(); const manifest = await ModuleBundle.campaign(path, source, seed);
    party ??= manifest.party;
    let campaign: Campaign | undefined;
    // Each module is checked as it is compiled; the joined whole, once, when the last is in.
    for (const request of manifest.modules) {
      if (campaign) { await campaign.install(request, source, false); continue; }
      const draft = await ModuleBundle.load(request, { seed }, source);
      if (party) { CompanyChoices.apply(draft, party); }
      Overlays.declareGear(draft.instance); Overlays.declareWorth(draft.instance);
      const first = ModuleInstallations.prepare(undefined, draft, 0, false);
      campaign = new Campaign(seed, first, undefined, manifest.calendar);
    }
    // Settled when the last is in: everyone's facts projected (each install projected only its newcomers'), and the
    // joined whole checked.
    campaign!.refresh(); ModuleInstallations.check(campaign!.module, campaign!.world);
    campaign!.compiled.name = manifest.name; return campaign!;
  }
  // checked: the joined whole checked now; everyone: every actor's creature facts projected again, not only the
  // newcomers' (by default, when the whole is checked).
  async install(request: BundleRequest, source: BundleSource, checked = true, everyone = checked): Promise<void> {
    this.installBoundary();
    if (!this.definition?.installations) { throw new Error('Install modules into a bundle-based campaign'); }
    const startedAt = this.current.elapsed;
    const draft = await ModuleBundle.load(request, { seed: this.current.seed,
      elapsed: this.current.elapsed, installed: this.definition.installations }, source);
    this.installBoundary();
    if (this.current.elapsed !== startedAt) { throw new Error('Campaign advanced while loading module; retry installation'); }
    Overlays.declareGear(draft.instance); Overlays.declareWorth(draft.instance);
    const next = ModuleInstallations.prepare({ module: this.module, world: this.current.world, live: this.world,
      budget: this.current.deadline, campaign: this.definition }, draft, this.current.elapsed, checked);
    const { actors, store, world } = ModuleInstallations.populate(next, this.creatures, this.current, everyone);
    this.compiled = next.module; this.definition = next.campaign; this.creatures = store;
    this.commit(world); this.current.deadline = next.budget;
    for (const actor of actors) { this.current.inhabitants[actor.id] = [...actor.members]; }
    this.updateOutcome();
  }
  private installBoundary() {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Install only between commands'); }
  }
  // Read many times a turn (the page's observation reads both), so given as they are, for reading only.
  get installations(): readonly InstalledModule[] { return this.definition?.installations ?? []; }
  get schemas(): Operator[] { return structuredClone(this.definition?.schemas ?? []); }
  get actors(): readonly CampaignActor[] { return this.definition?.actors ?? []; }
  get playerActor(): string | undefined { return this.definition?.actors.find(a => a.player)?.id; }
  get persistent(): boolean { return !!this.definition; }
  get running(): boolean {
    return this.party.some(c => c.hp > 0) && (this.persistent || this.current.outcome === 'active')
      && !Endings.reached(this.world);
  }
  // A save holds schemas (operators are grounded on demand); a copy, unless written out at once (live: not to be kept).
  save(_compact = false, live = false): CampaignSave {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Save only between campaign commands'); }
    this.keepFacts();
    // Written out at once (live), the creatures are given as they are: a copy of every one is what a kept copy needs.
    const save = { version: 1 as const, actionFormat: 'schemas' as const, module: this.module, definition: this.definition,
      state: this.current, creatures: live ? this.creatures.live as Creature[] : this.creatures.snapshot,
      events: this.log, encounter: this.encounter, observations: this.observations };
    return live ? save : structuredClone(save);
  }
  static restore(saved: CampaignSave, handed: { owned?: boolean; trusted?: boolean } = {}): Campaign {
    if (saved.version !== 1) { throw new Error('Unsupported campaign save'); }
    return new Campaign(saved.state.seed,
      { module: saved.module, world: saved.state.world, budget: saved.state.deadline }, { save: saved, ...handed });
  }
  get state(): CampaignState {
    this.keepFacts();
    return { ...structuredClone(this.current), party: this.party, creatures: this.creatures.snapshot,
      ...(this.definition?.installations
        ? { modules: Progression.statuses(this.installations, this.world, this.observations) } : {}),
      ...(this.definition ? { outcomes: Progression.outcomes(this.world, this.definition),
        developments: Object.entries(this.observations).map(([id, elapsed]) => ({ id, elapsed })) } : {}) };
  }
  // What presentation reads many times a turn, without the copies state makes. Never change it.
  get readout() { return { ...this.current as Readonly<typeof this.current>, creatures: this.creatures.live }; }
  // The log, the action schemas and the company as it would fight, likewise without copies. Never change them.
  get history(): readonly CampaignEvent[] { return this.log; }
  get schemaList(): readonly Operator[] { return this.definition?.schemas ?? []; }
  get installed(): string[] { return (this.definition?.installations ?? []).map(m => m.id); }
  get fighters(): Fighter[] { return this.party; }
  private get party(): Fighter[] { return this.current.partyIds.map(id => CombatProjection.fighter(this.creatures.get(id), 'fighters')); }
  get events(): CampaignEvent[] { return structuredClone(this.log); }
  // What the company was told of the last command, kept with it (see Telling): what it has heard is not said again.
  told(voiced: NonNullable<CampaignEvent['voiced']>) { const last = this.log.at(-1); if (last) { last.voiced = voiced; } }
  // The world as last committed (see CommittedWorld): its facts are written into the state only when it is read whole.
  private committed = new CommittedWorld();
  private commit(world: World) { this.committed.commit(this.current, this.module, world); }
  private keepFacts() { this.committed.keep(this.current); }
  get world(): World { return this.committed.of(this.current, this.module, this); }
  // Actions are grounded on demand against the current module and controllers (see CampaignGrounding).
  private grounding = new CampaignGrounding();
  get operators(): Operators { return this.grounding.operators(this.module, this.definition?.actors); }
  operator(id: string): Operator | undefined { return this.operators.get(id); }
  available(): Operator[] { return structuredClone(this.offered()) as Operator[]; }
  // The actions open to the player now, worked out once for this world: to read without copying. Never change them.
  offered(): readonly Operator[] {
    if (!this.running || this.executing) { return []; }
    return this.grounding.offered(this.world, this.definition?.actors.find(a => a.player), this.operators);
  }
  plan(moduleId?: string) { return CampaignPlan.plan(this, moduleId); }
  encounterBattle(actionId: string): Battle {
    const action = this.operator(actionId);
    if (action?.resolve?.name !== 'combat') { throw new Error('Action does not resolve a combat encounter'); }
    const seed = this.randomSeed(action, 'combat'), group = action.resolve.args[0]!;
    const attacker = action.actor && this.definition ? this.live.find(a => a.id === action.actor) : undefined;
    const members = attacker?.members ?? this.current.partyIds, foes = this.current.inhabitants[group]!;
    return Battle.encounter(this.creatures, [...members.map(creatureId => ({ creatureId, team: 'fighters' as const })),
      ...foes.map(creatureId => ({ creatureId, team: 'goblins' as const }))],
    { seed, ...Environment.encounter(this.world, this.playerActor, members, group) });
  }

  private action(id: string): Operator {
    const action = structuredClone(this.offered().find(candidate => candidate.id === id));
    if (!action) { throw new Error(`Unavailable campaign action: ${id}`); }
    return action;
  }
  execute(id: string, play: (battle: Battle) => void = Campaign.autofight): CampaignEvent {
    const action = this.action(id), checkpoint = this.begun = this.checkpoint();
    this.executing = true;
    let battle: Battle | undefined;
    try {
      battle = action.resolve?.name === 'combat' ? this.encounterBattle(id) : undefined;
      if (battle) { play(battle); }
      const event = this.complete(action, checkpoint, battle), assault = Engagement.assault(this);
      if (!assault) { return event; }
      battle = this.encounterBattle(assault.id); play(battle);
      const fight = this.complete(assault, this.checkpoint(), battle);
      return Engagement.after(this, event, fight, assault.bindings!.opponent!);
    } catch (error) { this.rollback(battle, checkpoint); throw error; }
    finally { this.executing = false; }
  }
  async executeAsync(id: string, play: (battle: Battle) => Promise<void>): Promise<CampaignEvent> {
    const action = this.action(id), checkpoint = this.begun = this.checkpoint();
    this.executing = true;
    let battle: Battle | undefined;
    try {
      battle = action.resolve?.name === 'combat' ? this.encounterBattle(id) : undefined;
      if (battle) { await play(battle); }
      const event = this.complete(action, checkpoint, battle), assault = Engagement.assault(this);
      if (!assault) { return event; }
      battle = this.encounterBattle(assault.id); await play(battle);
      const fight = this.complete(assault, this.checkpoint(), battle);
      return Engagement.after(this, event, fight, assault.bindings!.opponent!);
    } catch (error) { this.rollback(battle, checkpoint); throw error; }
    finally { this.executing = false; }
  }
  // What a command undoes to if it throws, and what its receipt is told against: the world itself and the creature
  // store's records, which are replaced when they change and never changed where they lie, so neither is copied.
  // It holds the module and definition too, so that what came of a command after it (the country beyond it drew,
  // installed) is undone with it (see undo).
  private checkpoint() {
    return { creatures: this.creatures.with([]), current: structuredClone({ ...this.current, world: undefined }),
      world: this.world, compiled: this.compiled, definition: this.definition,
      observations: structuredClone(this.observations), events: this.log.length, encounter: this.encounter };
  }
  // The last command undone, with all that came of it: a session whose command failed after the campaign had carried
  // it out (drawing the country beyond) keeps nothing of it (Mission 15's independent audit, F3).
  private begun?: ReturnType<Campaign['checkpoint']>;
  undo() { if (this.begun) { this.rollback(undefined, this.begun); this.begun = undefined; } }
  // A command that throws commits nothing: combat damage taken before the error is discarded with it.
  private rollback(battle: Battle | undefined, checkpoint: ReturnType<Campaign['checkpoint']>) {
    battle?.close();
    if (this.compiled !== checkpoint.compiled) { LocalKinds.activate(checkpoint.compiled.catalog, this); }
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
    const told = success ? action.report : action.otherwise;
    let response = told ? ObservationText.render(told, this.world) : undefined;
    if (!success && action.resolve?.name === 'expose') { response = 'The hazard brings down the exposed adventurer. The company does not cross; the injury is permanent until treated.'; }
    const pass = WatchLoop.pass(this, action,
      { before, combat, ...leg ? { journey: { leg, arrive: Journey.arrive.bind(Journey, this, action, leg) } } : {} });
    const { npc, happenings, interrupted } = pass;
    if (deferred && !leg) { success &&= !interrupted; this.apply(action, success); }
    if (leg) { success &&= Journey.landed(this, action, leg, 'turned' in pass); }
    if (interrupted) { response = interrupted; }
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
      ...(response ? { response } : {}),
      ...(this.definition ? { npc } : {}) };
    if (causal) {
      event.resolution = CommandResolutions.receipt(action,
        { creatures: checkpoint.creatures.live, world: checkpoint.world, elapsed: checkpoint.current.elapsed },
        { creatures: this.creatures.live, world: this.world, elapsed: this.current.elapsed },
        { events: combat, success, sequence: this.log.length });
    }
    const seen = Perceptions.settle(this.module, { before, after, player: this.playerActor, happenings },
      changes => { this.commit(this.world.apply(changes)); return this.world; });
    event.changes.push(...seen.noted); if (seen.perceptions) { event.perceptions = seen.perceptions; }
    this.log.push(event);
    return structuredClone(event);
  }
  // A fight won is worth its experience; what the command resolves (other than a fight or a rest) happens now.
  private settle(action: Operator, battle: Battle | undefined, combat: CombatEvent[]) {
    const won = battle?.state.outcome === 'fighters' || combat.some(e => e.type === 'end' && e.fled?.team === 'goblins');
    const taken = battle?.state.outcome === 'goblins' && Mercy.spare(this.world, this.creatures,
      { ...this.current, player: this.playerActor, combat }); if (taken) { this.commit(taken); this.refresh(); }
    const opponent = action.resolve?.args[0];
    if (won && action.resolve?.name === 'combat' && opponent) {
      FieldUse.award(this.creatures, this.current.partyIds, this.world,
        { opponent, members: this.current.inhabitants[opponent] ?? [], events: combat });
    }
    if (action.resolve && Membership.resolves(action.resolve)) {
      this.commit(Membership.resolve({ current: this.current, company: this.playerActor, module: this.module,
        world: this.world }, action.resolve)); this.refresh(); return;
    }
    if (action.resolve && !['combat', 'recover', 'rough'].includes(action.resolve.name) && !action.interrupt) {
      combat.push(...this.field(action));
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
    const name = action.resolve?.name, site = action.bindings?.site, rest = name === 'recover' || name === 'rough';
    const safe = !rest || (!!site && (action.schema !== 'rest' || this.world.test(ModuleWriter.call('restful', site)))
      && !this.world.test(ModuleWriter.call('closed', site)));
    const due = safe && (rest || (success && !!action.interrupt && !!name && name !== 'combat'));
    if (due) { combat.push(...this.field(action)); this.refresh(); }
    return safe;
  }
  private randomSeed(action: Operator, domain: string): string {
    return RandomStreams.command(this.current.seed, domain, { installations: this.definition?.installations,
      operator: this.operator.bind(this), history: this.log }, action);
  }
  private field(action: Operator): CombatEvent[] {
    return FieldResolver.resolve(action, { module: this.module, creatures: this.creatures, world: this.world,
      actors: this.live, seed: this.randomSeed(action, 'field') });
  }
  get tickState() { return { definition: { ...this.definition!, actors: this.live }, creatures: this.creatures,
    current: this.current }; }
  applyAction(action: Operator, success = true) { this.apply(action, success); }
  refreshProjection() { this.refresh(); }
  recordObservations() { this.observe(); }
  commitWorld(world: World) { this.commit(world); }
  amend(event: CampaignEvent) { this.log[this.log.length - 1] = structuredClone(event); }
  advanceWatch(combat: CombatEvent[], asleep = false) {
    this.current.elapsed++;
    if (FieldUse.advance(this.creatures, this.current.elapsed, combat,
      { world: this.world, actors: this.live, player: this.playerActor, asleep })) { this.refresh(); }
    if (this.definition) { this.commit(this.world.apply(CampaignTick.clock(this.world, this.current))); }
  }
  settleWatch(combat: CombatEvent[]) {
    this.commit(Progression.check(this.world, this.definition!, this.current.elapsed));
    this.resolutions(combat, false);
    this.observe();
  }
  private apply(action: Operator, success: boolean) {
    const before = this.world;
    const after = Journey.along(before, before.apply(success ? action.success : action.failure), this.playerActor);
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
    const left = Membership.depart(this.current, this.playerActor, this.module, this.world);
    if (left) { this.commit(left); this.refresh(); } this.current.outcome = 'active'; this.observe();
  }
  static autofight(battle: Battle) { while (!battle.state.outcome) { battle.step(battle.chosen()); } }
}
