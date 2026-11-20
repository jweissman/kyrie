import type { World } from './world';
import { WorldReads, type Picks } from './world-reads';

type Read<T> = { value: T; reads?: string[]; picks?: Picks };
// A reading done once for a world and a key, and what it read noted again wherever it is used again inside a
// reading under way (see WorldReads): a view kept from one world to the next (KeptParts, KeptGroundings) that asks of
// it a second time in the same world must still read what the first asking read, or a later world that writes one
// of those names would keep it wrongly (OR-91). One that read everything says so again where it is used.
export class WorldMemo<T> {
  private readonly kept = new WeakMap<World, Map<string, Read<T>>>();
  of(world: World, key: string, read: () => T): T {
    const kept = this.kept.get(world) ?? new Map<string, Read<T>>();
    this.kept.set(world, kept);
    const had = kept.get(key);
    if (had) {
      if (had.reads) { WorldReads.note(had.reads, had.picks); } else { WorldReads.all(); }
      return had.value;
    }
    const found = WorldReads.of(read);
    kept.set(key, found);
    return found.value;
  }
}
