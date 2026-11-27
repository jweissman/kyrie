import type { World } from './world';
import { WorldReads, type Picks } from './world-reads';

type Held = ReturnType<World['held']>;
// A reading of the world kept with what it read (see WorldReads): the names, their stamps (and the line) of the world
// it was last held in, what of each name it picked, and what that world held of each name picked (was), to tell what
// has been written of it since. Never the world itself: a reading kept from an early world (two thousand groundings,
// most never asked again) had held every world it was made in, and each world the versions of every fact list it had
// written, some 1.5 MB a step of a walk (25 November: 63 worlds held at step 100 of iscoed).
export interface Kept<T> { value: T; reads: string[]; stamped: number[]; picks?: Picks; was?: Map<string, Held> }

// Whether a reading kept from an earlier world of the line still holds in this one: none of the names it read has
// been written since (World.agrees), or those written were read only in part and nothing written of them is among what
// was picked. A fact taken away and put back moves where its relation lists it, and so may change what a reading of it
// in order found first: such a fact is held to have changed, as one written (see moved). What holds is brought up to
// this world, so the next is compared with it; and what it read is noted in any reading under way (see
// WorldReads.note).
export class KeptReading {
  private static readonly memoed = new WeakMap<object,
    WeakMap<object, { module: World['module']; kept: Kept<unknown> }>>();
  // A keyed view kept only while its world reads hold; a non-World dependency must be part of the key or unkeepable.
  static memo<T>(world: World, key: object, read: () => T,
    options: { keep?: boolean; scope?: object } = {}): T {
    const keep = options.keep ?? true, scope = options.scope ?? world.module;
    if (!keep) { return read(); }
    const scoped = this.memoed.get(scope) ?? new WeakMap<object, { module: World['module']; kept: Kept<unknown> }>();
    this.memoed.set(scope, scoped);
    const was = scoped.get(key);
    if (was && was.module === world.module && this.holds(world, was.kept)) { return was.kept.value as T; }
    const now = this.read(world, read);
    if (now.kept) { scoped.set(key, { module: world.module, kept: now.kept }); }
    else { scoped.delete(key); }
    return now.value;
  }
  // A reading done afresh, and kept if it read by name (none where it read everything).
  static read<T>(world: World, read: () => T): { value: T; kept?: Kept<T> } {
    const { value, reads, picks } = WorldReads.of(read);
    if (!reads) { return { value }; }
    const was = picks && { picks, was: this.held(world, picks) };
    return { value, kept: { value, reads, stamped: world.stamped(reads), ...was } };
  }
  static holds<T>(world: World, kept: Kept<T>): boolean {
    if (!world.agrees(kept.reads, kept.stamped)) {
      if (!kept.picks || !kept.was || !world.agrees([], kept.stamped)) { return false; }
      const moved = kept.reads.filter((name, i) => world.stamp(name) !== kept.stamped[i + 1]);
      const picks = kept.picks, was = kept.was;
      if (moved.some(name => !picks.has(name) || this.touched(was.get(name)!, world, name, picks.get(name)!))) {
        return false;
      }
      kept.stamped = world.stamped(kept.reads); kept.was = this.held(world, kept.picks);
    }
    WorldReads.note(kept.reads, kept.picks);
    return true;
  }
  // What a world holds of each name picked: its fact list and its values, shared with the world (never copied).
  private static held(world: World, picks: Picks): Map<string, Held> {
    return new Map([...picks.keys()].map(name => [name, world.held(name)]));
  }
  // Whether anything written of a name since what was held of it is among what was picked of it.
  private static touched(was: Held, is: World, name: string, picked: ReadonlySet<string>): boolean {
    return this.changed(was, is, name).some(key => picked.has(key));
  }
  // What of a name differs between what was held of it and a world, as the picks it would touch. Worked out once for a
  // world, a name and what was held of it (its fact list and its values, by identity), however many readings ask.
  private static readonly diffs = new WeakMap<World, Map<string, WeakMap<object, WeakMap<object, string[]>>>>();
  private static readonly none = {};
  private static changed(was: Held, is: World, name: string): string[] {
    const named = this.diffs.get(is) ?? new Map<string, WeakMap<object, WeakMap<object, string[]>>>();
    this.diffs.set(is, named);
    const facts = named.get(name) ?? new WeakMap<object, WeakMap<object, string[]>>();
    named.set(name, facts);
    const values = facts.get(was[0] ?? this.none) ?? new WeakMap<object, string[]>();
    facts.set(was[0] ?? this.none, values);
    let changed = values.get(was[1] ?? this.none);
    if (!changed) { changed = this.differ(was, is.held(name)); values.set(was[1] ?? this.none, changed); }
    return changed;
  }
  private static differ([wasFacts, wasValues]: Held, [isFacts, isValues]: Held): string[] {
    const out: string[] = [];
    if (wasFacts !== isFacts) {
      for (const [key, call] of this.moved(wasFacts, isFacts)) { this.picks(key, call.args, out); }
      for (const [key, call] of wasFacts ?? []) { if (!isFacts?.has(key)) { this.picks(key, call.args, out); } }
      for (const [key, call] of isFacts ?? []) { if (!wasFacts?.has(key)) { this.picks(key, call.args, out); } }
    }
    if (wasValues !== isValues) {
      for (const [key, m] of wasValues ?? []) {
        if (isValues?.get(key)?.value !== m.value) { out.push(WorldReads.pick(2, key)); }
      }
      for (const [key] of isValues ?? []) { if (!wasValues?.has(key)) { out.push(WorldReads.pick(2, key)); } }
    }
    return out;
  }
  // The picks a fact answers to: by its first argument, its second, and its key.
  private static picks(key: string, args: readonly string[], out: string[]) {
    out.push(WorldReads.pick(2, key));
    if (args[0] !== undefined) { out.push(WorldReads.pick(0, args[0])); }
    if (args[1] !== undefined) { out.push(WorldReads.pick(1, args[1])); }
  }
  // The facts both worlds hold that may have been taken away and put back since (a fact put back is listed after every
  // fact its relation held all along): those off a run of them listed in the same order in both, the run found
  // greedily in this world's order. Any such run will do: the rest keep their order among themselves, so a reading
  // that picked none of what is off it found what it found, in the order it found it (a door's state set back had
  // made every reading of any thing's state stale: the chart, the quarters and the ways, after a fight or a search).
  private static moved(was?: ReadonlyMap<string, unknown>, is?: ReadonlyMap<string, { args: readonly string[] }>):
    [string, { args: readonly string[] }][] {
    if (!was || !is) { return []; }
    const at = new Map<string, number>(), out: [string, { args: readonly string[] }][] = [];
    let n = 0, last = -1;
    for (const key of was.keys()) { at.set(key, n++); }
    for (const [key, call] of is) {
      const was = at.get(key);
      if (was === undefined) { continue; }
      if (was > last) { last = was; } else { out.push([key, call]); }
    }
    return out;
  }
}
