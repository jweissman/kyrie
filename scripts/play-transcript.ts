#!/usr/bin/env bun
// A journey in a generated country played by the page's own labels and written as the page told it, one line to a step,
// as doc/history/activation/transcripts are. A step that is a label (or a ">place" walk, "=day N HH:MM" wait or
// "map:Name" set-out) is played; a line "# note" is written as a note; "PLACE id" puts the company down (and says so).
//   bun scripts/play-transcript.ts <seed> <calling> <steps-file> [out-file]
import { readFile, writeFile } from 'node:fs/promises';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from '../test/support/placed';
import { MapPlay } from '../test/support/map-play';

const [seed = 'kahitude', calling = 'warrior', file = '', out] = process.argv.slice(2);
const steps = (await readFile(file, 'utf8')).split('\n').filter(l => l.trim());
const j = Journey.of(await DrawnWorld.start(seed, { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: calling }] },
  NodeBundleSource.shared));
const lines: string[] = [];
for (const s of steps) {
  if (s.startsWith('#')) { lines.push(`(${s.slice(1).trim()})`); continue; }
  if (s.startsWith('PLACE ')) { Placed.at(j, s.slice(6)); lines.push(`(the company is put down at ${s.slice(6)} to save the walk)`); continue; }
  if (s.startsWith('COIN ')) { j.coin(Number(s.slice(5))); lines.push(`(the company is given ${s.slice(5)} crowns)`); continue; }
  if (s.startsWith('ROLL ')) { j.roll(s.slice(5) === 'none' ? undefined : s.slice(5) as 'pass' | 'fail'); lines.push(`(the dice are held to ${s.slice(5)})`); continue; }
  if (s.startsWith('REACH ')) { const d = await MapPlay.reach(j, s.slice(6)); lines.push(`[Set out for ${s.slice(6)}] ${d.arrived ? 'arrived' : 'did not arrive'}`); continue; }
  if (s.startsWith('FIGHT ')) { const told = await j.fight(s.slice(6)); lines.push(`[${s.slice(6)}] ${told.replace(/\s+/g, ' ')}`); continue; }
  try {
    const told = await j.play(s);
    lines.push(`[${s}] ${told.replace(/\s+/g, ' ').trim()}`);
  } catch (e) { lines.push(`[${s}] !! ${(e as Error).message.slice(0, 300)}`); }
}
const text = `${lines.join('\n')}\n`;
if (out) { await writeFile(out, text); } else { console.log(text); }
