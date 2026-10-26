import type { Instance, Module, Predicate, Value } from '../lang/module';

type Compare = Extract<Predicate, { kind: 'compare' }>;
type Addition = NonNullable<Instance['campaign']>;

// A module installed after a campaign began counts its own time from the first morning after it was installed: every
// read of the clock's watch in what it brings (its rules, observations, objectives, actions, queries, pursuits, the
// roles and sight of its people, its actors' goals and its outcomes, and what it sets at the start) is of its own
// watch, the watches since that morning, and its pressures fall due by it. So a fever that kills a child on the tenth
// day does so ten days after the country it is in is first reached, not at once; a timer it reads through a query, or
// in arithmetic, or keeps in a measure it set from the watch, is counted from the same morning (the architecture
// review's A14: only bare comparisons were moved, and a timer read any other way fired at once). Its days begin at a
// morning because its author counted them from one: what is left of the day it is reached on is the country's for
// nothing (Merrowdale, reached at night, told its storm's end, "The rain stops before dawn", at nine in the evening).
export class ClockShift {
  static readonly day = 144;
  static apply(module: Module, addition: Addition, id: string, reached: number) {
    const elapsed = Math.ceil(reached / this.day) * this.day;
    if (!elapsed) { return; }
    const prefix = `${id}__`;
    // Each once: a module's actions are its schemas, the same objects (which had moved an action's times twice).
    const own = new Set<object>([module.rules ?? [], module.observations ?? [], module.objectives ?? [],
      module.actions, addition.schemas ?? [], module.entities.filter(e => e.roles)]
      .flatMap(list => list.filter(x => x.id.startsWith(prefix))));
    for (const q of module.queries.filter(x => x.name.startsWith(prefix))) { own.add(q); }
    for (const p of (module.pursuits ?? []).filter(x => x.actor.startsWith(prefix))) { own.add(p); }
    for (const g of [...addition.actors, ...addition.extensions ?? []].flatMap(a => a.goals)) { own.add(g); }
    for (const o of addition.outcomes) { own.add(o); }
    for (const x of own) { this.mine(x, elapsed, false); }
    for (const [who, when] of Object.entries(module.seen ?? {}).filter(([w]) => w.startsWith(prefix))) {
      module.seen![who] = this.local(when, elapsed, false) as Predicate;
    }
    for (const p of addition.pressures ?? []) { p.at += elapsed; }
    // What it sets at the start is set as at its start, its own watch 0 (shared rules set nothing from the clock).
    for (const c of module.initial) { this.mine(c, elapsed, true); }
  }
  // One declaration read with the installation's own watch, in place: the module holds it, and so may others.
  private static mine(x: object, by: number, start: boolean) {
    for (const [k, v] of Object.entries(x)) { (x as Record<string, unknown>)[k] = this.local(v, by, start); }
  }
  // A part of a declaration with every read of the watch made the installation's own (at its start, 0); what reads it
  // not is as it was.
  private static local(node: unknown, by: number, start: boolean): unknown {
    if (Array.isArray(node)) {
      const out = node.map(n => this.local(n, by, start));
      return out.some((n, i) => n !== node[i]) ? out : node;
    }
    if (!node || typeof node !== 'object') { return node; }
    const moved = (node as { kind?: string }).kind === 'compare' ? this.moved(node as Compare, by) : undefined;
    if (moved) { return moved; }
    if (this.watch(node as Value)) {
      return start ? { kind: 'number', value: 0 }
        : { kind: 'arith', op: '-', left: node, right: { kind: 'number', value: by } };
    }
    let out: Record<string, unknown> | undefined;
    for (const [k, v] of Object.entries(node)) {
      const w = this.local(v, by, start);
      if (w !== v) { (out ??= { ...node as Record<string, unknown> })[k] = w; }
    }
    return out ?? node;
  }
  // A bare comparison of the watch with a number is moved on by the watches gone by, as it reads (`watch(clock) >=
  // 240`, ten days in, is 240 watches past that morning).
  private static moved(p: Compare, by: number): Compare | undefined {
    if (this.watch(p.left) && p.right.kind === 'number') {
      return { ...p, right: { kind: 'number', value: p.right.value + by } };
    }
    if (this.watch(p.right) && p.left.kind === 'number') {
      return { ...p, left: { kind: 'number', value: p.left.value + by } };
    }
    return undefined;
  }
  private static watch(v: Value): boolean { return v.kind === 'call' && v.name === 'watch' && v.args[0] === 'clock'; }
}
