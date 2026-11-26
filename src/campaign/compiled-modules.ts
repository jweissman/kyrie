import { Costs } from '../costs';
import { ParseCache } from '../lang/parse-cache';
import { TextHash } from '../lang/text-hash';
import type { VocabularyContext, ReadAmong, KindReads } from '../lang';

// A module's own files compiled: read each among the kinds its files declare, joined, and its names that the shared
// rules name too made its own (see ModuleBundle.loading). What that comes to depends on nothing but the texts, the
// shared rules it is read beside, and what reading them asked of the kinds already in the catalogs (each name with
// what it stood for then: Vocabularies.reading); so it is kept by those,
// in the process and wherever the process keeps its parses (ParseCache.store: on disk, or the browser's IndexedDB),
// and a module installed again (the same adventure in another world, a country's site read again) is not read,
// joined and shadowed again file by file (compile-once-plan.md step 1).
// Kept never changed: each taking is its own copy, which installing it changes (its company sized, the canon given).
// The language's module, as its parse cache gives it.
type Module = NonNullable<ReturnType<typeof ParseCache.get>>;
export interface Compiled {
  module: Module;
  // The id its first file declares (its seed is drawn by it), and what lint says of its shadowed names.
  id: string; told: string[];
}
export class CompiledModules {
  private static readonly kept = new Map<string, ReadAmong<Compiled>[]>();
  private static readonly editions = new Map<string, string>();
  // The shared rules' edition: their texts, hashed once for each set of them.
  static edition(rules: readonly string[]): string {
    const all = rules.join('\u0001');
    let edition = this.editions.get(all);
    if (!edition) {
      if (this.editions.size > 8) { this.editions.clear(); }
      edition = TextHash.of(all); this.editions.set(all, edition);
    }
    return edition;
  }
  // Taken before the module's own files would be read: its texts and the rules' edition; each compiled reading of
  // them kept by what it read (get).
  static key(context: VocabularyContext, edition: string, texts: readonly string[]): string {
    return `\u0004compiled\u0000${context.id}\u0000${edition}\u0000${texts.join('\u0001')}`;
  }
  // The module compiled before, its own kinds put back in the catalogs as reading it would have put them: a copy, or,
  // shared, the one kept, for a caller that writes nothing of it (ModuleBundle.loading, which copies only what it
  // changes: the company's size, the canon's entities given it; test/small/frozen-modules: AX-04).
  static get(context: VocabularyContext, key: string, shared = false): Compiled | undefined {
    const known = this.kept.get(key), stored = known ? undefined : ParseCache.store?.get(key) as unknown;
    const variants = known ?? (Array.isArray(stored) ? stored as ReadAmong<Compiled>[] : undefined);
    if (variants && !known) { this.remember(key, variants); }
    const kept = context.kept(variants)?.value;
    if (!kept?.module) { return undefined; }
    Costs.note('compiled kept', 0, { bytes: key.length });
    context.install(kept.module.catalog);
    return shared ? kept : structuredClone(kept);
  }
  static set(context: VocabularyContext, key: string, compiled: Compiled, reads: KindReads) {
    const variants = context.keep(this.kept.get(key), { value: structuredClone(compiled), reads });
    this.remember(key, variants);
    ParseCache.store?.set(key, variants as unknown as Module);
  }
  private static remember(key: string, variants: ReadAmong<Compiled>[]) {
    this.kept.delete(key);
    if (this.kept.size >= 64) { this.kept.delete(this.kept.keys().next().value!); }
    this.kept.set(key, variants);
  }
}
