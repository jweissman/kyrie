import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { readFileSync } from 'node:fs';
const lines = readFileSync(process.argv[2]!, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const quiet = process.argv.includes('--quiet');
const P = (x: string) => x === 'party' ? x : (x.startsWith('pentrice__') ? x : 'pentrice__' + x);
const j = await Journey.start('test/fixtures/gosse/city.campaign.json', 'kp');
const jj = j as any;
for (const s of lines) {
  try {
    if (s.startsWith('!')) {
      const [d, ...a] = s.slice(1).split(/\s+/);
      if (d === 'cm') { j.assert(P(a[0]!), ...a.slice(1).map(P)); }
      else if (d === 'un') { const c = jj.named(P(a[0]!), a.slice(1).map(P)); jj.campaign.commitWorld(jj.campaign.world.apply([{ kind: 'retract', call: c }])); }
      else if (d === 'set') { jj.campaign.commitWorld(jj.campaign.world.apply([{ kind: 'set', call: ModuleWriter.call(P(a[0]!), ...a.slice(1, -1).map(P)), value: ModuleWriter.number(Number(a.at(-1))) }])); }
      else if (d === 'put') { j.put(P(a[0]!), P(a[1]!)); }
      else if (d === 'give') { j.give(P(a[0]!)); } else if (d === 'roll') { j.roll(a[0] as 'pass' | 'fail'); }
      else if (d === 'holds') { console.log(`HOLDS ${a.join(' ')}:`, j.holds(P(a[0]!), ...a.slice(1).map(P))); }
      else if (d === 'knows') { console.log(`KNOWS ${a[0]}:`, j.holds('knows', 'party', P(a[0]!))); }
      else if (d === 'measure') { console.log('MEASURE', a.join(' '), j.measure(P(a[0]!), ...a.slice(1).map(P))); }
      else if (d === 'show') { console.log('CHOICES', j.choices().map(c => c.label).filter(l => !/Give to|Set down|prepare spells|^Wait|Pack ›|: Light$|^Search|Examine/.test(l)).join(' | ').slice(0, 3000)); }
      continue;
    }
    const t = await j.step(s);
    console.log(`[${s}] ${t.replace(/\s+/g, ' ').slice(0, quiet ? 240 : 1500)}`);
  } catch (e) { console.log(`!! ${s}: ${(e as Error).message.slice(0, 700)}`); break; }
}
console.log('AT', j.at('party'), 'GOLD', j.measure('quantity', 'party', 'gold'));
