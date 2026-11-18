// A journey reviewed step by step (the adventure-structure brief §6, ST-08's Phase A): a game played line by line
// through the runner (bin/kyrie run), as a blind agent or a cold player plays it, with an observer around each line
// that keeps the scene before it (the turn the line was chosen from), the line and what it was in that scene, what
// happened (the step's CampaignEvents), the scene after, what changed and what made each change, and where each line
// told was made. The game is played as it is played anywhere: the observer reads the runner's turns, the campaign's
// history and worlds, and CampaignTick's witness of the rules; it changes nothing (test/journey-review.test.ts holds
// that the turns are the same observed or not). A live recording is kept as it was played and never written over; a
// replay plays its lines again under the code as it is now, holds each step to the recorded transcript's digest
// (PlaySession.replay), and says, each on its own, whether the state, the offer and what was shown came out the same.
import type { PlaySession } from '../session/play-session';
import type { CampaignEvent } from '../campaign/campaign';
import { CampaignTick } from '../campaign/campaign-tick';
import type { World } from '../lang/world';
import { ScreenModel } from '../ui/screen-model';
import { Runner, type Asked, type Said } from './runner';
import { JourneyCapture, type Build } from './journey-capture';
import { ReviewFrame } from './review-frame';
import { ReviewProvenance } from './review-provenance';
import { ReviewDelta, type Fired } from './review-delta';
import { ReviewCoverage } from './review-coverage';
import type { JourneyReviewV1, Maker, ReviewFrame as Frame, ReviewStep } from './review-types';

export interface Observing { args: string[]; lines?: { file: string; playedAt?: string }; build?: Build }

