import { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';
import type { CampaignActor } from './definition';
import type { Call, Change, Module, Operator, Predicate, Value } from '../lang/module';

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
  static mayAct(action: Operator, actor: string, actors?: Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[]) {
    return !actors || actors.some(a => a.id === actor && (a.allActions || a.actions.includes(action.id)));
  }
  // Every type-correct binding of every schema, less those a static fact rules out. Campaigns ground on demand
  // (see Operators); this eager form serves validation and tools.
  static ground(module: Module, actors?: Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[]): Operator[] {
    const labels = this.labels(module), context = this.context(module);
    return module.actions.flatMap(action => {
      this.checkLabels(action, labels);
      return this.bindings(module, action, { ...context, actors })
        .map(bindings => this.instance(action, bindings, labels));
    });
  }
  // Which schemas have at least one binding their unchanging facts allow (what lint asks), without listing them all:
  // a schema with more bindings than the limit plainly has some.
  static targeted(module: Module, actors?: Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[]): Set<string> {
    const context = this.context(module);
    return new Set(module.actions.filter(action => {
      try { return this.bindings(module, action, { ...context, actors }).length > 0; } catch { return true; }
    }).map(a => a.id));
  }
  // Join only on relations that no action, rule or campaign projection can write. Keep dynamic
  // preconditions for execution, including cross-module distinct facts installed after grounding.
  private static context(module: Module) {
    const written = new Set(['at', 'able', 'dead', 'distinct', 'dark', 'recorded', 'capable', 'awake', 'needsCare', 'canCast',
      'treatable', 'ownedItem', 'wearing', 'canTrain', 'proficient', 'swappable', 'company', 'improvable', 'learnable', 'brings', 'witnessed',
      ...module.actions.flatMap(a => [...a.success, ...a.failure].map(c => c.call.name)),
      ...(module.rules ?? []).flatMap(r => r.effects.map(c => c.call.name))]);
    const constants = new Set(module.relations.filter(r => !written.has(r.name)).map(r => r.name));
    const facts = new Set(new World(module).apply(module.initial).snapshot.relations.map(c => ActionSchemas.key(c)));
    return { constants, facts };
  }
  private static bindings(module: Module, action: Operator, context: { constants: Set<string>; facts: Set<string>;
    actors?: Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[] }): Record<string, string>[] {
    if (!action.parameters?.length) { return [{}]; }
    const { constants, facts, actors } = context, parameters = new Set(action.parameters.map(p => p.name));
    let combinations: Record<string, string>[] = [{}];
    for (const parameter of action.parameters) {
      const candidates = module.entities.filter(e => (parameter.type === 'entity' || e.type === parameter.type)
        && (parameter.name !== 'actor' || this.mayAct(action, e.id, actors)));
      combinations = combinations.flatMap(binding => candidates.map(e => ({ ...binding, [parameter.name]: e.id })))
        .filter(binding => this.constantTruth(action.requires, binding, { parameters, constants, facts }) !== false);
      if (combinations.length > 20000) { throw new Error(`Too many bindings for ${action.id}`); }
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
        || action.parameters.every(p => p.name === 'actor') ? action.name.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
          (_, name: string) => labels.get(bindings[name] ?? name) ?? bindings[name] ?? name) : `${action.name} (${this.named(action, bindings, labels)})`,
      requires: this.predicate(action.requires, bindings),
      ...(action.report ? { report: this.text(action.report, bindings) } : {}),
      ...(action.seen ? { seen: this.text(action.seen, bindings) } : {}),
      success: action.success.map(c => this.change(c, bindings)),
      failure: action.failure.map(c => this.change(c, bindings)),
      ...(action.resolve ? { resolve: this.call(action.resolve, bindings) } : {}),
      ...(action.duration ? { duration: this.call(action.duration, bindings) } : {}) };
  }
  // A label that names none of its parameters is told apart by what they are bound to, by name, less the actor.
  private static named(action: Operator, bindings: Record<string, string>, labels: Map<string, string>): string {
    return (action.parameters ?? []).filter(p => p.name !== 'actor').map(p => labels.get(bindings[p.name]!) ?? bindings[p.name]).join(', ');
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
    return value.kind === 'call' ? this.call(value, bindings) : { ...value };
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
