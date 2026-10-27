#!/usr/bin/env bun
// Plays The Liberty of the Ice's journeys by the labels a player sees and writes each out as the page told it, step by
// step, to doc/adventures/liberty-of-the-ice/playtest (the evidence its report quotes). The journeys are the fixtures
// test/liberty-of-the-ice*.test.ts asserts; waits that tell nothing are counted, not repeated.
import { writeFile, mkdir } from 'node:fs/promises';
import type { CreatureGenerationContext } from '../src/content';
import { Pellam, home, steps } from '../test/support/pellam';
import { ScreenModel } from '../src/ui/screen-model';

const out = 'doc/adventures/liberty-of-the-ice/playtest';
type Told = { file: string; title: string; fixture: string; party?: CreatureGenerationContext[] };
const journeys: Told[] = [
  { file: 'long-con.md', title: 'The Front Door: the Squire of Hawsfold, to the Long Con', fixture: 'long' },
  { file: 'ring.md', title: 'The Ring: hired, and out down the Reach on the first night', fixture: 'ring', party: Pellam.one('warrior', 'laborer') },
  { file: 'unswearing.md', title: 'Mr. Icicle\'s key, the Liars\' Bench, Callow\'s third answer, and the Unswearing', fixture: 'unswearing', party: Pellam.one('mage', 'scholar') },
  { file: 'score.md', title: 'The Score: the half, and out past Harker\'s man', fixture: 'score', party: Pellam.one('thief', 'cutpurse') },
  { file: 'pillory.md', title: 'The Pillory: the real shepherd of Hawsfold', fixture: 'pillory' },
  { file: 'flock.md', title: 'The Flock That Was', fixture: 'flock' },
  { file: 'sold.md', title: 'Five Coin a Head', fixture: 'sold' },
  { file: 'ursel.md', title: 'Ursel Cobb: the Flashes, her brother, and a hand landed', fixture: 'ursel', party: Pellam.one('thief', 'cutpurse') },
  { file: 'alone.md', title: 'Nothing done: Landed', fixture: 'alone' },
];
class Telling {
  static name(g: Pellam, id: string): string { return g.j.campaign.module.entities.find(e => e.id === id)?.name ?? id; }
  // A step the journey took by routing (go:room) is shown as the way it went, by the passage's own name.
  static shown(g: Pellam, label: string): string {
    const m = /^@go\(([^,]+),([^)]+)\)$/.exec(label);
    return m ? `By ${this.name(g, m[1] ?? '')}, to ${this.name(g, m[2] ?? '')}` : label;
  }
}
await mkdir(out, { recursive: true });
for (const { file, title, fixture, party } of journeys) {
  const g = await Pellam.start(home, 'lisk', party);
  const opening = ScreenModel.build(g.j.campaign).prose.join(' ');
  try { await g.play(...steps(fixture)); } catch (e) { if (g.running) { throw e; } }
  const lines: string[] = ['*(The first page)*', '', opening, ''];
  let quiet = 0;
  for (const t of g.j.taken) {
    const said = t.page.trim();
    if (/^Wait/.test(t.label) && (!said || /^(An hour passes|Time passes)\.$/.test(said))) { quiet++; continue; }
    if (quiet) { lines.push(`*(${quiet} ${quiet === 1 ? 'wait' : 'waits'} in which nothing is told)*`, ''); quiet = 0; }
    lines.push(`**${Telling.shown(g, t.label)}**`, '', said || '*(nothing is told)*', '');
  }
  const ending = g.j.campaign.module.entities.find(e => e.type === 'ending' && g.j.holds('reached', e.id));
  const who = party?.[0] ? `, a ${party[0].classId} (${party[0].backgroundId})` : ', the bard of the title page';
  await writeFile(`${out}/${file}`, [`# ${title}`, '', `Seed \`lisk\`${who}; fixture \`${fixture}\`; ${g.j.taken.length} steps; ` +
    `ended at watch ${g.watch}${ending ? `, at the ending "${ending.name}"` : ''}; ${g.experience()} experience in all. Written by ` +
    '`bun scripts/liberty-of-the-ice-transcripts.ts` from the journey as the page told it.', '', ...lines].join('\n'));
  console.log(file, g.j.taken.length, ending?.name ?? '-');
}
