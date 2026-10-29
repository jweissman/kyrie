#!/usr/bin/env bun
// Plays The Grand Tour's journeys (the step files in test/fixtures/sennet) by the labels a player sees, waits out the
// week to the book's close, and writes each out as the page told it to doc/adventures/the-grand-tour/playtest: the
// evidence its editorial assessment quotes. Waits that tell nothing are counted, not repeated.
import { writeFile, mkdir } from 'node:fs/promises';
import { ScreenModel } from '../src/ui/screen-model';
import { Sennet, steps } from '../test/support/sennet';
import type { CreatureGenerationContext } from '../src/content';

const out = 'doc/adventures/the-grand-tour/playtest';
const bard = undefined, one = Sennet.one;
const journeys: { file: string; title: string; who: string; party?: CreatureGenerationContext[]; route: string[] }[] = [
  { file: 'tour.md', title: 'The Grand Tour', who: 'Tamsin, a bard (a fabulist)', party: bard, route: steps('tour') },
  { file: 'alone.md', title: 'Left Alone', who: 'Tamsin, a bard', party: bard, route: [] },
  { file: 'coming-down.md', title: 'The Coming Down', who: 'Tamsin, a bard', party: bard,
    route: [...steps('tour', 'fire', 'fabian_earth'), ...steps('outcomes', 'coming_down')] },
  { file: 'undertow.md', title: 'The Undertow', who: 'Brann, a warrior (a labourer)', party: one('warrior', 'laborer', 'human', 'Brann'),
    route: steps('outcomes', 'undertow') },
  { file: 'found-out.md', title: 'Found Out', who: 'Ama, a cleric (an acolyte)', party: one('cleric', 'acolyte', 'human', 'Ama'),
    route: steps('outcomes', 'found_out') },
  { file: 'rectors-door.md', title: 'The Rector\'s Door', who: 'Tamsin, a bard', party: bard,
    route: [...steps('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate', 'air', 'made'), ...steps('outcomes', 'rectors_door')] },
  { file: 'first-through.md', title: 'First Through', who: 'Tamsin, a bard', party: bard,
    route: [...steps('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate'), ...steps('outcomes', 'accomplice')] },
  { file: 'kept-above.md', title: 'Kept Above', who: 'Tamsin, a bard', party: bard,
    route: [...steps('tour', 'fire', 'fabian_earth', 'whelm'), ...steps('outcomes', 'kept_above')] },
  { file: 'keepsake.md', title: 'The Keepsake', who: 'Tamsin, a bard', party: bard,
    route: [...steps('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate', 'air'), ...steps('outcomes', 'lanterns')] },
  { file: 'bell.md', title: 'The Bell', who: 'Tamsin, a bard', party: bard, route: steps('outcomes', 'bell') },
  { file: 'wrong-answer.md', title: 'The Wrong Answer', who: 'Tamsin, a bard', party: bard,
    route: [...steps('tour', 'fire', 'fabian_earth', 'whelm'), ...steps('outcomes', 'wrong')] },
  { file: 'letter.md', title: 'The Letter', who: 'Wren, a thief (a burglar)', party: one('thief', 'burglar', 'elf', 'Wren'),
    route: steps('outcomes', 'letter') },
];
await mkdir(out, { recursive: true });
for (const { file, title, who, party, route } of journeys) {
  const g = await Sennet.start(undefined, 'sennet', party), j = g.j;
  const opening = ScreenModel.build(j.campaign).prose.join(' ');
  await g.play(...route);
  await g.until(1015);
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
  await writeFile(`${out}/${file}`, [`# ${title}`, '', `Played by ${who}; seed \`sennet\`; ${route.length} steps given, ` +
    `${j.taken.length} taken; ended at watch ${j.watch()}${ending ? `, at the ending "${ending.name}"` : ''}. ` +
    'Written by `bun scripts/the-grand-tour-transcripts.ts` from the journey as the page told it.', '', ...lines].join('\n'));
  console.log(`${file}: ${j.taken.length} steps, ${ending?.name ?? 'no ending'}`);
}
