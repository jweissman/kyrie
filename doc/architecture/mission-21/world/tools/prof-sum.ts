// Summarize a .cpuprofile: top self and inclusive (each sample counted once per distinct frame on its stack).
// usage: bun prof-sum.ts file.cpuprofile [N] [filter-regex-for-inclusive]
const [file, nArg, filt] = process.argv.slice(2);
const N = Number(nArg ?? 40);
const p = JSON.parse(await Bun.file(file!).text());
const nodes = new Map<number, any>(); for (const n of p.nodes) nodes.set(n.id, n);
const parent = new Map<number, number>(); for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const dt: number[] = p.timeDeltas; const samples: number[] = p.samples;
const key = (n: any) => `${n.callFrame.functionName || '(anon)'} ${String(n.callFrame.url).replace(/^.*\/(src|test|node_modules|doc)\//, '$1/')}:${n.callFrame.lineNumber + 1}`;
const self = new Map<string, number>(), incl = new Map<string, number>();
let total = 0;
for (let i = 0; i < samples.length; i++) {
  const d = (dt[i + 1] ?? dt[i] ?? 0) / 1000; total += d;
  let id: number | undefined = samples[i]; const seen = new Set<string>();
  const n0 = nodes.get(id!); self.set(key(n0), (self.get(key(n0)) ?? 0) + d);
  while (id !== undefined) { const k = key(nodes.get(id)); if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) ?? 0) + d); } id = parent.get(id); }
}
console.log(`total ${Math.round(total)} ms`);
const top = (m: Map<string, number>, f?: RegExp) => [...m].filter(([k]) => !f || f.test(k)).sort((a, b) => b[1] - a[1]).slice(0, N).map(([k, v]) => `${String(Math.round(v)).padStart(7)}  ${k}`).join('\n');
console.log('--- self'); console.log(top(self));
console.log('--- inclusive'); console.log(top(incl, filt ? new RegExp(filt) : /src\//));
