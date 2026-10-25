// How a sustained game costs as it goes on: a kept record of choices (test/fixtures/descent/<seed>.choices) played
// through the browser's own engine (EngineHost, in this process: no worker, no page), timing each command's parts
// (the engine's command, the screen, the narration, keeping the game) and recording how the game has grown (facts,
// modules, commands, the kept game's size, the heap after a full collection). Fights are fought by the game's own
// tactics. The steps, with each command's id, can be written out and played again in the browser
// (scripts/journey-browser.ts).
//   bun scripts/journey-profile.ts <seed> [--class warrior] [--origin wanderer] [--choices file] [--out file.jsonl]
//     [--steps n] [--every n]
import { readFileSync, writeFileSync } from 'node:fs';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import { PlayerView } from '../src/presentation/player-view';
import type { Frame, Message } from '../web/engine/protocol';
import type { PlaySession } from '../src/session/play-session';

export interface JourneyStep {
  step: number; choice: string; command: string; total: number; engine: number; screen: number; narrative: number;
  save: number; elapsed: number; facts: number; modules: number; commands: number; saved: number; heap: number;
}
type Inner = { session: PlaySession; saving: () => void; keep: () => Promise<void> };
export class JourneyProfile {
  private saved = 0;
  private readonly host = new EngineHost(this.heard.bind(this));
  private readonly inner = this.host as unknown as Inner;
  constructor(private readonly every: number) { this.inner.saving = JourneyProfile.never; }
  static never() { /* the profile keeps the game itself, and times it */ }
  static option(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] ?? fallback : fallback;
  }
  // What the engine posts: the size of the game kept; a fight waiting for the company, fought by its tactics.
  private heard(m: Message) {
    if (m.kind === 'saved') { this.saved = m.save.length + (m.world?.text.length ?? 0); }
    if (m.kind === 'frame' && m.frame.combat?.ours) { setTimeout(this.fightOn.bind(this), 0); }
  }
  private fightOn() { void this.host.handle({ kind: 'fight' }); }
  static async main(args: string[]): Promise<number> {
    const seed = args[0];
    if (!seed) { console.error('usage: bun scripts/journey-profile.ts <seed> [--class c] [--origin o] [--out f]'); return 1; }
    const file = this.option(args, 'choices', `test/fixtures/descent/${seed}.choices`);
    const choices = readFileSync(file, 'utf8').split('\n').filter(Boolean)
      .slice(0, Number(this.option(args, 'steps', '100000')));
    const profile = new JourneyProfile(Number(this.option(args, 'every', '25')));
    const began = performance.now();
    await profile.host.handle({ kind: 'begin', campaign: Creation.generated, seed,
      party: [{ name: 'Wenna', raceId: 'human', classId: this.option(args, 'class', 'warrior') }],
      origin: this.option(args, 'origin', 'wanderer') });
    console.log(`begin ${Math.round(performance.now() - began)} ms`);
    const steps = await profile.play(choices), out = this.option(args, 'out', '');
    this.summary(steps);
    // The game it came to, as a hash of its canonical state: the same before and after a change that should not
    // change what happens.
    console.log(`canonical ${Bun.hash(profile.inner.session.canonical()).toString(16)}`);
    if (out) { writeFileSync(out, steps.map(s => JSON.stringify(s)).join('\n') + '\n'); }
    return 0;
  }
  async play(choices: string[]): Promise<JourneyStep[]> {
    const steps: JourneyStep[] = [];
    for (const [i, line] of choices.entries()) {
      const step = await this.step(i + 1, line);
      if (!step) { break; }
      steps.push(step);
      if (step.step % this.every === 0) { JourneyProfile.row(steps.slice(-this.every)); }
    }
    return steps;
  }
  private async step(n: number, line: string): Promise<JourneyStep | undefined> {
    const campaign = this.inner.session.campaign, re = new RegExp(line, 'i');
    const c = PlayerView.choices(campaign).find(x => re.test(x.choice.name));
    if (!c) { console.error(`step ${n}: ${line} is not offered`); return undefined; }
    const t1 = performance.now();
    const frame = await this.host.handle({ kind: 'perform', command: c.choice.id, said: c.choice.name, move: false });
    const t2 = performance.now();
    await this.inner.keep();
    const t3 = performance.now(), t = (frame as Frame).timing ?? { engine: 0, screen: 0, narrative: 0 };
    const installed = (campaign as unknown as { definition?: { installations?: unknown[] } }).definition?.installations;
    return { step: n, choice: c.choice.name, command: c.choice.id, total: Math.round(t2 - t1), ...t,
      save: Math.round(t3 - t2), elapsed: campaign.readout.elapsed, facts: campaign.world.view.relations.length,
      modules: installed?.length ?? 0, commands: campaign.history.length, saved: this.saved,
      heap: JourneyProfile.heap(n % this.every === 0) };
  }
  // The heap in use, in megabytes: at the end of each window after a full collection, so that what is kept is told
  // apart from garbage not yet collected.
  private static heap(collect: boolean): number {
    if (collect) { Bun.gc(true); }
    return Math.round(process.memoryUsage().heapUsed / 1e6);
  }
  static pct(xs: number[], p: number): number {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? 0;
  }
  private static median(w: JourneyStep[], k: keyof JourneyStep): number {
    return this.pct(w.map(s => s[k] as number), 0.5);
  }
  // A window of steps: the command's median and worst, its parts' medians, and how big the game is by then.
  private static row(w: JourneyStep[]) {
    const last = w.at(-1)!, worst = Math.max(...w.map(s => s.total)), saves = Math.max(...w.map(s => s.save));
    console.log(`steps ${w[0]!.step}-${last.step}: command p50 ${this.median(w, 'total')} max ${worst}`
      + ` | engine ${this.median(w, 'engine')} screen ${this.median(w, 'screen')}`
      + ` narrative ${this.median(w, 'narrative')} save ${this.median(w, 'save')} (max ${saves})`
      + ` | facts ${last.facts} modules ${last.modules} commands ${last.commands}`
      + ` saved ${Math.round(last.saved / 1000)}k heap ${last.heap}MB`);
  }
  private static summary(steps: JourneyStep[]) {
    for (const k of ['total', 'engine', 'screen', 'narrative', 'save'] as const) {
      const all = steps.map(s => s[k]);
      console.log(`${k}: p50 ${this.pct(all, 0.5)} p90 ${this.pct(all, 0.9)} p99 ${this.pct(all, 0.99)}`
        + ` max ${Math.max(...all)} ms`);
    }
    const worst = [...steps].sort((a, b) => b.total + b.save - a.total - a.save).slice(0, 5);
    for (const s of worst) { console.log(`worst: step ${s.step} ${s.choice} — command ${s.total} save ${s.save} ms`); }
  }
}
if (import.meta.main) { process.exitCode = await JourneyProfile.main(process.argv.slice(2)); }
