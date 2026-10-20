import { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';
import type { CampaignActor } from './definition';
import type { Call, Change, Module, Operator, Predicate, Value } from '../lang/module';

export class ActionSchemas {
  static placeholders(template: string): string[] {
    return [...template.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map(match => match[1]!);
  }
  static ground(module: Module, actors?: Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[]): Operator[] {
    const labels = new Map(module.entities.map(e => [e.id, e.type === 'group' ? e.name.split(', ')[0]! : e.name]));
    for (const [id, name] of labels) {
      labels.set(id, name.replace(/\{([A-Za-z][A-Za-z0-9_-]*)\}/g, (whole, ref: string) => labels.get(ref) ?? whole));
    }
    // Join only on relations that no action, rule or campaign projection can write. Keep dynamic
    // preconditions for execution, including cross-module distinct facts installed after grounding.
    const written = new Set(['at', 'able', 'dead', 'distinct', 'recorded', 'capable', 'awake', 'needsCare', 'canCast',
      'treatable', 'ownedItem', 'wearing', 'canTrain', 'proficient',
      ...module.actions.flatMap(a => [...a.success, ...a.failure].map(c => c.call.name)),
      ...(module.rules ?? []).flatMap(r => r.effects.map(c => c.call.name))]);
    const constants = new Set(module.relations.filter(r => !written.has(r.name)).map(r => r.name));
    const facts = new Set(new World(module).apply(module.initial).snapshot.relations.map(World.key));
    return module.actions.flatMap(action => {
      const shown = this.placeholders(action.name).filter(name => action.parameters?.some(p => p.name === name));
      if (this.placeholders(action.name).some(name => !shown.includes(name) && !labels.has(name))) {
        throw new Error(`Unknown label parameter in ${action.id}`);
      }
      if (!action.parameters?.length) { return [structuredClone(action)]; }
      const parameters = new Set(action.parameters.map(p => p.name));
      let combinations: Record<string, string>[] = [{}];
      for (const parameter of action.parameters) {
        const candidates = module.entities.filter(e => (parameter.type === 'entity' || e.type === parameter.type)
          && (parameter.name !== 'actor' || !actors || actors.some(a => a.id === e.id
            && (a.allActions || a.actions.includes(action.id)))));
        combinations = combinations.flatMap(binding => candidates.map(e => ({ ...binding, [parameter.name]: e.id })))
          .filter(binding => this.constantTruth(action.requires, binding, { parameters, constants, facts }) !== false);
        if (combinations.length > 20000) { throw new Error(`Too many bindings for ${action.id}`); }
      }
      return combinations.map(bindings => {
        const args = action.parameters!.map(p => bindings[p.name]!);
        const body = structuredClone(action);
        delete body.parameters;
        return { ...body, id: `${action.id}(${args.join(',')})`, schema: action.id, bindings,
          actor: bindings.actor, name: action.speaker || this.placeholders(action.name).length || action.parameters!.every(p => p.name === 'actor') ? action.name.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
            (_, name: string) => labels.get(bindings[name] ?? name) ?? bindings[name] ?? name) : `${action.name} (${args.join(', ')})`,
          requires: this.predicate(action.requires, bindings),
          ...(action.report ? { report: this.text(action.report, bindings) } : {}),
          ...(action.seen ? { seen: this.text(action.seen, bindings) } : {}),
          success: action.success.map(c => this.change(c, bindings)),
          failure: action.failure.map(c => this.change(c, bindings)),
          ...(action.resolve ? { resolve: this.call(action.resolve, bindings) } : {}),
          ...(action.duration ? { duration: this.call(action.duration, bindings) } : {}) };
      });
    });
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
        return facts.has(World.key(this.call(p, binding)));
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
  private static text(text: string, bindings: Record<string, string>): string {
    return ObservationText.scope(text, call => this.call(call, bindings), id => bindings[id] ?? id);
  }
  private static call(call: Call, bindings: Record<string, string>): Call {
    return { ...call, args: call.args.map(arg => bindings[arg] ?? arg) };
  }
  private static value(value: Value, bindings: Record<string, string>): Value {
    return value.kind === 'call' ? this.call(value, bindings) : structuredClone(value);
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
    const next = { ...structuredClone(change), call: this.call(change.call, bindings) };
    if ('value' in next && next.value.kind === 'call') { next.value = this.call(next.value, bindings); }
    return next;
  }
}
