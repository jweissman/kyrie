import { Spatial } from './spatial';
import { ComputedRelations } from './computed-relations';
import { ObservationText } from './observation-text';
import { Deem } from 'deem';
import type { Aspect, Call, Change, Instance, Module, NumberValue, Predicate, Signature, Value } from './module';
import { World } from './world';
import { VocabularyContext } from './vocabulary';
import { EngineOwned } from './engine-owned';
import { Arithmetic } from './arithmetic';
import { CheckedActions } from './checked-actions';
import type { SiteSpan } from './declaration-sites';
import { ModulePositions } from './module-positions';
import { ModuleDiagnosticText } from './module-diagnostic-text';

// Name lookups for one validation pass; validation reads every action, so linear scans make it quadratic.
interface Lookup { types: Map<string, string>; relations: Signature[]; predicates: Signature[] }
// What rolls a module's dice once as it is instantiated, made for its seed: the runtime's, by its rules (Expressions).
export interface Dice { number(expression: string): number }
export class ModuleCompiler {
  static readonly aspects: readonly Aspect[] = ['fixture', 'feature', 'sign', 'weather', 'ambience', 'event', 'revelation',
    'reading', 'hearsay', 'sound', 'felt'];
  private lookup?: Lookup;
  private signatures = new WeakMap<Signature[], Map<string, Signature>>();
  private positions?: ModulePositions;
  // joined: checking a world joined from modules each checked on its own already. An action's parameter named as
  // something another module brought into the world (the catalog's lamp, once a country gave someone one) is no
  // ambiguity there: in the action, its parameter is meant. The Strewnfield's fuel_lamp could not be installed into a
  // world that held a lamp (the library tour, wren). dice: what rolls a module's dice as it is instantiated; a module
  // instantiated with none may roll none.
  constructor(private readonly capabilities: Signature[] = [], private readonly joined = false,
    private readonly dice?: (seed: string) => Dice,
    private readonly vocabulary: VocabularyContext = VocabularyContext.none) {}
  // goals: predicates over the module (a pressure's measure, outcomes, people's goals), each checked in the one pass
  // with it, rather than the whole module checked again as each one's goal: a scenario of a hundred people had been
  // checked whole hundreds of times, a second of a generated start (Mission 21, world/construction.md §6).
  validate(module: Module, goals: readonly Predicate[] = []) {
    this.lookup = { types: new Map(module.entities.map(e => [e.id, e.type])), relations: module.relations,
      predicates: [...module.relations, ...module.queries.map(q => ({ name: q.name,
        types: q.parameters.map(p => p.type), exclusive: false }))] };
    this.positions = new ModulePositions(module);
    try {
      this.check(module);
      for (const goal of goals) { this.predicate(module, goal); }
    } finally { this.lookup = undefined; this.signatures = new WeakMap(); this.positions = undefined; }
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
    for (const [index, signature] of [...module.relations, ...module.measures].entries()) {
      signature.types.forEach((type, i) => this.kind(module, type,
        index < module.relations.length ? this.positions?.type(index, i) : undefined));
      if (signature.exclusive && signature.types.length < 1) { throw new Error('Exclusive relation needs an argument'); }
    }
    for (const query of module.queries) {
      ModuleCompiler.unique(query.parameters.map(p => p.name), 'query parameter');
      const bindings = Object.fromEntries(query.parameters.map(p => [p.name, p.type]));
      query.parameters.forEach(p => p.type === 'number' || this.kind(module, p.type));
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
    for (const r of module.rules ?? []) { this.once(module, r, () => this.rule(module, r)); }
    ModuleCompiler.unique((module.observations ?? []).map(o => o.id), 'observation');
    for (const o of module.observations ?? []) { this.once(module, o, () => this.observation(module, o)); }
    for (const [id, p] of Object.entries(module.seen ?? {})) {
      if (!this.type(module, id)) { throw new Error(`${id} is seen only by some, but is not an entity`); }
      this.predicate(module, p);
    }
    ModuleCompiler.unique((module.objectives ?? []).map(o => o.id), 'objective');
    for (const o of module.objectives ?? []) { this.objective(module, o); }
  }
  // A rule's own check (see behaviours), checked once while its lookups hold (once).
  private rule(module: Module, r: NonNullable<Module['rules']>[number]) {
    this.predicate(module, r.when); ModuleCompiler.bound(`Rule ${r.id}`, r.when);
    if (r.place?.startsWith('?')) { this.subject(`Rule ${r.id}`, r.anchor, r.place, r.when); }
    else if (r.place) { this.anchor(module, r.place, r.anchor); }
    if (r.say) {
      this.text(module, r.say);
      for (const line of [r.again ?? '', ...r.then ?? []].filter(Boolean)) { this.text(module, line); }
      const named = JSON.stringify(r.when);
      for (const v of ObservationText.variables([r.say, r.again ?? '', ...r.then ?? []].join(' ')).filter(v => !named.includes(`"${v}"`))) {
        throw new Error(`Rule ${r.id} speaks of ${v}, which its condition does not bind`);
      }
    }
    if (r.teaches && (!r.say || this.type(module, r.teaches) !== 'fact')) {
      // What is learned is learned from something said or seen (GTR-24: the refusal says how).
      throw new Error(`Rule ${r.id} teaches ${r.teaches}: a rule teaches a fact by what it says (\`Rule … says "…" `
        + `teaches fact\`), or the fact is taught where it is seen (\`Observe … teaches fact\`); see the guide's `
        + `"Words that teach"`);
    }
    r.effects.forEach(c => this.change(module, c)); ModuleCompiler.writes(`Rule ${r.id}`, r.when, r.effects);
    if (r.effects.some(c => EngineOwned.rules.has(c.call.name))) {
      throw new Error(`Rule ${r.id} cannot change canonical projections, clocks, records or discovery knowledge`
        + ' (a rule teaches what it says: says "…" teaches fact)');
    }
  }
  // An observation's own check (see behaviours), likewise.
  private observation(module: Module, o: NonNullable<Module['observations']>[number]) {
    // Near a variable: near each entity its condition binds it to (a lamp, wherever a lamp is lit).
    const subject = o.place.startsWith('?') ? o.place : undefined;
    if (subject) { this.subject(o.id, o.anchor, subject, o.when); } else { this.anchor(module, o.place, o.anchor); }
    this.predicate(module, o.when); ModuleCompiler.bound(`Observation ${o.id}`, o.when);
    this.text(module, o.text, subject ? { [subject]: 'entity' } : {});
    // What it speaks of is what its condition binds ("{?who} waits here." printed ?who: the review's A17).
    const named = JSON.stringify(o.when);
    for (const v of ObservationText.variables(o.text).filter(v => v !== subject && !named.includes(`"${v}"`))) {
      throw new Error(`Observation ${o.id} speaks of ${v}, which its condition does not bind`);
    }
    if (o.teaches && this.type(module, o.teaches) !== 'fact') { throw new Error(`${o.id} teaches ${o.teaches}, not a fact`); }
    if (o.about && !o.about.startsWith('?') && !this.type(module, o.about)) { throw new Error(`${o.id} is of ${o.about}, which is not an entity`); }
    if (o.aspect && !ModuleCompiler.aspects.includes(o.aspect)) {
      throw new Error(`${o.id} is told as ${o.aspect}; an observation is one of ${ModuleCompiler.aspects.join(', ')}`);
    }
    if (o.by && this.type(module, o.by) !== 'capability') { throw new Error(`${o.id} is noticed by ${o.by}, not a capability`); }
  }
  // An aim's condition and words, and what it is toward: entities, each of them.
  private objective(module: Module, o: NonNullable<Module['objectives']>[number]) {
    this.predicate(module, o.when); this.text(module, o.text);
    const missing = [...o.toward ?? [], ...o.route ? [o.route] : []].find(t => !this.type(module, t));
    if (missing) { throw new Error(`Objective ${o.id} is toward ${missing}, which is not an entity`); }
  }
  // Each checked once while nothing it looks up changes (CheckedActions), its lookups noted as it is checked: an
  // action, a rule, an observation.
  private action(module: Module, action: Module['actions'][number]) { this.once(module, action, () => this.whole(module, action)); }
  private once(module: Module, element: object, check: () => void) {
    const at = { joined: this.joined, capabilities: this.capabilities };
    if (CheckedActions.holds(element, at, n => this.answer(module, n))) { return; }
    const noted: string[] = [];
    this.noted = noted;
    try { check(); } finally { this.noted = undefined; }
    CheckedActions.keep(element, at, noted);
  }
  private noted?: string[];
  // A lookup's note as the module answers it now: `t <id> <type>`, `k <kind>`, `s <list> <name> <types>`.
  private answer(module: Module, note: string): string {
    const [q, a, b] = note.split(' ');
    if (q === 't') { return `t ${a} ${this.type(module, a!) ?? ''}`; }
    if (q === 'k') { return a === 'entity' || module.kinds.includes(a!) ? note : ''; }
    const list = this.list(module, a!), found = list && this.index(list).get(b!);
    return `s ${a} ${b} ${found?.types.join(',') ?? ''}`;
  }
  private list(module: Module, label: string): Signature[] | undefined {
    return ({ p: this.lookup?.predicates, r: module.relations, m: module.measures, c: this.capabilities })[label];
  }
  private whole(module: Module, action: Module['actions'][number]) {
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
    for (const call of action.meanwhile ?? []) { this.predicate(module, call, bindings); }
    [...action.success, ...action.failure].forEach(change => this.change(module, change, bindings));
    // What it writes is what its requirement binds, as a rule's is (ARV-A9: `Assert stale(?nobody)` had loaded).
    ModuleCompiler.writes(`Action ${action.id}`, action.requires, [...action.success, ...action.failure]);
    if (action.speaker && this.type(module, action.speaker) !== 'group') {
      throw new Error(`Unknown topic speaker ${action.speaker}`);
    }
    this.text(module, action.report ?? '', bindings);
    this.text(module, action.otherwise ?? '', bindings);
    this.text(module, action.seen ?? '', bindings);
    for (const t of action.told ?? []) {
      this.predicate(module, t.when, bindings); this.text(module, t.text, bindings);
    }
    if (action.resolve) { this.call(module, action.resolve, this.capabilities, bindings); }
    if (action.duration) { this.value(module, action.duration, bindings); }
  }
  // The definition is read, never written: what is lowered (its dice settled, its predicates resolved) is a new value
  // in a module of its own, each element copied only where it is changed and only a level deep (the review of
  // generated parsing, 20 November, §3; AX-04): the shared rules and a compiled module kept between campaigns are
  // joined into a definition uncopied, and a lowering in place had made each caller copy them whole first (0.18 s and
  // 0.21 s of a new world's install). goals: predicates checked over it in the same pass (see validate).
  instantiate(definition: Module, seed: string, goals: readonly Predicate[] = []): Instance {
    this.validate(definition, goals);
    const expressions = this.dice?.(`${seed}:module`), when = this.resolved.bind(this, expressions);
    const change = ModuleCompiler.change.bind(null, expressions);
    const module: Module = { ...definition, budget: ModuleCompiler.resolve(expressions, definition.budget),
      initial: definition.initial.map(change), goal: when(definition.goal),
      queries: definition.queries.map(q => ({ ...q, body: when(q.body) })),
      actions: definition.actions.map(a => ({ ...a, requires: when(a.requires), success: a.success.map(change),
        failure: a.failure.map(change), ...a.interrupt ? { interrupt: when(a.interrupt) } : {},
        ...a.told ? { told: a.told.map(t => ({ ...t, when: when(t.when) })) } : {},
        ...a.duration ? { duration: ModuleCompiler.settle(expressions, a.duration) } : {} })),
      ...definition.rules ? { rules: definition.rules.map(r => ({ ...r, when: when(r.when),
        effects: r.effects.map(change) })) } : {},
      ...definition.pursuits ? { pursuits: definition.pursuits.map(p => ({ ...p, when: when(p.when),
        target: when(p.target) })) } : {},
      ...definition.observations ? { observations: definition.observations.map(o => ({ ...o, when: when(o.when) })) }
        : {},
      ...definition.objectives ? { objectives: definition.objectives.map(o => ({ ...o, when: when(o.when) })) } : {} };
    const world = new World(module).apply(module.initial);
    return { module, world: world.snapshot, budget: World.literal(module.budget) };
  }
  private resolved(expressions: Dice | undefined, p: Predicate): Predicate {
    return this.resolvePredicate(p, expressions);
  }
  // A change with its value settled (its dice rolled), as a new change; one with no value as it is.
  private static change<C extends Module['initial'][number]>(expressions: Dice | undefined, c: C): C {
    return 'value' in c ? { ...c, value: ModuleCompiler.settle(expressions, c.value) } : c;
  }
  private static settle(expressions: Dice | undefined, value: Value): Value {
    if (value.kind === 'call' || value.kind === 'count') { return value; }
    if (value.kind === 'arith') { return { ...value, left: this.settle(expressions, value.left),
      right: this.settle(expressions, value.right) }; }
    return this.resolve(expressions, value);
  }
  private static resolve(expressions: Dice | undefined, value: NumberValue): NumberValue {
    if (value.kind !== 'deem') { return { kind: 'number', value: value.value }; }
    if (!expressions) {
      throw new Error(`The module rolls (${value.expression}), and no dice were given to instantiate it`);
    }
    return { kind: 'number', value: expressions.number(value.expression) };
  }
  private resolvePredicate(predicate: Predicate, expressions: Dice | undefined): Predicate {
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
    // At or within a place the condition finds, too (Wapshott's Circus friction 2: `near` a place told nothing).
    if (!['near', 'at', 'within'].includes(anchor ?? 'at') || !seen.bound.has(variable)) {
      throw new Error(`${id} is ${anchor ?? 'at'} ${variable}, which its condition must bind (Observe ${id} near ${variable} when …)`);
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
    const type = this.lookup ? this.lookup.types.get(id) : module.entities.find(e => e.id === id)?.type;
    this.noted?.push(`t ${id} ${type ?? ''}`);
    return type;
  }
  private kind(module: Module, kind: string, span?: SiteSpan) {
    if (kind !== 'entity' && !module.kinds.includes(kind)) {
      throw new Error(ModulePositions.message(span, `Unknown kind ${kind}`));
    }
    this.noted?.push(`k ${kind}`);
  }
  private index(signatures: Signature[]): Map<string, Signature> {
    let index = this.signatures.get(signatures);
    if (!index) { index = new Map(signatures.map(s => [s.name, s])); this.signatures.set(signatures, index); }
    return index;
  }
  private call(module: Module, call: Call, signatures: Signature[], bindings: Record<string, string> = {}) {
    const signature = this.index(signatures).get(call.name);
    if (!signature || signature.types.length !== call.args.length) {
      const shape = signature ? `; it is ${ModuleDiagnosticText.shape(signature)}` : '';
      throw new Error(ModulePositions.message(this.positions?.call(call),
        `Unknown function or arity: ${World.format(call)}${shape}`));
    }
    if (this.noted) {
      const label = (['p', 'r', 'm', 'c'] as const).find(l => this.list(module, l) === signatures);
      this.noted.push(label ? `s ${label} ${call.name} ${signature.types.join(',')}` : CheckedActions.unknown);
    }
    call.args.forEach((arg, i) => {
      if (arg.startsWith('?') || (signature.types[i] === 'number' && (/^\d+$/.test(arg) || bindings[arg] === 'number'))) {
        return;
      }
      const type = bindings[arg] ?? this.type(module, arg);
      const expected = signature.types[i];
      // A runtime capability may take one of several kinds at a place (`invoke`'s target: a member or a group).
      if (!type || (expected !== 'entity' && type !== 'entity' && !expected?.split('|').includes(type))) {
        // A world event read by name needs naming in the module's manifest canon (M19-175: eight authors met this
        // refusal and it did not say so).
        const canon = !type && /(^|__)befell$/.test(call.name)
          ? `; a world event is read by listing ${arg} in the manifest's "canon"` : '';
        const detail = type ? signature.roles ? `; it is ${ModuleDiagnosticText.shape(signature)}` : ''
          : ModuleDiagnosticText.unrun(this.vocabulary, arg, expected) ?? ModuleDiagnosticText.known(module, expected);
        const message = `Invalid argument ${arg} in ${World.format(call)}${detail}${canon}`;
        throw new Error(ModulePositions.message(this.positions?.call(call, i), message));
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
    if (value.kind === 'call' && value.name === Arithmetic.given) {
      if (bindings[value.args[0]!] !== 'number') { throw new Error(`${value.args[0]} is no number its query is given`); }
    } else if (value.kind === 'call') { this.call(module, value, module.measures, bindings); }
    else if (value.kind === 'arith') { this.value(module, value.left, bindings); this.value(module, value.right, bindings); }
    else if (value.kind === 'count') { this.predicate(module, value.of, bindings); }
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
  // What a rule writes is what its condition binds: a variable it did not bind was written as itself, and kept (the
  // architecture review's A9: `Assert marked(?t)` under `at(ann, hall)`, or under `not lit(?t)`, kept marked(?t)).
  private static writes(id: string, when: Predicate, effects: Change[]) {
    const bound = this.binds(when);
    const written = effects.flatMap(c => JSON.stringify(c, ModuleCompiler.uncounted).match(/"\?[A-Za-z0-9_]+"/g) ?? [])
      .map(v => v.slice(1, -1));
    for (const v of written) {
      if (!bound.has(v)) { throw new Error(`${id} writes ${v}, which its condition does not bind`); }
    }
  }
  // What a count names is its own to find (count(…)), and not written: read past, as JSON is written.
  private static uncounted(this: void, _key: string, value: unknown): unknown {
    return (value as { kind?: string } | null)?.kind === 'count' ? 0 : value;
  }
  // The variables a condition binds wherever it holds: of an `or`, only those both sides bind.
  private static binds(p: Predicate): Set<string> {
    switch (p.kind) {
      case 'call': return new Set(ComputedRelations.has(p.name) ? [] : p.args.filter(a => a.startsWith('?')));
      case 'and': return new Set([...this.binds(p.left), ...this.binds(p.right)]);
      case 'or': { const right = this.binds(p.right); return new Set([...this.binds(p.left)].filter(v => right.has(v))); }
      default: return new Set();
    }
  }
  private static variables(p: Predicate, seen: { bound: Set<string>; compared: Set<string> }, positive: boolean) {
    if (p.kind === 'call') {
      // `distinct` and `within` test what is bound, and bind nothing (one asked of nothing bound threw mid-pass: the
      // review's A9).
      const into = ComputedRelations.has(p.name) ? seen.compared : positive ? seen.bound : undefined;
      for (const a of p.args.filter(x => x.startsWith('?'))) { into?.add(a); }
    }
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
