#!/usr/bin/env bun
// Closures checked mechanically (MT-17; the closure review of 19 November, mission-22/closure-review-method.md, its
// patterns 5 and 6: evidence asserted in prose that is false or stale, and the size a defect names not the one
// pinned). For every closed row of the register and its archive, the status is read for what it cites: a path under
// test/, src/, data/, doc/ (or its history/), web/, scripts/ or .github/; a spec by `small/x`, by `x.test.ts`, by
// `x` followed by its lines (`drove-reeve:21-50`), in backquotes or after "held by"; and any hyphenated word that is a
// spec's own name. A cited path that is not on disk is missing; a spec named by its name alone that two files answer
// is ambiguous; a size the row's what cell names (1280×800) that no cited spec says is a size unpinned. A closure
// that cites a census under scripts/ and no spec is said too, as advice: it is not counted. And (MT-19, patterns 1 and
// 3, scripts/closure-clauses.ts): a cold-play reference or "; " clause of the what cell the status leaves unanswered,
// and a rule against ("must not", "must be held") closed on no spec with a negative assertion. Today's findings are in
// doc/architecture/mission-22/closure-lint-baseline.json, and test/small/closure-lint fails on a new one, or on one
// gone that the baseline still lists (so that it only shrinks, and on purpose).
//   bun scripts/closure-lint.ts            the findings by kind, with counts and each one
//   bun scripts/closure-lint.ts --write    the baseline written from today's findings
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { ClosureClauses } from './closure-clauses';
import { RegisterTickets, type Row } from './register-tickets';

export type Kind = 'missing' | 'ambiguous' | 'size' | 'unpinned' | 'unanswered' | 'negative';
export interface Finding { id: string; kind: Kind; detail: string }
// A citation: its words in the status, the files that answer it, whether it was meant as one (a path, a spec's form)
// or only a hyphenated word that happens to be a spec's name, and whether it names a spec.
export interface Cite { said: string; files: string[]; meant: boolean; spec: boolean }

