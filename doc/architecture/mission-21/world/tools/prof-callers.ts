// For samples whose leaf frame matches LEAF, the nearest K src/ frames above it (a caller chain), summed.
// usage: bun prof-callers.ts file.cpuprofile LEAF-regex [K=2] [N=25]
const [file, leaf, kArg, nArg] = process.argv.slice(2);
const K = Number(kArg ?? 2), N = Number(nArg ?? 25), re = new RegExp(leaf!);
const p = JSON.parse(await Bun.file(file!).text());
const nodes = new Map<number, any>(); for (const n of p.nodes) nodes.set(n.id, n);
const parent = new Map<number, number>(); for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const key = (n: any) => `${n.callFrame.functionName || '(anon)'} ${String(n.callFrame.url).replace(/^.*\/(src|test|node_modules)\//, '$1/')}:${n.callFrame.lineNumber + 1}`;
const out = new Map<string, number>(); let tot = 0;
for (let i = 0; i < p.samples.length; i++) {
  const d = (p.timeDeltas[i + 1] ?? 0) / 1000; let id: number | undefined = p.samples[i];
  // the leaf matches anywhere on the stack: take the first frame matching, then K src frames above it
  let hit: number | undefined; let j = id; while (j !== undefined) { if (re.test(key(nodes.get(j)))) { hit = j; break; } j = parent.get(j); }
  if (hit === undefined) continue; tot += d;
  const chain: string[] = []; let k = parent.get(hit);
  while (k !== undefined && chain.length < K) { const kk = key(nodes.get(k)); if (/src\//.test(kk) && !/node_modules/.test(String(nodes.get(k).callFrame.url))) chain.push(kk); k = parent.get(k); }
  const c = chain.join(' < '); out.set(c, (out.get(c) ?? 0) + d);
}
console.log(`matched ${Math.round(tot)} ms`);
for (const [c, v] of [...out].sort((a, b) => b[1] - a[1]).slice(0, N)) console.log(`${String(Math.round(v)).padStart(7)}  ${c}`);
