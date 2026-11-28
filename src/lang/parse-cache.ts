import type { Module } from './module';
import type { VocabularyContext, ReadAmong } from './vocabulary';

// What has been parsed, kept: in the process, the last few dozen texts (the same shared rules come again and again),
// and, where the process has a file system, on disk between processes (see ParseStore). Parsing is the costliest part
// of loading a campaign. A text is kept by its text, and each of its parses by what the reading asked of the kinds it
// was read among (Vocabularies.reading): one read while another campaign's kinds were in the catalogs (Kind figurine
// like dreg_ox, or like a token worth 9 where it is worth 1) is not taken for one read among others (the review's H7;
// the compilation-context review of 26 November). On disk too: a text's few parses are kept together.
export class ParseCache {
  private static readonly parsed = new Map<string, ReadAmong<Module>[]>();
  // Where a process keeps what it parsed between runs, when it has one: under a text's key, its parses (each with what
  // it read), and under the keys of their own, what else the language keeps there (DeclarationShapes).
  static store?: { get(key: string): Module | undefined; set(key: string, module: Module): void };
  // Where what a parse cost is noted, when the process counts it: the runtime's Costs, which gives itself here as it
  // is loaded (src/costs.ts), so that the language counts nothing of its own and imports none of the runtime.
  static costs?: { note(stage: 'parse' | 'parse kept' | 'parse match' | 'parse lower' | 'parse clone' | 'parse store',
    ms: number, o: { bytes: number }): void };
  // The module remembered for a key, as it was parsed: the one kept, not a copy, so a caller that may change it copies
  // it first (ModuleParser.parse does).
  // Of the parses kept for a key, the one good among the kinds now, its reads noted (Vocabularies.kept).
  static get(context: VocabularyContext, key: string): Module | undefined {
    const known = this.parsed.get(key), variants = known ?? this.variants(key), kept = context.kept(variants);
    if (kept) { this.costs?.note('parse kept', 0, { bytes: key.length }); }
    // Those from the store remembered even where none is good now, for the parse kept beside them (set).
    if (variants && (kept || !known)) { this.remember(key, variants); }
    return kept?.value;
  }
  private static variants(key: string): ReadAmong<Module>[] | undefined {
    const stored = this.store?.get(key) as unknown;
    return Array.isArray(stored) ? stored as ReadAmong<Module>[] : undefined;
  }
  // What a parse cost (see Costs): the text's length, and the time taken.
  // bytes: the text's UTF-8 size, where the parser gives it (the key's length had been taken for it).
  // reads: what the reading asked of the vocabulary (see Vocabularies.reading).
  static set(context: VocabularyContext, key: string, reading: ReadAmong<Module>,
    measure: { ms?: number; bytes?: number } = {}) {
    const { ms = 0, bytes = key.length } = measure;
    this.costs?.note('parse', ms, { bytes });
    const cloned = performance.now();
    const variants = context.keep(this.parsed.get(key), { value: structuredClone(reading.value),
      reads: reading.reads });
    this.remember(key, variants);
    const stored = performance.now();
    this.store?.set(key, variants as unknown as Module);
    this.costs?.note('parse clone', stored - cloned, { bytes });
    this.costs?.note('parse store', performance.now() - stored, { bytes });
  }
  // Kept by how much text, not how many: a drawn country is some thirty texts of a megabyte and a half between them,
  // and its world a hundred and fifty, so that a count of ninety-six had let the country's go while the rest of its
  // world was read, and its start parsed the country again (3.5 s of a cold set-out's 7.3: OR-121). The most recently
  // asked for are kept; a world and the next country beyond it fit.
  // A process that starts many different worlds (a spec worker) keeps less (test/support/lean-caches).
  static budget = 12 * 1024 * 1024;
  private static held = 0;
  private static remember(key: string, variants: ReadAmong<Module>[]) {
    if (this.parsed.delete(key)) { this.held -= key.length; }
    this.parsed.set(key, variants); this.held += key.length;
    for (const oldest of this.parsed.keys()) {
      if (this.held <= this.budget || oldest === key) { break; }
      this.parsed.delete(oldest); this.held -= oldest.length;
    }
  }
}
