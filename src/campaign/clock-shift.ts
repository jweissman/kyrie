import type { Module, Predicate, Value } from '../lang/module';
import type { Operator } from './planner';

// A module installed after a campaign began counts its own time from when it was installed. Its comparisons of the
// clock's watch (`watch(clock) >= 240`: ten days in) are moved on by the watches already gone, so a fever that kills
// a child on the tenth day does so ten days after the country it is in is first reached, not at once; and so is
// where it starts a measure the clock is compared with (`Initially Set raidAt(brood) to 84`).
export class ClockShift {
  static apply(module: Module, schemas: Operator[], id: string, elapsed: number) {
    if (!elapsed) { return; }
    const prefix = `${id}__`;
    for (const r of (module.rules ?? []).filter(x => x.id.startsWith(prefix))) { r.when = this.shift(r.when, elapsed); }
    for (const o of (module.observations ?? []).filter(x => x.id.startsWith(prefix))) {
      o.when = this.shift(o.when, elapsed);
    }
    for (const o of (module.objectives ?? []).filter(x => x.id.startsWith(prefix))) {
      o.when = this.shift(o.when, elapsed);
    }
    for (const a of [...module.actions, ...schemas].filter(x => x.id.startsWith(prefix))) {
      a.requires = this.shift(a.requires, elapsed);
    }
    const timers = new Set((module.rules ?? []).flatMap(r => this.timers(r.when)));
    for (const c of module.initial) {
      if (c.kind === 'set' && timers.has(c.call.name) && c.call.args.some(a => a.startsWith(prefix))
        && c.value.kind === 'number') { c.value = { kind: 'number', value: c.value.value + elapsed }; }
    }
  }
  // The measures a predicate compares with the clock's watch.
  private static timers(p: Predicate): string[] {
    switch (p.kind) {
      case 'not': return this.timers(p.value);
      case 'and': case 'or': return [...this.timers(p.left), ...this.timers(p.right)];
      case 'compare': return this.watch(p.left) && p.right.kind === 'call' ? [p.right.name]
        : this.watch(p.right) && p.left.kind === 'call' ? [p.left.name] : [];
      default: return [];
    }
  }
  private static shift(p: Predicate, by: number): Predicate {
    switch (p.kind) {
      case 'not': return { ...p, value: this.shift(p.value, by) };
      case 'and': case 'or': return { ...p, left: this.shift(p.left, by), right: this.shift(p.right, by) };
      case 'compare':
        if (this.watch(p.left) && p.right.kind === 'number') {
          return { ...p, right: { kind: 'number', value: p.right.value + by } };
        }
        if (this.watch(p.right) && p.left.kind === 'number') {
          return { ...p, left: { kind: 'number', value: p.left.value + by } };
        }
        return p;
      default: return p;
    }
  }
  private static watch(v: Value): boolean { return v.kind === 'call' && v.name === 'watch' && v.args[0] === 'clock'; }
}
