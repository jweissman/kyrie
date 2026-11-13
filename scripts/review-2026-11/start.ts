#!/usr/bin/env bun
// The architecture review of November 2026 (doc/history/reviews/architecture-review-2026-11.md): one start at a
// scale, timed phase by phase, with what it crossed (src/costs.ts), for a CPU profile to be taken of it; and, after
// each, the heap still held once it is let go (Campaign's LoadCache keeps the first campaign of each source).
//   bun scripts/review-2026-11/start.ts full|scenario|tiny [--twice|--thrice] [--seed=<a world seed>]
//   bun --cpu-prof --cpu-prof-dir=<dir> scripts/review-2026-11/start.ts full
import { Costs } from '../../src/costs';

const scale = process.argv[2] ?? 'full', args = process.argv.slice(3);
const rounds = args.includes('--thrice') ? 3 : args.includes('--twice') ? 2 : 1;
const seed = args.find(a => a.startsWith('--seed='))?.slice(7) ?? 'a1';
const t0 = performance.now();
const { ReviewScales } = await import('./scales');
const { ScreenModel } = await import('../../src/ui/screen-model');
const { Narrator } = await import('../../src/presentation/narrator');
const imported = performance.now() - t0;
for (let round = 0; round < rounds; round++) {
  const mark = Costs.mark(), t = performance.now();
  let session: Awaited<ReturnType<typeof ReviewScales.start>> | undefined = await ReviewScales.start(scale, seed);
  const started = performance.now();
  const screen = ScreenModel.build(session.campaign), built = performance.now();
  Narrator.leaf(session.campaign, screen);
  const done = performance.now();
  session = undefined; Bun.gc(true);
  const heldMB = Math.round(process.memoryUsage().heapUsed / 2 ** 20);
  console.log(JSON.stringify({ scale, seed, round, importMs: Math.round(imported), startMs: Math.round(started - t),
    screenMs: Math.round(built - started), leafMs: Math.round(done - built),
    rss: Math.round(process.memoryUsage().rss / 2 ** 20), heldMB, costs: Costs.said(Costs.since(mark)) }));
}
