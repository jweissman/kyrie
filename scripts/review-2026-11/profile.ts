#!/usr/bin/env bun
// The architecture review of November 2026: a CPU profile (bun --cpu-prof) summed by function and by file, self and
// inclusive (each sample counted once per function on its stack, so recursion is not counted twice).
//   bun scripts/review-2026-11/profile.ts <file.cpuprofile> [top=40] [--files] [--match=<regex>]
import { readFileSync } from 'node:fs';

interface Frame { functionName: string; url: string; lineNumber: number }
interface Node { id: number; callFrame: Frame; children?: number[] }
interface Profile { nodes: Node[]; samples: number[]; timeDeltas: number[]; startTime: number; endTime: number }
const [path, topArg] = process.argv.slice(2), top = Number(topArg ?? 40) || 40;
const byFile = process.argv.includes('--files');
const match = process.argv.find(a => a.startsWith('--match='))?.slice(8);
// --callers=<regex>: samples whose leaf function matches, by the nearest caller in src/ (who called structuredClone).
const callers = process.argv.find(a => a.startsWith('--callers='))?.slice(10);
const p = JSON.parse(readFileSync(path!, 'utf8')) as Profile;
const parent = new Map<number, number>(), nodes = new Map(p.nodes.map(n => [n.id, n]));
for (const n of p.nodes) { for (const c of n.children ?? []) { parent.set(c, n.id); } }
class Frames {
  static short(url: string): string { return url.replace(/^.*\/agent-[^/]+\//, '').replace(/^.*node_modules\//, 'nm/'); }
  static key(f: Frame): string {
    return byFile ? Frames.short(f.url) || '(native)' : `${f.functionName || '(anon)'} ${Frames.short(f.url)}:${f.lineNumber + 1}`;
  }
}
const key = Frames.key.bind(Frames);
const self = new Map<string, number>(), incl = new Map<string, number>();
let total = 0;
p.samples.forEach((id, i) => {
  const dt = (p.timeDeltas[i + 1] ?? p.timeDeltas[i] ?? 0) / 1000; total += dt;
  const leaf = nodes.get(id)!; self.set(key(leaf.callFrame), (self.get(key(leaf.callFrame)) ?? 0) + dt);
  const seen = new Set<string>();
  for (let at: number | undefined = id; at !== undefined; at = parent.get(at)) {
    const k = key(nodes.get(at)!.callFrame);
    if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) ?? 0) + dt); }
  }
});
if (callers) {
  const by = new Map<string, number>(); let all = 0;
  p.samples.forEach((id, i) => {
    const dt = (p.timeDeltas[i + 1] ?? p.timeDeltas[i] ?? 0) / 1000, leaf = nodes.get(id)!.callFrame;
    if (!new RegExp(callers).test(leaf.functionName)) { return; }
    all += dt;
    let at: number | undefined = parent.get(id);
    while (at !== undefined && !/\/src\//.test(nodes.get(at)!.callFrame.url)) { at = parent.get(at); }
    const k = at === undefined ? '(none)' : key(nodes.get(at)!.callFrame);
    by.set(k, (by.get(k) ?? 0) + dt);
  });
  console.log(`${Math.round(all)} ms in ${callers}, by nearest caller in src/`);
  for (const [k, ms] of [...by].sort((a, b) => b[1] - a[1]).slice(0, top)) { console.log(`${Math.round(ms).toString().padStart(7)}   ${k}`); }
  process.exit(0);
}
const rows = [...incl].filter(([k]) => !match || new RegExp(match).test(k)).sort((a, b) => b[1] - a[1]).slice(0, top);
console.log(`total ${Math.round(total)} ms sampled`);
console.log('incl ms   self ms   function');
for (const [k, ms] of rows) { console.log(`${Math.round(ms).toString().padStart(7)} ${Math.round(self.get(k) ?? 0).toString().padStart(9)}   ${k}`); }
if (!match) {
  console.log('\nby self time');
  for (const [k, ms] of [...self].sort((a, b) => b[1] - a[1]).slice(0, top)) { console.log(`${Math.round(ms).toString().padStart(7)}   ${k}`); }
}
