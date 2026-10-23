import { Spatial } from '../spatial';
import { ObservationText } from '../lang/observation-text';
import type { BoundRole } from './role-requirements';
import type { Call, Change, Instance, Module, Operator, Predicate, Value } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import type { CampaignDefinition, InstalledModule } from './definition';

export interface ModuleDraft {
  id: string; seed: string; instance: Instance; imports: string[]; exports: Record<string, string>; roles?: BoundRole[];
  experience?: number;
}
export interface ModuleBindings {
  id: string; seed: string; imports: Record<string, string>; globals: string[]; exports: Record<string, string>;
}
export class ModuleNamespace {
  // Catalog-backed entity types: the same id means the same thing in every installation.
  static readonly canonical = ['ability', 'feat', 'capability', 'itemkind', 'good', 'clock', 'waykind', 'servicekind', 'element',
    'terrainkind', 'temperament', 'law', 'manner', 'pronoun', 'sizekind', 'craft',
    'verb', 'circle', 'quality'];
  private entities: Record<string, string>;
  private functions: Record<string, string>;
  private kinds: Record<string, string>;
  constructor(private instance: Instance, private rules: Module, private bindings: ModuleBindings) {
    const scope = `${bindings.id}__`;
    this.entities = Object.fromEntries(instance.module.entities.map(e => [e.id,
      bindings.imports[e.id] ?? ((bindings.globals.includes(e.id) || ModuleNamespace.canonical.includes(e.type)) ? e.id
        : scope + e.id)]));
    const shared = [...rules.relations, ...rules.measures, ...rules.queries].map(f => f.name);
    this.functions = Object.fromEntries([...instance.module.relations, ...instance.module.measures,
      ...instance.module.queries].map(f => [f.name, shared.includes(f.name) ? f.name : scope + f.name]));
    this.kinds = Object.fromEntries(instance.module.kinds.map(k => [k, rules.kinds.includes(k) ? k : scope + k]));
  }
  private call(call: Call, bound: string[] = []): Call {
    return { ...call, name: this.functions[call.name] ?? call.name,
      args: call.args.map(arg => bound.includes(arg) ? arg : this.entities[arg] ?? arg) };
  }
  private value(value: Value, bound: string[]): Value {
    return ModuleWriter.calls(value, c => this.call(c, bound));
  }
  private predicate(p: Predicate, bound: string[] = []): Predicate {
    switch (p.kind) {
      case 'call': return this.call(p, bound);
      case 'not': return { ...p, value: this.predicate(p.value, bound) };
      case 'and': case 'or': return { ...p, left: this.predicate(p.left, bound), right: this.predicate(p.right, bound) };
      case 'compare': return { ...p, left: this.value(p.left, bound), right: this.value(p.right, bound) };
      default: return structuredClone(p);
    }
  }
  private change(change: Change, bound: string[] = []): Change {
    const next = { ...structuredClone(change), call: this.call(change.call, bound) };
    if ('value' in next) { next.value = this.value(next.value, bound); }
    return next;
  }
  private action(action: Operator): Operator {
    const parameters = action.parameters?.map(p => ({ ...p, type: this.kinds[p.type] ?? p.type }));
    const bound = parameters?.map(p => p.name) ?? [];
    const shared = this.rules.actions.some(a => a.id === action.id);
    return { ...structuredClone(action), id: shared ? action.id : `${this.bindings.id}__${action.id}`,
      name: this.text(action.name, bound),
      ...(action.report ? { report: this.text(action.report, bound) } : {}),
      ...(action.seen ? { seen: this.text(action.seen, bound) } : {}),
      ...(action.speaker ? { speaker: this.entities[action.speaker] } : {}),
      ...(action.searchPlace ? { searchPlace: this.entities[action.searchPlace] } : {}),
      ...(action.movement ? { movement: Spatial.scope(action.movement, id => this.entities[id] ?? id) } : {}),
      ...(parameters ? { parameters } : {}), requires: this.predicate(action.requires, bound),
      ...(action.interrupt ? { interrupt: this.predicate(action.interrupt, bound) } : {}),
      success: action.success.map(c => this.change(c, bound)), failure: action.failure.map(c => this.change(c, bound)),
      ...(action.resolve ? { resolve: this.call(action.resolve, bound) } : {}),
      ...(action.duration ? { duration: this.call(action.duration, bound) } : {}) };
  }
  private text(text: string, bound: string[] = []): string {
    return ObservationText.scope(text, call => this.call(call, bound),
      id => bound.includes(id) ? id : this.entities[id] ?? id);
  }
  draft(): ModuleDraft {
    const original = this.instance.module, definition = this.instance.campaign!;
    const actors = definition.actors.map(a => ({ ...structuredClone(a), id: this.entities[a.id]!,
      members: a.members.map(id => `${this.bindings.id}__${id}`),
      actions: a.actions.map(id => this.rules.actions.some(a => a.id === id) ? id : `${this.bindings.id}__${id}`),
      goals: a.goals.map(g => ({ ...g, when: this.predicate(g.when), target: this.predicate(g.target),
        ...(g.urgent ? { urgent: { ...g.urgent, when: this.predicate(g.urgent.when) } } : {}) })) }));
    const module: Module = { ...original, id: this.bindings.id,
      kinds: original.kinds.map(k => this.kinds[k]!),
      entities: original.entities.map(e => ({ ...e, id: this.entities[e.id]!, type: this.kinds[e.type] ?? e.type,
        ...(e.name.includes('{') ? { name: this.text(e.name) } : {}),
        ...(e.creatureId ? { creatureId: `${this.bindings.id}__${e.creatureId}` } : {}),
        ...(e.space ? { space: { ...e.space,
          ...(e.space.parent ? { parent: this.entities[e.space.parent] ?? e.space.parent } : {}) } } : {}),
        ...(e.exit ? { exit: Spatial.scope(e.exit, id => this.entities[id] ?? id) } : {}),
        ...(e.alias ? { alias: { name: e.alias.name.includes('{') ? this.text(e.alias.name) : e.alias.name,
          until: this.entities[e.alias.until] ?? e.alias.until } } : {}) })),
      relations: original.relations.map(s => ({ ...s, name: this.functions[s.name]!,
        types: s.types.map(t => this.kinds[t] ?? t) })),
      measures: original.measures.map(s => ({ ...s, name: this.functions[s.name]!,
        types: s.types.map(t => this.kinds[t] ?? t) })),
      queries: original.queries.map(q => ({ ...q, name: this.functions[q.name]!,
        parameters: q.parameters.map(p => ({ ...p, type: this.kinds[p.type] ?? p.type })),
        body: this.predicate(q.body, q.parameters.map(p => p.name)) })),
      pursuits: original.pursuits?.map(p => ({ ...p, actor: this.entities[p.actor]!,
        ...(p.label ? { label: this.text(p.label) } : {}),
        when: this.predicate(p.when), target: this.predicate(p.target) })),
      // A rule of the shared rules modules is the world's, not the installation's: it keeps its id and is joined once.
      rules: original.rules?.map(r => ({ ...r, id: this.rules.rules?.some(s => s.id === r.id) ? r.id : `${this.bindings.id}__${r.id}`,
        when: this.predicate(r.when), effects: r.effects.map(c => this.change(c)),
        ...(r.place ? { place: this.entities[r.place] ?? r.place } : {}),
        ...(r.say ? { say: this.text(r.say) } : {}) })),
      objectives: original.objectives?.map(o => ({ ...o, id: `${this.bindings.id}__${o.id}`,
        when: this.predicate(o.when), text: this.text(o.text) })),
      observations: original.observations?.map(o => ({ ...o, id: `${this.bindings.id}__${o.id}`,
        place: this.entities[o.place]!, when: this.predicate(o.when),
        text: this.text(o.text), ...(o.teaches ? { teaches: this.entities[o.teaches]! } : {}),
        ...(o.about ? { about: this.entities[o.about] ?? o.about } : {}) })),
      initial: original.initial.map(c => this.change(c)), goal: this.predicate(original.goal),
      actions: definition.schemas!.map(a => this.action(a)) };
    const extensions = definition.extensions?.map(e => ({ actor: this.entities[e.actor]!,
      actions: e.actions.map(id => this.rules.actions.some(a => a.id === id) ? id : `${this.bindings.id}__${id}`),
      goals: e.goals.map(g => ({ ...g, id: `${this.bindings.id}.${g.id}`, when: this.predicate(g.when),
        target: this.predicate(g.target) })) }));
    const campaign: CampaignDefinition = { schemas: module.actions, actors, ...(extensions ? { extensions } : {}),
      ...(definition.conflicts ? { conflicts: definition.conflicts.map(c => `${this.bindings.id}: ${c}`) } : {}),
      creatures: definition.creatures.map(c => ({ ...c, id: `${this.bindings.id}__${c.id}`,
        seed: `${this.bindings.seed}:creature:${c.id}` })),
      pressures: definition.pressures.map(p => ({ ...p, id: this.entities[p.id]!, measure: this.call(p.measure) })),
      outcomes: definition.outcomes.map(o => ({ ...o, predicate: this.predicate(o.predicate) })) };
    return { id: this.bindings.id, seed: this.bindings.seed, instance: { ...this.instance, module, campaign },
      imports: Object.values(this.bindings.imports), exports: Object.fromEntries(
        Object.entries(this.bindings.exports).map(([name, local]) => {
          const id = this.entities[local];
          if (!id) { throw new Error(`Unknown export ${local}`); }
          return [name, id];
        })) };
  }
  static record(draft: ModuleDraft, elapsed: number): InstalledModule {
    const definition = draft.instance.campaign!;
    return { id: draft.id, seed: draft.seed, name: draft.instance.module.name,
      description: draft.instance.module.description, installedAt: elapsed,
      ...(definition.pressures.length ? { deadline: elapsed + draft.instance.budget } : {}),
      goal: draft.instance.module.goal,
      ...(draft.roles?.length ? { roles: structuredClone(draft.roles) } : {}),
      actors: definition.actors.map(a => a.id), pressures: definition.pressures.map(p => p.id),
      outcomes: structuredClone(definition.outcomes), exports: draft.exports,
      ...(draft.experience ? { experience: draft.experience } : {}) };
  }
}
