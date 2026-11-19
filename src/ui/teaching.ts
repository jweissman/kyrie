import type { Call, Change, Module, Predicate } from '../lang/module';

// Whether doing an act teaches the company something by what it shows: its success makes so what an observation that
// teaches a fact waits on. A reading is written so (a Change to its read state, and `Observe … as reading when
// state(it, read) … teaches fact`): the dead man's wax tablet read had been drawn "worth a look", not something to
// learn, for its success asserts no `knows` of its own (the atlas study, audit 12: AT-01). So is a closer look at
// something whose look tells what it is (`Observe … when tried(it, looking) … teaches`). Typed by the author's
// `teaches`, never by an act's words.
export class Teaching {
  private static readonly shown = new WeakMap<Module, Set<string>>();
  // bindings: the act's arguments, by parameter, its success's calls written in them.
  static shows(module: Module, success: readonly Change[], bindings: Record<string, string> = {}): boolean {
    const waited = this.waited(module);
    return waited.size > 0 && success.some(c => c.kind === 'assert'
      && waited.has(this.key(c.call.name, c.call.args.map(a => bindings[a] ?? a))));
  }
  // What each observation that teaches waits on, as calls it needs to hold (an `and`'s, not a `not`'s or an `or`'s).
  private static waited(module: Module): Set<string> {
    const had = this.shown.get(module);
    if (had) { return had; }
    const out = new Set((module.observations ?? []).filter(o => o.teaches)
      .flatMap(o => this.calls(o.when)).map(c => this.key(c.name, c.args)));
    this.shown.set(module, out);
    return out;
  }
  private static calls(p: Predicate): Call[] {
    return p.kind === 'call' ? [p] : p.kind === 'and' ? [...this.calls(p.left), ...this.calls(p.right)] : [];
  }
  private static key(name: string, args: readonly string[]): string { return `${name}(${args.join(',')})`; }
}
