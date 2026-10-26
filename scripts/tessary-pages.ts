import { readFileSync, writeFileSync } from 'node:fs';
import { Journey } from '../src/session/journey';

// Writes a journey of What Tessary Owes as the page tells it, step by step, for reading as a player would
// (doc/adventures/what-tessary-owes/playtest). Usage: bun scripts/tessary-pages.ts <fixture> <seed> <out.md>
const [name = 'release', seed = 'tessary', out = `doc/adventures/what-tessary-owes/playtest/${name}.md`] = process.argv.slice(2);
const phases = JSON.parse(readFileSync(`test/fixtures/tessary/${name}.json`, 'utf8')) as Record<string, string[]>;
const j = await Journey.start('data/campaigns/what-tessary-owes.campaign.json', seed);
const lines = [`# What Tessary Owes, played: ${name} (seed ${seed})`, '',
  'Each step as the page tells it: the choice taken, then what the page said. Waits that told nothing are left out.', ''];
for (const [phase, steps] of Object.entries(phases)) {
  lines.push(`## ${phase}`, '');
  for (const step of steps) {
    const before = j.taken.length;
    try { await j.step(step); } catch (e) { lines.push(`> **stopped:** ${(e as Error).message.slice(0, 300)}`, ''); break; }
    for (const t of j.taken.slice(before)) {
      const page = `${t.page}`.trim();
      if (!page || /^(Time passes|An hour passes)\.?$/.test(page)) { continue; }
      lines.push(`**${t.label}** — ${page}`, '');
    }
  }
}
writeFileSync(out, lines.join('\n'));
console.log(`wrote ${out}: ${lines.length} lines`);
