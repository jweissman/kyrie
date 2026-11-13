#!/usr/bin/env bun
// The architecture review of November 2026: what importing an entry point costs a fresh process, before anything is
// run (each in a process of its own, scripts/review-2026-11/import-one.ts, five times, the median; `bun -e` measured
// slower and is not used). And what it holds once imported (the heap after a GC).
//   bun scripts/review-2026-11/import-times.ts [entry…]
const entries = process.argv.slice(2).length ? process.argv.slice(2) : ['src/lang/world.ts', 'src/lang/module-parser.ts',
  'src/lang/module-compiler.ts', 'src/canon/canon.ts', 'src/content.ts', 'src/campaign/campaign.ts',
  'src/session/play-session.ts', 'src/ui/screen-model.ts', 'src/presentation/narrator.ts', 'src/world/drawn-world.ts',
  'test/support/tiny.ts', 'web/engine/engine-host.ts', 'src/cli/terminal.ts', 'src/lang/grammars.ts',
  'node_modules/deem/index.ts'];
console.log('| entry | import ms (median of 5) | heap after import MB |');
console.log('|---|---:|---:|');
for (const entry of entries) {
  const runs = Array.from({ length: 5 }, () => {
    const out = Bun.spawnSync(['bun', 'scripts/review-2026-11/import-one.ts', entry]);
    return JSON.parse(out.stdout.toString().trim().split('\n').at(-1)!) as { ms: number; heap: number };
  }).sort((a, b) => a.ms - b.ms);
  const m = runs[2]!;
  console.log(`| ${entry} | ${Math.round(m.ms)} | ${(m.heap / 2 ** 20).toFixed(0)} |`);
}
