import type { Module } from '../lang/module';
import type { World } from '../lang/world';
import { KeptReading, type Kept } from '../lang/kept-reading';
import { AskedNames } from './asked-names';
import type { Names } from './known-names';

type Part = Kept<unknown> & { from: string; shape: string; asked?: ReadonlyMap<string, string | undefined> };
// A part of the page kept from one world to the next of its line, of the same module, while nothing it read of the
// world has been written, or nothing of what it picked of a name written (see KeptReading), and what else it was
// worked out from is as it was: `from`, said in words by the part (where the company has been, read from the log; the
// aim it follows; the region drawn, by its token). The journeys set out for and the chart had each been worked out
// again for every act, though an act's word with someone writes nothing either reads (OR-91: the screen most of an
// act). A part that read everything keeps nothing. What is kept is shared from one page to the next: never changed.
// And only the parts lately asked for: a journey's search is kept by the place it sets out from, and every place a
// walk had planned from had kept its whole search for good (some 200 by step 80 of iscoed, each with its every way and
// the two thousand picks it read: 25 November). A part is asked again within a step or two or not at all, and a page
// asks for at most a score, so the last `lately` asked for are kept.
export class KeptParts {
  private static readonly by = new WeakMap<Module, Map<string, Part>>();
  static readonly lately = 64;
  // Off, every part is worked out afresh at every ask, as if none were kept (the screen's oracle: test/screen-oracle).
  static keeping = true;
  static of<T>(world: World, key: string, from: string, read: () => T): T {
    if (!this.keeping) { return read(); }
    const kept = this.by.get(world.module) ?? new Map<string, Part>();
    this.by.set(world.module, kept);
    const was = kept.get(key), shape = this.shape(world.module);
    if (was && was.from === from && was.shape === shape && KeptReading.holds(world, was)) {
      return this.keep(kept, key, was).value as T;
    }
    const now = KeptReading.read(world, read);
    if (now.kept) { this.keep(kept, key, { ...now.kept, from, shape }); } else { kept.delete(key); }
    return now.value;
  }
  // A module's entities, actions and observations as they stand: an install adds to them, and a part that went
  // through them (every item's price, every place's quarter) is then read again.
  private static shape(m: Module): string {
    return [m.entities, m.actions, m.observations].map(xs => `${this.token(xs)}.${xs?.length ?? 0}`).join(':');
  }
  // A part worded by the names the company knows things by: kept while each name it asked is still what it was.
  static named<T>(world: World, key: string, at: { from: string; names: Names }, read: (names: Names) => T): T {
    if (!this.keeping) { return read(at.names); }
    const { from, names } = at, kept = this.by.get(world.module) ?? new Map<string, Part>();
    this.by.set(world.module, kept);
    const was = kept.get(key), shape = this.shape(world.module);
    if (was?.asked && was.from === from && was.shape === shape && AskedNames.same(was.asked, names)
      && KeptReading.holds(world, was)) {
      return this.keep(kept, key, was).value as T;
    }
    const asking = new AskedNames(names), now = KeptReading.read(world, () => read(asking));
    if (now.kept) { this.keep(kept, key, { ...now.kept, from, shape, asked: asking.asked }); }
    else { kept.delete(key); }
    return now.value;
  }
  // A part kept as the one last asked for, and the one asked for longest ago let go past `lately`.
  private static keep(kept: Map<string, Part>, key: string, part: Part): Part {
    kept.delete(key); kept.set(key, part);
    if (kept.size > this.lately) { kept.delete(kept.keys().next().value!); }
    return part;
  }
  // An object said by a token of its own: the same object, the same token; another, another.
  private static readonly tokens = new WeakMap<object, number>();
  private static tokened = 0;
  static token(o: object | undefined): string {
    if (!o) { return ''; }
    let t = this.tokens.get(o);
    if (t === undefined) { t = ++this.tokened; this.tokens.set(o, t); }
    return String(t);
  }
}
