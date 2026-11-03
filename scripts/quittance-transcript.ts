import { writeFileSync } from 'node:fs';
import { Journey } from '../src/session/journey';
import { campaign } from '../test/support/quittance';

// Plays a scenario by the labels a player sees and writes what the page told, step by step, with the facts asked of the
// world at the end. Usage: bun scripts/quittance-transcript.ts <scenario.json> <out.md>
// A scenario: { title, seed, party?, steps: string[], probes?: string[] (e.g. "quittance__aliased party", "#quittance__regard quittance__lamprey") }
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.error('usage: scenario.json out.md'); process.exit(2); }
const sc = JSON.parse(await Bun.file(file).text()) as { title: string; note?: string; seed: string; party?: any[]; steps: string[]; probes?: string[] };
const j = await Journey.start(campaign, sc.seed, sc.party ? { party: sc.party } : {});
const lines = [`# ${sc.title}`, '', sc.note ?? '', '', `Seed \`${sc.seed}\`. Played by the labels a player sees; each block is the page's telling of the step.`, ''];
let n = 0;
for (const step of sc.steps) {
  const from = j.taken.length;
  try { await j.step(step); } catch (e) { lines.push(`**Step ${++n}: \`${step}\` — not taken:** ${String(e).split('\n')[0]}`, ''); continue; }
  for (const t of j.taken.slice(from)) {
    lines.push(`**${++n}. ${t.label.replace(/ · .*$/, '')}** _(watch ${j.watch()}, ${j.at('party')?.replace('quittance__', '')})_`, '', '> ' + t.page.replace(/\n/g, '\n> '), '');
  }
}
lines.push('## State at the end', '');
for (const p of sc.probes ?? []) {
  const [name, ...args] = p.trim().split(/\s+/);
  lines.push(`- \`${p}\`: ${name!.startsWith('#') ? j.measure(name!.slice(1), ...args) : j.holds(name!, ...args) ? 'yes' : 'no'}`);
}
writeFileSync(out, lines.join('\n') + '\n');
console.log(`wrote ${out} (${n} steps)`);
