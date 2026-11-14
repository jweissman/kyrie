#!/usr/bin/env bun
// Where the authored prose is heaviest (src/presentation/clause-load.ts): every quoted string of the Kyr under data/
// and every string of data/voice and data/generation's JSON, split into sentences, and the heavy ones counted file by
// file, the heaviest files first: an editor's worklist (the owner, 14 November: empty words are an obstacle).
// Strings of a few words (labels, ids) are not prose and are passed over.
// `--first-hour` keeps to what every first hour meets: the origins and their road prologues, the town and its
// undertown, the region's generated places, the voice tables.
//   bun scripts/clause-census.ts [--top=20] [--show=3] [--first-hour]
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import { ClauseLoad } from '../src/presentation/clause-load';

interface Counted { file: string; sentences: number; heavy: string[] }
export class ClauseCensus {
  static strings(file: string): string[] {
    const text = readFileSync(file, 'utf8');
    if (file.endsWith('.kyr') || file.endsWith('.kyrt')) { return [...text.matchAll(/"([^"\n]{40,})"/g)].map(m => m[1]!); }
    const out: string[] = [];
    this.walk(JSON.parse(text) as unknown, out);
    return out;
  }
  private static walk(value: unknown, out: string[]) {
    if (typeof value === 'string') { if (value.split(/\s+/).length > 6) { out.push(value); } return; }
    if (Array.isArray(value)) { value.forEach(v => this.walk(v, out)); return; }
    // A table's own notes (`about`, `note`) are for its author, not the player.
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => { if (!/^(about|note|notes|_.*)$/.test(k)) { this.walk(v, out); } });
    }
  }
  static readonly firstHour = /^data\/(origins|generation|voice)\//;
  static count(firstHour = false): Counted[] {
    const files = [...new Glob('data/**/*.{kyr,kyrt}').scanSync('.'),
      ...new Glob('data/{voice,generation,origins}/**/*.json').scanSync('.')]
      .filter(f => !firstHour || this.firstHour.test(f));
    return files.map(file => {
      const load = ClauseLoad.said(this.strings(file));
      return { file, sentences: load.sentences, heavy: load.heavy };
    }).filter(c => c.sentences);
  }
  static main(args: string[]): number {
    const top = Number(args.find(a => a.startsWith('--top='))?.slice(6) ?? 20);
    const show = Number(args.find(a => a.startsWith('--show='))?.slice(7) ?? 0);
    const counted = this.count(args.includes('--first-hour')).sort((a, b) => b.heavy.length - a.heavy.length);
    const sentences = counted.reduce((n, c) => n + c.sentences, 0);
    const heavy = counted.reduce((n, c) => n + c.heavy.length, 0);
    console.log(`${heavy} heavy of ${sentences} authored sentences (${(100 * heavy / sentences).toFixed(1)} %), `
      + `in ${counted.filter(c => c.heavy.length).length} of ${counted.length} files`);
    for (const c of counted.slice(0, top)) {
      console.log(`${String(c.heavy.length).padStart(5)} of ${String(c.sentences).padStart(5)}  ${c.file}`);
      for (const h of c.heavy.slice(0, show)) { console.log(`        · ${h.slice(0, 160)}`); }
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(ClauseCensus.main(process.argv.slice(2))); }
