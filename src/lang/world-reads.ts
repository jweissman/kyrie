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
interface Open { names: Set<string>; picks: Map<string, Set<string>> }
export type Picks = ReadonlyMap<string, ReadonlySet<string>>;
export class WorldReads {
  private static readonly open: Open[] = [];
  private static readonly every = '\u0000every';
  // A name asked of, for each reading under way: all its facts, or (at and value) only those whose argument at that
  // place is that value (at 2: the fact or value whose key that is).
  static saw(name: string, at?: number, value?: string): void {
    if (!this.open.length) { return; }
    if (value === undefined) { for (const reading of this.open) { reading.names.add(name); } return; }
    const pick = this.pick(at!, value);
    for (const reading of this.open) {
      const picked = reading.picks.get(name);
      if (picked) { picked.add(pick); } else { reading.picks.set(name, new Set([pick])); }
    }
  }
  static pick(at: number, value: string): string { return `${at}\u0000${value}`; }
  // Everything asked of at once.
  static all(): void { this.saw(this.every); }
  // Names read by a reading kept and used again (see the head), and what of them it picked.
  static note(names: readonly string[], picks?: Picks): void {
    if (!this.open.length) { return; }
    for (const name of names) {
      const picked = picks?.get(name);
      if (!picked) { this.saw(name); continue; }
      for (const reading of this.open) {
        const has = reading.picks.get(name) ?? new Set<string>();
        reading.picks.set(name, has);
        for (const p of picked) { has.add(p); }
      }
    }
  }
  // What a reading gives, and the names it read; none where it read everything (nothing then is kept of it). Of the
  // names it read only in part, what it picked.
  static of<T>(read: () => T): { value: T; reads?: string[]; picks?: Picks } {
    const reading: Open = { names: new Set(), picks: new Map() };
    this.open.push(reading);
    let value: T;
    try { value = read(); } finally { this.open.splice(this.open.lastIndexOf(reading), 1); }
    if (reading.names.has(this.every)) { return { value }; }
    const picks = new Map([...reading.picks].filter(([name]) => !reading.names.has(name)));
    return { value, reads: [...reading.names, ...picks.keys()], ...picks.size ? { picks } : {} };
  }
}
