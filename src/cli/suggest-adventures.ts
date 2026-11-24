import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// What kind of adventure to write next (the owner, 24 November: "count adventure genres and favor the least-represented
// ones; use census data to suggest whether to focus on a combat gauntlet, a series of investigations, a wonder-tranche
// or something else"). An adventure's shape is read from what its Kyr declares, never from a tag its author gives it
// (the owner's ruling on facets, 24 November): the foes that come at a company (a person or creature of a species or
// a fighting temperament, not Peaceable), what is found out (Discovery, a check), what is talked over (Topic), what has
// states to work (State), what is sold (Sells), what endangers (Hazard), and what is a wonder (Wonder, once Kyr
// declares one: OR-440). Each against the corpus's own share, so that the talk every adventure has does not make each
// one a talk; an adventure's genre is the facet it holds most above that share. The least written of are suggested
// first, with what the world's last quantity reading says beside them, where one was kept (bun run quantity).
export type Facet = 'combat' | 'investigation' | 'talk' | 'mechanism' | 'trade' | 'peril' | 'wonder';
export interface Shape { id: string; counts: Record<Facet, number>; genre?: Facet; next?: Facet }
export class SuggestAdventures {
  static readonly root = resolve(import.meta.dir, '../../data/adventures');
  static readonly reading = resolve(import.meta.dir, '../../node_modules/.cache/kyrie-quantity/last.json');
  static readonly facets: Facet[] = ['combat', 'investigation', 'talk', 'mechanism', 'trade', 'peril', 'wonder'];
  // What a focus on each would be called, as the owner names them.
  static readonly focus: Record<Facet, string> = { combat: 'a combat gauntlet', investigation: 'a series of '
    + 'investigations', talk: 'a society to talk among', mechanism: 'a mechanism or puzzle-box', trade: 'a trade or '
    + 'a market', peril: 'a perilous crossing', wonder: 'a wonder-tranche' };
  static readonly fighting = /\bTemperament (territorial|defensive|savage|ambush|proud|seizing)\b/;
  static shapes(): Shape[] {
    const dirs = readdirSync(this.root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
    const shapes = dirs.map(id => ({ id, counts: this.count(this.text(id)) }));
    const total = this.sum(shapes.map(s => s.counts));
    return shapes.map(s => ({ ...s, ...this.genre(s.counts, total) }));
  }
  private static text(id: string): string {
    return readdirSync(join(this.root, id)).filter(f => /\.kyrt?$/.test(f))
      .map(f => readFileSync(join(this.root, id, f), 'utf8')).join('\n');
  }
  static count(text: string): Record<Facet, number> {
    const people = [...text.matchAll(/^\s*Person\s+\w+\s+"[^"]*"[^{\n]*\{([\s\S]*?)^\s*\}/gm)].map(m => m[1]!);
    const foes = people.filter(b => !/\bPeaceable\b/.test(b) && (/^\s*Species\s/m.test(b) || this.fighting.test(b)));
    return { combat: foes.length,
      investigation: this.n(text, /^\s*Discovery\b/gm) + this.n(text, /\bcheck\(/g),
      talk: this.n(text, /^\s*Topic\b/gm), mechanism: this.n(text, /^\s+State\s/gm),
      trade: this.n(text, /^\s+Sells\b/gm), peril: this.n(text, /^\s*Hazard\b/gm),
      wonder: this.n(text, /^\s*Wonder\b/gm) };
  }
  private static n(text: string, r: RegExp): number { return text.match(r)?.length ?? 0; }
  private static sum(all: Record<Facet, number>[]): Record<Facet, number> {
    return Object.fromEntries(this.facets.map(f => [f, all.reduce((a, c) => a + c[f], 0)])) as Record<Facet, number>;
  }
  // The facets an adventure holds most above the corpus's share of them, best first: each held at least three times
  // and as a twentieth of what it declares (a few shops in a long talk are no market).
  private static genre(counts: Record<Facet, number>, total: Record<Facet, number>): { genre?: Facet; next?: Facet } {
    const own = this.facets.reduce((a, f) => a + counts[f], 0), all = this.facets.reduce((a, f) => a + total[f], 0);
    if (!own) { return {}; }
    const lift = Object.fromEntries(this.facets.map(f => [f, total[f] ? (counts[f] / own) / (total[f] / all) : 0]));
    const [genre, next] = this.facets.filter(f => counts[f] >= 3 && counts[f] >= own / 20)
      .sort((a, b) => lift[b]! - lift[a]!);
    return { ...genre ? { genre } : {}, ...next ? { next } : {} };
  }
  // The world's last quantity reading, if one was kept: each measure's label, value and whether it held.
  static world(): { at: string; rows: { id: string; label: string; value: number | null; ok: boolean }[] } | undefined {
    return existsSync(this.reading) ? JSON.parse(readFileSync(this.reading, 'utf8')) : undefined;
  }
  static report(): string[] {
    const shapes = this.shapes(), by = new Map(this.facets.map(f => [f, shapes.filter(s => s.genre === f)]));
    const ranked = [...this.facets].sort((a, b) => by.get(a)!.length - by.get(b)!.length);
    const lines = [`${shapes.length} adventures, by the facet each holds most (read from its Kyr):`];
    for (const f of this.facets) {
      const of = by.get(f)!;
      lines.push(`  ${f.padEnd(13)} ${String(of.length).padStart(2)}  ${of.map(s => s.next ? `${s.id} (then ${s.next})`
        : s.id).join(', ')}`);
    }
    const none = shapes.filter(s => !s.genre);
    if (none.length) { lines.push(`  ${'(none)'.padEnd(13)} ${String(none.length).padStart(2)}  ${none.map(s => s.id).join(', ')}`); }
    lines.push('', 'Least written of, first:');
    for (const f of ranked.slice(0, 3)) {
      const why = f === 'wonder' && !by.get(f)!.length ? ' (no adventure declares a Wonder yet: Kyr cannot until OR-440)' : '';
      lines.push(`  ${this.focus[f]}: ${by.get(f)!.length} of ${shapes.length}${why}`);
    }
    return [...lines, '', ...this.worldLines()];
  }
  private static worldLines(): string[] {
    const w = this.world();
    if (!w) { return ['No quantity reading kept yet: `bun run quantity` keeps one, and it is said here after.']; }
    const out = w.rows.filter(r => !r.ok).map(r => `  out of its band: ${r.label} (${r.value ?? '—'})`);
    return [`The world, as quantity last read it (${w.at}):`, ...out.length ? out : ['  every measure within its band'],
      ...w.rows.filter(r => /^1\. |danger|kill|Atlas|marks/i.test(r.label)).map(r => `  ${r.label}: ${r.value ?? '—'}`)];
  }
}
