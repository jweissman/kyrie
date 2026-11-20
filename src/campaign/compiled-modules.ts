import { Costs } from '../costs';
import { LocalKinds } from '../catalog/local-catalog';
import { ParseCache } from '../lang/parse-cache';
import { TextHash } from '../lang/text-hash';
import { Vocabularies } from '../lang/vocabulary';
import type { Module } from '../lang/module';

// A module's own files compiled: read each among the kinds its files declare, joined, and its names that the shared
// rules name too made its own (see ModuleBundle.loading). What that comes to depends on nothing but the texts, the
// shared rules it is read beside, and the kinds already in the catalogs that its texts name; so it is kept by those,
// in the process and wherever the process keeps its parses (ParseCache.store: on disk, or the browser's IndexedDB),
// and a module installed again (the same adventure in another world, a country's site read again) is not read,
// joined and shadowed again file by file (compile-once-plan.md step 1).
// Kept never changed: each taking is its own copy, which installing it changes (its company sized, the canon given).
export interface Compiled {
  module: Module;
  // The id its first file declares (its seed is drawn by it), and what lint says of its shadowed names.
  id: string; told: string[];
}
export class CompiledModules {
  private static readonly kept = new Map<string, Compiled>();
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
  // Taken before the module's own files would be read: the kinds its texts name are those in the catalogs as its
  // first file would have been read among them (the kinds its files declare are its texts' own).
  static key(edition: string, texts: readonly string[]): string {
    const all = texts.join('\u0001');
    return `\u0003compiled\u0000${edition}\u0000${Vocabularies.seen(all)}\u0000${all}`;
  }
  // The module compiled before, its own kinds put back in the catalogs as reading it would have put them.
  static get(key: string): Compiled | undefined {
    const known = this.kept.get(key), kept = known ?? ParseCache.store?.get(key) as unknown as Compiled | undefined;
    if (!kept?.module) { return undefined; }
    if (!known) { this.remember(key, kept); }
    Costs.note('compiled kept', 0, { bytes: key.length });
    LocalKinds.install(kept.module.catalog);
    return structuredClone(kept);
  }
  static set(key: string, compiled: Compiled) {
    const copy = structuredClone(compiled);
    this.remember(key, copy);
    ParseCache.store?.set(key, copy as unknown as Module);
  }
  private static remember(key: string, compiled: Compiled) {
    if (this.kept.size >= 64) { this.kept.delete(this.kept.keys().next().value!); }
    this.kept.set(key, compiled);
  }
}
