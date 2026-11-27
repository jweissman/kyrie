// A world's stamps: for each relation or measure name, the stamp of the last write to it, globally unique (so views
// derived from some names can tell whether those names changed between two worlds of one line); and for each name and
// first argument, the stamp of the last write to a fact or measure of that name whose first argument is that one
// (OR-1438). A rule held idle on a part that asks of one thing (state(bell, rung), at(party, ?p), patience(boar)) is
// held to that thing's stamp, not its relation's, which every write of the relation moves: the weather's state, set
// every few watches, had woken every rule held on any thing's state, and every resident walking about every rule held
// on where the company is. Shared with the world forked from it until either writes a name (copy-on-write, as World's
// facts are).
export class Stamps {
  static readonly mark = '\u0000';
  private static writes = 0;
  private names = new Map<string, number>();
  private by = new Map<string, Map<string, number>>();
  private owned = new Set<string>();
  // A name's stamp for one first argument, as a key (see stamp).
  static key(name: string, arg: string): string { return `${name}${Stamps.mark}${arg}`; }
  fork(): Stamps {
    const next = new Stamps();
    next.names = new Map(this.names); next.by = new Map(this.by);
    return next;
  }
  // A name's stamp, or a name's for one first argument (a key).
  stamp(key: string): number {
    const at = key.indexOf(Stamps.mark);
    return at < 0 ? this.names.get(key) ?? 0 : this.of(key.slice(0, at), key.slice(at + 1));
  }
  // The same, its name and first argument already apart (a reader that asks often: RuleWakes).
  of(name: string, arg?: string): number {
    return arg === undefined ? this.names.get(name) ?? 0 : this.by.get(name)?.get(arg) ?? 0;
  }
  // A write to a name, of a fact or measure whose first argument is arg (and of those it displaces: also).
  write(name: string, ...args: (string | undefined)[]) {
    const stamp = ++Stamps.writes;
    this.names.set(name, stamp);
    for (const arg of args) { if (arg !== undefined) { this.argument(name, arg, stamp); } }
  }
  // A write's stamp given to the first arguments of the facts it displaces (by their keys, among a relation's facts).
  displaced(name: string, facts: ReadonlyMap<string, { args: readonly string[] }>, keys: string[]): string[] {
    for (const k of keys) {
      const arg = facts.get(k)?.args[0];
      if (arg !== undefined) { this.argument(name, arg, this.names.get(name)!); }
    }
    return keys;
  }
  // Whether these names' stamps are these (each after the line's, which the world asks).
  agree(names: readonly string[], stamped: readonly number[]): boolean {
    for (let i = 0; i < names.length; i++) { if (this.stamp(names[i]!) !== stamped[i + 1]) { return false; } }
    return true;
  }
  // The names written in one and not the other, or written since.
  written(from: Stamps, both = false): string[] {
    const out = [...this.names].filter(([n, s]) => from.names.get(n) !== s).map(([n]) => n);
    return both ? [...new Set([...out, ...[...from.names.keys()].filter(n => !this.names.has(n))])] : out;
  }
  private argument(name: string, arg: string, stamp: number) {
    let own = this.by.get(name);
    if (!this.owned.has(name)) { own = new Map(own ?? []); this.by.set(name, own); this.owned.add(name); }
    own!.set(arg, stamp);
  }
}
