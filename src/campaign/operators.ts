import { ActionSchemas } from './action-schemas';
import type { CampaignActor } from './definition';
import type { Call, Module, Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';

type Actors = Pick<CampaignActor, 'id' | 'actions' | 'allActions'>[];
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
  private readonly made = new Map<string, Operator>();
  private readonly atoms = new Map<string, Call[]>();
  constructor(readonly module: Module, private readonly actors?: Actors) {
    this.labels = ActionSchemas.labels(module);
    this.schemas = new Map(module.actions.map(a => [a.id, a]));
    this.types = new Map(module.entities.map(e => [e.id, e.type]));
    this.order = new Map(module.entities.map((e, i) => [e.id, i]));
    this.relations = new Set(module.relations.map(r => r.name));
    for (const action of module.actions) { ActionSchemas.checkLabels(action, this.labels); }
  }
  // The operator with this id, if its schema exists and its arguments have the declared types.
  get(id: string): Operator | undefined {
    const made = this.made.get(id);
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
      const candidates = parameters.length ? this.bindings(world, schema, actor !== undefined ? { actor } : {})
        .map(b => this.make(schema, b)) : [schema];
      out.push(...candidates.filter(op => world.test(op.requires) && world.admits(op.success)));
    }
    return out;
  }
  private make(schema: Operator, binding: Binding): Operator {
    const id = `${schema.id}(${schema.parameters!.map(p => binding[p.name]).join(',')})`;
    let op = this.made.get(id);
    if (!op) {
      const ordered = Object.fromEntries(schema.parameters!.map(p => [p.name, binding[p.name]!]));
      op = ActionSchemas.instance(schema, ordered, this.labels);
      this.made.set(id, op);
    }
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
  private collect(p: Predicate, names: Set<string>, out: Call[]): Call[] {
    if (p.kind === 'and') { this.collect(p.left, names, out); this.collect(p.right, names, out); }
    else if (p.kind === 'call' && this.relations.has(p.name) && p.args.some(a => names.has(a))) { out.push(p); }
    return out;
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
      const atom = open.reduce((best, a) => Operators.known(a, names, bound) > Operators.known(best, names, bound)
        ? a : best);
      pending.splice(pending.indexOf(atom), 1);
      const next = new Map<string, Binding>();
      for (const row of rows) {
        const query = { ...atom, args: atom.args.map(x => names.has(x) ? row[x] ?? `?$${x}` : x) };
        for (const solution of world.solve(query, {})) {
          const extended = { ...row };
          if (atom.args.every(x => !names.has(x) || extended[x] !== undefined
            || (this.fits(schema, x, solution[`?$${x}`]) && (extended[x] = solution[`?$${x}`]!)))) {
            next.set(JSON.stringify(extended), extended);
          }
        }
      }
      rows = [...next.values()];
    }
    for (const p of parameters) {
      rows = rows.flatMap(row => row[p.name] !== undefined ? [row] : this.module.entities
        .filter(e => this.fits(schema, p.name, e.id)).map(e => ({ ...row, [p.name]: e.id })));
    }
    const ranked = rows.map(row => ({ row, rank: parameters.map(p => this.order.get(row[p.name]!) ?? 0) }));
    return ranked.sort((a, b) => a.rank.reduce((d, v, i) => d || v - b.rank[i]!, 0)).map(r => r.row);
  }
}
