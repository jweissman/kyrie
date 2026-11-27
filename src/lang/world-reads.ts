// What a reading of the world read: the names of the relations and measures it asked of, as the world answers them
// (OR-91, OR-114: the ways of a whole country read again for every act, though an act changes few of the names they
// read). A view worked out from these names alone, of the same module and the same arguments, is the same in any later
// world of its line whose stamps for them agree (World.agrees), whatever else has changed: that is what lets it be
// kept from one world to the next. A reading that asks of everything (every fact, the world's key) is said to read
// everything, and nothing is kept of it. A name asked of within readings one inside another is read by each of them;
// and a reading kept and used again inside another is noted as read there too (note), so that what the outer one keeps
// reads what the inner one did.
// And what of a name it read, where it read only some of its facts: those with this first or second argument, or the
// one fact or value of this key (picks). A name written since is then no matter where nothing written of it is among
// what was picked (see KeptReading): a word with someone writes what the company knows, and a schema that asked only
// whether it knows one thing (or a way only whether its secret is known) need not be read again.
interface Open { names: Set<string>; picks: Map<string, Set<string>>; noted: Set<readonly string[]> }
export type Picks = ReadonlyMap<string, ReadonlySet<string>>;
export class WorldReads {
  private static readonly open: Open[] = [];
  private static readonly every = '\u0000every';
  // A name asked of, for each reading under way: all its facts, or (at and value) only those whose argument at that
  // place is that value (at 2: the fact or value whose key that is). Noted in the innermost reading, and in each it is
  // within as that one ends (see of): a search over a country's ways inside four readings one within another had
  // noted each of its thousands of reads four times over.
  static saw(name: string, at?: number, value?: string): void {
    const reading = this.open[this.open.length - 1];
    if (!reading) { return; }
    if (value === undefined) { reading.names.add(name); return; }
    const pick = this.pick(at!, value), picked = reading.picks.get(name);
    if (picked) { picked.add(pick); } else { reading.picks.set(name, new Set([pick])); }
  }
  // Each pick's words made once (a reading picks the same few thousand facts again and again: made afresh for every
  // read, they were most of what a reading left for the collector).
  private static readonly picked = [new Map<string, string>(), new Map<string, string>(), new Map<string, string>()];
  static pick(at: number, value: string): string {
    const made = this.picked[at], had = made?.get(value);
    if (had !== undefined) { return had; }
    const pick = `${at}\u0000${value}`;
    made?.set(value, pick);
    return pick;
  }
  // Whether any reading is under way.
  static under(): boolean { return this.open.length > 0; }
  // Everything asked of at once.
  static all(): void { this.saw(this.every); }
  // Names read by a reading kept and used again (see the head), and what of them it picked. Noted once in each reading
  // under way, however often it is used again there (a screen plans a journey to every place it offers, each over the
  // one search kept for the world, whose reads are the country's ways: noted afresh each time, they were most of the
  // journeys' time).
  static note(names: readonly string[], picks?: Picks): void {
    const reading = this.open[this.open.length - 1];
    if (!reading || reading.noted.has(names)) { return; }
    reading.noted.add(names);
    for (const name of names) {
      const picked = picks?.get(name);
      if (!picked) { reading.names.add(name); continue; }
      const has = reading.picks.get(name);
      if (has) { for (const p of picked) { has.add(p); } } else { reading.picks.set(name, new Set(picked)); }
    }
  }
  // What a reading gives, and the names it read; none where it read everything (nothing then is kept of it). Of the
  // names it read only in part, what it picked.
  static of<T>(read: () => T, within = true): { value: T; reads?: string[]; picks?: Picks } {
    const reading: Open = { names: new Set(), picks: new Map(), noted: new Set() };
    this.open.push(reading);
    let value: T;
    try { value = read(); } finally {
      const at = this.open.lastIndexOf(reading);
      this.open.splice(at, 1);
      if (within && at > 0) { this.within(reading, this.open[at - 1]!); }
    }
    if (reading.names.has(this.every)) { return { value }; }
    const picks = new Map([...reading.picks].filter(([name]) => !reading.names.has(name)));
    return { value, reads: [...reading.names, ...picks.keys()], ...picks.size ? { picks } : {} };
  }
  // A reading kept apart from any under way: what it read is noted there only as its asker chooses (note, all), as
  // where one part of a question settles it alone and the parts asked before it do not (SchemaAsks).
  static apart<T>(read: () => T): { value: T; reads?: string[]; picks?: Picks } { return this.of(read, false); }
  // What a reading read, noted in the one under way (see apart).
  static noted(read: { reads?: readonly string[]; picks?: Picks }): void {
    if (read.reads) { this.note(read.reads, read.picks); } else { this.all(); }
  }
  // What a reading read, read too by the one it was within.
  private static within(reading: Open, outer: Open): void {
    for (const name of reading.names) { outer.names.add(name); }
    for (const [name, picked] of reading.picks) {
      const has = outer.picks.get(name);
      if (has) { for (const p of picked) { has.add(p); } } else { outer.picks.set(name, new Set(picked)); }
    }
    for (const noted of reading.noted) { outer.noted.add(noted); }
  }
}
