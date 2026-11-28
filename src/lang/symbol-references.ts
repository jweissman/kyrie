import type { Call, Change, Module, Predicate, Value } from './module';
import type { SymbolNamespace } from './declaration-sites';

// What a reference names: a relation, measure or query (a call), an entity (an argument), an act, or a kind (a type).
export type SymbolSought = 'function' | 'entity' | 'act' | 'kind' | 'rule' | 'observation' | 'objective' | 'pursuit';
// What it does with it: reads it (a condition), writes it (a change, a fact), mentions it (an argument, a person's
// act), or gives it as a type.
export type SymbolRole = 'read' | 'write' | 'mention' | 'type';
// The element a reference is written in: a declared name's, or one of the module's initial facts.
export type SymbolWithin = { namespace: SymbolNamespace; name: string } | { fact: number };
// lexical: a variable (?x) or a parameter of what it is written in, bound there and declared nowhere.
export interface SymbolOccurrence {
  name: string; sought: SymbolSought; role: SymbolRole; within: SymbolWithin; lexical: boolean;
  typeIndex?: number; signatureIndex?: number;
  call?: Call; argIndex?: number;
}

// Every reference a parsed module makes, read off the module the parse made (never its text): the calls of its
// conditions and changes, their arguments, the acts its people and pursuits name, and the kinds its signatures,
// parameters and entities are of. Prose is not read: a noun in a sentence is no reference.
export class SymbolReferences {
  private readonly out: SymbolOccurrence[] = [];
  private constructor() {}
  static of(module: Module): SymbolOccurrence[] {
    const r = new SymbolReferences();
    r.entities(module); r.people(module); r.signatures(module); r.acts(module); r.others(module);
    if (module.company) { r.add({ name: module.company.place, sought: 'entity', role: 'mention',
      within: { namespace: 'entity', name: module.company.id }, lexical: false }); }
    module.initial.forEach((c, i) => r.change(c, { fact: i }, new Set()));
    return r.out;
  }
  private entities(m: Module) {
    for (const e of m.entities) {
      const within = { namespace: 'entity' as const, name: e.id };
      this.add({ name: e.type, sought: 'kind', role: 'type', within, lexical: false });
      if (e.space?.parent) { this.add({ name: e.space.parent, sought: 'entity', role: 'mention', within, lexical: false }); }
      if (e.exit) {
        for (const name of [e.exit.origin, e.exit.destination, e.exit.passage, e.exit.door]) {
          if (name) { this.add({ name, sought: 'entity', role: 'mention', within, lexical: false }); }
        }
      }
      for (const role of e.roles ?? []) { this.predicate(role.when, within, new Set()); }
      if (m.seen?.[e.id]) { this.predicate(m.seen[e.id]!, within, new Set(['?viewer'])); }
    }
  }
  private people(m: Module) {
    for (const p of m.people ?? []) {
      const within = { namespace: 'person' as const, name: p.id };
      for (const act of p.actions ?? []) { this.add({ name: act, sought: 'act', role: 'mention', within, lexical: false }); }
      for (const name of [p.place, p.arrives?.place]) {
        if (name) { this.add({ name, sought: 'entity', role: 'mention', within, lexical: false }); }
      }
      for (const name of [p.raceId, p.classId, p.professionId, p.backgroundId, ...(p.gear ?? [])]) {
        if (name) { this.add({ name, sought: 'kind', role: 'mention', within, lexical: false }); }
      }
      for (const offer of p.offers ?? []) { this.add({ name: offer.kind, sought: 'kind', role: 'mention', within, lexical: false }); }
      for (const trade of [...(p.sells ?? []), ...(p.buys ?? [])]) {
        this.add({ name: trade.what, sought: 'kind', role: 'mention', within, lexical: false });
      }
      for (const role of p.roles ?? []) { this.predicate(role.when, within, new Set()); }
      if (p.arrives) { this.predicate(p.arrives.when, within, new Set()); }
      if (p.seen) { this.predicate(p.seen, within, new Set(['?viewer'])); }
    }
  }
  private signatures(m: Module) {
    for (const [namespace, list] of [['relation', m.relations], ['measure', m.measures]] as const) {
      for (const [signatureIndex, s] of list.entries()) {
        for (const [typeIndex, t] of s.types.entries()) {
          this.add({ name: t, sought: 'kind', role: 'type', within: { namespace, name: s.name }, lexical: false,
            typeIndex, signatureIndex });
        }
      }
    }
    for (const q of m.queries) {
      const within = { namespace: 'query' as const, name: q.name }, own = new Set(q.parameters.map(p => p.name));
      for (const p of q.parameters) {
        this.add({ name: p.type, sought: 'kind', role: 'type', within, lexical: false });
      }
      this.predicate(q.body, within, own);
    }
    for (const verb of m.verbs ?? []) {
      const within = { namespace: 'verb' as const, name: verb.name };
      const own = new Set(verb.parameters.map(p => p.name));
      for (const p of verb.parameters) {
        this.add({ name: p.type, sought: 'kind', role: 'type', within, lexical: false });
      }
      this.change(verb.lowering, within, own);
    }
  }
  private acts(m: Module) {
    for (const a of m.actions) {
      const within = { namespace: 'act' as const, name: a.id };
      const own = new Set((a.parameters ?? []).map(p => p.name));
      for (const p of a.parameters ?? []) {
        this.add({ name: p.type, sought: 'kind', role: 'type', within, lexical: false });
      }
      this.predicate(a.requires, within, own);
      for (const c of [...a.success, ...a.failure]) { this.change(c, within, own); }
      if (a.duration) { this.value(a.duration, within, own); }
      if (a.resolve) { this.call(a.resolve, 'read', within, own); }
      for (const t of a.told ?? []) { this.predicate(t.when, within, own); }
      if (a.interrupt) { this.predicate(a.interrupt, within, own); }
      for (const call of a.meanwhile ?? []) { this.call(call, 'read', within, own); }
    }
  }
  private others(m: Module) {
    for (const r of m.rules ?? []) {
      const within = { namespace: 'rule' as const, name: r.id };
      this.predicate(r.when, within, new Set());
      for (const c of r.effects) { this.change(c, within, new Set()); }
      if (r.place) { this.add({ name: r.place, sought: 'entity', role: 'mention', within, lexical: false }); }
    }
    for (const o of m.observations ?? []) {
      const within = { namespace: 'observation' as const, name: o.id };
      this.predicate(o.when, within, new Set());
      for (const name of [o.place, o.from, o.about]) {
        if (name) { this.add({ name, sought: 'entity', role: 'mention', within, lexical: false }); }
      }
      if (o.instead) { this.add({ name: o.instead, sought: 'observation', role: 'mention', within, lexical: false }); }
      if (o.by) { this.add({ name: o.by, sought: 'kind', role: 'mention', within, lexical: false }); }
    }
    for (const o of m.objectives ?? []) {
      const within = { namespace: 'objective' as const, name: o.id };
      this.predicate(o.when, within, new Set());
      for (const name of [...(o.toward ?? []), ...(o.route ? [o.route] : [])]) {
        this.add({ name, sought: 'entity', role: 'mention', within, lexical: false });
      }
    }
    for (const p of m.pursuits ?? []) {
      const within = { namespace: 'pursuit' as const, name: p.id };
      this.add({ name: p.actor, sought: 'entity', role: 'mention', within, lexical: false });
      this.predicate(p.when, within, new Set()); this.predicate(p.target, within, new Set());
      for (const act of p.using ?? []) {
        this.add({ name: act, sought: 'act', role: 'mention', within, lexical: false });
      }
    }
  }
  private change(c: Change, within: SymbolWithin, own: ReadonlySet<string>) {
    this.call(c.call, 'write', within, own);
    if ('value' in c) { this.value(c.value, within, own); }
    if (c.when) { this.predicate(c.when, within, own); }
  }
  private predicate(p: Predicate, within: SymbolWithin, own: ReadonlySet<string>): void {
    switch (p.kind) {
      case 'call': this.call(p, 'read', within, own); break;
      case 'not': this.predicate(p.value, within, own); break;
      case 'and': case 'or': this.predicate(p.left, within, own); this.predicate(p.right, within, own); break;
      case 'compare': this.value(p.left, within, own); this.value(p.right, within, own); break;
      case 'boolean': break;
    }
  }
  private value(v: Value, within: SymbolWithin, own: ReadonlySet<string>): void {
    switch (v.kind) {
      case 'call': this.call(v, 'read', within, own); break;
      case 'arith': this.value(v.left, within, own); this.value(v.right, within, own); break;
      case 'count': this.predicate(v.of, within, own); break;
      case 'number': case 'deem': break;
    }
  }
  private call(c: Call, role: 'read' | 'write', within: SymbolWithin, own: ReadonlySet<string>) {
    this.add({ name: c.name, sought: 'function', role, within, lexical: false, call: c });
    for (const [argIndex, arg] of c.args.entries()) {
      if (/^-?\d/.test(arg)) { continue; }
      this.add({ name: arg, sought: 'entity', role: 'mention', within,
        lexical: arg.startsWith('?') || own.has(arg), call: c, argIndex });
    }
  }
  private add(occurrence: SymbolOccurrence) {
    this.out.push(occurrence);
  }
}
