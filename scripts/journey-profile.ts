// How a sustained game costs as it goes on: commands played through the browser's own engine (EngineHost, in this
// process: no worker, no page), timing each command's parts (the engine's command, the screen, the narration, keeping
// the game) and recording how the game has grown (facts, modules, commands, the kept game's size, the heap after a
// full collection at the end of each window). Fights are fought by the game's own tactics. The commands come from a
// kept record of choices (test/fixtures/descent/<seed>.choices), or a wander by a fixed rule (--wander n: across
// marches into the country beyond; see Wanderer), or a profile's own steps played again (--replay steps.jsonl).
// Bounded and diagnostic: each step is written out as it is measured (--out), any step slower than --slow ms is told at
// once, the run stops at --deadline seconds with what it has, and a checkpoint can be kept every --checkpoint-every
// steps (into --checkpoints) and taken up again (--resume), so a slow command is reproduced without the road to it.
//   bun scripts/journey-profile.ts <seed> [--class warrior] [--origin wanderer] [--choices file | --wander n |
//     --replay steps.jsonl] [--resume checkpoint.json] [--steps n] [--every n] [--out file.jsonl] [--slow ms]
//     [--deadline s] [--checkpoint-every n --checkpoints dir]
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import { PlayerView } from '../src/presentation/player-view';
import type { Frame, Message } from '../web/engine/protocol';
import type { PlaySession } from '../src/session/play-session';
import { Wanderer, type Offered } from './journey-wanderer';
import { JourneyReport, type JourneyStep } from './journey-report';

