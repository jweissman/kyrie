// What a reading of the world read: the names of the relations and measures it asked of, as the world answers them
// (OR-91, OR-114: the ways of a whole country read again for every act, though an act changes few of the names they
// read). A view worked out from these names alone, of the same module and the same arguments, is the same in any later
// world of its line whose stamps for them agree (World.agrees), whatever else has changed: that is what lets it be
// kept from one world to the next. A reading that asks of everything (every fact, the world's key) is said to read
// everything, and nothing is kept of it. A name asked of within readings one inside another is read by each of them;
// and a reading kept and used again inside another is noted as read there too (note), so that what the outer one keeps
// reads what the inner one did.
export class WorldReads {
  private static readonly open: Set<string>[] = [];
  private static readonly every = '\u0000every';
  // A name asked of, for each reading under way.
  static saw(name: string): void {
    if (!this.open.length) { return; }
    for (const reading of this.open) { reading.add(name); }
  }
  // Everything asked of at once.
  static all(): void { this.saw(this.every); }
  // Names read by a reading kept and used again (see the head).
  static note(names: readonly string[]): void {
    if (!this.open.length) { return; }
    for (const name of names) { this.saw(name); }
  }
  // What a reading gives, and the names it read; none where it read everything (nothing then is kept of it).
  static of<T>(read: () => T): { value: T; reads?: string[] } {
    const reading = new Set<string>();
    this.open.push(reading);
    let value: T;
    try { value = read(); } finally { this.open.splice(this.open.lastIndexOf(reading), 1); }
    return reading.has(this.every) ? { value } : { value, reads: [...reading] };
  }
}
