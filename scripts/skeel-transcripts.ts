import { readFileSync, writeFileSync } from 'node:fs';
import { Journey } from '../src/session/journey';

// Writes the play transcripts of Fair Weather (doc/adventures/fair-weather/playtest), one per journey of
// test/fixtures/skeel, each step as the page told it. Run: bun scripts/skeel-transcripts.ts
const runs: [string, string, string][] = [
  ['pilots', 's1', 'The Pilots: the long road, by the tide, to the Rutter on the table'],
  ['living', 's1', 'A Living Thing: the dog up the loft'],
  ['exposed', 's1', 'The Light in the Pulpit: the boy points'],
  ['kerensa', 's1', 'Asked in the loft: Kerensa stands'],
  ['godson', 's1', 'The Godson, sent: he rows out to her alone'],
  ['eyes', 's1', "Loveday's eyes: the crate, the spectacles, the oil"],
  ['share', 's1', "A Stranger's Share: the offer taken"],
  ['craigs', 's1', 'The Craigs: Piran, the Pulpit, the Supper'],
  ['away', 'reach', 'Wreck, While You Were Away: never going down into Skeel'],
];
for (const [name, seed, title] of runs) {
  const f = JSON.parse(readFileSync(`test/fixtures/skeel/${name}.json`, 'utf8')) as Record<string, string[]>;
  const j = await Journey.start('data/campaigns/skeel.campaign.json', seed);
  const out = [`# ${title}`, '', `*Seed \`${seed}\`; steps \`test/fixtures/skeel/${name}.json\`; the standalone campaign, one protagonist (Tamar, a human ranger). Each step is the choice taken, then what the page said. Waits that told nothing are left out.*`, ''];
  for (const [phase, steps] of Object.entries(f)) {
    out.push(`## ${phase}`, '');
    for (const step of steps) {
      const before = j.taken.length;
      await j.play(step);
      for (const t of j.taken.slice(before)) {
        if (/^Wait/.test(t.label) && /^(Time passes|An hour passes)\.?$/.test(t.page.trim())) { continue; }
        out.push(`**${t.label}**${t.chapter ? ` *(chapter: ${t.chapter})*` : ''}`, '', t.page.trim(), '');
      }
      if (!j.campaign.running) { break; }
    }
  }
  const reached = j.campaign.world.related('reached').map(r => r.args[0]).join(', ');
  out.push('---', '', `Ending reached: \`${reached || 'none'}\`.`, '');
  writeFileSync(`doc/adventures/fair-weather/playtest/${name}.md`, out.join('\n'));
  console.log(name, reached);
}
