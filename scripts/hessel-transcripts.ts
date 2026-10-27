#!/usr/bin/env bun
// Plays The Banns at Hessel's journeys (the step files in test/fixtures/hessel) by the labels a player sees, waits out
// the Season, and writes each out as the page told it to doc/adventures/banns-at-hessel/playtest: the evidence its
// editorial assessment quotes. Waits that tell nothing are counted, not repeated.
import { writeFile, mkdir } from 'node:fs/promises';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Hessel, build, alone as bard } from '../test/support/hessel';

const out = 'doc/adventures/banns-at-hessel/playtest';
const journeys: { file: string; title: string; who: string; campaign: string; seed: string; steps: string }[] = [
  { file: 'alone.md', title: 'Left Alone', who: 'Tamsin, a bard', campaign: bard, seed: 'h1', steps: 'alone' },
  { file: 'rooms.md', title: 'The Rooms', who: 'Tamsin, a bard', campaign: bard, seed: 'h1', steps: 'rooms' },
  { file: 'rooms-soldier.md', title: 'The Rooms, without the gifts', who: 'Dick, a soldier', campaign: build('soldier'), seed: 'h1', steps: 'rooms' },
  { file: 'oldtown.md', title: 'The Old Town', who: 'a thief', campaign: build('thief'), seed: 'o1', steps: 'oldtown' },
  { file: 'orm.md', title: 'The Road to Orm', who: 'a ranger', campaign: build('ranger'), seed: 'r1', steps: 'orm' },
  { file: 'gossip.md', title: 'Turned Away', who: 'Tamsin, a bard', campaign: bard, seed: 'h1', steps: 'gossip' },
  { file: 'window.md', title: 'The Window', who: 'a monk', campaign: build('monk'), seed: 'm1', steps: 'window' },
  { file: 'cleric.md', title: 'The Prayers', who: 'a dwarf cleric', campaign: build('cleric'), seed: 'c1', steps: 'cleric' },
  { file: 'objection.md', title: 'Ismay Stands', who: 'Tamsin, a bard', campaign: bard, seed: 'h1', steps: 'objection' },
];
await mkdir(out, { recursive: true });
for (const { file, title, who, campaign, seed, steps } of journeys) {
  const g = await Hessel.start(campaign, seed), j: Journey = g.j;
  const opening = ScreenModel.build(j.campaign).prose.join(' ');
  await g.fixture(steps);
  await g.until();
  const lines: string[] = ['*(The first page)*', '', opening, ''];
  let quiet = 0;
  for (const t of j.taken) {
    const said = t.page.trim();
    const nothing = !said || /^(An hour passes|Time passes|A while passes)\.$/.test(said);
    if (/^Wait/.test(t.label) && nothing) { quiet++; continue; }
    if (quiet) { lines.push(`*(${quiet} ${quiet === 1 ? 'wait' : 'waits'} in which nothing is told)*`, ''); quiet = 0; }
    lines.push(`**${t.label}**`, '', said || '*(nothing is told)*', '');
  }
  const ending = j.campaign.module.entities.find(e => e.type === 'ending' && j.holds('reached', e.id));
  await writeFile(`${out}/${file}`, [`# ${title}`, '', `Played by ${who}; seed \`${seed}\`, steps \`test/fixtures/hessel/${steps}.json\`; ` +
    `${j.taken.length} steps; ended at watch ${j.watch()}${ending ? `, at the ending "${ending.name}"` : ''}. ` +
    'Written by `bun scripts/hessel-transcripts.ts` from the journey as the page told it.', '', ...lines].join('\n'));
  console.log(`${file}: ${j.taken.length} steps, ${ending?.name ?? 'no ending'}`);
}
