import { Spatial } from '../spatial';
import { ObservationText } from './observation-text';
import { Deem } from 'deem';
import { Expressions } from '../expressions';
import type { Aspect, Call, Change, Instance, Module, NumberValue, Predicate, Signature, Value } from './module';
import { World } from './world';

// Name lookups for one validation pass; validation reads every action, so linear scans make it quadratic.
interface Lookup { types: Map<string, string>; relations: Signature[]; predicates: Signature[] }
export class ModuleCompiler {
  static readonly aspects: readonly Aspect[] = ['fixture', 'feature', 'sign', 'weather', 'ambience', 'event', 'revelation',
    'reading', 'hearsay'];
  private lookup?: Lookup;
  private signatures = new WeakMap<Signature[], Map<string, Signature>>();
  // joined: checking a world joined from modules each checked on its own already. An action's parameter named as
  // something another module brought into the world (the catalog's lamp, once a country gave someone one) is no
  // ambiguity there: in the action, its parameter is meant. The Strewnfield's fuel_lamp could not be installed into a
  // world that held a lamp (the library tour, wren).
  constructor(private readonly capabilities: Signature[] = [], private readonly joined = false) {}
  validate(module: Module) {
    this.lookup = { types: new Map(module.entities.map(e => [e.id, e.type])), relations: module.relations,
      predicates: [...module.relations, ...module.queries.map(q => ({ name: q.name,
        types: q.parameters.map(p => p.type), exclusive: false }))] };
    try { this.check(module); } finally { this.lookup = undefined; this.signatures = new WeakMap(); }
  }
  private check(module: Module) {
    Spatial.validate(module);
    ModuleCompiler.unique(module.kinds, 'kind');
    ModuleCompiler.unique(module.entities.map(e => e.id), 'entity');
    ModuleCompiler.unique(module.actions.map(a => a.id), 'action');
    ModuleCompiler.unique([...module.relations, ...module.measures, ...module.queries].map(s => s.name), 'function');
    for (const entity of module.entities) {
      this.kind(module, entity.type);
      if ((entity.type === 'member') !== !!entity.creatureId) {
        throw new Error(`Member reference ${entity.id} needs an explicit canonical creature binding`);
      }
      // A place seen as something else until a fact is known needs that fact, or it is never named.
      if (entity.alias && this.type(module, entity.alias.until) !== 'fact') {
        throw new Error(`${entity.id} is seen as "${entity.alias.name}" until ${entity.alias.until}, which is not a fact`);
      }
    }
    ModuleCompiler.unique(module.entities.filter(e => e.creatureId).map(e => e.creatureId!), 'creature binding');
    this.signaturesOf(module);
    this.behaviours(module);
    this.number(module.budget);
    this.predicate(module, module.goal);
    module.initial.forEach(change => this.change(module, change));
    module.actions.forEach(action => this.action(module, action));
  }
  // Relations, measures and queries: well-typed, and no query defined in terms of itself.
  private signaturesOf(module: Module) {
    for (const signature of [...module.relations, ...module.measures]) {
      signature.types.forEach(type => this.kind(module, type));
      if (signature.exclusive && signature.types.length < 2) { throw new Error('Exclusive relation needs at least two arguments'); }
    }
    for (const query of module.queries) {
      ModuleCompiler.unique(query.parameters.map(p => p.name), 'query parameter');
      const bindings = Object.fromEntries(query.parameters.map(p => [p.name, p.type]));
      query.parameters.forEach(p => this.kind(module, p.type));
      this.predicate(module, query.body, bindings);
      this.acyclic(module, query.name, []);
    }
  }
  // What the world does on its own: people's pursuits, rules, and what is observed and wanted.
  private behaviours(module: Module) {
    ModuleCompiler.unique((module.pursuits ?? []).map(p => `${p.actor}:${p.id}`), 'pursuit');
    for (const p of module.pursuits ?? []) {
      if (!module.entities.some(e => e.id === p.actor && e.type === 'group')
        || !Number.isSafeInteger(p.priority)) { throw new Error('Invalid pursuit actor/priority'); }
      this.predicate(module, p.when); this.predicate(module, p.target);
    }
    ModuleCompiler.unique((module.rules ?? []).map(r => r.id), 'rule');
    for (const r of module.rules ?? []) {
      this.predicate(module, r.when); ModuleCompiler.bound(`Rule ${r.id}`, r.when);
      if (r.place) { this.anchor(module, r.place, r.anchor); }
      if (r.say) {
        this.text(module, r.say);
        const named = JSON.stringify(r.when);
        for (const v of ObservationText.variables(r.say).filter(v => !named.includes(`"${v}"`))) {
          throw new Error(`Rule ${r.id} speaks of ${v}, which its condition does not bind`);
        }
      }
      if (r.teaches && (!r.say || this.type(module, r.teaches) !== 'fact')) {
        throw new Error(`Rule ${r.id} teaches ${r.teaches}: it must say something, and teach a fact`);
      }
      r.effects.forEach(c => this.change(module, c));
      if (r.effects.some(c => ['able', 'dead', 'watch', 'dark', 'untilLight', 'untilMorning', 'dice', 'recorded', 'deficit', 'knows', 'established', 'capable', 'memberOf', 'awake', 'needsCare', 'canCast', 'treatable', 'relieves', 'ownedItem', 'wearing', 'canTrain', 'proficient'].includes(c.call.name))) {
        throw new Error(`Rule ${r.id} cannot change canonical projections, clocks, records or discovery knowledge`
          + ' (a rule teaches what it says: says "…" teaches fact)');
      }
    }
    ModuleCompiler.unique((module.observations ?? []).map(o => o.id), 'observation');
    for (const o of module.observations ?? []) {
      // Near a variable: near each entity its condition binds it to (a lamp, wherever a lamp is lit).
      const subject = o.place.startsWith('?') ? o.place : undefined;
      if (subject) { this.subject(o.id, o.anchor, subject, o.when); } else { this.anchor(module, o.place, o.anchor); }
      this.predicate(module, o.when); ModuleCompiler.bound(`Observation ${o.id}`, o.when);
      this.text(module, o.text, subject ? { [subject]: 'entity' } : {});
      if (o.teaches && this.type(module, o.teaches) !== 'fact') { throw new Error(`${o.id} teaches ${o.teaches}, not a fact`); }
      if (o.about && !o.about.startsWith('?') && !this.type(module, o.about)) { throw new Error(`${o.id} is of ${o.about}, which is not an entity`); }
      if (o.aspect && !ModuleCompiler.aspects.includes(o.aspect)) {
        throw new Error(`${o.id} is told as ${o.aspect}; an observation is one of ${ModuleCompiler.aspects.join(', ')}`);
      }
      if (o.by && this.type(module, o.by) !== 'capability') { throw new Error(`${o.id} is noticed by ${o.by}, not a capability`); }
    }
    for (const [id, p] of Object.entries(module.seen ?? {})) {
      if (!this.type(module, id)) { throw new Error(`${id} is seen only by some, but is not an entity`); }
      this.predicate(module, p);
    }
    ModuleCompiler.unique((module.objectives ?? []).map(o => o.id), 'objective');
    for (const o of module.objectives ?? []) { this.predicate(module, o.when); this.text(module, o.text); }
  }
  private action(module: Module, action: Module['actions'][number]) {
    if (!Number.isSafeInteger(action.cost) || action.cost < 0
      || !Number.isSafeInteger(action.time) || action.time < 0) { throw new Error(`Invalid cost/time for ${action.id}`); }
    const bindings = Object.fromEntries((action.parameters ?? []).map(p => [p.name, p.type]));
    ModuleCompiler.unique((action.parameters ?? []).map(p => p.name), 'action parameter');
    (action.parameters ?? []).forEach(p => {
      this.kind(module, p.type);
      if (!this.joined && this.type(module, p.name)) { throw new Error(`Parameter shadows entity ${p.name}`); }
    });
    this.predicate(module, action.requires, bindings);
    if (action.interrupt) { this.predicate(module, action.interrupt, bindings); }
    [...action.success, ...action.failure].forEach(change => this.change(module, change, bindings));
    if (action.speaker && !module.entities.some(e => e.id === action.speaker && e.type === 'group')) {
      throw new Error(`Unknown topic speaker ${action.speaker}`);
    }
    this.text(module, action.report ?? '', bindings);
    this.text(module, action.otherwise ?? '', bindings);
    this.text(module, action.seen ?? '', bindings);
    if (action.resolve) { this.call(module, action.resolve, this.capabilities, bindings); }
    if (action.duration) { this.call(module, action.duration, module.measures, bindings); }
  }
  instantiate(definition: Module, seed: string): Instance {
    this.validate(definition);
    const module = structuredClone(definition);
    const expressions = new Expressions(`${seed}:module`);
    const resolve = ModuleCompiler.resolve.bind(null, expressions);
    module.budget = resolve(module.budget);
    const changes = [...module.initial, ...(module.rules ?? []).flatMap(r => r.effects),
      ...module.actions.flatMap(action => [...action.success, ...action.failure])];
    for (const change of changes) {
      if ('value' in change) { change.value = ModuleCompiler.settle(expressions, change.value); }
    }
    for (const p of module.pursuits ?? []) {
      p.when = this.resolvePredicate(p.when, expressions); p.target = this.resolvePredicate(p.target, expressions);
    }
    for (const r of module.rules ?? []) { r.when = this.resolvePredicate(r.when, expressions); }
    for (const o of module.observations ?? []) { o.when = this.resolvePredicate(o.when, expressions); }
    for (const o of module.objectives ?? []) { o.when = this.resolvePredicate(o.when, expressions); }
    module.goal = this.resolvePredicate(module.goal, expressions);
    for (const query of module.queries) { query.body = this.resolvePredicate(query.body, expressions); }
    for (const action of module.actions) {
      action.requires = this.resolvePredicate(action.requires, expressions);
      if (action.interrupt) { action.interrupt = this.resolvePredicate(action.interrupt, expressions); }
    }
    const world = new World(module).apply(module.initial);
    return { module, world: world.snapshot, budget: World.literal(module.budget) };
  }
  // A value with its dice rolled once, for the module: what is left to the world is its measures.
  private static settle(expressions: Expressions, value: Value): Value {
    if (value.kind === 'call') { return value; }
    if (value.kind === 'arith') { return { ...value, left: this.settle(expressions, value.left),
      right: this.settle(expressions, value.right) }; }
    return this.resolve(expressions, value);
  }
  private static resolve(expressions: Expressions, value: NumberValue): NumberValue {
    return { kind: 'number', value: value.kind === 'deem' ? expressions.number(value.expression) : value.value };
  }
  private resolvePredicate(predicate: Predicate, expressions: Expressions): Predicate {
    switch (predicate.kind) {
      case 'compare': return { ...predicate,
        left: ModuleCompiler.settle(expressions, predicate.left),
        right: ModuleCompiler.settle(expressions, predicate.right) };
      case 'and': case 'or': return { ...predicate, left: this.resolvePredicate(predicate.left, expressions),
        right: this.resolvePredicate(predicate.right, expressions) };
      case 'not': return { ...predicate, value: this.resolvePredicate(predicate.value, expressions) };
      default: return predicate;
    }
  }
  private subject(id: string, anchor: string | undefined, variable: string, when: Predicate) {
    const seen = { bound: new Set<string>(), compared: new Set<string>() };
    ModuleCompiler.variables(when, seen, true);
    if (anchor !== 'near' || !seen.bound.has(variable)) {
      throw new Error(`${id} is near ${variable}, which its condition must bind (Observe ${id} near ${variable} when …)`);
    }
  }
  private anchor(module: Module, id: string, anchor: string | undefined) {
    const type = this.type(module, id);
    const ok = anchor === 'near' ? !!type : anchor === 'beside' ? type === 'passage' : type === 'place';
    if (!ok) { throw new Error(anchor && anchor !== 'at' ? `Unknown ${anchor} anchor ${id}` : `Unknown observation place ${id}`); }
  }
  private text(module: Module, text: string, bindings: Record<string, string> = {}) {
    for (const call of ObservationText.references(text)) { this.call(module, call, module.measures, bindings); }
    for (const id of ObservationText.names(text)) {
      if (!bindings[id] && !this.type(module, id)) { throw new Error(`Text names unknown entity {${id}}`); }
    }
  }
  static unique(names: string[], label: string) {
    const seen = new Set<string>(), repeated = names.filter(n => seen.size === seen.add(n).size);
    if (repeated.length) { throw new Error(`Duplicate ${label} ${[...new Set(repeated)].join(', ')}`); }
  }
  private type(module: Module, id: string): string | undefined {
    return this.lookup ? this.lookup.types.get(id) : module.entities.find(e => e.id === id)?.type;
  }
  private kind(module: Module, kind: string) {
    if (kind !== 'entity' && !module.kinds.includes(kind)) { throw new Error(`Unknown kind ${kind}`); }
  }
  private call(module: Module, call: Call, signatures: Signature[], bindings: Record<string, string> = {}) {
    let index = this.signatures.get(signatures);
    if (!index) { index = new Map(signatures.map(s => [s.name, s])); this.signatures.set(signatures, index); }
    const signature = index.get(call.name);
    if (!signature || signature.types.length !== call.args.length) { throw new Error(`Unknown function or arity: ${World.format(call)}`); }
    call.args.forEach((arg, i) => {
      if (arg.startsWith('?')) { return; }
      const type = bindings[arg] ?? this.type(module, arg);
      const expected = signature.types[i];
      if (!type || (expected !== 'entity' && type !== 'entity' && type !== expected)) {
        throw new Error(`Invalid argument ${arg} in ${World.format(call)}`);
      }
    });
  }
  private predicate(module: Module, predicate: Predicate, bindings: Record<string, string> = {}) {
    switch (predicate.kind) {
      case 'call':
        this.call(module, predicate, this.lookup?.predicates ?? [...module.relations, ...module.queries.map(q => ({
          name: q.name, types: q.parameters.map(p => p.type), exclusive: false }))], bindings);
        break;
      case 'compare': this.value(module, predicate.left, bindings); this.value(module, predicate.right, bindings); break;
      case 'and': case 'or': this.predicate(module, predicate.left, bindings); this.predicate(module, predicate.right, bindings); break;
      case 'not': this.predicate(module, predicate.value, bindings); break;
      case 'boolean': break;
    }
  }
  private value(module: Module, value: Value, bindings: Record<string, string>) {
    if (value.kind === 'call') { this.call(module, value, module.measures, bindings); }
    else if (value.kind === 'arith') { this.value(module, value.left, bindings); this.value(module, value.right, bindings); }
    else { this.number(value); }
  }
  private number(value: NumberValue) {
    // Numbers are whole: a written one is never negative, but a kind may weigh less than nothing (selm).
    if (value.kind === 'number' && !Number.isSafeInteger(value.value)) { throw new Error('Module numbers must be safe integers'); }
    if (value.kind === 'deem' && Deem.grammar.match(value.expression).failed()) { throw new Error('Invalid Deem expression'); }
  }
  private change(module: Module, change: Change, bindings: Record<string, string> = {}) {
    if (change.kind === 'assert' || change.kind === 'retract') { this.call(module, change.call, module.relations, bindings); }
    else {
      this.call(module, change.call, module.measures, bindings);
      this.value(module, change.value, bindings);
    }
  }
  // A condition that compares ?variables nothing in it binds is never true: the comparison reads nothing. Alone,
  // "purse(?m) > quantity(?m, gold)" is false for every dealer; "buysValuables(?m) and purse(?m) > …" binds them.
  private static bound(id: string, when: Predicate) {
    const seen = { bound: new Set<string>(), compared: new Set<string>() };
    this.variables(when, seen, true);
    const loose = [...seen.compared].filter(v => !seen.bound.has(v));
    if (loose.length) { throw new Error(`${id} compares ${loose.join(', ')}, which nothing in its condition binds`); }
  }
  private static variables(p: Predicate, seen: { bound: Set<string>; compared: Set<string> }, positive: boolean) {
    if (p.kind === 'call' && positive) { for (const a of p.args.filter(a => a.startsWith('?'))) { seen.bound.add(a); } }
    if (p.kind === 'compare') {
      for (const v of [p.left, p.right]) {
        if (v.kind === 'call') { for (const a of v.args.filter(a => a.startsWith('?'))) { seen.compared.add(a); } }
      }
    }
    if (p.kind === 'and' || p.kind === 'or') { this.variables(p.left, seen, positive); this.variables(p.right, seen, positive); }
    if (p.kind === 'not') { this.variables(p.value, seen, false); }
  }
  private acyclic(module: Module, name: string, stack: string[]) {
    if (stack.includes(name)) { throw new Error(`Recursive query ${[...stack, name].join(' -> ')}`); }
    const query = module.queries.find(q => q.name === name)!;
    for (const dependency of this.dependencies(query.body)) {
      if (module.queries.some(q => q.name === dependency)) { this.acyclic(module, dependency, [...stack, name]); }
    }
  }
  private dependencies(predicate: Predicate): string[] {
    if (predicate.kind === 'call') { return [predicate.name]; }
    if (predicate.kind === 'not') { return this.dependencies(predicate.value); }
    if (predicate.kind === 'and' || predicate.kind === 'or') {
      return [...this.dependencies(predicate.left), ...this.dependencies(predicate.right)];
    }
    return [];
  }
}
