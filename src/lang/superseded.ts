import type { Module } from './module';

// An observation written `instead of` another is told in its place while its own condition holds: the other waits on
// its not holding. Quittance's bakehouse said the oven was 'banked and breathing' and, below it, that 'the red light
// under the ash is gone'; nothing could replace the line (its ms 4, QTC-A25). Lowered once a module's files are
// joined, so that the line it replaces may be in another of them; one file read alone lowers what it can.
export class Superseded {
  static lower(module: Module, joined = true): Module {
    const by = new Map((module.observations ?? []).map(o => [o.id, o]));
    for (const o of module.observations ?? []) {
      if (!o.instead) { continue; }
      const base = by.get(o.instead);
      if (!base) {
        if (joined) { throw new Error(`Observe ${o.id} is instead of ${o.instead}, which is no observation`); }
        continue;
      }
      if (base === o) { throw new Error(`Observe ${o.id} cannot be instead of itself`); }
      base.when = { kind: 'and', left: base.when, right: { kind: 'not', value: o.when } };
      delete o.instead;
    }
    return module;
  }
}
