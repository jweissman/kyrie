import type { World } from './world';
import { WorldReads, type Picks } from './world-reads';

// A reading of the world kept with what it read (see WorldReads): the names, their stamps in the world it was last
// held in, and what of each name it picked.
export interface Kept<T> { value: T; reads: string[]; stamped: number[]; picks?: Picks; world: World }
type Held = ReturnType<World['held']>;

// Whether a reading kept from an earlier world of the line still holds in this one: none of the names it read has
// been written since (World.agrees), or those written were read only in part and nothing written of them is among what
// was picked. A fact taken away and put back moves where its relation lists it, and so may change what a reading of it
// in order found first: a name of which that happened is held to have changed whole. What holds is brought up to this
// world, so the next is compared with it; and what it read is noted in any reading under way (see WorldReads.note).
export class KeptReading {
  // A reading done afresh, and kept if it read by name (none where it read everything).
  static read<T>(world: World, read: () => T): { value: T; kept?: Kept<T> } {
    const { value, reads, picks } = WorldReads.of(read);
    if (!reads) { return { value }; }
    return { value, kept: { value, reads, stamped: world.stamped(reads), world, ...picks ? { picks } : {} } };
  }
  static holds<T>(world: World, kept: Kept<T>): boolean {
    if (!world.agrees(kept.reads, kept.stamped)) {
      if (!kept.picks || !world.sameLine(kept.world)) { return false; }
      const moved = kept.reads.filter((name, i) => world.stamp(name) !== kept.stamped[i + 1]);
      if (moved.some(name => !kept.picks!.has(name) || this.touched(kept.world, world, name, kept.picks!.get(name)!))) {
        return false;
      }
      kept.stamped = world.stamped(kept.reads); kept.world = world;
    }
    WorldReads.note(kept.reads, kept.picks);
    return true;
  }
  // Whether anything written of a name between two worlds is among what was picked of it.
  private static touched(was: World, is: World, name: string, picked: ReadonlySet<string>): boolean {
    const changed = this.changed(was, is, name);
    return changed === 'all' || changed.some(key => picked.has(key));
  }
  // What of a name differs between two worlds, as the picks it would touch; or all of it, where a fact was moved.
  // Worked out once for two worlds and a name, however many readings ask.
  private static readonly diffs = new WeakMap<World, WeakMap<World, Map<string, string[] | 'all'>>>();
  private static changed(was: World, is: World, name: string): string[] | 'all' {
    const from = this.diffs.get(is) ?? new WeakMap<World, Map<string, string[] | 'all'>>();
    this.diffs.set(is, from);
    const named = from.get(was) ?? new Map<string, string[] | 'all'>();
    from.set(was, named);
    let changed = named.get(name);
    if (!changed) { changed = this.differ(was.held(name), is.held(name)); named.set(name, changed); }
    return changed;
  }
  private static differ([wasFacts, wasValues]: Held, [isFacts, isValues]: Held): string[] | 'all' {
    const out: string[] = [];
    if (wasFacts !== isFacts) {
      if (this.reordered(wasFacts, isFacts)) { return 'all'; }
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
  // Whether the facts both worlds hold are listed in another order in one of them (taken away and put back).
  private static reordered(was?: ReadonlyMap<string, unknown>, is?: ReadonlyMap<string, unknown>): boolean {
    if (!was || !is) { return false; }
    const theirs = [...is.keys()].filter(k => was.has(k)), ours = [...was.keys()].filter(k => is.has(k));
    return ours.some((k, i) => theirs[i] !== k);
  }
}
