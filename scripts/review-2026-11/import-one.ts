#!/usr/bin/env bun
// The architecture review of November 2026: one entry imported by a fresh process from a file (not `bun -e`, whose
// imports measured slower), timed, with the heap it holds after a GC. Used by import-times.ts.
//   bun scripts/review-2026-11/import-one.ts src/lang/module-parser.ts
const entry = process.argv[2]!;
const t = performance.now();
await import(`../${entry}`);
const ms = performance.now() - t;
Bun.gc(true);
console.log(JSON.stringify({ ms, heap: process.memoryUsage().heapUsed }));
