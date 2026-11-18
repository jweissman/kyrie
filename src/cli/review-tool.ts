// `kyrie review`: a played journey reviewed step by step (the adventure-structure brief §6 and §10; ST-08's Phase A;
// see doc/architecture/mission-22/review/README.md). A review is a directory: review.json (recorded live as its lines
// were played, never written over), journey.md (to read aloud), findings.md (how much is known by its making, and the
// unknown), and, once replayed, replay.json and replay.md (the same lines under the code as it is now, apart).
//   bin/kyrie review record <dir> <lines.txt> [--force] [--played-at <commit>] --world iscoed --as human/warrior/Wenna
//   bin/kyrie review replay <dir>
//   bin/kyrie review step <dir> <n> [--replay]
//   bin/kyrie review render <dir>
//   bin/kyrie review <lines.txt> --world … --as … [--step n]   (played and shown, nothing kept)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JourneyCapture } from './journey-capture';
import { JourneyReview } from './journey-review';
import { ReviewInspector } from './review-inspector';
import { ReviewMarkdown } from './review-markdown';
import type { JourneyReviewV1 } from './review-types';

export class ReviewTool {
  static readonly usage = 'usage: kyrie review record <dir> <lines.txt> [--force] [--played-at c] <run args>'
    + ' | replay <dir> | step <dir> <n> [--replay] | render <dir> | <lines.txt> <run args> [--step n]';
  static async main(args: string[]): Promise<number> {
    const [verb, dir, ...rest] = args;
    if (!verb) { console.error(this.usage); return 2; }
    switch (verb) {
      case 'record': return dir ? this.record(dir, rest) : this.fail();
      case 'replay': return dir ? this.replay(dir) : this.fail();
      case 'step': {
        if (!dir) { return this.fail(); }
        return this.step(this.read(dir, rest.includes('--replay') ? 'replay.json' : 'review.json'), Number(rest[0]));
      }
      case 'render': if (!dir) { return this.fail(); } this.render(dir); return 0;
      default: return this.once(args);
    }
  }
  private static fail(): number { console.error(this.usage); return 2; }
  static read(dir: string, file = 'review.json'): JourneyReviewV1 {
    return JSON.parse(readFileSync(join(dir, file), 'utf8')) as JourneyReviewV1;
  }
  static lines(file: string): string[] { return readFileSync(file, 'utf8').split('\n').filter(l => l.trim()); }
  // The lines played and observed, kept as the review; one kept already is not written over unless asked.
  private static async record(dir: string, rest: string[]): Promise<number> {
    const [file, ...more] = rest, force = more.includes('--force'), playedAt = this.flag(more, '--played-at');
    const args = more.filter((a, i) => a !== '--force' && a !== '--played-at' && more[i - 1] !== '--played-at');
    if (!file) { return this.fail(); }
    if (existsSync(join(dir, 'review.json')) && !force) {
      console.error(`${dir}/review.json is kept already: a live recording is not written over (--force to record anew)`);
      return 1;
    }
    const started = performance.now();
    const review = await JourneyReview.observe(await JourneyCapture.start(args), this.lines(file),
      { args, lines: { file, ...playedAt ? { playedAt } : {} } });
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'review.json'), this.json(review));
    console.log(`${dir}/review.json: ${review.steps.length} steps at ${review.revision.commit}`
      + ` in ${Math.round(performance.now() - started)} ms, ${this.json(review).length} bytes`);
    this.render(dir);
    return 0;
  }
  // The review's lines played again, apart (replay.json), its live recording untouched.
  private static async replay(dir: string): Promise<number> {
    const of = this.read(dir);
    let made: JourneyReviewV1;
    try { made = await JourneyReview.replay(of, join(dir, 'review.json'), a => JourneyCapture.start(a)); } catch (e) {
      console.error(`the review's transcript does not replay under the code as it is now: ${(e as Error).message}`);
      return 1;
    }
    writeFileSync(join(dir, 'replay.json'), this.json(made));
    const differ = (made.verdicts ?? []).filter(v => v.state !== 'same' || v.offer !== 'same' || v.presentation !== 'same');
    console.log(`${dir}/replay.json: ${made.steps.length} steps at ${made.revision.commit}; ${differ.length} differ`);
    this.render(dir);
    return 0;
  }
  // The pages made again from what is kept: no game played.
  static render(dir: string) {
    const live = this.read(dir);
    writeFileSync(join(dir, 'journey.md'), ReviewMarkdown.journey(live));
    writeFileSync(join(dir, 'findings.md'), ReviewMarkdown.findings(live));
    console.log(`${dir}/journey.md, ${dir}/findings.md`);
    if (existsSync(join(dir, 'replay.json'))) {
      writeFileSync(join(dir, 'replay.md'), ReviewMarkdown.compared(live, this.read(dir, 'replay.json')));
      console.log(`${dir}/replay.md`);
    }
  }
  private static step(r: JourneyReviewV1, n: number): number {
    const shown = ReviewInspector.step(r, n);
    if (!shown) { console.error(`no step ${n}: the review has ${r.steps.length}`); return 2; }
    console.log(shown);
    return 0;
  }
  // Played and shown at once, nothing kept: the journey, or one step.
  private static async once(args: string[]): Promise<number> {
    const [file, ...rest] = args, n = this.flag(rest, '--step');
    const run = rest.filter((a, i) => a !== '--step' && rest[i - 1] !== '--step');
    if (!file || !existsSync(file)) { return this.fail(); }
    const review = await JourneyReview.observe(await JourneyCapture.start(run), this.lines(file),
      { args: run, lines: { file } });
    if (n) { return this.step(review, Number(n)); }
    console.log(ReviewMarkdown.journey(review));
    return 0;
  }
  private static flag(args: string[], flag: string): string | undefined {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  }
  // A review a frame or a step to a line: read by a diff step by step.
  static json(r: JourneyReviewV1): string {
    const { frames, steps, source, makers, ...head } = r, { transcript, ...from } = source;
    return `{${Object.entries(head).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')},\n`
      + `"source":${JSON.stringify({ ...from, transcript })},\n`
      + `"frames":[\n${frames.map(f => JSON.stringify(f)).join(',\n')}\n],\n`
      + `"steps":[\n${steps.map(s => JSON.stringify(s)).join(',\n')}\n],\n`
      + `"makers":{\n${Object.entries(makers).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}}\n`;
  }
}
