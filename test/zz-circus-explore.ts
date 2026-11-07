import { Journey } from '../src/session/journey';
import { readFileSync } from 'node:fs';
const lines = readFileSync(process.argv[2]!, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const quiet = process.argv.includes('--quiet');
const j = await Journey.start('test/fixtures/circus/circus.campaign.json', 'p4');
for (const s of lines) {
  try {
    if (s.startsWith('!')) {
      const [d, ...a] = s.slice(1).split(/\s+/);
      if (d === 'give') { j.give(a[0]!); } else if (d === 'put') { j.put(a[0]!, a[1]!); } else if (d === 'cm') { (j as any).assert('circus__' + a[0], ...a.slice(1).map((x: string) => x === 'party' ? x : 'circus__' + x)); } else if (d === 'coin') { j.coin(+a[0]!); }
      else if (d === 'assert') { j.assert(a[0]!, ...a.slice(1)); } else if (d === 'roll') { j.roll(a[0] as 'pass' | 'fail'); }
      else if (d === 'wait') { const t = await j.step(a.join(' ') || 'Wait › An hour'); if (!quiet) { console.log(`[wait] ${t.replace(/\s+/g, ' ').slice(0, 500)}`); } }
      else if (d === 'show') { console.log('CHOICES', j.choices().map(c => (/^Take/.test(c.label) ? (c as any).full : c.label)).filter(l => !/Give to|Set down|prepare spells|^Wait|Dori: Prepare|Pack ›|: Light$/.test(l)).join(' | ').slice(0, 2500)); }
      else if (d === "told") { const t = (j as any).taken.at(-1); console.log("TOLD", t.told.replace(/\s+/g, " ").slice(0, 2500)); console.log("EVENT", JSON.stringify(t.event).slice(0, 2500)); } else if (d === "rel") { console.log('REL', a.join(' '), JSON.stringify((j as any).campaign.world.related(a[0]!, a[1]!))); } else if (d === 'un') { const c2 = (j as any).named(a[0]!.startsWith('circus__') ? a[0]! : 'circus__' + a[0]!, a.slice(1).map((x: string) => x === 'party' ? x : 'circus__' + x)); (j as any).campaign.commitWorld((j as any).campaign.world.apply([{ kind: 'retract', call: c2 }])); } else if (d === "measure") { console.log("MEASURE", a.join(" "), j.measure(a[0]!, ...a.slice(1))); } else if (d === "holds") { console.log(`HOLDS ${a.join(' ')}:`, j.holds(a[0]!, ...a.slice(1))); }
      continue;
    }
    const t = await j.step(s);
    console.log(`[${s}] ${t.replace(/\s+/g, ' ').slice(0, quiet ? 260 : 3000)}`);
  } catch (e) { console.log(`!! ${s}: ${(e as Error).message.slice(0, 600)}`); break; }
}
console.log('AT', j.at('party'), 'GOLD', j.measure('quantity', 'party', 'gold'));
console.log('CHOICES', j.choices().map(c => (/^Take/.test(c.label) ? (c as any).full : c.label)).filter(l => !/Give to|Set down|prepare spells|^Wait|Dori: Prepare|Pack ›|: Light$/.test(l)).join(' | ').slice(0, 2500));
