// The parts of a module that can wait on something (a module, as the language makes it: read for its shape alone).
interface Parts { goal?: unknown; rules?: unknown; actions?: unknown; queries?: unknown; objectives?: unknown;
  pursuits?: unknown; observations?: unknown }
// Whether a module waits on a band's fall: names it, by its id, in whether it is dead or able, or felled (a rule's
// condition, an action's requirement, the goal, a told line's, an objective's). Morale by default had been tried for
// every band and taken out (the cold review's REV-16): authored fights wait on a band's fall (the corn-store rats
// paid for once not able, Skell's sons fallen), and a band that ran stood able where it was, so that what waited on it
// never came. A band its module names so fights on; any other thinking band may lose heart (see Morale.shaken).
// Nor is a band's fall waited on where its rout is waited on too (routed, said as it holds): the module meets it put to
// flight as it meets it dead (OR-1864: the deep renewed, whose newcomers had moved in only where the dwellers died, so
// that the first bands of every level fought to the last).
// How far into a module's parts, and whether under a not.
interface Walk { depth: number; not?: boolean }
export class FallAwaited {
  private static readonly read = ['dead', 'able'];
  private static readonly kept = new WeakMap<Parts, { named: Set<string>; routed: Set<string> }>();
  static of(module: Parts, band: string): boolean {
    let read = this.kept.get(module);
    if (!read) {
      read = { named: new Set(), routed: new Set() };
      this.walk(this.parts(module), read, { depth: 0 });
      this.kept.set(module, read);
    }
    return read.named.has(band) && !read.routed.has(band);
  }
  // What can wait on a band: never what the world begins with (its facts, its people and places).
  private static parts(module: Parts): unknown[] {
    return [module.goal, module.rules, module.actions, module.queries, module.objectives, module.pursuits,
      module.observations];
  }
  // Its fall is waited on where something holds once it has fallen (not able, dead, felled). What holds while it is
  // there and able (the deep's sounds and spoor, "when able(rats) and at(rats, crossing)", a band's wandering) says
  // only that it is there, and had kept every band of the deep from ever losing heart (OR-1855).
  private static walk(value: unknown, read: { named: Set<string>; routed: Set<string> }, at: Walk) {
    if (!value || typeof value !== 'object' || at.depth > 64) { return; }
    const deeper = { ...at, depth: at.depth + 1 };
    if (Array.isArray(value)) { for (const v of value) { this.walk(v, read, deeper); } return; }
    const o = value as { kind?: unknown; name?: unknown; args?: unknown };
    if (o.kind === 'call' && typeof o.name === 'string' && Array.isArray(o.args)) {
      const into = this.reads(o.name) && (at.not || o.name !== 'able') ? read.named
        : o.name === 'routed' && !at.not ? read.routed : undefined;
      for (const a of o.args) { if (typeof a === 'string') { into?.add(a); } }
    }
    const under = o.kind === 'not' ? { ...deeper, not: !at.not } : deeper;
    for (const v of Object.values(value)) { this.walk(v, read, under); }
  }
  private static reads(name: string): boolean {
    return this.read.includes(name) || name === 'felled' || name.endsWith('__felled');
  }
}
