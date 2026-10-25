import type { Call } from './module';

type Held = Call | { call: Call; value: number };
// Read-only views of one relation's facts, or one measure's values: the list of them and indexes by an argument,
// built on first use and kept with the map they were read from. A world shares a relation's map with the world it
// was forked from until it writes that relation (see World.fork), and so shares what was read of it, before or after
// the fork (Mission 15's profile: every watch's worlds read every relation they asked of afresh). A map a world is
// writing is forgotten here as it is written.
export class RelationViews {
  private static readonly lists = new WeakMap<Map<string, Held>, Held[]>();
  private static readonly indexes = new WeakMap<Map<string, Held>, Map<number, Map<string, Held[]>>>();
  static readonly none: readonly never[] = [];
  static list<T extends Held>(held: Map<string, T>): readonly T[] {
    let list = this.lists.get(held) as T[] | undefined;
    if (!list) { list = [...held.values()]; this.lists.set(held, list); }
    return list;
  }
  // Those whose argument at this place is this one.
  static by<T extends Held>(held: Map<string, T>, at: number, value: string): readonly T[] {
    let indexes = this.indexes.get(held);
    if (!indexes) { indexes = new Map(); this.indexes.set(held, indexes); }
    let index = indexes.get(at) as Map<string, T[]> | undefined;
    if (!index) {
      index = new Map();
      for (const x of this.list(held)) {
        const key = RelationViews.args(x)[at]!, those = index.get(key);
        if (those) { those.push(x); } else { index.set(key, [x]); }
      }
      indexes.set(at, index);
    }
    return index.get(value) ?? this.none;
  }
  private static args(x: Held): string[] { return 'value' in x ? x.call.args : x.args; }
  static forget(held: Map<string, Held>) { this.lists.delete(held); this.indexes.delete(held); }
}
