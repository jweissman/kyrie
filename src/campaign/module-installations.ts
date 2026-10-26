import { LocalKinds } from '../canon/local-catalog';
import { RuntimeCapabilities } from './runtime-capabilities';
import { RoleRequirements } from './role-requirements';
import { ModuleCompiler } from '../lang/module-compiler';
import { ModuleWriter } from '../lang/module-writer';
import type { Instance, Module } from '../lang/module';
import { World } from '../lang/world';
import { ModuleNamespace, type ModuleDraft } from './module-namespace';
import type { CampaignActor, CampaignDefinition } from './definition';
import { CreatureStore } from '../creature-store';
import { Membership } from './membership';
import { ClockShift } from './clock-shift';
import { CreatureFacts } from './creature-facts';
import { Progression } from './progression';
import { Content } from '../content';
import { InstalledInstance } from './installed-instance';
import type { Creature } from '../creature';
import { Discovery } from '../information/discovery';

export class ModuleInstallations {
  // Actors another installation declared take up the goals and actions this one gives them.
  private static extended(actors: CampaignActor[], extensions: NonNullable<CampaignDefinition['extensions']>) {
    const out = structuredClone(actors);
    for (const e of extensions) {
      const actor = out.find(a => a.id === e.actor);
      if (!actor || actor.player) { throw new Error(`An extended pursuit needs an installed person: ${e.actor}`); }
      if (e.goals.some(g => actor.goals.some(o => o.id === g.id))) { throw new Error(`Duplicate pursuit for ${e.actor}`); }
      actor.goals.push(...structuredClone(e.goals));
      actor.actions.push(...e.actions.filter(id => !actor.actions.includes(id)));
    }
    return out;
  }
  // The people a new installation brings, made and placed in the store, with the facts about them projected into
  // its world: everyone's as they stand now, after any have joined the company or left it (see Membership). Every
  // goal they pursue is checked against that world before it is accepted.
  // everyone: whether everyone's facts are projected again, or only the newcomers' (while a campaign is assembled
  // from many modules at once, when everyone's are projected once at the end).
  static populate(next: Instance & { live?: World }, creatures: CreatureStore,
    current: Parameters<typeof Membership.live>[1], everyone = true) {
    const had = new Set(Object.keys(current.inhabitants)), held = new Set(creatures.live.map(c => c.id));
    const live = Membership.live(next.campaign!.actors, current).actors;
    const actors = next.campaign!.actors.filter(a => !had.has(a.id));
    const added = next.campaign!.creatures.filter(c => !held.has(c.id));
    const store = creatures.with(added.map(entry => this.creature(entry)));
    const joined = next.live ?? new World(next.module, next.world);
    CreatureFacts.initialize(joined, actors, store);
    const projected = everyone ? live : live.filter(a => !had.has(a.id));
    const world = CreatureFacts.project(joined, projected, store);
    Progression.outcomes(world, next.campaign!);
    for (const actor of next.campaign!.actors) {
      for (const goal of actor.goals) {
        world.test(goal.when); world.test(goal.target);
        if (goal.urgent) { world.test(goal.urgent.when); }
      }
    }
    return { actors, store, world };
  }
  // A creature a campaign's definition declares, made from its own seed (or, with none, the campaign's), with its gold.
  static creature(entry: CampaignDefinition['creatures'][number], content?: Content): Creature {
    const maker = entry.seed ? new Content(entry.seed) : content ?? new Content(entry.seed!);
    const creature = maker.createCreature(entry.id, entry.context, entry.seed ? 'self' : entry.id);
    creature.state.gold += entry.gold;
    return creature;
  }
  // What two installations both declare is kept once. Definitions are never changed after they are joined, so the
  // result shares them rather than copying. Shared definitions all come from one edition of the rules, and a module's
  // own are named for it, so two that differ are a world kept from an earlier edition joined by a country drawn in
  // this one (M16's free play: a save from before "Examine" was "Read" could not go over the march). The world keeps
  // the rules it was made with; what differed is noted (drifted).
  static readonly drifted = new Set<string>();
  private static union<T>(left: T[], right: T[], key: (value: T) => string): T[] {
    const result = [...left], index = new Map(left.map(v => [key(v), v]));
    for (const value of right) {
      const previous = index.get(key(value));
      if (previous && previous !== value && JSON.stringify(previous) !== JSON.stringify(value)) {
        this.drifted.add(key(value));
      }
      if (!previous) { result.push(value); index.set(key(value), value); }
    }
    return result;
  }
  // An installation brings its own entities (an import must match the type it names; only canonical ones may be
  // declared twice, identically) and may not reset imported or campaign-owned state.
  private static admit(existing: Module['entities'], incoming: Module, draft: ModuleDraft) {
    const known = new Map(existing.map(e => [e.id, e]));
    for (const entity of incoming.entities) {
      const previous = known.get(entity.id);
      if (draft.imports.includes(entity.id)) {
        if (!previous || previous.type !== entity.type) { throw new Error(`Invalid typed import ${entity.id}`); }
      } else if (previous && !(ModuleNamespace.canonical.includes(entity.type)
        && JSON.stringify(previous) === JSON.stringify(entity))) { throw new Error(`Duplicate entity ${entity.id}`); }
    }
    // What a module says of an imported entity by a name of its own (The Patient Star's breath and memories of the
    // company) resets nothing the campaign had.
    for (const change of incoming.initial) {
      const imported = draft.imports.includes(change.call.args[0]!), own = change.call.name.startsWith(`${draft.id}__`);
      const relation = incoming.relations.find(r => r.name === change.call.name);
      if ((imported && !own && (change.kind !== 'assert' || relation?.exclusive || (relation?.types.length ?? 0) < 2))
        || ['able', 'dead', 'watch', 'recorded', 'deficit', 'capable',
          'awake', 'needsCare', 'canCast', 'treatable', 'relieves', 'proficient'].includes(change.call.name)) {
        throw new Error('Module initialization cannot reset imported or campaign-owned state');
      }
    }
  }
  // The campaign module with an installation joined to it.
  private static joined(base: Module | undefined, incoming: Module, draft: ModuleDraft,
    schemas: Module['actions']): Module {
    const existing = base?.entities ?? [], known = new Set(existing.map(e => e.id)), imports = new Set(draft.imports);
    const entities = [...existing, ...incoming.entities.filter(e => !imports.has(e.id) && !known.has(e.id))];
    return { ...incoming, id: 'campaign', name: base?.name ?? 'Campaign',
      description: base?.description ?? 'Installed situations share this persistent world.',
      entities, kinds: [...new Set([...(base?.kinds ?? []), ...incoming.kinds])],
      relations: this.union(base?.relations ?? [], incoming.relations, s => s.name),
      measures: this.union(base?.measures ?? [], incoming.measures, s => s.name),
      queries: this.union(base?.queries ?? [], incoming.queries, q => q.name),
      pursuits: [...(base?.pursuits ?? []), ...(incoming.pursuits ?? [])],
      rules: this.union(base?.rules ?? [], incoming.rules ?? [], r => r.id),
      observations: [...(base?.observations ?? []), ...(incoming.observations ?? [])],
      objectives: [...(base?.objectives ?? []), ...(incoming.objectives ?? [])],
      initial: [...(base?.initial ?? []), ...incoming.initial], actions: schemas,
      ...base?.charts || incoming.charts ? { charts: { ...base?.charts, ...incoming.charts } } : {},
      ...LocalKinds.merge(base?.catalog, incoming.catalog),
      ...base?.seen || incoming.seen ? { seen: { ...base?.seen, ...incoming.seen } } : {},
      goal: { kind: 'boolean', value: false }, budget: ModuleWriter.number(0) };
  }
  // checked: whether to check the joined module now. A campaign assembled from many modules at once checks the whole
  // once, when the last is in (see Campaign.assemble), not again after each.
  // The joined module checked whole: its declarations, and what can be discovered in its world.
  static check(module: Instance['module'], world: World) {
    new ModuleCompiler(RuntimeCapabilities.signatures).validate(module);
    Discovery.validate(module, world);
  }
  // base.live: the world the installation joins, as it is (given, it is not built again from every fact).
  static prepare(base: (Instance & { live?: World }) | undefined, draft: ModuleDraft, elapsed: number, checked = true):
    InstalledInstance {
    // A draft is made for the one installation, and is the installation's own to change.
    const incoming = draft.instance, addition = incoming.campaign!;
    ClockShift.apply(incoming.module, addition.schemas!, draft.id, elapsed);
    const prior = base?.campaign;
    if (prior?.installations?.some(m => m.id === draft.id)) { throw new Error('Module already installed'); }
    this.admit(base?.module.entities ?? [], incoming.module, draft);
    const schemas = this.union(prior?.schemas ?? [], addition.schemas!, a => a.id);
    const module = this.joined(base?.module, incoming.module, draft, schemas);
    const conflicts = [...(prior?.conflicts ?? []), ...(addition.conflicts ?? [])];
    const shadows = [...(prior?.shadows ?? []), ...(addition.shadows ?? [])];
    const definition: CampaignDefinition = { schemas, ...(conflicts.length ? { conflicts } : {}),
      ...(shadows.length ? { shadows } : {}),
      installations: [...(prior?.installations ?? []), ModuleNamespace.record(draft, elapsed)],
      actors: this.extended([...(prior?.actors ?? []), ...addition.actors], addition.extensions ?? []),
      creatures: [...(prior?.creatures ?? []), ...addition.creatures],
      pressures: [...(prior?.pressures ?? []), ...addition.pressures.map(p => ({ ...p, at: elapsed + p.at }))],
      outcomes: [...(prior?.outcomes ?? []), ...addition.outcomes.map(o => ({ ...o, id: `${draft.id}.${o.id}` }))] };
    const actorIds = definition.actors.map(a => a.id), members = definition.actors.flatMap(a => a.members);
    const pressureIds = definition.pressures.map(p => p.id);
    if (definition.actors.filter(a => a.player).length !== 1 || new Set(actorIds).size !== actorIds.length
      || new Set(members).size !== members.length) { throw new Error('Each actor/creature must have one controller'); }
    if (new Set(pressureIds).size !== pressureIds.length
      || addition.pressures.some(p => draft.imports.includes(p.id))) {
      throw new Error('A pressure must belong to one installed module');
    }
    const joining = base?.live ? base.live.withModule(module) : new World(module, base?.world);
    RoleRequirements.validate(draft.roles ?? [], module, joining);
    if (!module.entities.some(e => e.id === 'gold' && e.type === 'good')
      || !module.entities.some(e => e.id === 'clock' && e.type === 'clock')) {
      throw new Error('Campaign rules require shared gold and clock entities');
    }
    const installed = joining.apply(incoming.module.initial);
    if (checked) { this.check(module, installed); }
    return new InstalledInstance(module, installed, definition,
      Math.max(0, ...definition.installations!.flatMap(m => m.deadline === undefined ? [] : [m.deadline])));
  }
}
