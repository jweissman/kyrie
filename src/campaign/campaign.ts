import { CommandResolutions, type CommandResolution } from './command-resolution';
import { Aftermath } from './aftermath';
import { Items } from './items';
import { FieldUse } from './field-use';
import { ObservationText } from '../lang/observation-text';
import { ActionSchemas } from './action-schemas';
import { LocalObservations } from '../presentation/local-observations';
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
import { CombatProjection } from '../combat-projection';
import type { Creature } from '../creature';
import { Battle } from '../arena';
import { Content, type CreatureGenerationContext } from '../content';
import { Creation } from '../rules/creation';
import type { CombatEvent, Fighter } from '../model';
import type { Call, Instance, Module, WorldState } from '../lang/module';
import { World } from '../lang/world';
import { Tactics } from '../tactics';
import { Planner, type Operator } from './planner';
import { RuntimeCapabilities } from './runtime-capabilities';
import { Overlays } from '../overlays';
import { ActionTime } from './action-time';
import { CampaignTick, type PendingAction, type TickDecision, type TickHost } from './campaign-tick';

export interface ModuleStatus {
  id: string; name: string; installedAt: number; deadline?: number;
  outcome: 'active' | 'success' | 'failure'; outcomes: Record<string, boolean>;
  developments: { id: string; elapsed: number }[];
}
export interface CampaignState {
  seed: string; world: WorldState; party: Fighter[]; creatures: Creature[];
  partyIds: string[]; inhabitants: Record<string, string[]>; elapsed: number; deadline: number;
  outcome: 'active' | 'success' | 'failure';
  modules?: ModuleStatus[];
  outcomes?: Record<string, boolean>; developments?: { id: string; elapsed: number }[];
  pending?: Record<string, PendingAction>;
}
export interface NpcDecision {
  actor: string; goal: string; action: string; plan: string[]; elapsed?: number; changes?: string[];
}
export interface CampaignSave {
  actionFormat?: 'schemas';
  version: 1; module: Module; definition?: CampaignDefinition; state: Omit<CampaignState, 'party' | 'creatures'>;
  creatures: Creature[]; events: CampaignEvent[]; encounter: number;
  observations: Record<string, number>;
}
export interface CampaignEvent {
  resolution?: CommandResolution;
  action: string; elapsed: number; changes: string[];
  result: 'success' | 'failure'; combat: CombatEvent[]; npc?: NpcDecision[];
  response?: string;
  perceptions?: { id: string; text: string; kind: 'observation' | 'discovery' | 'event' }[];
}
export class Campaign implements TickHost {
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
      new ModuleCompiler(RuntimeCapabilities.signatures).validate(this.module);
      if (saved.actionFormat === 'schemas') {
        this.compiled.actions = ActionSchemas.ground(this.compiled, this.definition?.actors);
        new ModuleCompiler(RuntimeCapabilities.signatures).validate(this.module);
      }
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
      const creature = (entry.seed ? new Content(entry.seed) : content).createCreature(entry.id, entry.context);
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
  static async load(path: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[]): Promise<Campaign> {
    const manifest = await ModuleBundle.campaign(path, source);
    party ??= manifest.party;
    let campaign: Campaign | undefined;
    for (const request of manifest.modules) {
      if (campaign) { await campaign.install(request, source); }
      else {
        const draft = await ModuleBundle.load(request, { seed }, source);
        if (party) {
          const player = draft.instance.campaign!.actors.find(a => a.player)!;
          if (party.length !== player.members.length) { throw new Error(`Choose ${player.members.length} companions`); }
          if (new Set(party.map(c => c.name?.trim().toLowerCase())).size !== party.length) {
            throw new Error('Give each companion a distinct name');
          }
          party.forEach((context, i) => {
            const entry = draft.instance.campaign!.creatures.find(c => c.id === player.members[i])!;
            if (!context.name?.trim() || context.name.length > 40 || !context.raceId || !context.classId
              || !Content.playableRaces.includes(context.raceId)
              || !Content.playableClasses.includes(Creation.classId(context.classId))) {
              throw new Error('Choose a name, playable ancestry and class for every companion');
            }
            entry.context = { name: context.name.trim(), raceId: context.raceId,
              classId: Creation.classId(context.classId), level: entry.context.level ?? 1,
              ...(context.backgroundId ? { backgroundId: context.backgroundId } : {}),
              ...(context.traits ? { traits: [...context.traits] } : {}),
              ...(context.spells ? { spells: [...context.spells] } : {}),
              ...(context.weapon ? { weapon: context.weapon } : {}),
              ...(context.armor ? { armor: context.armor } : {}) };
            const entity = draft.instance.module.entities.find(e => e.creatureId === entry.id);
            if (entity) { entity.name = context.name; }
          });
        }
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
    const actors = next.campaign!.actors.filter(a => !this.definition!.actors.some(old => old.id === a.id));
    const added = next.campaign!.creatures.filter(c => !this.creatures.snapshot.some(old => old.id === c.id));
    const store = new CreatureStore([...this.creatures.snapshot, ...added.map(entry => {
      const creature = new Content(entry.seed!).createCreature(entry.id, entry.context);
      creature.state.gold += entry.gold;
      return creature;
    })]);
    CreatureFacts.initialize(new World(next.module, next.world), actors, store);
    const world = CreatureFacts.project(new World(next.module, next.world), next.campaign!.actors, store);
    Progression.outcomes(world, next.campaign!);
    for (const actor of next.campaign!.actors) {
      for (const goal of actor.goals) {
        world.test(goal.when); world.test(goal.target);
        if (goal.urgent) { world.test(goal.urgent.when); }
      }
    }
    this.compiled = next.module; this.definition = next.campaign; this.creatures = store;
    this.current.world = world.snapshot; this.current.deadline = next.budget;
    for (const actor of actors) { this.current.inhabitants[actor.id] = [...actor.members]; }
    this.updateOutcome();
  }
  private installBoundary() {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Install only between campaign commands'); }
  }
  get installations(): InstalledModule[] { return structuredClone(this.definition?.installations ?? []); }
  private moduleStatuses(): ModuleStatus[] {
    return this.installations.map(m => ({ id: m.id, name: m.name, installedAt: m.installedAt, deadline: m.deadline,
      outcome: m.pressures.some(id => this.world.number(ModuleWriter.call('deficit', id)) > 0) ? 'failure' :
        this.world.test(m.goal) ? 'success' : 'active',
      outcomes: Object.fromEntries(m.outcomes.map(o => [o.id, this.world.test(o.predicate)])),
      developments: m.outcomes.filter(o => this.observations[`${m.id}.${o.id}`] !== undefined)
        .map(o => ({ id: o.id, elapsed: this.observations[`${m.id}.${o.id}`]! })) }));
  }
  get schemas(): Operator[] { return structuredClone(this.definition?.schemas ?? []); }
  get actors(): CampaignActor[] { return structuredClone(this.definition?.actors ?? []); }
  explain() {
    if (!this.definition || this.executing) { return []; }
    return this.definition.actors.filter(a => !a.player)
      .map(actor => Agency.explain(this.world, actor, this.module.actions));
  }
  get playerActor(): string | undefined { return this.definition?.actors.find(a => a.player)?.id; }
  get persistent(): boolean { return !!this.definition; }
  get running(): boolean {
    return this.party.some(c => c.hp > 0) && (this.persistent || this.current.outcome === 'active');
  }
  save(compact = false): CampaignSave {
    if (this.executing || this.creatures.hasActiveLeases) { throw new Error('Save only between campaign commands'); }
    const schemas = compact && this.definition?.schemas;
    return structuredClone({ version: 1, ...(schemas ? { actionFormat: 'schemas' as const } : {}),
      module: schemas ? { ...this.module, actions: schemas } : this.module,
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
      ...(this.definition?.installations ? { modules: this.moduleStatuses() } : {}),
      ...(this.definition ? { outcomes: Progression.outcomes(this.world, this.definition),
        developments: Object.entries(this.observations).map(([id, elapsed]) => ({ id, elapsed })) } : {}) };
  }
  private get party(): Fighter[] {
    return this.current.partyIds.map(id => CombatProjection.fighter(this.creatures.get(id), 'fighters'));
  }
  get events(): CampaignEvent[] { return structuredClone(this.log); }
  get world(): World { return new World(this.module, this.current.world); }
  available(): Operator[] {
    if (!this.running || this.executing) { return []; }
    const player = this.definition?.actors.find(a => a.player), world = this.world;
    return structuredClone(this.module.actions.filter(action => (!player || (action.actor === player.id
      && (player.allActions || player.actions.includes(action.schema ?? action.id))))
      && Planner.applicable(world, action)));
  }
  plan(moduleId?: string) {
    if (!this.persistent && this.current.outcome === 'failure') { return null; }
    const player = this.definition?.actors.find(actor => actor.player);
    const installed = moduleId ? this.installations.find(m => m.id === moduleId) :
      this.installations.find(m => !this.world.test(m.goal));
    if (moduleId && !installed) { throw new Error('Unknown module'); }
    const actions = this.module.actions.filter(a => !player || (!a.resolve
      && a.actor === player.id && (player.allActions || player.actions.includes(a.schema ?? a.id))));
    return Planner.search(this.world, installed?.goal ?? this.module.goal, actions, {
      maxNodes: 2000,
      timeRemaining: (installed ? installed.deadline ?? Infinity : this.current.deadline) - this.current.elapsed,
    });
  }
  encounterBattle(actionId: string): Battle {
    const action = this.module.actions.find(candidate => candidate.id === actionId);
    if (action?.resolve?.name !== 'combat') { throw new Error('Action does not resolve a combat encounter'); }
    const seed = `${this.current.seed}:encounter:${this.encounter}:${action.resolve.args.join(':')}`;
    const group = action.resolve.args[0]!;
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
    if (battle?.state.outcome === 'fighters' && action.resolve?.name === 'combat') {
      FieldUse.award(this.creatures, this.current.partyIds, this.world,
        { opponent: action.resolve.args[0]!, events: combat });
    }
    if (action.resolve && !['combat', 'recover', 'rough'].includes(action.resolve.name)) {
      combat.push(...this.field(action));
    }
    let success = (!battle || battle.state.outcome === 'fighters') && CommandResolutions.survived(action,
      this.creatures.snapshot, this.definition?.actors, this.module.entities);
    const causal = this.module.relations.some(r => r.name === 'witnessedAttack');
    const before = this.world;
    this.apply(action, success);
    if (this.definition) { this.refresh(); }
    this.current.world = Aftermath.record(before, this.world, action, combat).snapshot;
    let response = success && action.report ? ObservationText.render(action.report, this.world) : undefined;
    if (!success && action.resolve?.name === 'expose') {
      response = 'The hazard brings down the exposed adventurer. The company does not cross; the injury is permanent until treated.';
    }
    const npc: NpcDecision[] = [], happenings: { id: string; text: string; kind: 'event' }[] = [];
    for (let tick = 0; tick < ActionTime.of(action, before); tick++) {
      this.current.elapsed++;
      if (FieldUse.advance(this.creatures, this.current.elapsed, combat,
        { world: this.world, actors: this.definition?.actors ?? [], player: this.playerActor })) { this.refresh(); }
      if (this.definition) {
        this.current.world = this.world.apply([{ kind: 'set', call: ModuleWriter.call('watch', 'clock'),
          value: ModuleWriter.number(this.current.elapsed) }]).snapshot;
        CampaignTick.npcs(this, npc as TickDecision[]);
        CampaignTick.rules(this, happenings);
        this.current.world = Progression.check(this.world, this.definition, this.current.elapsed).snapshot;
        this.observe();
      }
    }
    if (action.resolve?.name === 'recover' || action.resolve?.name === 'rough') {
      const shelter = action.bindings?.site;
      const safe = shelter && (action.schema !== 'rest' || this.world.test(ModuleWriter.call('restful', shelter)))
        && !this.world.test(ModuleWriter.call('closed', shelter));
      if (safe) { combat.push(...this.field(action)); this.refresh(); }
      else {
        success = false;
        response = 'Your shelter becomes unsafe before recovery is complete. Time and the shared ration are spent, but health and mana are not restored.';
      }
    }
    if (success && !CommandResolutions.survived(action, this.creatures.snapshot,
      this.definition?.actors, this.module.entities)) {
      success = false;
      response = 'The company can no longer act. Injuries and deaths remain; the attempt has failed.';
    }
    const after = this.world;
    if (action.resolve) { this.encounter++; }
    this.updateOutcome();
    const event: CampaignEvent = { action: action.id, elapsed: this.current.elapsed, result: success ? 'success' : 'failure',
      changes: Campaign.diff(before, after), combat: combat.filter(e => e.visibility !== 'private'),
      ...(response ? { response } : {}),
      ...(this.definition ? { npc } : {}) };
    if (causal) {
      event.resolution = CommandResolutions.receipt(action,
        { creatures: checkpoint.creatures, world: checkpoint.current.world, elapsed: checkpoint.current.elapsed },
        { creatures: this.creatures.snapshot, world: this.current.world, elapsed: this.current.elapsed },
        { events: combat, success, sequence: this.log.length });
    }
    const player = this.playerActor;
    if (player && (this.module.observations?.length || happenings.length) && after.test(ModuleWriter.call('able', player))) {
      event.perceptions = [...happenings,
        ...LocalObservations.read(after, player).map(o => ({ ...o, kind: 'observation' as const })),
        // Only what this action taught: a fact already known is not discovered again.
        ...after.snapshot.relations.filter(r => r.name === 'knows' && r.args[0] === player
          && !before.test(ModuleWriter.call('knows', player, r.args[1]!))).map(r => ({
          id: r.args[1]!, text: ObservationText.render(this.module.entities.find(e => e.id === r.args[1])!.name, after),
          kind: 'discovery' as const })),
      ];
    }
    this.log.push(event);
    return structuredClone(event);
  }
  private field(action: Operator): CombatEvent[] {
    const call = structuredClone(action.resolve!);
    call.args = call.args.map(id => this.module.entities.find(e => e.id === id)?.creatureId ?? id);
    const seed = `${this.current.seed}:field:${this.encounter}:${action.id}`;
    if (call.name === 'recover' || call.name === 'rough') {
      const actor = this.definition!.actors.find(a => a.id === call.args[0])!;
      const caster = actor.members.find(id => this.creatures.get(id).state.hp > 0)!;
      return FieldUse.perform(this.creatures, actor.members, { ability: call.name === 'rough' ? 'rough_rest' : 'camp_recovery', caster, target: caster,
        seed, service: 'recover' });
    }
    if (call.name === 'reward') {
      return FieldUse.perform(this.creatures, [call.args[1]!], { ability: call.args[0]!, caster: call.args[1]!,
        target: call.args[1]!, seed, service: 'reward' });
    }
    if (call.name === 'invoke') {
      return FieldUse.perform(this.creatures, [call.args[1]!, call.args[2]!],
        { ability: call.args[0]!, caster: call.args[1]!, target: call.args[2]!, seed });
    }
    if (call.name === 'purchase') {
      const buyer = this.definition!.actors.find(a => a.id === call.args[3])!;
      const price = this.world.number(ModuleWriter.call('price', call.args[0]!));
      const seller = this.definition!.actors.find(a => a.id === call.args[4])!;
      if (!seller || seller.id === buyer.id) { throw new Error('Purchase needs a distinct merchant'); }
      const lease = this.creatures.acquire([...buyer.members, seller.members[0]!]);
      try {
        let due = price;
        for (const c of lease.creatures.filter(c => buyer.members.includes(c.id))) {
          const paid = Math.min(due, c.state.gold); c.state.gold -= paid; due -= paid;
        }
        if (due || price < 0) { throw new Error('Insufficient currency or invalid item price'); }
        lease.creatures.find(c => c.id === seller.members[0])!.state.gold += price;
        lease.commit(lease.creatures);
      } finally { lease.release(); }
      return this.take(call);
    }
    if (call.name === 'acquire') { return this.take(call); }
    if (call.name === 'bless') { return Items.bless(this.creatures,
      { source: call.args[0]!, deity: call.args[1]!, target: call.args[2]!, seed }); }
    if (call.name === 'equip') { return Items.equip(this.creatures, call.args[1]!, call.args[0]!, this.label(call.args[0]!)); }
    if (call.name === 'consume') { return Items.consume(this.creatures,
      { owner: call.args[1]!, target: call.args[2]!, id: call.args[0]!, seed }); }
    if (call.name === 'expose') { return Items.expose(this.creatures,
      { target: call.args[1]!, ability: call.args[0]!, entities: this.module.entities, source: action.schema === 'risk' ? action.bindings?.trap ?? action.id : action.id, seed }); }
    if (call.name === 'train') { return Items.train(this.creatures, call.args[1]!, call.args[0]!); }
    if (call.name === 'transfer_item') {
      const moved = { id: call.args[0]!, label: this.label(call.args[0]!) };
      return Items.transfer(this.creatures, moved, call.args[1]!, call.args[2]!);
    }
    if (call.name === 'drop') { return Items.drop(this.creatures, call.args[1]!, call.args[0]!, this.label(call.args[0]!)); }
    throw new Error(`Unsupported resolver ${call.name}`);
  }
  private static diff(before: World, after: World): string[] { return CampaignTick.diff(before, after); }
  private label(id: string): string { return ObservationText.label(this.world, id); }
  private take(call: Call): CombatEvent[] {
    const [id, definition, owner] = call.args as [string, string, string];
    return Items.take(this.creatures, owner, { id, definition, label: this.label(id) });
  }
  get tickState() { return { definition: this.definition!, creatures: this.creatures, current: this.current }; }
  applyAction(action: Operator) { this.apply(action, true); }
  refreshProjection() { this.refresh(); }
  recordObservations() { this.observe(); }
  private apply(action: Operator, success: boolean) {
    const before = this.world, after = before.apply(success ? action.success : action.failure);
    if (this.definition) { CreatureFacts.commitMoney(before, after, this.definition.actors, this.creatures); }
    this.current.world = after.snapshot;
  }
  private refresh() {
    if (this.definition) {
      this.current.world = CreatureFacts.project(this.world, this.definition.actors, this.creatures).snapshot;
    }
  }
  private observe() {
    if (!this.definition) { return; }
    for (const [id, active] of Object.entries(Progression.outcomes(this.world, this.definition))) {
      if (active && this.observations[id] === undefined) { this.observations[id] = this.current.elapsed; }
    }
  }
  // Campaigns are open-ended: installed situations report outcomes; the campaign itself does not end.
  private updateOutcome() { this.current.outcome = 'active'; this.observe(); }
  static autofight(battle: Battle) {
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
  }
}
