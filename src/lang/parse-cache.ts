import type { Module } from './module';
import { Costs } from '../costs';

// What has been parsed, kept: in the process, the last few dozen texts (the same shared rules come again and again),
// and, where the process has a file system, on disk between processes (see ParseStore). Parsing is the costliest part
// of loading a campaign. A text is kept by the kinds it was read among: one read while another campaign's kinds were in
// the catalogs (Kind figurine like dreg_ox) is not taken for one read without them (the review's H7).
export class ParseCache {
  private static readonly parsed = new Map<string, Module>();
  // Where a process keeps what it parsed between runs, when it has one.
  static store?: { get(key: string): Module | undefined; set(key: string, module: Module): void };
  // The module remembered for a key, as it was parsed: the one kept, not a copy, so a caller that may change it copies
  // it first (ModuleParser.parse does).
  static get(key: string): Module | undefined {
    const known = this.parsed.get(key), kept = known ?? this.store?.get(key);
    if (kept) { Costs.note('parse kept', 0, { bytes: key.length }); this.remember(key, kept); }
    return kept;
  }
  // What a parse cost (see Costs): the text's length, and the time taken.
  static set(key: string, module: Module, ms = 0) {
    Costs.note('parse', ms, { bytes: key.length });
    this.remember(key, structuredClone(module));
    this.store?.set(key, module);
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
