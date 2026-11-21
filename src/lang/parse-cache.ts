import type { Module } from './module';

// What has been parsed, kept: in the process, the last few dozen texts (the same shared rules come again and again),
// and, where the process has a file system, on disk between processes (see ParseStore). Parsing is the costliest part
// of loading a campaign. A text is kept by the kinds it was read among: one read while another campaign's kinds were in
// the catalogs (Kind figurine like dreg_ox) is not taken for one read without them (the review's H7).
export class ParseCache {
  private static readonly parsed = new Map<string, Module>();
  // Where a process keeps what it parsed between runs, when it has one.
  static store?: { get(key: string): Module | undefined; set(key: string, module: Module): void };
  // Where what a parse cost is noted, when the process counts it: the runtime's Costs, which gives itself here as it
  // is loaded (src/costs.ts), so that the language counts nothing of its own and imports none of the runtime.
  static costs?: { note(stage: 'parse' | 'parse kept' | 'parse match' | 'parse lower' | 'parse clone' | 'parse store',
    ms: number, o: { bytes: number }): void };
  // The module remembered for a key, as it was parsed: the one kept, not a copy, so a caller that may change it copies
  // it first (ModuleParser.parse does).
  static get(key: string): Module | undefined {
    const known = this.parsed.get(key), kept = known ?? this.store?.get(key);
    if (kept) { this.costs?.note('parse kept', 0, { bytes: key.length }); this.remember(key, kept); }
    return kept;
  }
  // What a parse cost (see Costs): the text's length, and the time taken.
  // bytes: the text's UTF-8 size, where the parser gives it (the key's length had been taken for it).
  static set(key: string, module: Module, ms = 0, bytes = key.length) {
    this.costs?.note('parse', ms, { bytes });
    const cloned = performance.now();
    this.remember(key, structuredClone(module));
    const stored = performance.now();
    this.store?.set(key, module);
    this.costs?.note('parse clone', stored - cloned, { bytes });
    this.costs?.note('parse store', performance.now() - stored, { bytes });
  }
  // Kept by how much text, not how many: a drawn country is some thirty texts of a megabyte and a half between them,
  // and its world a hundred and fifty, so that a count of ninety-six had let the country's go while the rest of its
  // world was read, and its start parsed the country again (3.5 s of a cold set-out's 7.3: OR-121). The most recently
  // asked for are kept; a world and the next country beyond it fit.
  static readonly budget = 12 * 1024 * 1024;
  private static held = 0;
  private static remember(key: string, module: Module) {
    if (this.parsed.delete(key)) { this.held -= key.length; }
    this.parsed.set(key, module); this.held += key.length;
    for (const oldest of this.parsed.keys()) {
      if (this.held <= this.budget || oldest === key) { break; }
      this.parsed.delete(oldest); this.held -= oldest.length;
    }
  }
}
