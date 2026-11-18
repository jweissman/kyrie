// A journey recorded as the player met it, for literary review (doc/architecture/mission-22/journey-reader): the
// runner's own turns (Runner: the scene's lines and prose, the offer, the aim), what was chosen and from where, and the
// narrator's exchange, step by step, with the session's transcript so that any step's checkpoint can be made again.
// A capture is what was shown when it was played; a replay is the same acts played again under the code as it is
// now. Each says which it is, and by what build; neither is ever written over the other.
import type { PlaySession, Transcript } from '../session/play-session';
import type { Exchange } from '../presentation/narrator';
import { Runner, type Asked, type Offered, type Said } from './runner';
import { PlayTool } from './play-tool';

// Where an act chosen stood in what the scene offered: what pulls next, the led, the four, the rest, a fight's turn.
export type From = 'next' | 'led' | 'primary' | 'rest' | 'fight' | 'given';
export interface CapturedStep {
  n: number; asked: Asked; label: string; from: From; said: Said; exchange?: Exchange;
  // How many of the session's transcript steps had been taken once this step was done (a journey's legs and a fight's
  // turns are steps of their own there): the checkpoint after it is the transcript played to here.
  mark: number; error?: string;
}
export interface Build { commit: string; dirty: boolean }
export interface CapturedRun {
  kind: 'captured' | 'replay'; about: string; args: string[]; policy: string; build: Build; at: string;
  opening: Said; steps: CapturedStep[]; transcript: Transcript;
  // A replay that could not do what the capture did: at which step, and why.
  diverged?: { step: number; why: string };
  // A replay's capture: the file and the build it was recorded at.
  of?: { file: string; build: Build; at: string };
}

