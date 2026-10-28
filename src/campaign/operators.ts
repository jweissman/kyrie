import { ActionSchemas } from './action-schemas';
import { ComputedRelations } from '../lang/computed-relations';
import type { CampaignActor } from './definition';
import type { Call, Module, Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { Candidates } from '../lang/candidates';

type Actors = readonly Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[];
type Binding = Record<string, string>;

// A campaign's actions, grounded on demand. A schema's applicable bindings are found by joining the positive facts
// its precondition requires against the current world, then every candidate is tested exactly as an eagerly
// grounded action would be: full precondition and admissible effects. Operators are made once per id.
export class Operators {
  private readonly labels: Map<string, string>;
  private readonly schemas: Map<string, Operator>;
  private readonly types: Map<string, string>;
  private readonly order: Map<string, number>;
  private readonly relations: Set<string>;
  private readonly queries: Set<string>;
  // The actions made most lately, by id, as many as `kept`: a long game's townsfolk plan over tens of thousands of
  // actions, and kept every one of them (Mission 15: 128 MB after 333 commands of wren, a fresh restore of which
  // holds 48 MB in all). One made again is the same action.
  private readonly made = new Map<string, Operator>();
  private static readonly kept = 4096;
  private readonly atoms = new Map<string, Call[]>();
  constructor(readonly module: Module, private readonly actors?: Actors) {
    this.labels = ActionSchemas.labels(module);
    this.schemas = new Map(module.actions.map(a => [a.id, a]));
    this.types = new Map(module.entities.map(e => [e.id, e.type]));
    this.order = new Map(module.entities.map((e, i) => [e.id, i]));
    this.relations = new Set(module.relations.map(r => r.name));
    this.queries = new Set(module.queries.map(q => q.name));
    for (const action of module.actions) { ActionSchemas.checkLabels(action, this.labels); }
  }
  // The operator with this id, if its schema exists and its arguments have the declared types.
  get(id: string): Operator | undefined {
    const made = this.recall(id);
    if (made) { return made; }
    const plain = this.schemas.get(id);
    if (plain) { return plain.parameters?.length ? undefined : plain; }
    const match = /^([^()]+)\((.*)\)$/.exec(id);
    const schema = match && this.schemas.get(match[1]!);
    const args = match?.[2]!.split(',') ?? [];
    if (!schema?.parameters || schema.parameters.length !== args.length) { return undefined; }
    const binding = Object.fromEntries(schema.parameters.map((p, i) => [p.name, args[i]!]));
    return schema.parameters.every(p => this.fits(schema, p.name, binding[p.name]!))
      ? this.make(schema, binding) : undefined;
  }
  // Operators whose preconditions hold, in schema order and then binding order. With an actor, only actions that
  // actor performs: schemas whose actor parameter it may bind.
  applicable(world: World, actor?: string, only?: Set<string>): Operator[] {
    const out: Operator[] = [];
    for (const schema of this.schemas.values()) {
      if (only && !only.has(schema.id)) { continue; }
      const parameters = schema.parameters ?? [];
      if (actor !== undefined && !parameters.some(p => p.name === 'actor')) { continue; }
      if (actor !== undefined && !ActionSchemas.mayAct(schema, actor, this.actors)) { continue; }
      // A candidate's precondition is the schema's under its binding (World.test binds a schema's parameters as an
      // action made of it has them bound), so only the candidates it holds for are made into actions.
      if (!parameters.length) {
        if (world.test(schema.requires) && world.admits(schema.success)) { out.push(schema); }
        continue;
      }
      out.push(...this.bindings(world, schema, actor !== undefined ? { actor } : {})
        .filter(b => world.test(schema.requires, b)).map(b => this.make(schema, b))
        .filter(op => world.admits(op.success)));
    }
    return out;
  }
  private make(schema: Operator, binding: Binding): Operator {
    const id = `${schema.id}(${schema.parameters!.map(p => binding[p.name]).join(',')})`;
    let op = this.recall(id);
    if (!op) {
      const ordered = Object.fromEntries(schema.parameters!.map(p => [p.name, binding[p.name]!]));
      op = ActionSchemas.instance(schema, ordered, this.labels);
      this.made.set(id, op);
      if (this.made.size > Operators.kept) { this.made.delete(this.made.keys().next().value!); }
    }
    return op;
  }
  // An action made before, kept as the latest made.
  private recall(id: string): Operator | undefined {
    const op = this.made.get(id);
    if (op) { this.made.delete(id); this.made.set(id, op); }
    return op;
  }
  private fits(schema: Operator, parameter: string, value: string | undefined): boolean {
    const type = schema.parameters!.find(p => p.name === parameter)!.type, actual = value && this.types.get(value);
    return !!actual && (type === 'entity' || actual === type)
      && (parameter !== 'actor' || ActionSchemas.mayAct(schema, value!, this.actors));
  }
  // The positive relation facts a schema's precondition requires, at the top of its conjunction.
  private required(schema: Operator): Call[] {
    let atoms = this.atoms.get(schema.id);
    if (!atoms) {
      atoms = this.collect(schema.requires, new Set(schema.parameters!.map(p => p.name)), []);
      this.atoms.set(schema.id, atoms);
    }
    return atoms;
  }
  // A query at the top of the conjunction proposes too (see Candidates), after the facts that constrain as much.
  private collect(p: Predicate, names: Set<string>, out: Call[]): Call[] {
    if (p.kind === 'and') { this.collect(p.left, names, out); this.collect(p.right, names, out); }
    // A computed comparison (distinct, within) only filters what the facts propose; it proposes nothing itself.
    else if (p.kind === 'call' && !ComputedRelations.has(p.name) && (this.relations.has(p.name) || this.queries.has(p.name))
      && p.args.some(a => names.has(a))) {
      out.push(p);
    }
    return out;
  }
  private score(atom: Call, names: Set<string>, bound: Set<string>): number {
    return Operators.known(atom, names, bound) - (this.queries.has(atom.name) ? 0.5 : 0);
  }
  private static known(atom: Call, names: Set<string>, bound: Set<string>): number {
    return atom.args.filter(x => !names.has(x) || bound.has(x)).length;
  }
  // Candidate bindings: join the required facts most-constrained first, then enumerate any parameter they leave
  // open over the entities of its type. A superset of the applicable bindings; applicable() tests each one.
  private bindings(world: World, schema: Operator, initial: Binding): Binding[] {
    const parameters = schema.parameters!, names = new Set(parameters.map(p => p.name));
    if (Object.entries(initial).some(([p, v]) => !this.fits(schema, p, v))) { return []; }
    let rows: Binding[] = [initial];
    const pending = [...this.required(schema)];
    while (rows.length && pending.length) {
      const bound = new Set(Object.keys(rows[0]!));
      const open = pending.filter(a => a.args.some(x => names.has(x) && !bound.has(x)));
      if (!open.length) { break; }
      const atom = open.reduce((best, a) => this.score(a, names, bound) > this.score(best, names, bound) ? a : best);
      pending.splice(pending.indexOf(atom), 1);
      rows = this.join(world, schema, atom, rows) ?? rows;
    }
    for (const p of parameters) {
      rows = rows.flatMap(row => row[p.name] !== undefined ? [row] : this.module.entities
        .filter(e => this.fits(schema, p.name, e.id)).map(e => ({ ...row, [p.name]: e.id })));
    }
    const ranked = rows.map(row => ({ row, rank: parameters.map(p => this.order.get(row[p.name]!) ?? 0) }));
    return ranked.sort((a, b) => a.rank.reduce((d, v, i) => d || v - b.rank[i]!, 0)).map(r => r.row);
  }
  // The rows extended by what an atom proposes for its open parameters. A query that leaves one of them open in any
  // of what it proposes narrows nothing, and the rows are left as they were (undefined).
  private join(world: World, schema: Operator, atom: Call, rows: Binding[]): Binding[] | undefined {
    const names = new Set(schema.parameters!.map(p => p.name)), next = new Map<string, Binding>();
    const asked = this.queries.has(atom.name);
    for (const row of rows) {
      const query = { ...atom, args: atom.args.map(x => names.has(x) ? row[x] ?? `?$${x}` : x) };
      for (const solution of asked ? Candidates.of(world, query, {}) : world.solve(query, {})) {
        const extended = { ...row };
        if (asked && atom.args.some(x => names.has(x) && row[x] === undefined && solution[`?$${x}`] === undefined)) {
          return undefined;
        }
        if (atom.args.every(x => !names.has(x) || extended[x] !== undefined
          || (this.fits(schema, x, solution[`?$${x}`]) && (extended[x] = solution[`?$${x}`]!)))) {
          next.set(JSON.stringify(extended), extended);
        }
      }
    }
    return [...next.values()];
  }
}
