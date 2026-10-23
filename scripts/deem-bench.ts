#!/usr/bin/env bun
// Times Deem generation as Kyr uses it, each cost on its own: a cold start (reading and building the setting and the
// first creature, as the public CLI does), warm generation in a running Kyr (per creature, by family), the same with
// an execution trace recorded, and serializing what was generated.
// Usage: bun scripts/deem-bench.ts [--json] [--count n]
import { runGeneration } from 'deem';
import { Content } from '../src/content';

class DeemBench {
  static readonly families = ['dragon', 'animal', 'humanoid', 'construct'];
  static rows: { label: string; ms: number; note?: string }[] = [];
  static time<T>(label: string, work: () => T, note?: (result: T) => string): T {
    const start = performance.now(), result = work();
    this.rows.push({ label, ms: performance.now() - start, ...(note ? { note: note(result) } : {}) });
    return result;
  }
  static run(count: number) {
    // Cold: the public CLI reads the split setting folder, builds it and generates one creature, untraced then traced.
    this.time('cold: CLI load + first creature', () => runGeneration({ settingDir: process.cwd(), scenario: 'generation',
      type: 'creature', seed: 'bench', trace: false }));
    this.time('cold: CLI, traced', () => runGeneration({ settingDir: process.cwd(), scenario: 'generation',
      type: 'creature', seed: 'bench', trace: true }), r => `${r.trace.length} trace events`);
    const content = this.time('warm: runtime bootstrap', () => new Content('bench'));
    content.createCreature('warmup', { family: 'dragon' });
    const made: unknown[] = [];
    for (const family of this.families) {
      const total = this.time(`warm: ${count} × ${family}`, () => {
        for (let i = 0; i < count; i++) { made.push(content.createCreature(`${family}-${i}`, { family })); }
        return count;
      });
      const row = this.rows.at(-1)!;
      row.note = `${(row.ms / total).toFixed(2)} ms each`;
    }
    this.time(`traced: ${count} creatures (CLI)`, () => {
      let events = 0;
      for (let i = 0; i < count; i++) {
        events += runGeneration({ settingDir: process.cwd(), scenario: 'generation', type: 'creature',
          seed: `bench-${i}`, trace: true }).trace.length;
      }
      return events;
    }, events => `${(events / count).toFixed(0)} events each`);
    this.time(`untraced: ${count} creatures (CLI)`, () => {
      for (let i = 0; i < count; i++) {
        runGeneration({ settingDir: process.cwd(), scenario: 'generation', type: 'creature', seed: `bench-${i}` });
      }
    });
    const text = this.time(`serialize: ${made.length} creatures`, () => JSON.stringify(made), t => `${t.length} bytes`);
    this.time(`parse: ${made.length} creatures`, () => JSON.parse(text) as unknown[]);
  }
}
const at = process.argv.indexOf('--count');
DeemBench.run(at >= 0 ? Number(process.argv[at + 1]) : 100);
if (process.argv.includes('--json')) { console.log(JSON.stringify(DeemBench.rows)); }
else {
  for (const { label, ms, note } of DeemBench.rows) {
    console.log(`${label.padEnd(34)} ${ms.toFixed(1).padStart(9)} ms${note ? `  (${note})` : ''}`);
  }
}
