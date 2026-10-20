import { RuntimeCapabilities } from './runtime-capabilities';
import { RoleRequirements } from './role-requirements';
import { ModuleCompiler } from '../lang/module-compiler';
import { ModuleWriter } from '../lang/module-writer';
import type { Instance, Module } from '../lang/module';
import { World } from '../lang/world';
import { ActionSchemas } from './action-schemas';
import { ModuleNamespace, type ModuleDraft } from './module-namespace';
import type { CampaignDefinition } from './definition';
import { Discovery } from '../information/discovery';

export class ModuleInstallations {
  private static union<T>(left: T[], right: T[], key: (value: T) => string): T[] {
    const result = structuredClone(left);
    for (const value of right) {
      const previous = result.find(v => key(v) === key(value));
      if (previous && JSON.stringify(previous) !== JSON.stringify(value)) {
        throw new Error(`Conflicting shared definition ${key(value)}`);
      }
      if (!previous) { result.push(structuredClone(value)); }
    }
    return result;
  }
  static prepare(base: Instance | undefined, draft: ModuleDraft, elapsed: number): Instance {
    const incoming = structuredClone(draft.instance), addition = incoming.campaign!;
    const prior = base?.campaign;
    if (prior?.installations?.some(m => m.id === draft.id)) { throw new Error('Module already installed'); }
    const existing = base?.module.entities ?? [];
    for (const entity of incoming.module.entities) {
      const previous = existing.find(e => e.id === entity.id);
      if (draft.imports.includes(entity.id)) {
        if (!previous || previous.type !== entity.type) { throw new Error(`Invalid typed import ${entity.id}`); }
      } else if (previous && !(ModuleNamespace.canonical.includes(entity.type)
        && JSON.stringify(previous) === JSON.stringify(entity))) { throw new Error(`Duplicate entity ${entity.id}`); }
    }
    for (const change of incoming.module.initial) {
      const imported = draft.imports.includes(change.call.args[0]!);
      const relation = incoming.module.relations.find(r => r.name === change.call.name);
      if ((imported && (change.kind !== 'assert' || relation?.exclusive || (relation?.types.length ?? 0) < 2))
        || ['able', 'dead', 'watch', 'recorded', 'deficit', 'capable',
          'awake', 'needsCare', 'canCast', 'treatable', 'proficient'].includes(change.call.name)) {
        throw new Error('Module initialization cannot reset imported or campaign-owned state');
      }
    }
    const entities = [...existing, ...incoming.module.entities.filter(e => !draft.imports.includes(e.id)
      && !existing.some(old => old.id === e.id))];
    const schemas = this.union(prior?.schemas ?? [], addition.schemas!, a => a.id);
    const module: Module = { ...incoming.module, id: 'campaign', name: base?.module.name ?? 'Campaign',
      description: base?.module.description ?? 'Installed situations share this persistent world.',
      entities, kinds: [...new Set([...(base?.module.kinds ?? []), ...incoming.module.kinds])],
      relations: this.union(base?.module.relations ?? [], incoming.module.relations, s => s.name),
      measures: this.union(base?.module.measures ?? [], incoming.module.measures, s => s.name),
      queries: this.union(base?.module.queries ?? [], incoming.module.queries, q => q.name),
      pursuits: [...(base?.module.pursuits ?? []), ...(incoming.module.pursuits ?? [])],
      rules: [...(base?.module.rules ?? []), ...(incoming.module.rules ?? [])],
      observations: [...(base?.module.observations ?? []), ...(incoming.module.observations ?? [])],
      objectives: [...(base?.module.objectives ?? []), ...(incoming.module.objectives ?? [])],
      initial: [...(base?.module.initial ?? []), ...incoming.module.initial], actions: schemas,
      goal: { kind: 'boolean', value: false }, budget: ModuleWriter.number(0) };
    const conflicts = [...(prior?.conflicts ?? []), ...(addition.conflicts ?? [])];
    const definition: CampaignDefinition = { schemas, ...(conflicts.length ? { conflicts } : {}),
      installations: [...(prior?.installations ?? []), ModuleNamespace.record(draft, elapsed)],
      actors: [...(prior?.actors ?? []), ...addition.actors],
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
    module.actions = ActionSchemas.ground(module, definition.actors);
    compiler.validate(module);
    const world = new World(module, base?.world).apply(incoming.module.initial);
    const distinct = definition.actors.flatMap(a => definition.actors.filter(b => b.id !== a.id).map(b => ({
      kind: 'assert' as const, call: ModuleWriter.call('distinct', a.id, b.id),
    })));
    const installed = world.apply(distinct);
    Discovery.validate(module, installed);
    return { module, world: installed.snapshot, campaign: definition,
      budget: Math.max(0, ...definition.installations!.flatMap(m => m.deadline === undefined ? [] : [m.deadline])) };
  }
}
