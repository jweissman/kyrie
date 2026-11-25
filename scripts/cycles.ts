#!/usr/bin/env bun
// The folders' dependency cycles, mechanically held (MT-29 (c); the architectural review of 20 November, Finding B and
// Stage 0: "check in a dependency graph baseline and reject new cycles"; the largest, src/ui and src/presentation,
// 33 value imports one way and 49 the other). Beside the layers' upward edges (scripts/layers.ts), the cycles within
// a layer: each folder of src (and web/engine) a unit, joined by the value imports between them (a type's import is
// erased and joins nothing at run time); folders that reach each other make a cycle, and every import from one of its
// folders to another is an edge of it. Today's are kept in doc/architecture/mission-22/cycles-baseline.json, which
// test/small/cycles lets only shrink, as the layers' baseline does.
//   bun scripts/cycles.ts            the cycles, each by its folders, with the imports between them counted
//   bun scripts/cycles.ts --write    the baseline written from today's edges
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';

export class Cycles {
  static readonly root = join(import.meta.dir, '..');
  static readonly baseline = 'doc/architecture/mission-22/cycles-baseline.json';
  static readonly seen = ['src', 'web/engine'];
  // The unit a file is of: its folder under src (a file directly in src is the runtime's root, "src"), or web/engine.
  static unit(path: string): string | undefined {
    if (path.startsWith('web/engine/')) { return 'web/engine'; }
    const m = /^src\/([^/]+)\//.exec(path);
    return m ? `src/${m[1]}` : /^src\/[^/]+$/.test(path) ? 'src' : undefined;
  }
  // Every value import between two units, as "from -> to" by file.
  static imports(): string[] {
    const out = new Set<string>();
    for (const file of this.seen.flatMap(d => this.files(join(this.root, d)))) {
      const rel = relative(this.root, file), from = this.unit(rel);
      for (const spec of this.specs(readFileSync(file, 'utf8'))) {
        const target = normalize(join(dirname(rel), spec)).replace(/\.(tsx?|js)$/, '');
        const to = this.unit(`${target}.ts`);
        if (from && to && to !== from) { out.add(`${rel} -> ${target}`); }
      }
    }
    return [...out].sort();
  }
  // The imports within a cycle: from a unit to another that reaches it back (the folders' strongly connected parts).
  static edges(imports = this.imports()): string[] {
    const graph = new Map<string, Set<string>>();
    for (const e of imports) {
      const [a, b] = this.ends(e);
      graph.set(a, (graph.get(a) ?? new Set()).add(b));
    }
    return imports.filter(e => { const [a, b] = this.ends(e); return this.reaches(graph, b, a); });
  }
  // Each cycle's folders, with the count of its imports each way between two of them.
  static kinds(edges: string[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const e of edges) { const [a, b] = this.ends(e), k = `${a} -> ${b}`; out[k] = (out[k] ?? 0) + 1; }
    return out;
  }
  private static ends(edge: string): [string, string] {
    const [a, b] = edge.split(' -> ') as [string, string];
    return [this.unit(a)!, this.unit(`${b}.ts`)!];
  }
  private static reaches(graph: Map<string, Set<string>>, from: string, to: string): boolean {
    const seen = new Set<string>(), todo = [from];
    while (todo.length) {
      const at = todo.pop()!;
      if (at === to) { return true; }
      if (seen.has(at)) { continue; }
      seen.add(at);
      todo.push(...graph.get(at) ?? []);
    }
    return false;
  }
  // Imported for its values: from, when wanted, or for what loading it does; never `import type` nor `export type`.
  // At a line's start, or after another import on the same line.
  private static readonly importing = new RegExp([
    `(?:^|;[ \\t]*)(?:import|export)\\s+(?!type\\b)[^'"]*?from\\s+['"](\\.[^'"]+)['"]`,
    `import\\(\\s*['"](\\.[^'"]+)['"]`, `(?:^|;[ \\t]*)import\\s+['"](\\.[^'"]+)['"]`].join('|'), 'gm');
  private static specs(text: string): string[] {
    return [...text.matchAll(this.importing)].map(m => (m[1] ?? m[2] ?? m[3])!);
  }
  private static files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? this.files(join(dir, d.name))
      : /\.tsx?$/.test(d.name) && !d.name.endsWith('.d.ts') ? [join(dir, d.name)] : []);
  }
  static main(argv: string[]): number {
    const edges = this.edges();
    if (argv.includes('--write')) {
      writeFileSync(join(this.root, this.baseline), `${JSON.stringify({ about: 'Value imports within a cycle between '
        + 'folders (MT-29, scripts/cycles.ts), kept so that none is added; each removed is taken off.',
      kinds: this.kinds(edges), edges }, null, 1)}\n`);
    }
    console.log(Object.entries(this.kinds(edges)).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}\t${k}`).join('\n'));
    console.log(`${edges.length} edges in cycles`);
    return 0;
  }
}

if (import.meta.main) { process.exit(Cycles.main(process.argv.slice(2))); }
