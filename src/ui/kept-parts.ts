import type { Module } from '../lang/module';
import type { World } from '../lang/world';
import { KeptReading, type Kept } from '../lang/kept-reading';
import { AskedNames } from './asked-names';
import type { Names } from './known-names';

type Part = Kept<unknown> & { from: string; asked?: ReadonlyMap<string, string | undefined> };
// A part of the page kept from one world to the next of its line, of the same module, while nothing it read of the
// world has been written, or nothing of what it picked of a name written (see KeptReading), and what else it was
// worked out from is as it was: `from`, said in words by the part (where the company has been, read from the log; the
// aim it follows; the region drawn, by its token). The journeys set out for and the chart had each been worked out
// again for every act, though an act's word with someone writes nothing either reads (OR-91: the screen most of an
// act). A part that read everything keeps nothing. What is kept is shared from one page to the next: never changed.
export class KeptParts {
  private static readonly by = new WeakMap<Module, Map<string, Part>>();
  static of<T>(world: World, key: string, from: string, read: () => T): T {
    const kept = this.by.get(world.module) ?? new Map<string, Part>();
    this.by.set(world.module, kept);
    const was = kept.get(key);
    if (was && was.from === from && KeptReading.holds(world, was)) { return was.value as T; }
    const now = KeptReading.read(world, read);
    if (now.kept) { kept.set(key, { ...now.kept, from }); } else { kept.delete(key); }
    return now.value;
  }
  // A part worded by the names the company knows things by: kept while each name it asked is still what it was.
  static named<T>(world: World, key: string, at: { from: string; names: Names }, read: (names: Names) => T): T {
    const { from, names } = at, kept = this.by.get(world.module) ?? new Map<string, Part>();
    this.by.set(world.module, kept);
    const was = kept.get(key);
    if (was?.asked && was.from === from && AskedNames.same(was.asked, names) && KeptReading.holds(world, was)) {
      return was.value as T;
    }
    const asking = new AskedNames(names), now = KeptReading.read(world, () => read(asking));
    if (now.kept) { kept.set(key, { ...now.kept, from, asked: asking.asked }); } else { kept.delete(key); }
    return now.value;
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
