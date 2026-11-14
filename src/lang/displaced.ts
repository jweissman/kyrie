import type { Call } from './module';

// What asserting a fact of an exclusive relation displaces, for one list of changes (World.apply): the relation's
// facts by every argument but their last, read once from the relation's facts the first time the list asserts one
// of it and kept as the list writes it. Before, each such assert went through every fact of its relation, and a
// world of N rooms took N² to build (scripts/scale-costs: 4,000 rooms, 35 s to start).
export class Displaced {
  private readonly by = new Map<string, Map<string, Set<string>>>();
  private static lead(call: Call): string { return JSON.stringify([call.name, ...call.args.slice(0, -1)]); }
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
    return keys ? [...keys] : [];
  }
  added(call: Call, key: string) {
    const index = this.by.get(call.name);
    if (index) { Displaced.into(index, Displaced.lead(call), key); }
  }
  removed(call: Call, key: string) { this.by.get(call.name)?.get(Displaced.lead(call))?.delete(key); }
  private static into(index: Map<string, Set<string>>, lead: string, key: string) {
    const keys = index.get(lead);
    if (keys) { keys.add(key); } else { index.set(lead, new Set([key])); }
  }
}
