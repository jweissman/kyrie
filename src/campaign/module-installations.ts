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
  static populate(next: Instance, creatures: CreatureStore, current: Parameters<typeof Membership.live>[1]) {
    const had = new Set(Object.keys(current.inhabitants)), held = new Set(creatures.live.map(c => c.id));
    const live = Membership.live(next.campaign!.actors, current).actors;
    const actors = next.campaign!.actors.filter(a => !had.has(a.id));
    const added = next.campaign!.creatures.filter(c => !held.has(c.id));
    const store = new CreatureStore([...creatures.snapshot, ...added.map(entry => {
      const creature = new Content(entry.seed!).createCreature(entry.id, entry.context, entry.seed ? 'self' : entry.id);
      creature.state.gold += entry.gold;
      return creature;
    })]);
    CreatureFacts.initialize(new World(next.module, next.world), actors, store);
    const world = CreatureFacts.project(new World(next.module, next.world), live, store);
    Progression.outcomes(world, next.campaign!);
    for (const actor of next.campaign!.actors) {
      for (const goal of actor.goals) {
        world.test(goal.when); world.test(goal.target);
        if (goal.urgent) { world.test(goal.urgent.when); }
      }
    }
    return { actors, store, world };
  }
  // What two installations both declare must agree; each is kept once. Definitions are never changed after they are
  // joined, so the result shares them rather than copying.
  private static union<T>(left: T[], right: T[], key: (value: T) => string): T[] {
    const result = [...left], index = new Map(left.map(v => [key(v), v]));
    for (const value of right) {
      const previous = index.get(key(value));
      if (previous && previous !== value && JSON.stringify(previous) !== JSON.stringify(value)) {
        throw new Error(`Conflicting shared definition ${key(value)}`);
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
    for (const change of incoming.initial) {
      const imported = draft.imports.includes(change.call.args[0]!);
      const relation = incoming.relations.find(r => r.name === change.call.name);
      if ((imported && (change.kind !== 'assert' || relation?.exclusive || (relation?.types.length ?? 0) < 2))
        || ['able', 'dead', 'watch', 'recorded', 'deficit', 'capable',
          'awake', 'needsCare', 'canCast', 'treatable', 'proficient'].includes(change.call.name)) {
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
      goal: { kind: 'boolean', value: false }, budget: ModuleWriter.number(0) };
  }
  static prepare(base: Instance | undefined, draft: ModuleDraft, elapsed: number): Instance {
    const incoming = structuredClone(draft.instance), addition = incoming.campaign!;
    ClockShift.apply(incoming.module, addition.schemas!, draft.id, elapsed);
    const prior = base?.campaign;
    if (prior?.installations?.some(m => m.id === draft.id)) { throw new Error('Module already installed'); }
    this.admit(base?.module.entities ?? [], incoming.module, draft);
    const schemas = this.union(prior?.schemas ?? [], addition.schemas!, a => a.id);
    const module = this.joined(base?.module, incoming.module, draft, schemas);
    const conflicts = [...(prior?.conflicts ?? []), ...(addition.conflicts ?? [])];
    const definition: CampaignDefinition = { schemas, ...(conflicts.length ? { conflicts } : {}),
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
    RoleRequirements.validate(draft.roles ?? [], module, new World(module, base?.world));
    const compiler = new ModuleCompiler(RuntimeCapabilities.signatures);
    if (!module.entities.some(e => e.id === 'gold' && e.type === 'good')
      || !module.entities.some(e => e.id === 'clock' && e.type === 'clock')) {
      throw new Error('Campaign rules require shared gold and clock entities');
    }
    compiler.validate(module);
    const installed = new World(module, base?.world).apply(incoming.module.initial);
    Discovery.validate(module, installed);
    return { module, world: installed.snapshot, campaign: definition,
      budget: Math.max(0, ...definition.installations!.flatMap(m => m.deadline === undefined ? [] : [m.deadline])) };
  }
}
