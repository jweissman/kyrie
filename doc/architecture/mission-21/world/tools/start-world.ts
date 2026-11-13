// Scratch: one generated world's start, phase by phase, and an inventory of what it built (by installation).
// SEED (a1), ORIGIN (kin), TWICE=1 for a warm second start in the same process. Run from the worktree's root.
const W = process.env.W ?? process.cwd();
const t0 = performance.now();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
console.log(`${Math.round(performance.now() - t0)} ms imports`);
const seed = process.env.SEED ?? 'a1', origin = process.env.ORIGIN ?? 'kin';
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
async function once(label: string) {
  let t = performance.now();
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin, party });
  const assemble = performance.now() - t; t = performance.now();
  const steps: number[] = []; let last = performance.now();
  const s = await PlaySession.start(w.path, seed, w.source, { step: () => { const n = performance.now(); steps.push(n - last); last = n; } });
  const start = performance.now() - t;
  console.log(`${label}: assemble ${Math.round(assemble)} ms, start ${Math.round(start)} ms (${steps.length} modules; first step ${Math.round(steps[0] ?? 0)}, then ${steps.slice(1).map(Math.round).join(' ')}; settle ${Math.round(performance.now() - last)})`);
  return s;
}
const s = await once('cold');
const c = s.campaign;
const by = new Map<string, { entities: number; types: Map<string, number> }>();
for (const e of c.module.entities) {
  const m = e.id.includes('__') ? e.id.slice(0, e.id.indexOf('__')) : '(top)';
  const r = by.get(m) ?? { entities: 0, types: new Map() }; r.entities++; r.types.set(e.type, (r.types.get(e.type) ?? 0) + 1); by.set(m, r);
}
const facts = c.world.view.relations, measures = c.world.view.measures;
const factsBy = new Map<string, number>();
for (const f of facts) { const a = f.args.find(x => x.includes('__')); const m = a ? a.slice(0, a.indexOf('__')) : '(none)'; factsBy.set(m, (factsBy.get(m) ?? 0) + 1); }
const relBy = new Map<string, number>(); for (const f of facts) relBy.set(f.name, (relBy.get(f.name) ?? 0) + 1);
console.log(`installed ${c.installed.length}: ${c.installed.join(' ')}`);
console.log(`entities ${c.module.entities.length}, facts ${facts.length}, measures ${measures.length}, creatures ${c.creatures.snapshot.length ?? '?'}`);
console.log(`operators ${c.module.operators?.length}, rules ${(c.module as any).rules?.length}, queries ${c.module.queries?.length}, relations ${c.module.relations?.length}`);
for (const [m, r] of [...by].sort((a, b) => b[1].entities - a[1].entities).slice(0, 30)) {
  console.log(`  ${m.padEnd(28)} ${String(r.entities).padStart(5)} entities  ${String(factsBy.get(m) ?? 0).padStart(6)} facts  ${[...r.types].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}
console.log('top relations: ' + [...relBy].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k} ${v}`).join(', '));
if (process.env.TWICE) { await once('warm'); }
console.log(`rss ${Math.round(process.memoryUsage().rss / 1e6)} MB`);
