// A career through every authored country of one generated world, by the game's own commands (src/autoplay/tour.ts):
// what the company was told of each and where, when it came in by the country's own road, or what stopped it.
//   bun scripts/library-tour.ts [--seed wren] [--class warrior] [--race human] [--budget 4000] [--out file.json]
import { writeFileSync } from 'node:fs';
import { Tour } from '../src/autoplay/tour';

class Args {
  static readonly argv = process.argv.slice(2);
  static value(flag: string, fallback: string): string {
    const i = this.argv.indexOf(flag);
    return i >= 0 && this.argv[i + 1] ? this.argv[i + 1]! : fallback;
  }
}
const value = Args.value.bind(Args);
const seed = value('--seed', 'wren');
const r = await Tour.run(seed, { name: 'Wenna', raceId: value('--race', 'human'), classId: value('--class', 'warrior') },
  Number(value('--budget', '4000')), v => { console.error(`… ${v.name}: ${v.entered ? 'entered' : v.stopped ?? 'not entered'}`); });
for (const v of r.visits) {
  console.log(`${v.name} (${v.cell}, from ${v.way || 'the first'}): ${v.entered ? `entered at command ${v.entered.command}, hour ${v.entered.hour}`
    : `not entered${v.stopped ? `: ${v.stopped}` : ''}`}; told ${v.told.length} time(s)`);
  for (const t of v.told) { console.log(`   told at ${t.at}: ${t.text.slice(0, 160)}`); }
  if (v.entered) { console.log(`   saw: ${v.entered.scene.slice(0, 200)}`); }
}
console.log(`${r.commands} commands, ${r.fights.won} fights won, ${r.fights.lost} lost, ${r.fights.fled} fled; `
  + `${r.hours} hours of the world's time; ${r.regions.length} regions drawn; ${(r.ms / 1000).toFixed(0)} s${r.ended ? '; ended' : ''}`);
console.log(r.kept.length ? `Not kept: ${r.kept.join('; ')}` : 'Kept and opened again: the same game.');
const out = value('--out', '');
if (out) { writeFileSync(out, JSON.stringify(r, null, 1)); }
