#!/usr/bin/env bun
// Plays Low Water's long journeys by the labels a player sees and writes each out as the page told it, step by step,
// to doc/playtests/low-water-2026-10-25 (the evidence its editorial assessment quotes). Waits that tell nothing are
// counted, not repeated.
import { writeFile, mkdir } from 'node:fs/promises';
import { Journey } from '../src/session/journey';
import { Bowl, L } from '../test/support/low-water';
import { ScreenModel } from '../src/ui/screen-model';

const out = 'doc/playtests/low-water-2026-10-25';
const leave = ['?^To the hall of the Office', '?^Out to Measures Square', '?^To the head of the Stair', '^To the north road',
  'Go up out of the Bowl'];
// Waits a player would make by watching, named as steps: until the count closes, until the Reflected come up, until a
// night they walk, and until the heart is due home.
class Waits {
  static async run(j: Journey, step: string) {
    if (step === '@@complete') { return Bowl.untilComplete(j); }
    if (step === '@@reflected') { return Bowl.untilReflected(j); }
    if (step === '@@night') { return Bowl.untilNight(j); }
    if (step === '@@heartDue') { return j.play(`=${j.measure(L('heartDue'), L('bowl'))}`); }
    return j.play(step);
  }
}
const journeys: { file: string; title: string; seed: string; steps: string[] }[] = [
  { file: 'accord.md', title: 'The Measured Accord', seed: 'ammerlin', steps: [...Bowl.act1, ...Bowl.trial, ...Bowl.descent,
    ...Bowl.night, ...Bowl.morning, ...Bowl.office2, '=820', 'Ask Isaura if she will sign', ...Bowl.toMoot, '=889',
    ...Bowl.finding, 'Ask Isaura what happens to her now', 'Ask Isaura what she will say about you', ...leave] },
  { file: 'alone.md', title: 'The Open Bowl', seed: 'alone', steps: [...Bowl.arrive, '@@complete', '@@heartDue'] },
  { file: 'audit.md', title: 'The Account Delivered', seed: 'sent', steps: [...Bowl.arrive, ...Bowl.bell, '^To the new mud',
    '^To the Ward landing', '@@complete', '@@reflected', 'Ring the Ear.s bell at the Reflected who carry',
    '^Take', ...Bowl.underMere, ...Bowl.ledger, ...Bowl.upStair, 'seat of the Auditor', 'Talk to the Auditor', 'what it is',
    'what it is owed', 'what becomes of Ammerlin', 'why the account is addressed upward', 'hall of the nine circles',
    'Let the heart go up through the opening'] },
  { file: 'false.md', title: 'The False Measure', seed: 'false', steps: [...Bowl.act1, ...Bowl.trial, 'Fill a lantern',
    '^To the intake culvert', '^To the dry vestibule', '^Take', '^Take', 'Hall of the Equals', 'Put in › A weight-stone',
    'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone', '^To the counting gallery',
    'room of the ninth wheel', 'counting gallery', 'Hall of the Equals', '^To the dry vestibule', '^To the intake culvert',
    '^To the Ninth Lock', '^To the lock stair', '^To the Ward landing', '^To the new mud', '^To the dig', ...Bowl.bell.slice(6),
    '=150', 'Talk to Teodor', 'what is set in the ninth wheel', 'Take your leave', '^To the new mud', '@@night',
    ...Bowl.underMere.slice(1), ...Bowl.ledger, 'what she sees in the ledger of water', 'write the false figure', ...Bowl.upStair,
    'seat of the Auditor', 'Talk to the Auditor', 'what it is', 'Ask Isaura to write the false figure', 'hall of the nine circles',
    'hall of receipts', 'glass gate', 'top of the stair', 'foot of the stair', 'Ward in the water', 'square in the water',
    'Rim in the water', 'Bowl in the water', 'still water', 'Ward landing', '^To the lock stair', "^To the Dyers' Walk",
    '^To Measures Square', ...leave] },
  { file: 'halm.md', title: 'The End of the Song', seed: 'halm', steps: [...Bowl.arrive, '^To Measures Square',
    '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar', 'what she wants from you', 'Take your leave',
    '^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing',
    '^To the new mud', '^To the dig', 'Talk to Dov', 'Quill.s agent', 'Take your leave', ...Bowl.freeze, '=700',
    'Say something to Isaura about the diggers', '^To the new mud', '^To the Ward landing', '^To the lock stair', "^To the Dyers' Walk",
    '^To Measures Square', ...leave] },
  { file: 'census.md', title: 'The Census Heard', seed: 'fed', steps: [...Bowl.act1, ...Bowl.trial, ...Bowl.descent,
    '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^To the head of the Stair', '^To the Rim Gauge',
    '^To the fulling mills', 'Into the Guild counting', "Quill.s counting-room", 'Talk to Harrow', 'working machine under the Mere',
    'what the city would owe him', "Agree to Quill's terms", 'Take your leave', '^To the counting-house floor',
    '^Out to the fulling mills', '^To the Rim Gauge', 'Break out the old third mouth', '=+300', '^To the head of the Stair',
    '^To Measures Square', '^Into the Full Measure', 'Buy › A torch', '^Out to Measures Square', "^To the Dyers' Walk",
    '^To the lock stair', '^To the Ninth Lock', 'a torch: Light', '^To the intake culvert', '^To the dry vestibule',
    'Hall of the Equals', '^To the counting gallery', 'Into the depths of the Undercroft', 'the still water', 'Bowl in the water',
    '^Take', '^To the still water', 'Through to the last door', 'counting gallery', 'Hall of the Equals', '^To the dry vestibule',
    '^To the intake culvert', '^To the Ninth Lock', '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square',
    '^Into the Sounding', "Cantor's room", 'Give a cup of the still water', "^To the Sounding's nave", '^Out to Measures Square',
    ...leave] },
];
await mkdir(out, { recursive: true });
for (const { file, title, seed, steps } of journeys) {
  const j = await Journey.start('data/campaigns/low-water.campaign.json', seed);
  const opening = ScreenModel.build(j.campaign).prose.join(' ');
  for (const step of steps) { await Waits.run(j, step); }
  const lines: string[] = ['*(The first page)*', '', opening, ''];
  let quiet = 0;
  for (const t of j.taken) {
    const said = t.page.trim();
    if (/^Wait/.test(t.label) && (!said || /^(An hour passes|Time passes)\.$/.test(said))) { quiet++; continue; }
    if (quiet) { lines.push(`*(${quiet} ${quiet === 1 ? 'wait' : 'waits'} in which nothing is told)*`, ''); quiet = 0; }
    lines.push(`**${t.label}**`, '', said || '*(nothing is told)*', '');
  }
  const ending = j.campaign.module.entities.find(e => e.type === 'ending' && j.holds('reached', e.id));
  await writeFile(`${out}/${file}`, [`# ${title}`, '', `Seed \`${seed}\`; ${j.taken.length} steps; ended at watch ${j.watch()} ` +
    `with the Mere at ${j.measure(L('mere'), L('bowl'))} spans${ending ? `, at the ending "${ending.name}"` : ''}. ` +
    'Written by `bun scripts/low-water-transcripts.ts` from the journey as the page told it.', '', ...lines].join('\n'));
  console.log(`${file}: ${j.taken.length} steps`);
}
