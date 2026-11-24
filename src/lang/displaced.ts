import type { Call } from './module';

// What asserting a fact of an exclusive relation displaces, for one list of changes (World.apply): the relation's
// facts by every argument but their last, read once from the relation's facts the first time the list asserts one
// of it and kept as the list writes it. Before, each such assert went through every fact of its relation, and a
// world of N rooms took N² to build (scripts/scale-costs: 4,000 rooms, 35 s to start).
// The lead is the relation's arguments but its last, as words: the first alone for a relation of two (at(x, place),
// the one asserted most), joined by a character no id holds for more; never a JSON form of each fact, which had been a
// seventh of an act's time (the act-cost profile of 24 November: every rule firing is a list of its own, and each read
// all of `at` again so).
export class Displaced {
  // By relation, each lead's key: one, as it nearly always is, or the several where a list asserted more.
  private readonly by = new Map<string, Map<string, string | Set<string>>>();
  private static lead(call: Call): string {
    const n = call.args.length - 1;
    return n === 1 ? call.args[0]! : n <= 0 ? '' : call.args.slice(0, n).join('\u0000');
  }
  // The keys of the facts this call displaces, taken from the index: the caller deletes them.
  take(named: ReadonlyMap<string, Call>, call: Call): string[] {
    let index = this.by.get(call.name);
    if (!index) {
      index = new Map();
      for (const [key, held] of named) { Displaced.into(index, Displaced.lead(held), key); }
      this.by.set(call.name, index);
    }
    const lead = Displaced.lead(call), keys = index.get(lead);
    index.delete(lead);
    return keys === undefined ? [] : typeof keys === 'string' ? [keys] : [...keys];
  }
  added(call: Call, key: string) {
    const index = this.by.get(call.name);
    if (index) { Displaced.into(index, Displaced.lead(call), key); }
  }
  removed(call: Call, key: string) {
    const index = this.by.get(call.name), lead = Displaced.lead(call), keys = index?.get(lead);
    if (keys === key) { index!.delete(lead); } else if (typeof keys === 'object') { keys.delete(key); }
  }
  private static into(index: Map<string, string | Set<string>>, lead: string, key: string) {
    const keys = index.get(lead);
    if (keys === undefined) { index.set(lead, key); } else if (typeof keys === 'string') {
      if (keys !== key) { index.set(lead, new Set([keys, key])); }
    } else { keys.add(key); }
  }
}
