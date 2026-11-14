#!/usr/bin/env bun
// Empty words in what every first hour meets (DN-06, the owner on a new game's first scene: "garlands of whatever is
// in flower", "abhorrent ... deeply unspecific, unserious"). Three measures over the same tables the clause census
// reads (ClauseCensus.firstHour), each an editor's worklist and a ratchet (test/small/empty-words):
// - indeterminate: narration that names nothing ("whatever", "something", "someone", "nobody in particular");
// - similes: the engine's "as if" / "as though" tic, mostly whimsy tagged onto a plain act;
// - stock: a sentence said word for word in more than one table (one camp told alike in every kind of dungeon).
// Speech is passed over: a speaker may say "somebody". A deliberate exception is declared in the data, not here: in
// JSON an object with "_literary" (why), in Kyr a line under a `// literary:` comment (the thing not yet made out).
//   bun scripts/empty-words.ts [--show=indeterminate|similes|stock]
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import { Sentences } from '../src/presentation/sentences';
import { ClauseCensus } from './clause-census';

export interface Said { file: string; sentence: string }
export class EmptyWords {
  static readonly indeterminate =
    /\b(whatever|something|somewhere|someone|somebody|some sort of|some kind of)\b|\b(nobody|no one) in particular\b/i;
  static readonly simile = /\bas (if|though)\b/i;
  static files(): string[] {
    return [...new Glob('data/**/*.{kyr,kyrt}').scanSync('.'), ...new Glob('data/{voice,generation,origins}/**/*.json').scanSync('.')]
      .filter(f => ClauseCensus.firstHour.test(f)).sort();
  }
  // Every narrated sentence of a table: its strings, less what is declared literary, less what is spoken.
  static said(file: string): Said[] {
    const text = readFileSync(file, 'utf8'), strings = /\.kyrt?$/.test(file) ? this.kyr(text) : this.json(JSON.parse(text));
    return strings.flatMap(s => Sentences.split(this.unspoken(s))).map(s => s.trim())
      .filter(s => s.split(/\s+/).length > 3).map(sentence => ({ file, sentence }));
  }
  private static kyr(text: string): string[] {
    const lines = text.split('\n');
    return lines.filter((_, i) => !/\/\/ literary:/.test(lines[i - 1] ?? ''))
      .flatMap(l => [...l.matchAll(/"([^"\n]{40,})"/g)].map(m => m[1]!));
  }
  private static json(value: unknown, out: string[] = []): string[] {
    if (typeof value === 'string') { if (value.split(/\s+/).length > 6) { out.push(value); } return out; }
    if (Array.isArray(value)) { value.forEach(v => this.json(v, out)); return out; }
    if (value && typeof value === 'object' && !('_literary' in value)) {
      Object.entries(value).forEach(([k, v]) => { if (!/^(about|note|notes|_.*)$/.test(k)) { this.json(v, out); } });
    }
    return out;
  }
  // What a speaker says, in quotes, is theirs ('Somebody has burned here,' says the burner).
  private static unspoken(text: string): string {
    return text.replace(/(^|[\s(—])['‘][^]*?[a-z.,!?—-]['’](?=[\s,.;:!?)]|$)/g, '$1').replace(/\s+/g, ' ');
  }
  static count(): { indeterminate: Said[]; similes: Said[]; stock: Said[] } {
    const all = this.files().flatMap(f => this.said(f));
    const where = new Map<string, Set<string>>();
    for (const s of all) { where.set(s.sentence, (where.get(s.sentence) ?? new Set()).add(s.file)); }
    const stock = [...where].filter(([s, files]) => files.size > 1 && s.split(/\s+/).length >= 8)
      .map(([sentence, files]) => ({ file: [...files].join(', '), sentence }));
    return { indeterminate: all.filter(s => this.indeterminate.test(s.sentence)),
      similes: all.filter(s => this.simile.test(s.sentence)), stock };
  }
  static main(args: string[]): number {
    const c = this.count(), show = args.find(a => a.startsWith('--show='))?.slice(7) as keyof typeof c | undefined;
    console.log(`indeterminate ${c.indeterminate.length} · similes ${c.similes.length} · stock ${c.stock.length}`);
    for (const s of show ? c[show] ?? [] : []) { console.log(`  ${s.file}: ${s.sentence.slice(0, 150)}`); }
    return 0;
  }
}
if (import.meta.main) { process.exit(EmptyWords.main(process.argv.slice(2))); }
