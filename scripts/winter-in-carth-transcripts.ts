#!/usr/bin/env bun
// Plays A Winter in Carth's journeys (the step files in test/fixtures/gaunt) by the labels a player sees, waits out the
// week to the book's close, and writes each out as the page told it to doc/adventures/a-winter-in-carth/playtest: the
// evidence its editorial assessment quotes. Waits that tell nothing are counted, not repeated.
import { writeFile, mkdir } from 'node:fs/promises';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Gaunt, build, alone as bard } from '../test/support/gaunt';

const out = 'doc/adventures/a-winter-in-carth/playtest';
const journeys: { file: string; title: string; who: string; campaign: string; seed: string; steps?: string }[] = [
  { file: 'alone.md', title: 'Left Alone at the Cross', who: 'Wren, a bard', campaign: bard, seed: 'g1' },
  { file: 'above.md', title: 'From Above', who: 'Wren, a bard', campaign: bard, seed: 'g1', steps: 'above' },
  { file: 'below.md', title: 'From Below', who: 'a thief', campaign: build('thief'), seed: 'g1', steps: 'below' },
  { file: 'flight.md', title: 'The Window', who: 'a warrior', campaign: build('warrior'), seed: 'g1', steps: 'flight' },
  { file: 'bearer.md', title: 'The Company Bears It', who: 'a cleric', campaign: build('cleric'), seed: 'g1', steps: 'bearer' },
  { file: 'dead.md', title: 'Nothing Done at Carth', who: 'a ranger', campaign: build('ranger'), seed: 'g1', steps: 'dead' },
  { file: 'letter.md', title: 'The Letter of the Vigil', who: 'Wren, a bard', campaign: bard, seed: 'g1', steps: 'letter' },
  { file: 'recant.md', title: 'The Lady\'s Words', who: 'Wren, a bard', campaign: bard, seed: 'g1', steps: 'recant' },
];
await mkdir(out, { recursive: true });
for (const { file, title, who, campaign, seed, steps } of journeys) {
  const g = await Gaunt.start(campaign, seed), j: Journey = g.j;
  const opening = ScreenModel.build(j.campaign).prose.join(' ');
  if (steps) { await g.fixture(steps); }
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
  if (quiet) { lines.push(`*(${quiet} ${quiet === 1 ? 'wait' : 'waits'} in which nothing is told)*`, ''); }
  const ending = j.campaign.module.entities.find(e => e.type === 'ending' && j.holds('reached', e.id));
  const source = steps ? `steps \`test/fixtures/gaunt/${steps}.json\`` : 'no steps but waiting';
  await writeFile(`${out}/${file}`, [`# ${title}`, '', `Played by ${who}; seed \`${seed}\`, ${source}; ` +
    `${j.taken.length} steps; ended at watch ${j.watch()}${ending ? `, at the ending "${ending.name}"` : ''}. ` +
    'Written by `bun scripts/winter-in-carth-transcripts.ts` from the journey as the page told it.', '', ...lines].join('\n'));
  console.log(`${file}: ${j.taken.length} steps, ${ending?.name ?? 'no ending'}`);
}