export class JourneyCapture {
  static readonly about = 'A journey as the player met it, by the runner (bin/kyrie run): each step\'s scene, offer,'
    + ' choice and exchange. Written by scripts/journey-read.ts; never edited by hand.';
  // A game the runner's arguments name (--world iscoed --as human/warrior/Wenna), as `kyrie run` starts it.
  static async start(args: string[]): Promise<PlaySession> {
    return (await PlayTool.start(PlayTool.parse(args))).journey.session;
  }
  // A journey of up to `limit` steps chosen by the policy "fresh": what pulls next, else the first of the led, the
  // four and the rest (journeys by road last) not yet taken anywhere; a fight's turn by its first offer.
  static async record(session: PlaySession, o: { args: string[]; limit: number; build?: Build }): Promise<CapturedRun> {
    const runner = new Runner(session), opening = this.lean(runner.said()), steps: CapturedStep[] = [];
    const taken = new Map<string, number>();
    let said = opening;
    for (let n = 1; n <= o.limit && !said.end; n++) {
      const pick = this.pick(said, taken);
      if (!pick) { break; }
      this.took(taken, pick);
      const step = await this.step(runner, n, { act: pick.id }, pick);
      steps.push(step);
      if (step.error) { break; }
      said = step.said;
    }
    return { kind: 'captured', about: this.about, args: o.args, policy: 'fresh', build: o.build ?? this.build(),
      at: new Date().toISOString(), opening, steps, transcript: session.transcript };
  }
  // The same acts asked again of a game started as the capture's was, under the code as it is now; stopped, and said,
  // where one is no longer offered.
  static async replay(session: PlaySession, of: CapturedRun, file: string, build = this.build()): Promise<CapturedRun> {
    const runner = new Runner(session), opening = this.lean(runner.said()), steps: CapturedStep[] = [];
    let diverged: CapturedRun['diverged'];
    for (const kept of of.steps) {
      const offer = steps.at(-1)?.said ?? opening;
      const found = this.where(offer, 'act' in kept.asked ? kept.asked.act : '');
      const step = await this.step(runner, kept.n, kept.asked, found ?? { label: kept.label, from: 'given' });
      steps.push(step);
      if (step.error) { diverged = { step: kept.n, why: step.error }; break; }
    }
    return { kind: 'replay', about: this.about, args: of.args, policy: `the acts of ${file}`, build,
      at: new Date().toISOString(), opening, steps, transcript: session.transcript,
      of: { file, build: of.build, at: of.at }, ...diverged ? { diverged } : {} };
  }
  private static async step(runner: Runner, n: number, asked: Asked, pick: { label: string; from: From })
    : Promise<CapturedStep> {
    const out = await runner.ask(JSON.stringify(asked)), mark = runner.session.transcript.steps.length;
    if ('error' in out) {
      return { n, asked, label: pick.label, from: pick.from, mark, error: out.error,
        said: { turn: n, moment: 'outcome', scene: { lines: [], prose: [] }, offer: { primary: [], rest: [] } } };
    }
    const exchange = out.moment === 'fight' ? undefined : runner.exchange();
    return { n, asked, label: pick.label, from: pick.from, said: this.lean(out), ...exchange ? { exchange } : {},
      mark };
  }
  // A turn as kept: an offer's empty aspects and marks left out (absent is none), which are most of a capture's bulk.
  static lean(said: Said): Said {
    return { ...said, offer: { primary: said.offer.primary.map(o => this.bare(o)),
      rest: said.offer.rest.map(o => this.bare(o)) } };
  }
  private static bare(o: Offered): Offered {
    return Object.fromEntries(Object.entries(o).filter(([, v]) => !Array.isArray(v) || v.length)) as unknown as Offered;
  }
  // The act to take next by the policy "fresh" (see record): no act twice, and no words more than twice (a third
  // "Talk to Maud" tells what the second told); of the rest, a way to somewhere first, a journey by road last.
  static pick(said: Said, taken: Map<string, number>): { id: string; label: string; from: From } | undefined {
    if (said.moment === 'fight') {
      const first = said.offer.primary[0] ?? said.offer.rest[0];
      return first && { id: first.id, label: first.label, from: 'fight' };
    }
    const fresh = this.fresh.bind(this, taken);
    if (said.next?.act && fresh({ id: said.next.act, label: said.next.label ?? said.next.text })) {
      return { id: said.next.act, label: said.next.label ?? said.next.text, from: 'next' };
    }
    const led = said.offer.primary.find(o => said.led?.includes(o.id) && fresh(o));
    if (led) { return { id: led.id, label: led.label, from: 'led' }; }
    const four = said.offer.primary.find(fresh);
    if (four) { return { id: four.id, label: four.label, from: 'primary' }; }
    const rest = said.offer.rest.filter(fresh).sort((a, b) => this.rank(a) - this.rank(b))[0];
    return rest && { id: rest.id, label: rest.label, from: 'rest' };
  }
  private static rank(o: Offered): number { return o.id.startsWith('travel:') ? 2 : o.type === 'go' ? 0 : 1; }
  private static fresh(taken: Map<string, number>, o: { id: string; label: string }): boolean {
    return !taken.has(o.id) && (taken.get(`label:${o.label}`) ?? 0) < 2;
  }
  static took(taken: Map<string, number>, o: { id: string; label: string }) {
    taken.set(o.id, 1); taken.set(`label:${o.label}`, (taken.get(`label:${o.label}`) ?? 0) + 1);
  }
  // Where an act stood in a turn's offer, by its id.
  static where(said: Said, id: string): { label: string; from: From } | undefined {
    if (said.next?.act === id) { return { label: said.next.label ?? said.next.text, from: 'next' }; }
    const four = said.offer.primary.find(o => o.id === id), rest = said.offer.rest.find(o => o.id === id);
    if (four) { return { label: four.label, from: said.moment === 'fight' ? 'fight' : said.led?.includes(id) ? 'led' : 'primary' }; }
    return rest && { label: rest.label, from: 'rest' };
  }
  // The build this is played by: its commit, and whether the tree had changes not committed.
  static build(): Build {
    return { commit: this.git('rev-parse', '--short', 'HEAD') || 'unknown',
      dirty: this.git('status', '--porcelain', '--untracked-files=no').length > 0 };
  }
  private static git(...args: string[]): string { return Bun.spawnSync(['git', ...args]).stdout.toString().trim(); }
}
