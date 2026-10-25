// How fast the game itself runs, by layer and by kind of command, over the same kept record of choices
// (test/fixtures/descent/<seed>.choices). Each layer is a separate pass over the record, from the same start:
//   A. the simulation alone: the campaign carrying out a command already resolved to an action (its watches, rules,
//      townsfolk, creature facts, fights fought by its own tactics); the record's choice is found untimed;
//   B. a headless session: the session's command (with its telling), what the company perceives before and after,
//      the feedback told of it, and the next choices, but no screen, no narration's page and no keeping of the game.
// Each command is put in a class by what it is (travel, time, fight, local), and each class's distribution and the
// commands a second it allows are reported, with the heap after a full collection every 100 commands.
//   bun scripts/sim-bench.ts <seed> [--class warrior] [--layers A,B] [--steps n]
import { readFileSync } from 'node:fs';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Campaign } from '../src/campaign/campaign';
import type { Battle } from '../src/battle';
import { JourneyReport } from './journey-report';

interface Timed { kind: string; ms: number }
export class SimBench {
  static option(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] ?? fallback : fallback;
  }
  static async main(args: string[]): Promise<number> {
    const seed = args[0];
    if (!seed) { console.error('usage: bun scripts/sim-bench.ts <seed> [--class c] [--layers A,B] [--steps n]'); return 1; }
    const lines = readFileSync(`test/fixtures/descent/${seed}.choices`, 'utf8').split('\n').filter(Boolean)
      .slice(0, Number(this.option(args, 'steps', '100000')));
    for (const layer of this.option(args, 'layers', 'A,B').split(',')) {
      const s = await this.start(seed, this.option(args, 'class', 'warrior'));
      const began = performance.now(), timed = await this.pass(s, lines, layer);
      console.log(`layer ${layer}: ${timed.length} commands in ${Math.round(performance.now() - began)} ms`
        + ` (canonical ${Bun.hash(s.canonical()).toString(16)})`);
      this.report(timed);
    }
    return 0;
  }
  static async start(seed: string, classId: string): Promise<PlaySession> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId }] });
    return PlaySession.start(w.path, seed, w.source);
  }
  private static async pass(s: PlaySession, lines: string[], layer: string): Promise<Timed[]> {
    const timed: Timed[] = [];
    for (const [i, line] of lines.entries()) {
      const re = new RegExp(line, 'i'), c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
      if (!c) { console.log(`layer ${layer}: step ${i + 1} not offered: ${line}`); break; }
      const id = PlayerView.resolve(s.campaign, c.choice.id), t = performance.now();
      const fought = layer === 'A' ? await this.simulate(s, id) : await this.session(s, c.choice.id);
      timed.push({ kind: this.kind(id, fought), ms: performance.now() - t });
      if ((i + 1) % 100 === 0) { console.log(`  ${i + 1}: heap ${JourneyReport.heap(true)} MB`); }
    }
    return timed;
  }
  // A: the campaign alone, its fights by its own tactics.
  private static async simulate(s: PlaySession, id: string): Promise<boolean> {
    const event = await s.campaign.executeAsync(id, SimBench.fight);
    return event.combat.some(e => e.type === 'end');
  }
  static async fight(this: void, battle: Battle) { await Promise.resolve(); Campaign.autofight(battle); }
  // B: the session's command, what is perceived before and after, its feedback, and the next choices.
  private static async session(s: PlaySession, command: string): Promise<boolean> {
    const before = PlayerView.observe(s.campaign), event = await s.perform(command);
    ActionFeedbackView.read(s.campaign, event, before);
    PlayerView.choices(s.campaign);
    return event.combat.some(e => e.type === 'end');
  }
  static kind(id: string, fought: boolean): string {
    if (fought) { return 'fight'; }
    if (/^(go|travel|risk)\(/.test(id)) { return 'travel'; }
    if (/^(wait|rest|camp|take_lodging|take_raising|sleep)/.test(id) || /raise/.test(id)) { return 'time'; }
    return 'local';
  }
  private static at(ms: number[], q: number): string { return JourneyReport.pct(ms, q).toFixed(1); }
  private static report(timed: Timed[]) {
    for (const kind of ['local', 'travel', 'time', 'fight', 'all']) {
      const ms = timed.filter(t => kind === 'all' || t.kind === kind).map(t => t.ms);
      if (!ms.length) { continue; }
      const mean = ms.reduce((a, b) => a + b, 0) / ms.length;
      console.log(`  ${kind.padEnd(6)} n ${String(ms.length).padStart(3)} p50 ${this.at(ms, 0.5)} p90 ${this.at(ms, 0.9)}`
        + ` p99 ${this.at(ms, 0.99)} max ${Math.max(...ms).toFixed(0)} ms | ${(1000 / mean).toFixed(1)} commands/s`);
    }
  }
}
if (import.meta.main) { process.exitCode = await SimBench.main(process.argv.slice(2)); }
