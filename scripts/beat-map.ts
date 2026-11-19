#!/usr/bin/env bun
// The golden route's beat map (Sprint 2, S2-2; planning-report.md §7): a cold play's own lines replayed as it played
// them, and each turn's state: where the company is, the aims held and those new this turn, its coin, its hurts, its
// food, and the first line it was told. A beat map is read against the eight beats by an editor; this is its record.
//   bun scripts/beat-map.ts <lines.txt> <world> <as> [turns]
// A kept play is from before the rooms under the first town had what lives in them come at the company: those are
// set aside (test/support/before-rooms), as the kept plays' own specs set them: its lines replay as they were played.
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';
import { BeforeRooms } from '../test/support/before-rooms';

export class BeatMap {
  static async main(argv: string[]): Promise<number> {
    const [file, world, as, n] = argv;
    if (!file || !world || !as) { console.log('bun scripts/beat-map.ts <lines.txt> <world> <as> [turns]'); return 2; }
    const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(0, Number(n ?? 200));
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', world, '--as', as]));
    const r = new Runner(BeforeRooms.set(journey.session)), c = journey.session.campaign;
    let held = new Set((r.said().aims ?? []).map(a => a.text));
    console.log(`T0 ${BeatMap.state(c)} | aims ${held.size}: ${[...held].join(' / ')}`);
    for (const [i, line] of lines.entries()) {
      const s = await r.ask(line);
      if ('error' in s) { console.log(`T${i + 1} REFUSED ${line}`); continue; }
      const now = new Set((s.aims ?? []).map(a => a.text)), fresh = [...now].filter(a => !held.has(a));
      const gone = [...held].filter(a => !now.has(a));
      held = now;
      console.log(`T${i + 1} ${BeatMap.act(line)} @${s.at ?? '?'} [${s.moment}] ${BeatMap.state(c)} | aims ${now.size}`
        + `${fresh.length ? ` +${fresh.join(' / +')}` : ''}${gone.length ? ` -${gone.join(' / -')}` : ''}`);
      console.log(`    ${BeatMap.told(s)}`);
    }
    return 0;
  }
  private static act(line: string): string {
    const o = JSON.parse(line) as Record<string, unknown>;
    return String(o.act ?? o.follow ?? o.say ?? Object.keys(o)[0]);
  }
  private static told(s: Said): string {
    return (s.scene.lines.find(l => l.length > 30) ?? s.scene.lines[0] ?? '').slice(0, 160);
  }
  private static state(c: Campaign): string {
    const party = c.readout.creatures.filter(x => c.readout.partyIds.includes(x.id));
    const coin = c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const food = c.world.number(ModuleWriter.call('quantity', 'party', 'rations'));
    return `coin ${coin} food ${food} hp ${party.map(x => `${x.state.hp}/${x.base.maxHp}`).join(',')}`;
  }
}
if (import.meta.main) { process.exit(await BeatMap.main(process.argv.slice(2))); }
