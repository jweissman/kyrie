// The compatibility harness's journeys (see CompatSnapshot): the cold plays' own lines, sent to the runner as the
// iscoed cold-play specs send them, and the kept traces (test/fixtures/traces), each played step by step, the turn
// after each step read through the runner's offer, and its save restored at the end.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PlaySession, type Transcript } from '../session/play-session';
import { Digest } from '../session/digest';
import { DrawnWorld } from '../client/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { JourneyShot, SaveShot, StepShot } from './compat-snapshot';
import { Runner, type Said } from './runner';
import { RunnerOffer } from './runner-offer';
import { PlayTool } from './play-tool';
import { Traces, type Kept } from './traces';

// A cold play: the world it was played in (the play tool's arguments) and the file of its lines.
export interface Cold { name: string; world: string; args: string[]; file: string; quick?: number }

export class CompatJourneys {
  static readonly cold: Cold[] = [
    { name: 'cold-4', world: 'iscoed/drove', args: ['--world', 'iscoed', '--as', 'human/warrior/Wenna'],
      file: 'doc/architecture/mission-22/cold/cold-4-lines.txt', quick: 12 },
    { name: 'cold-5', world: 'iscoed/weir', args: ['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar'],
      file: 'doc/architecture/mission-22/cold/cold-5-lines.txt' },
  ];
  // The clock's own journey: a1 left to itself to the eleventh day, a wait a day, and the tenth's afternoon in two, so
  // that what the standing scenarios do on their clocks is compared (the Walk's riot at two and its Reckoning at four:
  // MT-09's mending moved nothing the company's journeys reach), not only what a company does. Not quick: 80 s.
  static readonly clock = ['--world', 'a1', ...Array.from({ length: 9 }, (_, i) => `==day ${i + 2} 08:00`),
    '==day 10 15:00', '==day 10 17:00', '==day 11 08:00'];
  static async clocked(saves?: string): Promise<JourneyShot> { return this.played('clock/a1', this.clock, saves); }
  // quick: only the kept plays of a campaign (a generated world's are drawn, the slow part).
  static async traces(o: { quick: boolean; saves?: string }): Promise<JourneyShot[]> {
    const out: JourneyShot[] = [];
    for (const file of readdirSync(Traces.dir).filter(f => f.endsWith('.json') && !f.endsWith('.transcript.json'))) {
      const kept = JSON.parse(await readFile(join(Traces.dir, file), 'utf8')) as Kept, name = `trace/${Traces.named(file)}`;
      if (o.quick && (!kept.play || kept.play.includes('--world'))) { continue; }
      out.push(kept.play ? await this.played(name, kept.play, o.saves)
        : await this.transcript(name, join(Traces.dir, kept.transcript!), o.saves));
    }
    return out;
  }
  // A cold play's lines, sent in the world its play began in.
  static async lines(c: Cold, session: PlaySession, o: { quick: boolean; saves?: string }): Promise<JourneyShot> {
    const r = new Runner(session);
    const sent = (await readFile(c.file, 'utf8')).split('\n').filter(Boolean).slice(0, o.quick ? c.quick : undefined);
    const steps: StepShot[] = [];
    let s = r.said();
    for (const line of sent) {
      // A line the runner throws at (a "follow" sent while a fight is under way: cold-4 at HEAD of 19 November) ends
      // the journey there, as a kept trace's first failure does, and is said as the step's error.
      const x = await r.ask(line).catch((e: unknown) => ({ threw: e instanceof Error ? e.message : String(e) }));
      if ('threw' in x) { steps.push(this.step(line, s, session, `threw: ${x.threw}`)); break; }
      if (!('error' in x)) { s = x; }
      steps.push(this.step(line, s, session, 'error' in x ? x.error : undefined));
    }
    return { name: c.name, world: c.world, steps, save: await this.save(c.name, session, o.saves) };
  }
  // A trace kept by `kyrie play --keep`: its steps by label, as PlayTool.again takes them.
  private static async played(name: string, args: string[], saves?: string): Promise<JourneyShot> {
    const o = PlayTool.parse(args), { journey: j, lead } = await PlayTool.start(o);
    j.roll(o.roll);
    const steps: StepShot[] = [];
    for (const step of [...lead, ...await PlayTool.steps(o.file), ...o.steps]) {
      let error: string | undefined;
      try { await j.step(step); } catch (e) { error = e instanceof Error ? e.message.split('\n')[0] : String(e); }
      steps.push(this.step(step, new Runner(j.session).said(), j.session, error));
      if (error) { break; }
    }
    return { name, world: o.world ?? o.campaign ?? '', steps, save: await this.save(name, j.session, saves) };
  }
  // A transcript kept from the browser: its commands, each taken as it was (its own kept digest not held to: the
  // harness says what differs, it does not stop at the first).
  private static async transcript(name: string, file: string, saves?: string): Promise<JourneyShot> {
    const t = JSON.parse(await readFile(file, 'utf8')) as Transcript;
    const s = t.drawn ? await DrawnWorld.start(t.seed, t.drawn, NodeBundleSource.shared)
      : await PlaySession.start(t.scenario, t.seed, NodeBundleSource.shared, t.party);
    const steps: StepShot[] = [];
    for (const step of t.steps) {
      let error: string | undefined;
      try { await s.leg(step.command, PlaySession.scripted([...step.combat ?? []])); }
      catch (e) { error = e instanceof Error ? e.message.split('\n')[0] : String(e); }
      steps.push(this.step(step.command, new Runner(s).said(), s, error));
      if (error) { break; }
    }
    return { name, world: t.seed, steps, save: await this.save(name, s, saves) };
  }
  static step(line: string, s: Said, session: PlaySession, error?: string): StepShot {
    return { line, ok: !error, ...error ? { error } : {}, ...this.turn(s), digest: Digest.of(session.campaign),
      ...s.at ? { at: s.at } : {} };
  }
  // A turn as the runner offers it: each row (opened rows too) by its id and label, and the scene's lines.
  static turn(s: Said): Pick<StepShot, 'rows' | 'lines'> {
    return { rows: RunnerOffer.flat([...s.offer.primary, ...s.offer.rest]).map(o => `${o.id} | ${o.label}`),
      lines: s.scene.lines };
  }
  // The game kept and opened again in this build: the same digest and the same turn, read by a fresh runner.
  // A journey that ends in the middle of a command (a fight under way) has no save to take.
  private static async save(name: string, session: PlaySession, saves?: string): Promise<SaveShot> {
    if (session.acting) { return { restores: false, why: 'ends mid-command (a fight under way)', digest: '', turn: [] }; }
    const text = JSON.stringify(session.checkpoint()), before = this.reading(session);
    let file: string | undefined;
    if (saves) {
      await mkdir(saves, { recursive: true });
      file = join(saves, `${name.replaceAll('/', '-')}.json`);
      await writeFile(file, text);
    }
    const after = this.reopen(text);
    const restores = !after.why && after.digest === before.digest && after.turn.join('\n') === before.turn.join('\n');
    return { restores, ...after.why ? { why: after.why } : !restores ? { why: 'restored otherwise' } : {},
      digest: before.digest, turn: before.turn, ...file ? { file } : {} };
  }
  // A checkpoint's text opened as the page opens a save: its digest and its turn, or why it would not open.
  static reopen(text: string): { digest: string; turn: string[]; why?: string } {
    try {
      return this.reading(PlaySession.resume(JSON.parse(text) as Parameters<typeof PlaySession.resume>[0],
        { trusted: true }));
    } catch (e) { return { digest: '', turn: [], why: e instanceof Error ? e.message : String(e) }; }
  }
  private static reading(session: PlaySession): { digest: string; turn: string[] } {
    const t = this.turn(new Runner(session).said());
    return { digest: Digest.of(session.campaign), turn: [...t.rows, ...t.lines] };
  }
}
