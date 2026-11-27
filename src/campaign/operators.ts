import { ActionSchemas } from './action-schemas';
import { ComputedRelations } from '../lang/computed-relations';
import type { CampaignActor } from './definition';
import type { Call, Module, Operator, Predicate, World } from '../lang';
import { Candidates } from '../lang/candidates';
import { PresenceGate } from './presence-gate';
import { EntityIndex } from '../lang/entity-index';
import { KeptGroundings } from './kept-groundings';
import { WorldMemo } from '../lang/world-memo';
import { SchemaAsks } from './schema-asks';

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
  // Of every schema, only those that read what was written since asked again (see KeptGroundings.all).
  applicable(world: World, actor?: string, only?: Set<string>): Operator[] {
    const schemas: Operator[] = [];
    for (const schema of this.schemas.values()) {
      if (only && !only.has(schema.id)) { continue; }
      const parameters = schema.parameters ?? [];
      if (actor !== undefined && !parameters.some(p => p.name === 'actor')) { continue; }
      if (actor !== undefined && !ActionSchemas.mayAct(schema, actor, this.actors)) { continue; }
      schemas.push(schema);
    }
    if (!only) { return this.legal(world, actor, schemas); }
    return schemas.flatMap(s => this.groundings.of(world, s, actor, this.schemaOps.bind(this, world, s, actor)));
  }
  // The one operator of this id, if it is among what applicable(world, actor) would ground: its own schema alone
  // grounded at its own binding (OR-725: an act had grounded every schema of the world to find the one it was asked).
  one(world: World, id: string, actor?: string): Operator | undefined {
    const op = this.get(id), schema = op && this.schemas.get(op.schema ?? op.id);
    if (!op || !schema) { return undefined; }
    if (!schema.parameters?.length) {
      return actor === undefined && world.test(schema.requires) && world.admits(schema.success) ? schema : undefined;
    }
    const binding = op.bindings ?? {};
    if (actor !== undefined && (binding.actor !== actor || !ActionSchemas.mayAct(schema, actor, this.actors)
      || !PresenceGate.open(world, schema, actor))) { return undefined; }
    return this.bindings(world, schema, binding).some(b => world.test(schema.requires, b))
      && world.admits(op.success) ? op : undefined;
  }
  private legal(world: World, actor: string | undefined, schemas: readonly Operator[]): Operator[] {
    const ground = this.grounding.bind(this, world, actor);
    if (actor === undefined) { return this.groundings.all(world, actor, schemas, { ground }); }
    const closed = this.shut.bind(this, world, actor, PresenceGate.with(world, actor));
    return this.groundings.all(world, actor, schemas, { ground, closed });
  }
  // What one schema grounds to (kept from world to world: see KeptGroundings).
  private readonly groundings = new KeptGroundings();
  private grounding(world: World, actor: string | undefined, schema: Operator): Operator[] {
    return this.schemaOps(world, schema, actor);
  }
  // Whether a schema is shut for the actor by who it needs (see PresenceGate.with), checked as schemaOps checks it.
  private shut(world: World, actor: string, present: ReadonlySet<string>, schema: Operator): boolean {
    if (!schema.parameters?.length || !PresenceGate.shut(schema, present)) { return false; }
    if (Operators.checking) { this.unneeded(world, schema, actor); }
    return true;
  }
  private schemaOps(world: World, schema: Operator, actor?: string): Operator[] {
    // A candidate's precondition is the schema's under its binding (World.test binds a schema's parameters as an
    // action made of it has them bound), so only the candidates it holds for are made into actions.
    if (!schema.parameters?.length) {
      return world.test(schema.requires) && world.admits(schema.success) ? [schema] : [];
    }
    // Not where one of its needs is unmet (see SchemaAsks), asked first, so that it reads no more than they did.
    if (!SchemaAsks.met(world, schema, actor)) {
      if (Operators.checking) { this.unmet(world, schema, actor); }
      return [];
    }
    // Not where whoever it needs beside the actor is not (see PresenceGate): a word with someone elsewhere.
    if (actor !== undefined && !PresenceGate.open(world, schema, actor)) {
      if (Operators.checking) { this.unneeded(world, schema, actor); }
      return [];
    }
    return this.grounded(world, schema, actor);
  }
  private grounded(world: World, schema: Operator, actor?: string): Operator[] {
    return this.bindings(world, schema, actor !== undefined ? { actor } : {})
      .filter(b => world.test(schema.requires, b)).map(b => this.make(schema, b))
      .filter(op => world.admits(op.success));
  }
  // KYRIE_CHECK_GATES=1: every action the gate passes over is grounded anyway, and its being possible is an error. Read
  // only where there is a process: in the browser a bare process.env had stopped the game loading (13 November).
  static checking = typeof process !== 'undefined' && process.env?.KYRIE_CHECK_GATES === '1';
  private unneeded(world: World, schema: Operator, actor: string) {
    const found = this.grounded(world, schema, actor);
    if (found.length) { throw new Error(`PresenceGate closed ${schema.id} for ${actor}, but ${found[0]!.id} holds`); }
  }
  private unmet(world: World, schema: Operator, actor?: string) {
    const found = SchemaAsks.aside(() => this.grounded(world, schema, actor));
    if (found.length) { throw new Error(`SchemaAsks found ${schema.id} unmet, but ${found[0]!.id} holds`); }
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
  // An atom joined through a parameter already bound reads the working set's own facts (where the actor is, what it
  // has noticed); one known only by a constant (suits(target, looking)) proposes from the whole world, and is
  // preferred after: look_closely went through every thing in the world that suits looking, to test whether the
  // company reached it (scripts/scale-costs, 4,000 rooms: 220 ms a look).
  private score(atom: Call, names: Set<string>, bound: Set<string>): number {
    const local = atom.args.some(x => names.has(x) && bound.has(x)) ? 10 : 0;
    return local + Operators.known(atom, names, bound) - (this.queries.has(atom.name) ? 0.5 : 0);
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
      rows = this.closed(world, pending, this.join(world, schema, atom, rows) ?? rows, names);
    }
    // A parameter left open is enumerated over the entities of its type, in the module's order: over every entity, a
    // company's raise_quality had tested the whole world's for being a quality each step (performance-report.md §3).
    for (const p of parameters) {
      const pool = p.type === 'entity' ? this.module.entities : EntityIndex.of(this.module.entities).typed(p.type);
      rows = rows.flatMap(row => row[p.name] !== undefined ? [row] : pool
        .filter(e => this.fits(schema, p.name, e.id)).map(e => ({ ...row, [p.name]: e.id })));
    }
    const ranked = rows.map(row => ({ row, rank: parameters.map(p => this.order.get(row[p.name]!) ?? 0) }));
    return ranked.sort((a, b) => a.rank.reduce((d, v, i) => d || v - b.rank[i]!, 0)).map(r => r.row);
  }
  // What a query proposes for one pattern of its arguments, found once a world (see WorldMemo) and given back under
  // the asker's names for what is open: nine ways with things (attack, listen, push, pry, burn…) each asked what the
  // company reaches, at a millisecond each, in every world (OR-183).
  private static readonly proposals = new WorldMemo<Binding[]>();
  private static proposed(world: World, query: Call): Binding[] {
    const open = [...new Set(query.args.filter(a => a.startsWith('?')))];
    const plain = { ...query, args: query.args.map(a => a.startsWith('?') ? `?$${open.indexOf(a)}` : a) };
    const found = this.proposals.of(world, `${plain.name}(${plain.args.join(',')})`,
      () => [...Candidates.of(world, plain, {})]);
    return found.map(f => {
      const out: Binding = {};
      open.forEach((name, i) => { const v = f[`?$${i}`]; if (v !== undefined) { out[name] = v; } });
      return out;
    });
  }
  // The rows that hold every required fact the joins so far have bound all of, each taken from what is pending (it
  // must hold of any binding that is an act). Joined only while it had something left open, such a fact had been
  // tested only with the whole precondition at the end: give's every thing carried by everyone here (2,148 candidates
  // over the warrior's walk, none an act), for want of what the one given to wants (OR-183's legal actions).
  private closed(world: World, pending: Call[], rows: Binding[], names: Set<string>): Binding[] {
    if (!rows.length) { return rows; }
    const bound = new Set(Object.keys(rows[0]!));
    const shut = pending.filter(a => a.args.every(x => !names.has(x) || bound.has(x)));
    if (!shut.length) { return rows; }
    for (const a of shut) { pending.splice(pending.indexOf(a), 1); }
    return rows.filter(b => shut.every(a => world.test(a, b)));
  }
  // The rows extended by what an atom proposes for its open parameters. A query that leaves one of them open in any
  // of what it proposes narrows nothing, and the rows are left as they were (undefined).
  private join(world: World, schema: Operator, atom: Call, rows: Binding[]): Binding[] | undefined {
    const names = new Set(schema.parameters!.map(p => p.name)), next = new Map<string, Binding>();
    const asked = this.queries.has(atom.name);
    for (const row of rows) {
      const query = { ...atom, args: atom.args.map(x => names.has(x) ? row[x] ?? `?$${x}` : x) };
      for (const solution of asked ? Operators.proposed(world, query) : world.solve(query, {})) {
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
