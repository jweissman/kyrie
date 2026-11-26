// The parts of a module that can wait on something (a module, as the language makes it: read for its shape alone).
interface Parts { goal?: unknown; rules?: unknown; actions?: unknown; queries?: unknown; objectives?: unknown;
  pursuits?: unknown; observations?: unknown }
// Whether a module waits on a band's fall: names it, by its id, in whether it is dead or able, or felled (a rule's
// condition, an action's requirement, the goal, a told line's, an objective's). Morale by default had been tried for
// every band and taken out (the cold review's REV-16): authored fights wait on a band's fall (the corn-store rats
// paid for once not able, Skell's sons fallen), and a band that ran stood able where it was, so that what waited on it
// never came. A band its module names so fights on; any other thinking band may lose heart (see Morale.shaken).
export class FallAwaited {
  private static readonly read = ['dead', 'able'];
  private static readonly kept = new WeakMap<Parts, Set<string>>();
  static of(module: Parts, band: string): boolean {
    let named = this.kept.get(module);
    if (!named) { named = new Set(); this.walk(this.parts(module), named, 0); this.kept.set(module, named); }
    return named.has(band);
  }
  // What can wait on a band: never what the world begins with (its facts, its people and places).
  private static parts(module: Parts): unknown[] {
    return [module.goal, module.rules, module.actions, module.queries, module.objectives, module.pursuits,
      module.observations];
  }
  private static walk(value: unknown, named: Set<string>, depth: number) {
    if (!value || typeof value !== 'object' || depth > 64) { return; }
    if (Array.isArray(value)) { for (const v of value) { this.walk(v, named, depth + 1); } return; }
    const o = value as { kind?: unknown; name?: unknown; args?: unknown };
    if (o.kind === 'call' && typeof o.name === 'string' && Array.isArray(o.args) && this.reads(o.name)) {
      for (const a of o.args) { if (typeof a === 'string') { named.add(a); } }
    }
    for (const v of Object.values(value)) { this.walk(v, named, depth + 1); }
  }
  private static reads(name: string): boolean {
    return this.read.includes(name) || name === 'felled' || name.endsWith('__felled');
  }
}