export type { JourneyStep } from './journey-report';
type Inner = { session: PlaySession; saving: () => void; keep: () => Promise<void>; preparing?: Promise<void> };
interface Bounds {
  every: number; out: string; slow: number; deadline: number; checkpointEvery: number; checkpoints: string;
}
export class JourneyProfile {
  private saved = 0;
  private readonly host = new EngineHost(this.heard.bind(this));
  private readonly inner = this.host as unknown as Inner;
  private readonly began = performance.now();
  // Where the commands come from: a wander, a profile's own steps played again, or a record of choices.
  private wanderer?: Wanderer;
  private ids?: string[];
  private lines: string[] = [];
  constructor(private readonly bounds: Bounds) { this.inner.saving = JourneyProfile.never; }
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
    const seed = args[0], option = this.option.bind(this, args);
    if (!seed) { console.error('usage: bun scripts/journey-profile.ts <seed> [options] (see the header)'); return 1; }
    const profile = new JourneyProfile({ every: Number(option('every', '25')), out: option('out', ''),
      slow: Number(option('slow', '2000')), deadline: Number(option('deadline', '1800')) * 1000,
      checkpointEvery: Number(option('checkpoint-every', '0')), checkpoints: option('checkpoints', '') });
    if (profile.bounds.out) { writeFileSync(profile.bounds.out, ''); }
    const resume = option('resume', ''), started = performance.now();
    if (resume) { await profile.host.handle({ kind: 'resume', saved: readFileSync(resume, 'utf8') }); }
    else {
      await profile.host.handle({ kind: 'begin', campaign: Creation.generated, seed,
        party: [{ name: 'Wenna', raceId: 'human', classId: option('class', 'warrior') }], origin: option('origin', 'wanderer') });
    }
    console.log(`${resume ? 'resume' : 'begin'} ${Math.round(performance.now() - started)} ms`);
    profile.source(args, seed);
    const steps = await profile.run(Number(option('steps', '100000')));
    JourneyReport.summary(steps);
    // The game it came to, as a hash of its canonical state: the same before and after a change that should not
    // change what happens.
    console.log(`canonical ${Bun.hash(profile.inner.session.canonical()).toString(16)}`
      + ` facts ${JourneyProfile.facts(profile.inner.session)} told ${JourneyProfile.told(profile.inner.session)}`);
    const dump = option('dump', '');
    if (dump) {
      const c = profile.inner.session.campaign;
      writeFileSync(dump, JSON.stringify({ view: PlayerView.observe(c), chronicle: PlayerView.chronicle(c) }, null, 1));
    }
    return 0;
  }
  // The world's facts and measures as a hash of their sorted keys: the same world whatever order it keeps them in.
  static facts(session: PlaySession): string {
    const w = session.campaign.world;
    return Bun.hash(JSON.stringify(w.describe())).toString(16);
  }
  // What the company is shown of it: what it perceives now and the chronicle of what it has, as a hash.
  static told(session: PlaySession): string {
    const c = session.campaign;
    return Bun.hash(JSON.stringify({ view: PlayerView.observe(c), chronicle: PlayerView.chronicle(c) })).toString(16);
  }
  private source(args: string[], seed: string) {
    const option = JourneyProfile.option.bind(JourneyProfile, args), replay = option('replay', '');
    if (Number(option('wander', '0'))) { this.wanderer = new Wanderer(seed); return; }
    if (replay) {
      this.ids = readFileSync(replay, 'utf8').split('\n').filter(Boolean).map(l => (JSON.parse(l) as JourneyStep).command);
      return;
    }
    this.lines = readFileSync(option('choices', `test/fixtures/descent/${seed}.choices`), 'utf8').split('\n')
      .filter(Boolean);
  }
  private next(n: number): Offered | undefined {
    const offered = PlayerView.choices(this.inner.session.campaign);
    if (this.wanderer) { return this.wanderer.pick(offered); }
    if (this.ids) { return offered.find(c => c.choice.id === this.ids![n - 1]); }
    const re = new RegExp(this.lines[n - 1] ?? '^$', 'i');
    return offered.find(c => re.test(c.choice.name));
  }
  async run(limit: number): Promise<JourneyStep[]> {
    const steps: JourneyStep[] = [], b = this.bounds;
    for (let n = 1; n <= limit && this.inner.session.campaign.running; n++) {
      if (performance.now() - this.began > b.deadline) { console.log(`deadline: stopped before step ${n}`); break; }
      const c = this.next(n);
      if (!c) { console.log(`step ${n}: nothing to do (the record no longer holds, or it has ended)`); break; }
      const step = await this.measure(n, c);
      steps.push(step);
      if (b.out) { appendFileSync(b.out, JSON.stringify(step) + '\n'); }
      if (step.total >= b.slow) { console.log(`slow: step ${n} ${step.choice} ${step.total} ms (facts ${step.facts})`); }
      if (n % b.every === 0) { JourneyReport.row(steps.slice(-b.every)); }
      if (b.checkpointEvery && n % b.checkpointEvery === 0) { await this.checkpoint(n); }
    }
    return steps;
  }
  private async checkpoint(n: number) {
    mkdirSync(this.bounds.checkpoints, { recursive: true });
    writeFileSync(`${this.bounds.checkpoints}/step-${n}.json`, await this.host.handle({ kind: 'checkpoint' }) as string);
  }
  private async measure(n: number, c: Offered): Promise<JourneyStep> {
    const campaign = this.inner.session.campaign, t1 = performance.now();
    const frame = await this.host.handle({ kind: 'perform', command: c.choice.id });
    const t2 = performance.now();
    await this.inner.keep();
    const t3 = performance.now();
    // What the engine prepares while the player reads (the country beyond a march-stone a step away), waited for as
    // a player's reading would give it time.
    await this.inner.preparing;
    const t4 = performance.now(), t = (frame as Frame).timing ?? { engine: 0, screen: 0, narrative: 0 };
    const installed = (campaign as unknown as { definition?: { installations?: unknown[] } }).definition?.installations;
    return { step: n, choice: c.choice.name, command: c.choice.id, total: Math.round(t2 - t1), ...t,
      save: Math.round(t3 - t2), ahead: Math.round(t4 - t3),
      elapsed: campaign.readout.elapsed, facts: campaign.world.view.relations.length,
      modules: installed?.length ?? 0, commands: campaign.history.length, saved: this.saved,
      heap: JourneyReport.heap(n % this.bounds.every === 0) };
  }
}
if (import.meta.main) { process.exitCode = await JourneyProfile.main(process.argv.slice(2)); }
