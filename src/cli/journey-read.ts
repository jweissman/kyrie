// `kyrie read`: a Westernesse journey read as the player met it, for literary review (development only; see
// doc/architecture/mission-22/journey-reader/README.md). A run is a directory: captured.json (what was shown when it
// was played, never written over), notes.json (the reviewer's), replay.json (the capture's acts under the code as it
// is now), and the pages made from them: reader.html and account.md of the capture, compare.html and compare.md of
// the two.
//   bin/kyrie read record <dir> [--limit 40] [--force] --world iscoed --as human/warrior/Wenna
//   bin/kyrie read render <dir>
//   bin/kyrie read note <dir> <step> <kind> "<words quoted>" "<note>" [--suggest "<instead>"] [--by name]
//   bin/kyrie read replay <dir>
//   bin/kyrie read scene <dir> <step> [--out file]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JourneyCapture, type CapturedRun } from './journey-capture';
import { JourneyAccount } from './journey-account';
import { JourneyHtml } from './journey-html';
import { JourneyCompare } from './journey-compare';
import { JourneyNotes, type Kind } from './journey-notes';
import { ProseProvenance } from './prose-provenance';

export class JourneyRead {
  static readonly usage = 'usage: kyrie read record <dir> [--limit n] [--force] <run args> | render <dir>'
    + ' | note <dir> <step> <kind> "<quote>" "<note>" [--suggest s] [--by name] | replay <dir> | scene <dir> <step> [--out f]';
  static async main(args: string[]): Promise<number> {
    const [verb, dir, ...rest] = args;
    if (!verb || !dir) { console.error(this.usage); return 2; }
    switch (verb) {
      case 'record': return this.record(dir, rest);
      case 'render': this.render(dir); return 0;
      case 'note': return this.note(dir, rest);
      case 'replay': return this.replay(dir);
      case 'scene': return this.scene(dir, Number(rest[0]), this.flag(rest, '--out'));
      default: console.error(this.usage); return 2;
    }
  }
  static read(dir: string, file = 'captured.json'): CapturedRun {
    return JSON.parse(readFileSync(join(dir, file), 'utf8')) as CapturedRun;
  }
  // A journey played by the policy and kept as it was shown; a capture already kept is not written over unless asked.
  private static async record(dir: string, rest: string[]): Promise<number> {
    const limit = Number(this.flag(rest, '--limit') ?? 40), force = rest.includes('--force');
    const args = rest.filter((a, i) => a !== '--force' && a !== '--limit' && rest[i - 1] !== '--limit');
    if (existsSync(join(dir, 'captured.json')) && !force) {
      console.error(`${dir}/captured.json is kept already: a capture is not written over (--force to record anew)`);
      return 1;
    }
    const run = await JourneyCapture.record(await JourneyCapture.start(args), { args, limit });
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'captured.json'), this.json(run));
    console.log(`${dir}/captured.json: ${run.steps.length} steps at ${run.build.commit}`);
    this.render(dir);
    return 0;
  }
  // The capture's pages made again (its notes and the sources as they are now), no game played.
  static render(dir: string, provenance = ProseProvenance.index()) {
    const run = this.read(dir), notes = JourneyNotes.read(dir);
    writeFileSync(join(dir, 'reader.html'), JourneyHtml.page(run, notes, provenance, `bin/kyrie read scene ${dir}`));
    writeFileSync(join(dir, 'account.md'), JourneyAccount.markdown(run));
    console.log(`${dir}/reader.html, ${dir}/account.md`);
    if (existsSync(join(dir, 'replay.json'))) {
      const replay = this.read(dir, 'replay.json');
      writeFileSync(join(dir, 'compare.html'), JourneyCompare.page(run, replay, notes));
      writeFileSync(join(dir, 'compare.md'), JourneyCompare.markdown(run, replay, notes));
      console.log(`${dir}/compare.html, ${dir}/compare.md`);
    }
  }
  private static note(dir: string, rest: string[]): number {
    const words = rest.filter((a, i) => !a.startsWith('--') && !['--suggest', '--by'].includes(rest[i - 1] ?? ''));
    const [step, kind, quote, note] = words, suggest = this.flag(rest, '--suggest'), by = this.flag(rest, '--by');
    if (!step || !kind || !quote || !note) { console.error(this.usage); return 2; }
    try {
      JourneyNotes.add(dir, { step: Number(step), kind: kind as Kind, quote, note, ...suggest ? { suggest } : {},
        ...by ? { by } : {} }, JourneyAccount.steps(this.read(dir)));
    } catch (e) { console.error((e as Error).message); return 1; }
    this.render(dir);
    return 0;
  }
  // The capture's acts asked again under the code as it is now, kept apart as replay.json, and the two compared.
  private static async replay(dir: string): Promise<number> {
    const captured = this.read(dir);
    const replay = await JourneyCapture.replay(await JourneyCapture.start(captured.args), captured, 'captured.json');
    writeFileSync(join(dir, 'replay.json'), this.json(replay));
    console.log(`${dir}/replay.json: ${replay.steps.length} of ${captured.steps.length} steps at ${replay.build.commit}`
      + (replay.diverged ? `; stopped at step ${replay.diverged.step}: ${replay.diverged.why}` : ''));
    this.render(dir);
    return replay.diverged ? 1 : 0;
  }
  // The game as it stood just before a step, as a save file the page opens (its title page, or Options, opens one;
  // scripts/journey-scene.ts opens it and takes the step in a browser): the capture's commands played again headless,
  // each held to the state it was recorded with, so a checkpoint the code no longer comes to is refused, not made.
  private static async scene(dir: string, n: number, out?: string): Promise<number> {
    const run = this.read(dir), i = run.steps.findIndex(s => s.n === n), step = run.steps[i];
    if (!step || !n) { console.error(`no step ${n} in ${dir}/captured.json`); return 2; }
    const before = run.steps[i - 1];
    if (step.said.moment === 'fight' || before?.said.moment === 'fight') {
      console.error(`step ${n} is a turn of a fight: a checkpoint is kept only between commands (the fight's first step opens it)`);
      return 2;
    }
    const mark = before?.mark ?? 0, session = await JourneyCapture.start(run.args);
    try { await session.replay(run.transcript.steps.slice(0, mark)); } catch (e) {
      console.error(`step ${n} cannot be set up under the code as it is now: ${(e as Error).message}`);
      return 1;
    }
    const file = out ?? join(tmpdir(), 'kyrie-journey-scenes', `step-${n}.checkpoint.json`);
    mkdirSync(join(file, '..'), { recursive: true });
    const act = 'act' in step.asked ? step.asked.act : '';
    const prior = before ? [{ id: 0, at: '', elapsed: 0, place: before.said.at ?? '', placeName: '', said: before.label,
      lines: before.said.scene.prose, notes: [], tone: 'act' as const, title: before.label }] : [];
    writeFileSync(file, JSON.stringify({ about: `Before step ${n} of ${dir}/captured.json (${step.label}), its commands`
      + ` replayed at ${JourneyCapture.build().commit}`, step: { n, act, label: step.label }, checkpoint:
      session.checkpoint(), log: prior }));
    console.log(`${file}\n  open it in the page (title page: open a save file), then: ${step.label}`
      + `\n  or: bun scripts/journey-scene.ts ${file}`);
    return 0;
  }
  private static flag(args: string[], flag: string): string | undefined {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  }
  // A run kept a step to a line: small enough to keep in the repository, and read by a diff step by step.
  static json(run: CapturedRun): string {
    const { steps, opening, transcript, ...head } = run;
    return `{${Object.entries(head).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')},\n`
      + `"opening":${JSON.stringify(opening)},\n"steps":[\n${steps.map(s => JSON.stringify(s)).join(',\n')}\n],\n`
      + `"transcript":${JSON.stringify(transcript)}}\n`;
  }
}
