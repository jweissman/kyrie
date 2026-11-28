import type { Call, Module, Operator } from './module';

// What an act changes that anything asks after (the owner, 24 November, AU-56: "acts that change nothing that
// matters"). An act matters when what it writes is read by something other than itself: a rule, an act's condition,
// an observation, a topic, an aim or objective, an ending, a query, words that show a measure, or the shared rules and
// the engine (anything not the adventure's own: where one is, what one carries or knows), or the rules that resolve
// it (endow, acquire: anything but a bare check). One that writes nothing
// (its words only), writes only what nobody asks after, or writes only what its own condition asks (it closes itself
// and nothing else) is inert. A read is matched to a write by its arguments too: regard(clay) asked of nobody is not
// read by regard(gammage) >= 2; an argument that is not an entity (actor, ?who) matches any.
export type Inertia = 'words' | 'unread' | 'self';
export interface Inert { id: string; topic: boolean; why: Inertia; writes: string[] }
type Read = { args: readonly string[] | undefined; origin: string };
// Whose acts are counted: an adventure's own (pentrice__clay), or a drawn country's (region__…).
export type Scope = 'adventure' | 'region';
type Census = { reads: Map<string, Read[]>; entities: Set<string>; scope: Scope };
type Shape = { kind?: string; name?: string; args?: string[]; call?: Call; value?: unknown };

export class Consequence {
  private static readonly writes = new Set(['assert', 'retract', 'set', 'increase', 'decrease']);
  // The adventure's own acts that change nothing anything else asks after.
  static census(module: Module, scope: Scope = 'adventure'): Inert[] {
    const reads = this.reads(module), entities = new Set(module.entities.map(e => e.id));
    const ids = new Set(module.actions.map(a => a.id));
    return module.actions.filter(a => this.mine(a.id, scope) && !this.again(a.id, ids)).flatMap(a => {
      const why = this.inertia(a, { reads, entities, scope });
      return why ? [{ id: a.id, topic: !!a.topic, why, writes: this.written(a).map(c => c.name) }] : [];
    });
  }
  // A module's own names are namespaced (pentrice__clay); the shared rules' and the engine's are not.
  static own(name: string): boolean { return name.includes('__') && !name.startsWith('region__'); }
  private static mine(name: string, scope: Scope): boolean {
    return scope === 'region' ? name.startsWith('region__') : this.own(name);
  }
  // A topic asked once is answered again in other words (its `again`): the language's, not another act.
  private static again(id: string, ids: Set<string>): boolean {
    return id.endsWith('_again') && ids.has(id.slice(0, -'_again'.length));
  }
  // A latch alone is not a consequence, but one that opens an answer or changes a later act is.
  private static written(a: Operator, census?: Census): Call[] {
    const cut = a.id.indexOf('__') + 2, ns = a.id.slice(0, cut), bare = a.id.slice(cut);
    const latches = new Set([`${ns}said_${bare}`, `${ns}tried_${bare}`]);
    return [...a.success, ...a.failure].map(c => c.call).filter(c => !latches.has(c.name)
      || census && this.readers(census, c).some(r => r.origin !== a.id));
  }
  private static inertia(a: Operator, census: Census): Inertia | undefined {
    // Moving, searching, or resolved by the rules (endow, acquire, drop…, any but a bare check) is a change.
    if (a.movement || a.searchPlace || (a.resolve && a.resolve.name !== 'check')) { return undefined; }
    const calls = this.written(a, census);
    if (!calls.length) { return 'words'; }
    if (calls.some(c => !this.mine(c.name, census.scope) || this.readers(census, c).some(r => r.origin !== a.id))) {
      return undefined;
    }
    return calls.some(c => this.readers(census, c).length) ? 'self' : 'unread';
  }
  private static readers({ reads, entities }: Census, c: Call): Read[] {
    return (reads.get(c.name) ?? []).filter(r => this.matches(r.args, c.args, entities));
  }
  private static matches(read: readonly string[] | undefined, written: readonly string[], entities: Set<string>) {
    if (!read) { return true; }
    return read.length === written.length && read.every((r, i) => r === written[i] || !entities.has(r)
      || !entities.has(written[i]!));
  }
  // Every call read anywhere in the module, by whom: an act's own conditions, words and changes' values are its own
  // (and its asking again's);
  // the rest (rules, observations, objectives, endings, queries, the shared rules) the module's. What a change writes
  // is not a read of it, and a semantic record's lowered copies are not read again.
  private static reads(module: Module): Map<string, Read[]> {
    const out = new Map<string, Read[]>();
    const { actions, ...rest } = module;
    const ids = new Set(actions.map(a => a.id));
    for (const a of actions) { this.walk(a, this.again(a.id, ids) ? a.id.slice(0, -'_again'.length) : a.id, out); }
    this.walk(rest, '*', out);
    return out;
  }
  private static walk(node: unknown, origin: string, out: Map<string, Read[]>) {
    if (typeof node === 'string') { this.said(node, origin, out); return; }
    if (!node || typeof node !== 'object') { return; }
    if (Array.isArray(node)) { for (const x of node) { this.walk(x, origin, out); } return; }
    const n = node as Shape & Record<string, unknown>;
    if (n.kind && this.writes.has(n.kind) && n.call) { this.walk(n.value, origin, out); return; }
    if (n.kind === 'call' && n.name) { this.add(out, n.name, { args: n.args, origin }); }
    for (const [k, v] of Object.entries(n)) { if (k !== 'lowered') { this.walk(v, origin, out); } }
  }
  // Words that show a measure ({temper(pentrice)}) read it.
  private static said(text: string, origin: string, out: Map<string, Read[]>) {
    if (!text.includes('{')) { return; }
    for (const m of text.matchAll(/\{[^}]*?([A-Za-z_][\w]*)\(/g)) { this.add(out, m[1]!, { args: undefined, origin }); }
  }
  private static add(out: Map<string, Read[]>, name: string, read: Read) {
    const list = out.get(name);
    if (list) { list.push(read); } else { out.set(name, [read]); }
  }
}