export class JourneyReview {
  private readonly runner: Runner;
  private readonly frames: Frame[] = [];
  private readonly steps: ReviewStep[] = [];
  private readonly makers: Record<string, Maker> = {};
  private said: Said;
  private consequence = 0;
  private constructor(session: PlaySession) {
    this.runner = new Runner(session);
    this.said = this.runner.said();
    this.frame(this.said, [], true);
  }
  // A game played by these lines, observed.
  static async observe(session: PlaySession, lines: readonly string[], o: Observing): Promise<JourneyReviewV1> {
    const review = new JourneyReview(session);
    for (const line of lines) { await review.step(line); }
    return review.artifact('live-recorded', o);
  }
  // A review's lines played again under the code as it is now (a fresh game, started as the review's was), each step
  // held to the review's own transcript (PlaySession.replay refuses a step whose digest differs), and compared.
  static async replay(of: JourneyReviewV1, file: string, start: (args: string[]) => Promise<PlaySession>)
    : Promise<JourneyReviewV1> {
    const held = await start(of.source.args);
    await held.replay(structuredClone(of.source.transcript.steps));
    const review = new JourneyReview(await start(of.source.args));
    for (const s of of.steps) { await review.step(s.line); }
    const made = review.artifact('replay', { args: of.source.args, ...of.source.lines ? { lines: of.source.lines } : {} });
    return { ...made, source: { ...made.source, replayedAgainst: { file, revision: of.revision } },
      verdicts: JourneyReview.verdicts(of, made) };
  }
  private get campaign() { return this.runner.session.campaign; }
  // One line sent, and its step kept.
  private async step(line: string) {
    const n = this.steps.length + 1, before = this.frames.at(-1)!, campaign = this.campaign;
    const was: World = campaign.world, h0 = campaign.history.length, fired: Fired[] = [];
    CampaignTick.witness = JourneyReview.witnessed.bind(JourneyReview, fired);
    let out: Said | { error: string };
    try { out = await this.runner.ask(line); } finally { CampaignTick.witness = undefined; }
    const same = this.runner.session.campaign === campaign, events = same ? campaign.history.slice(h0) : [];
    const chosen = JourneyReview.chosen(this.said, line);
    const mark = this.runner.session.transcript.steps.length;
    if ('error' in out) {
      const delta = new ReviewDelta(campaign, new ReviewProvenance(campaign)).of({ before: was, after: was, events: [],
        fired: [], frames: [before, undefined] });
      this.steps.push({ n, line, before: before.n, ...chosen ? { chosen } : {}, error: out.error, events: [], delta,
        consequential: false, mark });
      return;
    }
    const after = this.frame(out, events, false), now = this.runner.session.campaign;
    const delta = new ReviewDelta(now, new ReviewProvenance(now)).of({ before: same ? was : now.world, after: now.world,
      events, fired, frames: [before, after] });
    const consequential = !!(delta.asserted.length || delta.retracted.length || delta.measures.length
      || delta.elapsed > 0 || delta.aims.taken.length || delta.aims.retired.length);
    this.steps.push({ n, line, before: before.n, after: after.n, ...chosen ? { chosen } : {},
      events: events.map(e => ({ action: e.action, result: e.result, ...e.response ? { response: e.response } : {},
        elapsed: e.elapsed })), delta, consequential,
      ...consequential ? { consequence: ++this.consequence } : {}, mark });
    this.said = out;
  }
  // A turn as a frame: its screen built afresh (ScreenModel reads the world, writes nothing), the narrator's kinds of
  // what it told, and what the terminal said for reference apart from the narration, where the turn is the scene's.
  private frame(said: Said, events: readonly CampaignEvent[], opening: boolean): Frame {
    const campaign = this.campaign, screen = ScreenModel.build(campaign), scene = this.runner.scenes.at(-1);
    const ours = scene && scene.lines.length === said.scene.prose.length
      && scene.lines.every((l, i) => l === said.scene.prose[i]);
    const kinds = said.moment === 'outcome' ? this.runner.exchange()?.lines : undefined;
    const frame = new ReviewFrame(campaign, this.makers).of(this.frames.length, { said, screen, events,
      ...kinds ? { kinds } : {},
      ...ours ? { reference: scene.reference } : {}, opening, ...this.runner.leaf ? { leaf: this.runner.leaf } : {} });
    this.frames.push(frame);
    return frame;
  }
  private static witnessed(fired: Fired[], rule: string, changes: string[]) { fired.push({ rule, changes }); }
  // What the line was in the scene it was sent from: an act by its label and where it stood, or what else was asked.
  private static chosen(said: Said, line: string): ReviewStep['chosen'] | undefined {
    let asked: Asked;
    try { asked = JSON.parse(line) as Asked; } catch { return undefined; }
    if (!('act' in asked)) {
      const what = 'look' in asked ? 'look' : 'lens' in asked ? `lens ${String(asked.lens)}` : 'follow' in asked
        ? `follow ${String(asked.follow)}` : 'more';
      return { command: line, label: what, from: 'asked' };
    }
    const found = JourneyCapture.where(said, asked.act);
    return { command: asked.act, label: found?.label ?? '', from: found?.from ?? 'not in the scene before' };
  }
  private artifact(kind: JourneyReviewV1['source']['kind'], o: Observing): JourneyReviewV1 {
    return { version: 1, kind: 'journey-review', generatedAt: new Date().toISOString(),
      revision: o.build ?? JourneyCapture.build(),
      source: { kind, args: o.args, ...o.lines ? { lines: o.lines } : {}, transcript: this.runner.session.transcript },
      frames: this.frames, steps: this.steps, makers: this.makers,
      coverage: ReviewCoverage.of(this.frames, this.makers) };
  }
  // A replay against what it replayed, step by step: the state (the digest after), the offer (the act chosen, still
  // offered under the same words, or not), and what was shown (every line, in order).
  private static verdicts(of: JourneyReviewV1, made: JourneyReviewV1): NonNullable<JourneyReviewV1['verdicts']> {
    return of.steps.map((s, i) => {
      const t = made.steps[i], a = s.after === undefined ? undefined : of.frames[s.after];
      const b = t?.after === undefined ? undefined : made.frames[t.after];
      const offered = t?.chosen && t.chosen.from !== 'not in the scene before';
      return { step: s.n, state: a?.digest === b?.digest ? 'same' as const : 'differs' as const,
        offer: !offered && s.chosen?.from !== 'not in the scene before' ? 'not offered' as const
          : t?.chosen?.label === s.chosen?.label && t?.chosen?.from === s.chosen?.from ? 'same' as const : 'changed' as const,
        presentation: JSON.stringify(a?.lines.map(l => l.text)) === JSON.stringify(b?.lines.map(l => l.text))
          ? 'same' as const : 'differs' as const };
    });
  }
}
