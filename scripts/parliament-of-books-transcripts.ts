#!/usr/bin/env bun
// Plays A Parliament of Books' long journeys by the labels a player sees and writes each out as the page told it, step
// by step, to doc/playtests/parliament-of-books-2026-10-26 (the evidence its final report quotes). The journeys are
// the ones test/parliament-of-books*.test.ts asserts; waits that tell nothing are counted, not repeated.
import { writeFile, mkdir } from 'node:fs/promises';
import type { Journey } from '../src/session/journey';
import type { CreatureGenerationContext } from '../src/content';
import { Arcs, Calamy, C, Steps } from '../test/support/calamy';
import { ScreenModel } from '../src/ui/screen-model';

const out = 'doc/playtests/parliament-of-books-2026-10-26';
const one = (classId: string, backgroundId: string, level = 1): CreatureGenerationContext[] =>
  [{ name: 'Sam', raceId: 'human', classId, backgroundId, level } as CreatureGenerationContext];
const rite = [...Steps.pieces, 'go:quarles_room', 'Talk to Ottoline', 'Tell the Archivist what you have found', 'Take your leave'];
const canon = ['go:vestry', 'Talk to Canon', 'what the Kindling was', 'Take your leave'];
const withCrake = [...Steps.corvell, ...Steps.crakeTrust];
const sponsor = ['go:draft_fields', 'Talk to the Second', 'where they stand', 'speak for you', 'Take your leave'];
const roll = ['go:chamber', 'Talk to the Great Roll', 'where it stands', 'when the Parliament sits', 'Take your leave'];
const wellhead = ['go:wellhead', 'first words: Examine', 'go:chamber', 'Talk to the Great Roll', 'first words at the Wellhead',
  'Take your leave'];
