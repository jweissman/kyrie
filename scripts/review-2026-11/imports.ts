#!/usr/bin/env bun
// The architecture review of November 2026: what an entry point's static import graph draws in, from the metafile
// `bun build <entry> --target=bun --metafile=<file>` writes. Files and bytes by layer; the data files imported at
// module load (JSON bundled into the code, read whether or not the caller needs them); the packages left external;
// and the shortest chain of imports from the entry to each layer it ought not to need.
//   bun build src/lang/module-parser.ts --target=bun --metafile=/tmp/m.json --outdir=/tmp/out
//   bun scripts/review-2026-11/imports.ts /tmp/m.json [entry]
import { readFileSync } from 'node:fs';

interface Input { bytes: number; imports: { path: string; kind: string; external?: boolean }[] }
const [file, given] = process.argv.slice(2);
const meta = JSON.parse(readFileSync(file!, 'utf8')) as { inputs: Record<string, Input> };
const inputs = meta.inputs, paths = Object.keys(inputs);
const entry = given ?? paths.find(p => !paths.some(q => inputs[q]!.imports.some(i => i.path === p)))!;
class Graph {
  static layer(p: string): string {
    if (p.startsWith('data/')) { return p.split('/').slice(0, 2).join('/'); }
    if (p.startsWith('node_modules/')) { return `node_modules/${p.split('/')[1]}`; }
    if (p.startsWith('src/')) { return p.split('/').length > 2 ? p.split('/').slice(0, 2).join('/') : 'src/*.ts (root)'; }
    return p.split('/')[0]!;
  }
  // The path from the entry to a file, by the first import that reached it.
  static chain(previous: Map<string, string | undefined>, p: string): string[] {
    const out = [];
    for (let at: string | undefined = p; at; at = previous.get(at)) { out.unshift(at); }
    return out;
  }
}
const layer = Graph.layer.bind(Graph);
const by = new Map<string, { files: number; bytes: number }>();
for (const p of paths) {
  const l = layer(p), r = by.get(l) ?? { files: 0, bytes: 0 };
  r.files++; r.bytes += inputs[p]!.bytes; by.set(l, r);
}
const total = paths.reduce((n, p) => n + inputs[p]!.bytes, 0);
console.log(`${entry}: ${paths.length} files, ${(total / 1024).toFixed(0)} KB`);
for (const [l, r] of [...by].sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`  ${l.padEnd(28)} ${r.files.toString().padStart(4)} files ${(r.bytes / 1024).toFixed(0).padStart(6)} KB`);
}
const json = paths.filter(p => p.endsWith('.json') && !p.startsWith('node_modules/'));
const jsonKB = json.reduce((n, p) => n + inputs[p]!.bytes, 0) / 1024;
console.log(`  data read at import: ${json.length} JSON files, ${jsonKB.toFixed(0)} KB`);
const external = new Set(paths.flatMap(p => inputs[p]!.imports.filter(i => i.external).map(i => i.path)));
console.log(`  external: ${[...external].sort().join(', ')}`);
// The shortest chain from the entry to the first file of each layer.
const previous = new Map<string, string | undefined>([[entry, undefined]]), queue = [entry];
while (queue.length) {
  const at = queue.shift()!;
  for (const i of inputs[at]?.imports ?? []) {
    if (!i.external && inputs[i.path] && !previous.has(i.path)) { previous.set(i.path, at); queue.push(i.path); }
  }
}
const chain = Graph.chain.bind(Graph, previous);
const reached = new Map<string, string>();
for (const p of previous.keys()) {
  const l = layer(p);
  if (!reached.has(l) || chain(p).length < chain(reached.get(l)!).length) { reached.set(l, p); }
}
console.log('  shortest chain to each layer:');
for (const [l, p] of [...reached].sort()) {
  if (l === layer(entry)) { continue; }
  console.log(`    ${l}: ${chain(p).join(' → ')}`);
}
