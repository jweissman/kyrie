// Probe (review artifact). Run: bun doc/architecture/next-phase-independent-review/probes/save-growth.probe.ts
// Plays the kept wren record (334 choices) headless and reports, every 50 commands, the size of a session checkpoint
// by part and the time to take and stringify it: the cost of keeping the game after every command, as it grows.
import { readFileSync } from 'node:fs';
import { SimBench } from '../../../../scripts/sim-bench';

const lines = readFileSync('test/fixtures/descent/wren.choices', 'utf8').split('\n').filter(Boolean);
const s = await SimBench.start('wren', 'warrior');
const kb = (v: unknown) => Math.round(JSON.stringify(v).length / 1024);
const report = (n: number) => {
  const t0 = performance.now(), c = s.checkpoint(true), text = JSON.stringify(c), ms = performance.now() - t0;
  const ev = c.save.events, receipts = ev.reduce((a, e) => a + (e.resolution ? JSON.stringify(e.resolution).length : 0), 0);
  console.log(`step ${n}: checkpoint ${Math.round(text.length / 1024)} kB in ${ms.toFixed(1)} ms | module ${kb(c.save.module)} definition ${kb(c.save.definition)} world ${kb(c.save.state.world)} creatures ${kb(c.save.creatures)} events ${kb(ev)} (receipts ${Math.round(receipts / 1024)}) transcript ${kb(c.transcript)}`);
};
report(0);
for (let i = 0; i < lines.length; i += 50) {
  await (SimBench as unknown as { pass(s: unknown, l: string[], layer: string): Promise<unknown> }).pass(s, lines.slice(i, i + 50), 'B');
  report(Math.min(i + 50, lines.length));
}
