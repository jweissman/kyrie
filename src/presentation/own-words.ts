import type { Module, Operator } from '../lang/module';

// Someone who tells of something in their own words is not also asked about it in the shared words (the owner, 3
// November: the circus could be asked about two ways at once, "Ask Cyril about Wapshott's Circus" beside Cyril's own
// "Ask Cyril about the circus"): the shared question (ask, a source revealing a fact) is left out for an informant
// with a topic of their own that teaches that fact, or that is of the going-on the fact is (Mik asked "about the
// players stuck at Lowmouth" beside his own "about the players": a1, 3 November). The country's own is everyone's.
export class OwnWords {
  private static readonly taught = new WeakMap<Module, Set<string>>();
  // Each speaker and what a topic of theirs teaches, read once for a module.
  static of(module: Module): Set<string> {
    let pairs = this.taught.get(module);
    if (!pairs) {
      pairs = new Set(module.actions.filter(a => a.speaker && a.schema !== 'ask').flatMap(a => a.success
        .filter(c => c.kind === 'assert' && c.call.name === 'knows' && c.call.args[0] === 'actor')
        .map(c => `${a.speaker}|${c.call.args[1]}`)
        .concat(this.module(a.id) && this.module(a.id) !== 'region' ? [`${a.speaker}|${this.module(a.id)}__`] : [])));
      this.taught.set(module, pairs);
    }
    return pairs;
  }
  static unasked(module: Module, offered: readonly Operator[]): readonly Operator[] {
    const pairs = this.of(module);
    if (!pairs.size) { return offered; }
    return offered.filter(a => a.schema !== 'ask' || !(pairs.has(`${a.bindings?.informant}|${a.bindings?.statement}`)
      || pairs.has(`${a.bindings?.informant}|${this.module(a.bindings?.statement ?? '')}__`)));
  }
  private static module(id: string): string | undefined { return /^([a-z0-9]+)__/.exec(id)?.[1]; }
}
