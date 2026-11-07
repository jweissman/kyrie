import { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';
import type { CampaignActor } from './definition';
import type { Call, Change, Module, Operator, Predicate, Value } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { EngineWrites } from './engine-writes';

// What grounding reads: the relations nothing writes, the facts they start with, the entities by type, and who acts.
type Grounding = { constants: Set<string>; facts: Set<string>; types: Map<string, Module['entities']>;
  actors?: readonly Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[] };
export class ActionSchemas {
  static placeholders(template: string): string[] {
    return [...template.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map(match => match[1]!);
  }
  // Entity names for action labels: a person's name without their role, with {references} resolved.
  static labels(module: Module): Map<string, string> {
    const labels = new Map(module.entities.map(e => [e.id, e.type === 'group' ? e.name.split(', ')[0]! : e.name]));
    for (const [id, name] of labels) {
      labels.set(id, name.replace(/\{([A-Za-z][A-Za-z0-9_-]*)\}/g, (whole, ref: string) => labels.get(ref) ?? whole));
    }
    return labels;
  }
  static checkLabels(action: Operator, labels: Map<string, string>) {
    const shown = this.placeholders(action.name).filter(name => action.parameters?.some(p => p.name === name));
    if (this.placeholders(action.name).some(name => !shown.includes(name) && !labels.has(name))) {
      throw new Error(`Unknown label parameter in ${action.id}`);
    }
  }
  // Whether an actor may bind a schema's actor parameter.
  static mayAct(action: Operator, actor: string, actors?: readonly Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[]) {
    return !actors || actors.some(a => a.id === actor && (a.allActions || a.actions.includes(action.id)));
  }
  // Every type-correct binding of every schema, less those a static fact rules out. Campaigns ground on demand
  // (see Operators); this eager form serves validation and tools.
  static ground(module: Module, actors?: readonly Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[]): Operator[] {
    const labels = this.labels(module), context = this.context(module);
    return module.actions.flatMap(action => {
      this.checkLabels(action, labels);
      return this.bindings(module, action, { ...context, actors })
        .map(bindings => this.instance(action, bindings, labels));
    });
  }
  // Which schemas have at least one binding their unchanging facts allow (what lint asks), without listing them all:
  // a schema with more bindings than the limit plainly has some.
  // One whose grounding throws for anything but its many bindings is taken as targeted, and why it threw is kept in
  // `failed` for lint to say (it was taken for targeted unsaid: the architecture review's M8).
  static targeted(module: Module, actors?: readonly Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[],
    failed?: Map<string, string>): Set<string> {
    const context = this.context(module);
    return new Set(module.actions.filter(action => {
      try { return this.some(module, action, { ...context, actors }); } catch (error) {
        const why = error instanceof Error ? error.message : String(error);
        if (why !== ActionSchemas.many(action.id)) { failed?.set(action.id, why); }
        return true;
      }
    }).map(a => a.id));
  }
  private static many(id: string): string { return `Too many bindings for ${id}`; }
  // Whether a schema has a binding, found depth first and stopped at the first (a drawn country's lint had listed
  // every binding of the shared ask breadth first, half a minute, to learn there was one: 3 November). A search that
  // goes on past the limit, as the listing would have, has plainly many.
  private static some(module: Module, action: Operator, context: Grounding,
    at: { binding: Record<string, string>; i: number; tried: { n: number } } = { binding: {}, i: 0, tried: { n: 0 } })
    : boolean {
    const parameters = action.parameters ?? [], parameter = parameters[at.i];
    if (!parameter) { return true; }
    const names = new Set(parameters.map(p => p.name));
    for (const e of parameter.type === 'entity' ? module.entities : context.types.get(parameter.type) ?? []) {
      if (parameter.name === 'actor' && !this.mayAct(action, e.id, context.actors)) { continue; }
      if (++at.tried.n > 20000) { return true; }
      const binding = { ...at.binding, [parameter.name]: e.id };
      if (this.constantTruth(action.requires, binding, { parameters: names, ...context }) !== false
        && this.some(module, action, context, { binding, i: at.i + 1, tried: at.tried })) { return true; }
    }
    return false;
  }
  // Join only on relations that no action, rule or campaign projection can write. Keep dynamic
  // preconditions for execution, including cross-module distinct facts installed after grounding.
  private static context(module: Module) {
    const written = new Set([...EngineWrites.names,
      ...module.actions.flatMap(a => [...a.success, ...a.failure].map(c => c.call.name)),
      ...(module.rules ?? []).flatMap(r => r.effects.map(c => c.call.name))]);
    const constants = new Set(module.relations.filter(r => !written.has(r.name)).map(r => r.name));
    const facts = new Set(new World(module).apply(module.initial).view.relations.map(c => ActionSchemas.key(c)));
    // The entities of each type, gathered once: every parameter of every action had scanned the whole world for its
    // type (a drawn country's lint spent most of a minute so, and timed out on CI: 3 November).
    const types = new Map<string, Module['entities']>();
    for (const e of module.entities) {
      if (!types.has(e.type)) { types.set(e.type, []); }
      types.get(e.type)!.push(e);
    }
    return { constants, facts, types };
  }
  private static bindings(module: Module, action: Operator, context: Grounding): Record<string, string>[] {
    if (!action.parameters?.length) { return [{}]; }
    const { constants, facts, actors } = context, parameters = new Set(action.parameters.map(p => p.name));
    let combinations: Record<string, string>[] = [{}];
    for (const parameter of action.parameters) {
      const candidates = (parameter.type === 'entity' ? module.entities : context.types.get(parameter.type) ?? [])
        .filter(e => parameter.name !== 'actor' || this.mayAct(action, e.id, actors));
      combinations = combinations.flatMap(binding => candidates.map(e => ({ ...binding, [parameter.name]: e.id })))
        .filter(binding => this.constantTruth(action.requires, binding, { parameters, constants, facts }) !== false);
      if (combinations.length > 20000) { throw new Error(ActionSchemas.many(action.id)); }
    }
    return combinations;
  }
  // One grounded operator: the schema with its parameters replaced by a binding.
  static instance(action: Operator, bindings: Record<string, string>, labels: Map<string, string>): Operator {
    if (!action.parameters?.length) { return structuredClone(action); }
    const args = action.parameters.map(p => bindings[p.name]!);
    const body = { ...action };
    delete body.parameters;
    return { ...body, id: `${action.id}(${args.join(',')})`, schema: action.id, bindings,
      actor: bindings.actor, name: action.speaker || this.placeholders(action.name).length
        || !this.named(action, bindings, labels) ? action.name.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
          (_, name: string) => labels.get(bindings[name] ?? name) ?? bindings[name] ?? name) : `${action.name} (${this.named(action, bindings, labels)})`,
      requires: this.predicate(action.requires, bindings),
      ...(action.interrupt ? { interrupt: this.predicate(action.interrupt, bindings) } : {}),
      ...(action.meanwhile ? { meanwhile: action.meanwhile.map(c => this.call(c, bindings)) } : {}),
      ...(action.report ? { report: this.text(action.report, bindings) } : {}),
      ...(action.otherwise ? { otherwise: this.text(action.otherwise, bindings) } : {}),
      ...(action.told ? { told: action.told.map(t => ({ ...t, text: this.text(t.text, bindings),
        when: this.predicate(t.when, bindings) })) } : {}),
      ...(action.seen ? { seen: this.text(action.seen, bindings) } : {}),
      success: action.success.map(c => this.change(c, bindings)),
      failure: action.failure.map(c => this.change(c, bindings)),
      ...(action.resolve ? { resolve: this.call(action.resolve, bindings) } : {}),
      ...(action.duration ? { duration: this.value(action.duration, bindings) } : {}) };
  }
  // A label that names none of its parameters is told apart by what they are bound to, by name, less the actor and
  // the site: the site is where the company already stands, so it tells nothing apart.
  private static named(action: Operator, bindings: Record<string, string>, labels: Map<string, string>): string {
    return (action.parameters ?? []).filter(p => p.name !== 'actor' && p.name !== 'site')
      .map(p => labels.get(bindings[p.name]!) ?? bindings[p.name]).join(', ');
  }
  private static constantTruth(p: Predicate, binding: Record<string, string>, context: {
    parameters: Set<string>; constants: Set<string>; facts: Set<string>;
  }): boolean | undefined {
    const { parameters, constants, facts } = context;
    switch (p.kind) {
      case 'boolean': return p.value;
      case 'call':
        if (!constants.has(p.name) || p.args.some(a => a.startsWith('?') || (parameters.has(a) && !(a in binding)))) {
          return undefined;
        }
        return facts.has(this.key(p, binding));
      case 'not': {
        const value = this.constantTruth(p.value, binding, context);
        return value === undefined ? undefined : !value;
      }
      case 'and': case 'or': {
        const left = this.constantTruth(p.left, binding, context);
        const right = this.constantTruth(p.right, binding, context);
        if (p.kind === 'and') {
          return left === false || right === false ? false : left === true && right === true ? true : undefined;
        }
        return left === true || right === true ? true : left === false && right === false ? false : undefined;
      }
      default: return undefined;
    }
  }
  private static key(call: Call, binding: Record<string, string> = {}): string {
    let key = call.name;
    for (const a of call.args) { key += '\u0000' + (binding[a] ?? a); }
    return key;
  }
  private static text(text: string, bindings: Record<string, string>): string {
    return ObservationText.scope(text, call => this.call(call, bindings), id => bindings[id] ?? id);
  }
  private static call(call: Call, bindings: Record<string, string>): Call {
    return { ...call, args: call.args.map(arg => bindings[arg] ?? arg) };
  }
  private static value(value: Value, bindings: Record<string, string>): Value {
    return ModuleWriter.calls(value, c => this.call(c, bindings));
  }
  private static predicate(p: Predicate, bindings: Record<string, string>): Predicate {
    switch (p.kind) {
      case 'call': return this.call(p, bindings);
      case 'and': case 'or': return { ...p, left: this.predicate(p.left, bindings), right: this.predicate(p.right, bindings) };
      case 'not': return { ...p, value: this.predicate(p.value, bindings) };
      case 'compare': return { ...p, left: this.value(p.left, bindings), right: this.value(p.right, bindings) };
      default: return structuredClone(p);
    }
  }
  private static change(change: Change, bindings: Record<string, string>): Change {
    const next = { ...change, call: this.call(change.call, bindings) };
    if ('value' in next) { next.value = this.value(next.value, bindings) as typeof next.value; }
    return next;
  }
}