const fire = ['=1240', '=1300'];
const journeys: { file: string; title: string; seed: string; party?: CreatureGenerationContext[]; steps: string[] }[] = [
  { file: 'lending.md', title: 'By the Archivist\'s reading, to the Lending Accord', seed: 'lending', steps: [...Steps.arrive,
    'Talk to the Almanack', 'kitchens of the Close', 'not sure it should tell', 'may keep', 'Take your leave', ...Steps.pieces,
    ...Steps.hennet, ...Steps.quarles, 'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'Take your leave',
    ...Steps.corvell, 'go:crake_parlour', 'green ledger: Examine', 'go:jonquil_garret', 'Talk to Jonquil', 'Housebook',
    'what he would do', 'where his family', 'Take your leave', 'letter to his mother.s book: Take', ...Steps.key, ...Steps.ink,
    ...Steps.read, 'go:wellhead', 'first words: Examine', 'go:foxing_deep', 'Talk to Dame', 'where it stands',
    "Ottoline Quarles's message", 'Take your leave', 'go:hb_kitchen', 'Talk to the Annery', 'where she stands', 'Take your leave',
    'Give Jonquil', 'go:draft_fields', 'Talk to the Second', 'where they stand', 'poems in an attic', 'Take your leave',
    'go:orme_garden', 'Talk to Mother', 'where she stands', 'Take your leave', 'go:reading_room', 'Talk to the Catalogue',
    'how it would vote', "Crake's green ledger", 'Take your leave', 'go:chamber', 'Talk to the Great Roll', 'where it stands',
    'when the Parliament sits', 'first words at the Wellhead', 'Take your leave', '=1176', 'Ask the Speaker to call',
    'Put to the Parliament: that every book sleep or wake', 'Put to the Parliament: that any book may ask',
    "Put to the Parliament: that Crake's door", 'Put to the Parliament: that no book be burned in Calamy save',
    'seal the Colophon', '=1219', 'Ask the Almanack to speak', ...fire] },
  { file: 'recall.md', title: 'By Crake\'s back stacks, to the Recall', seed: 'recall', steps: [...rite, ...canon, ...withCrake,
    ...sponsor, ...roll, '=1176', 'Ask the Speaker to call', 'Put to the Parliament: that every book of Calamy be Sewn',
    'seal the Colophon', ...fire] },
  { file: 'pleading.md', title: 'A cleric, once a warden, to the Pleading Accord', seed: 'pleading', party: one('cleric', 'warden', 3),
    steps: [...rite, ...canon, 'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'Take your leave', ...withCrake,
      'go:orme_garden', 'Talk to Mother', 'where she stands', 'Swear to the Physick', 'Take your leave', 'go:draft_fields',
      'Talk to the Second', 'where they stand', 'poems in an attic', 'speak for you', 'Take your leave', 'go:foxing_deep',
      'Talk to Dame', 'where it stands', 'Take your leave', ...roll, ...wellhead, '=1176', 'Ask the Speaker to call',
      'Talk to the Black Lexicon', 'where it stands', 'Take your leave', 'Bind the Lexicon',
      'Put to the Parliament: that every book sleep or wake', 'Put to the Parliament: that no book be burned but by judgment',
      'seal the Colophon', ...fire] },
  { file: 'open-door.md', title: 'A travelling bard, to the Open Door', seed: 'open', party: one('bard', 'messenger'),
    steps: ['go:taproom', 'Talk to the Almanack', 'what it is', 'kitchens of the Hithe', 'Take your leave', ...rite, ...canon,
      'go:gallon_attic', 'Talk to the Effusions', 'what they want', 'Take your leave', ...withCrake, 'Read aloud for an hour',
      'go:crake_parlour', 'green ledger: Examine', 'go:jonquil_garret', 'Talk to Jonquil', 'Housebook', 'what he would do',
      'where his family', 'Take your leave', 'letter to his mother.s book: Take', 'go:hb_kitchen', 'Talk to the Annery',
      'where she stands', 'Take your leave', 'Give Jonquil', 'go:orme_garden', 'Talk to Mother', 'where she stands', 'toll-gate',
      'Take your leave', 'go:foxing_deep', 'Talk to Dame', 'where it stands', 'nobody has ever read', 'Take your leave',
      'go:draft_fields', 'Talk to the Second', 'where they stand', 'poems in an attic', 'speak for you', 'Take your leave', ...roll,
      ...wellhead, '=1176', 'Ask the Speaker to call', 'Put to the Parliament: that every book sleep or wake',
      'Put to the Parliament: that the doors stand open', 'seal the Colophon', ...fire] },
  { file: 'advocate.md', title: 'Hester Rhule, shown and not lied to: the Advocate of Books', seed: 'advocate', steps: [
    ...Arcs.rhuleKept, '=182', 'go:rhule_room', 'Talk to Hester', 'stop the Thursday', 'Take your leave', 'go:ashpit', ...fire] },
  { file: 'binder.md', title: 'Hester Rhule, lied to: the Binder', seed: 'binder', steps: [...Arcs.rhuleLied, 'go:ashpit', ...fire] },
  { file: 'idle.md', title: 'Nobody does anything: the Year of Voices', seed: 'idle', steps: ['go:ashpit', ...fire] },
  { file: 'bond.md', title: 'The bestiary in the bond', seed: 'bond', steps: ['go:customs_yard', 'Talk to Mr. Sallis', 'claw-marks',
    'Take your leave', 'go:gallon_shop', 'Buy › A lantern', 'Buy › A flask', 'go:bond_loft', 'Talk to the Hithe Bestiary',
    'what happened', 'beasts might be called', 'Take your leave', 'go:bond_floor', '=78', 'Fill a lantern',
    'lift the bar on the bond gate', 'go:bond_floor', 'Read the bonnacon', 'go:bond_loft', 'Read the manticore',
    'Read the caladrius', '=+2', 'go:customs_yard', 'Talk to Mr. Sallis', 'bond is quiet',
    'Take your leave'] },
];
const reached = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
await mkdir(out, { recursive: true });
for (const { file, title, seed, party, steps } of journeys) {
  const j = await Calamy.start(seed, party);
  const opening = ScreenModel.build(j.campaign).prose.join(' ');
  for (const step of steps) {
    if (reached(j).length) { break; }
    try { await Calamy.play(j, step); } catch (e) { if (!reached(j).length) { throw e; } }
  }
  const lines: string[] = ['*(The first page)*', '', opening, ''];
  let quiet = 0;
  for (const t of j.taken) {
    const said = t.page.trim();
    if (/^Wait/.test(t.label) && (!said || /^(An hour passes|Time passes)\.$/.test(said))) { quiet++; continue; }
    if (quiet) { lines.push(`*(${quiet} ${quiet === 1 ? 'wait' : 'waits'} in which nothing is told)*`, ''); quiet = 0; }
    lines.push(`**${t.label}**`, '', said || '*(nothing is told)*', '');
  }
  const ending = j.campaign.module.entities.find(e => e.type === 'ending' && j.holds('reached', e.id));
  const sealed = j.campaign.world.related(C('sealed')).map(r => r.args[0].replace('calamy__', '')).sort();
  await writeFile(`${out}/${file}`, [`# ${title}`, '', `Seed \`${seed}\`${party ? `, a ${party[0].classId} (${party[0].backgroundId})` : ''}; ` +
    `${j.taken.length} steps; ended at watch ${j.watch()}${ending ? `, at the ending "${ending.name}"` : ''}` +
    `${sealed.length ? `; sealed: ${sealed.join(', ')}` : ''}. Written by \`bun scripts/parliament-of-books-transcripts.ts\` ` +
    'from the journey as the page told it.', '', ...lines].join('\n'));
  console.log(file, j.taken.length, ending?.name ?? '-');
}
