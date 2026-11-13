#!/usr/bin/env bun
// The architecture review of November 2026: which layer imports which, by the value imports of every file in src/ and
// web/ (read with the TypeScript parser; `import type` and type-only specifiers left out, since they cost nothing at
// run time). The edges that go the wrong way for a kernel → setting → scenario → presentation layering are listed
// with the files that make them.
//   bun scripts/review-2026-11/layers.ts [--edges=<from>:<to>]
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import ts from 'typescript';

class Layers {
  static files(dir: string): string[] {
    return readdirSync(dir).flatMap(n => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? Layers.files(p) : /\.tsx?$/.test(n) && !n.endsWith('.d.ts') ? [p] : [];
    });
  }
  static layer(p: string): string {
    if (p.startsWith('data/')) { return 'data'; }
    const parts = p.split('/');
    if (parts[0] === 'web') { return parts.length > 2 ? `web/${parts[1]}` : 'web'; }
    return parts.length > 2 ? `src/${parts[1]}` : 'src/(root)';
  }
  static resolve(from: string, spec: string): string | undefined {
    if (!spec.startsWith('.')) { return undefined; }
    const base = normalize(join(dirname(from), spec));
    return ['', '.ts', '.tsx', '/index.ts'].map(x => base + x).find(existsSync);
  }
  // Whether a statement imports a value (a type-only import costs nothing at run time).
  static value(s: ts.ImportDeclaration | ts.ExportDeclaration): boolean {
    if (ts.isExportDeclaration(s)) { return !s.isTypeOnly; }
    if (s.importClause?.isTypeOnly) { return false; }
    const named = s.importClause?.namedBindings;
    return !(named && ts.isNamedImports(named) && named.elements.length && named.elements.every(e => e.isTypeOnly)
      && !s.importClause?.name);
  }
}
const { files, layer, resolve } = { files: Layers.files.bind(Layers), layer: Layers.layer.bind(Layers),
  resolve: Layers.resolve.bind(Layers) };
const edges = new Map<string, Map<string, string[]>>();
for (const file of [...files('src'), ...files('web')]) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, false);
  for (const s of source.statements) {
    if ((!ts.isImportDeclaration(s) && !ts.isExportDeclaration(s)) || !Layers.value(s)) { continue; }
    const spec = s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier) ? s.moduleSpecifier.text : undefined;
    const to = spec && resolve(file, spec);
    if (!to) { continue; }
    const a = layer(file), b = layer(to);
    if (a === b) { continue; }
    const row = edges.get(a) ?? new Map<string, string[]>();
    row.set(b, [...row.get(b) ?? [], `${file} → ${to}`]); edges.set(a, row);
  }
}
const asked = process.argv.find(x => x.startsWith('--edges='))?.slice(8);
if (asked) {
  const [a, b] = asked.split(':');
  for (const e of edges.get(a!)?.get(b!) ?? []) { console.log(e); }
  process.exit(0);
}
// The layering the review proposes, lowest first: a layer may import only those below it.
const rank: Record<string, number> = { 'src/lang': 0, 'src/information': 0, 'src/(root)': 1, 'src/canon': 1,
  'src/rules': 1, 'data': 1, 'src/campaign': 2, 'src/session': 3, 'src/world': 3, 'src/narrative': 4,
  'src/presentation': 4, 'src/paintings': 4, 'src/ui': 4, 'src/autoplay': 5, 'src/cli': 5, 'src/handbook': 5,
  'src/registry': 5, 'web/engine': 5, 'web/reader': 6, 'web/compositions': 6, 'web': 5 };
console.log('| from | to | value imports | upward? |');
console.log('|---|---|---:|---|');
const rows = [...edges].flatMap(([a, row]) => [...row].map(([b, list]) => ({ a, b, n: list.length })))
  .sort((x, y) => y.n - x.n);
for (const r of rows) {
  const up = (rank[r.b] ?? 9) > (rank[r.a] ?? 9) ? 'upward' : (rank[r.b] ?? 9) === (rank[r.a] ?? 9) ? 'across' : '';
  if (r.n >= 3 || up) { console.log(`| ${r.a} | ${r.b} | ${r.n} | ${up} |`); }
}
