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
  // The module remembered for a key, as it was parsed: each caller takes its own copy of it.
  static get(key: string): Module | undefined {
    const known = this.parsed.get(key), kept = known ?? this.store?.get(key);
    if (kept) { Costs.note('parse kept', 0, { bytes: key.length }); }
    if (kept && !known) { this.remember(key, kept); }
    return kept;
  }
  // What a parse cost (see Costs): the text's length, and the time taken.
  static set(key: string, module: Module, ms = 0) {
    Costs.note('parse', ms, { bytes: key.length });
    this.remember(key, structuredClone(module));
    this.store?.set(key, module);
  }
  private static remember(key: string, module: Module) {
    if (this.parsed.size >= 96) { this.parsed.delete(this.parsed.keys().next().value!); }
    this.parsed.set(key, module);
  }
}
