// Where a sentence the player read was written (the journey reader's provenance): every string an author or a
// generator wrote (the Kyr of data/ and its templates, .kyrt, the JSON tables of data/, and the TypeScript of src/
// and web/engine, comments aside), split into sentences, and a sentence shown matched against them. A sentence with
// no blanks in it matches only itself; one with blanks ({name} in Kyr and the tables, ${…} in code) matches what
// fills them. Said plainly, as it stands: "exact" (the words as written, the file and line), "template" (a sentence
// with blanks, filled), "partial" (a stretch of six words or more is written somewhere, the rest made elsewhere: a
// list joined, a clause added), or "none" (made by code that writes no such sentence whole: a name joined to a verb).
// Traced against the sources as they stand when the page is made, not as they stood when the journey was played.
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Source { file: string; line: number; decl?: string; written: string; blanks: boolean }
export type How = 'exact' | 'template' | 'partial' | 'none';
export interface Traced { sentence: string; how: How; sources: Source[] }
interface Unit { source: Source; parts: string[]; longest: string }

export class ProseProvenance {
  static readonly roots = ['data/**/*.kyr', 'data/**/*.kyrt', 'data/**/*.json', 'src/**/*.ts', 'web/engine/**/*.ts'];
  static readonly skipped = [/^data\/sources\//, /\.generated\./, /^src\/cli\/(prose-provenance|journey-[a-z]+)\.ts$/];
  private readonly exact = new Map<string, Source[]>();
  private readonly templates: Unit[] = [];
  private readonly whole: { text: string; source: Source }[] = [];
  private readonly shingled = new Map<string, Source[]>();
  // The sources under a root (the repository's, by default), indexed once.
  static index(root = process.cwd(), patterns = ProseProvenance.roots): ProseProvenance {
    const p = new ProseProvenance();
    for (const pattern of patterns) {
      for (const file of new Glob(pattern).scanSync(root)) {
        if (!this.skipped.some(r => r.test(file))) { p.add(file, readFileSync(join(root, file), 'utf8')); }
      }
    }
    return p;
  }
  // A file's strings, by its kind: Kyr and JSON in double quotes; code in any quotes, its comment lines blanked.
  add(file: string, text: string) {
    const code = file.endsWith('.ts'), body = code ? text.replace(/^\s*\/\/.*$/gm, '') : text;
    const ends = [...body.matchAll(/\n/g)].map(m => m.index), lines = text.split('\n');
    // Kyr's prose blocks: a line begun with >>, written whole.
    for (const m of code ? [] : body.matchAll(/^>>[ \t]*(.+)$/gm)) {
      this.written(m[1]!, { file, line: ProseProvenance.line(ends, m.index) });
    }
    const re = code ? /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g : /"((?:[^"\\]|\\.)*)"/g;
    for (const m of body.matchAll(re)) {
      const raw = m[1] ?? m[2] ?? m[3] ?? '', written = ProseProvenance.unescape(raw);
      if (written.length < 12 || !/\s/.test(written)) { continue; }
      const line = ProseProvenance.line(ends, m.index);
      this.written(written, { file, line, ...ProseProvenance.decl(file, lines[line - 1] ?? '') });
    }
  }
  private written(written: string, at: { file: string; line: number; decl?: string }) {
    const key = ProseProvenance.key(written);
    this.whole.push({ text: key, source: { ...at, written, blanks: ProseProvenance.blank.test(written) } });
    for (const s of ProseProvenance.sentences(written)) {
      const parts = ProseProvenance.parts(s), source = { ...at, written: s, blanks: parts.length > 1 };
      for (const sh of parts.flatMap(x => ProseProvenance.shingles(x.trim()))) {
        this.shingled.set(sh, [...this.shingled.get(sh) ?? [], source]);
      }
      if (parts.length === 1) { this.exact.set(parts[0]!, [...this.exact.get(parts[0]!) ?? [], source]); continue; }
      const longest = [...parts].sort((a, b) => b.length - a.length)[0]!;
      if (longest.length >= 10) { this.templates.push({ source, parts, longest }); }
    }
  }
  // A sentence shown, traced.
  // A sentence in someone's mouth is looked for in its quotes and, written without them, out of them.
  trace(sentence: string): Traced {
    const traced = this.traced(sentence, ProseProvenance.key(sentence));
    const bare = ProseProvenance.key(sentence).replace(/^'|'$/g, '');
    return traced.how === 'none' && /^'|'$/.test(ProseProvenance.key(sentence)) ? this.traced(sentence, bare) : traced;
  }
  private traced(sentence: string, key: string): Traced {
    const exact = this.exact.get(key);
    if (exact) { return { sentence, how: 'exact', sources: ProseProvenance.few(exact) }; }
    const filled = this.templates.filter(t => key.includes(t.longest) && ProseProvenance.fills(t.parts, key));
    if (filled.length) { return { sentence, how: 'template', sources: ProseProvenance.few(filled.map(t => t.source)) }; }
    const within = key.length >= 24 ? this.whole.filter(w => w.text.includes(key)).map(w => w.source) : [];
    if (within.length) { return { sentence, how: 'exact', sources: ProseProvenance.few(within) }; }
    const part = this.partial(key);
    return part.length ? { sentence, how: 'partial', sources: ProseProvenance.few(part) } : { sentence, how: 'none', sources: [] };
  }
  // Of the sources sharing a stretch of six words or more with the sentence, those sharing most.
  private partial(key: string): Source[] {
    const counts = new Map<Source, number>();
    for (const shingle of ProseProvenance.shingles(key)) {
      for (const s of this.shingled.get(shingle) ?? []) { counts.set(s, (counts.get(s) ?? 0) + 1); }
    }
    const best = Math.max(0, ...counts.values());
    return best >= 2 ? [...counts.entries()].filter(([, n]) => n === best).map(([s]) => s) : [];
  }
  private static shingles(key: string): string[] {
    const words = key.split(' '), out: string[] = [];
    for (let i = 0; i + 5 <= words.length; i++) { out.push(words.slice(i, i + 5).join(' ')); }
    return out;
  }
  // A sentence as written, cut at its blanks (a Kyr blank made in code, {${keeper}}, is one).
  private static parts(written: string): string[] {
    return this.key(written).replace(this.blanks, '\0').replace(/\{\0\}/g, '\0').split(/\0+/);
  }
  // The line an offset is on, by the offsets of the line ends before it.
  private static line(ends: number[], at: number): number {
    let lo = 0, hi = ends.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (ends[mid]! < at) { lo = mid + 1; } else { hi = mid; } }
    return lo + 1;
  }
  private static fills(parts: string[], key: string): boolean {
    const re = new RegExp(`^${parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+?')}$`);
    return re.test(key);
  }
  private static few(sources: Source[]): Source[] {
    const seen = new Set<string>();
    return sources.filter(s => !seen.has(`${s.file}:${s.line}`) && !!seen.add(`${s.file}:${s.line}`)).slice(0, 4);
  }
  static readonly blank = /\$\{[^}]*\}|\{\{[^}\s]*\}[^}\s]*\}|\{[^}\s${]*\}/;
  private static readonly blanks = /\$\{[^}]*\}|\{\{[^}\s]*\}[^}\s]*\}|\{[^}\s${]*\}/g;
  // Text as it is compared: quotes and dashes straight, the stress marks and spacing gone, in lower case.
  static key(text: string): string {
    return text.replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...')
      .replace(/\*([^*\s](?:[^*]*[^*\s])?)\*/g, '$1').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  // Prose cut into its sentences, where one ends and a capital (or a quotation) begins the next.
  static sentences(text: string): string[] {
    return text.split(/(?<=[.!?][’'"”)]?)\s+(?=[A-Z‘“'"(])/).map(s => s.trim()).filter(Boolean);
  }
  private static unescape(raw: string): string {
    return raw.replace(/\\(["'`\\])/g, '$1').replace(/\\n/g, ' ').replace(/\\u([0-9a-f]{4})/gi,
      (_, h: string) => String.fromCharCode(parseInt(h, 16)));
  }
  // The declaration a Kyr string belongs to (the first two words of its line: "Observe owain_waits"), or a JSON
  // string's key.
  private static decl(file: string, at: string): { decl?: string } {
    const m = /\.kyrt?$/.test(file) ? /^\s*([A-Z]\w*\s+\w+)/.exec(at) : file.endsWith('.json') ? /"(\w+)"\s*:/.exec(at) : null;
    return m?.[1] ? { decl: m[1] } : {};
  }
}