export class ClosureLint {
  static readonly root = RegisterTickets.root;
  static readonly baseline = 'doc/architecture/mission-22/closure-lint-baseline.json';
  static readonly counted: Kind[] = ['missing', 'ambiguous', 'size', 'unanswered', 'negative'];
  // What a row's evidence must be clear of to be archived (scripts/register-archive.ts): its cited paths and sizes.
  // Its parts unanswered (MT-19) are a reading's, kept in the baseline wherever the row is, not a bar to moving it.
  static readonly evidence: Kind[] = ['missing', 'ambiguous', 'size'];
  private static index?: Map<string, string[]>;
  // Every spec by its own name (foo for test/foo.test.ts, test/small/foo.test.ts and test/features/x/foo.pin.test.ts).
  static specs(): Map<string, string[]> {
    if (this.index) { return this.index; }
    const out = new Map<string, string[]>();
    for (const file of this.tree('test')) {
      const name = basename(file).replace(/(\.pin)?\.test\.ts$/, '');
      out.set(name, [...out.get(name) ?? [], file]);
    }
    return this.index = out;
  }
  private static tree(dir: string): string[] {
    return readdirSync(join(this.root, dir), { withFileTypes: true }).flatMap(d => d.isDirectory()
      ? d.name === 'node_modules' ? [] : this.tree(`${dir}/${d.name}`)
      : d.name.endsWith('.test.ts') ? [`${dir}/${d.name}`] : []);
  }
  private static readonly ends = ['', '.test.ts', '.ts', '.tsx', '.json', '.md', '.kyr', '.css', '.js', '.pin.test.ts'];
  // A path as written, or with the extension a row leaves off (test/wares for test/wares.test.ts); history/ is doc's.
  static resolve(said: string): string[] {
    const path = said.startsWith('history/') ? `doc/${said}` : said;
    const hit = this.ends.map(e => `${path}${e}`).find(p => existsSync(join(this.root, p)));
    return hit ? [hit] : [];
  }
  // A path from the repository's root; not one inside another (/var/tmp/…/doc/…), nor a glob's stem (src/ui/*.ts).
  private static readonly paths = /(?<![\w/.~-])(?:test|src|data|doc|web|scripts|history|\.github)\/[\w./-]*\w/g;
  // A spec by its form: small/x, x.test.ts, x:12 (its lines), `x`, held by x.
  private static readonly forms = new RegExp('(?<![\\w/.-])(?:small/([a-z][\\w-]*)|([a-z][\\w-]*)\\.test\\.ts'
    + '|([a-z][a-z0-9]*(?:-[a-z0-9]+)+)(?=:\\d)|`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`'
    + '|(?:held|pinned|guarded) by (?:the )?([a-z][a-z0-9]*(?:-[a-z0-9]+)+))', 'g');
  private static readonly words = /(?<![\w/.`-])[a-z][a-z0-9]*(?:-[a-z0-9]+)+(?![\w/-]|\.\w)/g;
  static cites(status: string): Cite[] {
    const out: Cite[] = [], taken: [number, number][] = [];
    for (const m of status.matchAll(this.paths)) {
      if (/^[*{…<]/.test(status.slice(m.index + m[0].length))) { continue; }
      const said = m[0].replace(/\.$/, '');
      out.push({ said, files: this.resolve(said), meant: true, spec: said.startsWith('test/') });
      taken.push([m.index, m.index + m[0].length]);
    }
    for (const m of status.matchAll(this.forms)) {
      if (this.inside(taken, m.index)) { continue; }
      const [small, file, lines, quoted, held] = m.slice(1);
      if (small) { out.push({ said: m[0], files: this.resolve(`test/small/${small}`), meant: true, spec: true }); }
      const name = file ?? lines ?? quoted ?? held;
      // A backquoted name is meant as a spec only when one answers it (`data-way` is an attribute, `kyr-lint` a job).
      if (name && (!quoted || this.specs().has(name))) { out.push(this.named(name, true)); }
      taken.push([m.index, m.index + m[0].length]);
    }
    for (const m of status.matchAll(this.words)) {
      if (!this.inside(taken, m.index) && this.specs().has(m[0])) { out.push(this.named(m[0], false)); }
    }
    return out;
  }
  private static inside(spans: [number, number][], at: number): boolean {
    return spans.some(([a, b]) => at >= a && at < b);
  }
  private static named(name: string, meant: boolean): Cite {
    return { said: name, files: this.specs().get(name) ?? [], meant, spec: true };
  }
  // The sizes a what cell names, as width and height.
  static sizes(what: string): [string, string][] {
    return [...what.matchAll(/\b(\d{3,4}) ?[×x] ?(\d{3,4})\b/g)].map(m => [m[1]!, m[2]!]);
  }
  static findings(row: Pick<Row, 'id' | 'what' | 'status'>): Finding[] {
    const cites = this.cites(row.status), out: Finding[] = [], id = row.id;
    for (const c of cites) {
      if (c.meant && !c.files.length) { out.push({ id, kind: 'missing', detail: c.said }); }
      if (c.files.length > 1) { out.push({ id, kind: 'ambiguous', detail: `${c.said}: ${[...c.files].sort().join(', ')}` }); }
    }
    const specs = [...new Set(cites.filter(c => c.spec).flatMap(c => c.files))].filter(f => f.endsWith('.test.ts'));
    const texts = specs.map(f => readFileSync(join(this.root, f), 'utf8'));
    for (const [w, h] of this.sizes(row.what)) {
      if (!texts.some(t => this.says(t, w, h))) {
        out.push({ id, kind: 'size', detail: `${w}×${h} in no cited spec (${specs.length})` });
      }
    }
    for (const left of ClosureClauses.unanswered(row.what, row.status)) { out.push({ id, kind: 'unanswered', detail: left }); }
    if (ClosureClauses.forbids(row.what) && !texts.some(t => ClosureClauses.negative(t))) {
      out.push({ id, kind: 'negative', detail: `a rule against, and no negative assertion in a cited spec (${specs.length})` });
    }
    if (!specs.length && cites.some(c => c.said.startsWith('scripts/'))) {
      out.push({ id, kind: 'unpinned', detail: cites.filter(c => c.said.startsWith('scripts/')).map(c => c.said)
        .join(', ') });
    }
    return [...new Map(out.map(f => [this.key(f), f])).values()];
  }
  // A spec says a size when it says both its numbers (`{ width: 1280, height: 800 }`, '1280×800').
  static says(text: string, w: string, h: string): boolean {
    return new RegExp(`\\b${w}\\b`).test(text) && new RegExp(`\\b${h}\\b`).test(text);
  }
  static key(f: Finding): string { return `${f.id} ${f.kind}: ${f.detail}`; }
  // The closed rows of the register and its archive.
  static closed(): Row[] { return RegisterTickets.rows(RegisterTickets.text()).filter(r => r.state === 'closed'); }
  static all(rows: Row[] = this.closed()): Finding[] { return rows.flatMap(r => this.findings(r)); }
  static main(argv: string[]): number {
    const rows = this.closed(), found = this.all(rows), counted = found.filter(f => this.counted.includes(f.kind));
    if (argv.includes('--write')) {
      writeFileSync(join(this.root, this.baseline), `${JSON.stringify({ about: 'Closed rows whose cited evidence does '
        + 'not hold, or whose parts are unanswered (MT-17, MT-19, scripts/closure-lint.ts), kept so that none is added; each mended is taken off.',
      kinds: this.kinds(counted), findings: counted.map(f => this.key(f)) }, null, 1)}\n`);
    }
    console.log(`${rows.length} closed rows; ${new Set(counted.map(f => f.id)).size} with a finding`);
    console.log(Object.entries(this.kinds(found)).map(([k, n]) => `${n}\t${k}${k === 'unpinned' ? ' (advice)' : ''}`)
      .join('\n'));
    for (const f of found) { console.log(`  ${this.key(f)}`); }
    return 0;
  }
  static kinds(found: Finding[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const f of found) { out[f.kind] = (out[f.kind] ?? 0) + 1; }
    return out;
  }
}

if (import.meta.main) { process.exit(ClosureLint.main(process.argv.slice(2))); }
