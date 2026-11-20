#!/usr/bin/env bun
// Every client the same (MT-18; the owner, 20 November: "the important thing for verification would be that all the
// clients are the same, and Atlas logic is entirely in the engine"). A walk is played through the runner, and at each
// turn what the runner offers is read against the engine's one projection of the same turn (Doable, the rows every
// client is to draw): every act the engine offers and the runner does not, every row the runner offers that is no
// act of the engine's, every act both offer in different words, and every lead whose step names no row the runner
// offers. Today's divergences are kept as a baseline (doc/architecture/mission-22/offer-parity-baseline.json) that
// test/offer-parity lets only shrink, as scripts/layers.ts keeps the layers'. The runner first; the page's lenses and
// `serve` to follow (MT-18).
//   bun scripts/offer-parity.ts              the divergences by kind, with counts
//   bun scripts/offer-parity.ts --write      the baseline written from them
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../src/cli/runner';
import { RunnerOffer } from '../src/cli/runner-offer';
import { Doable, type Row } from '../src/presentation/doable';
import { ScreenModel } from '../src/ui/screen-model';

export interface Walk { world: string; as: string; lines: string }

export class OfferParity {
  static readonly root = join(import.meta.dir, '..');
  static readonly baseline = 'doc/architecture/mission-22/offer-parity-baseline.json';
  // The golden route's warrior (S3-0): the drove, the fuel boat, the night road and the gate-well.
  static readonly walks: Walk[] = [{ world: 'iscoed', as: 'human/warrior/Wenna',
    lines: 'doc/architecture/mission-22/golden/warrior-lines.txt' }];
  // Every divergence of every walk, as "kind: what" (one entry however many turns it stands at).
  static async divergences(walks = this.walks, turns = Infinity): Promise<string[]> {
    const out = new Set<string>();
    for (const w of walks) {
      const lines = readFileSync(join(this.root, w.lines), 'utf8').split('\n').filter(Boolean).slice(0, turns);
      const { journey } = await PlayTool.start(PlayTool.parse(['--world', w.world, '--as', w.as]));
      const runner = new Runner(journey.session);
      this.turn(runner, runner.said(), out);
      for (const line of lines) {
        const said = await runner.ask(line);
        if (!('error' in said)) { this.turn(runner, said, out); }
      }
    }
    return [...out].sort();
  }
  // One turn: the runner's rows against the engine's, by the act each does.
  private static turn(runner: Runner, said: Said, out: Set<string>) {
    const glance = runner.leaf?.glance;
    if (!glance) { return; }
    const engine = this.engine(Doable.of(glance, ScreenModel.build(runner.session.campaign)));
    const offered = RunnerOffer.flat([...said.offer.primary, ...said.offer.rest,
      ...Object.values(said.offer.lenses ?? {}).flatMap(os => os ?? [])] as Offered[]);
    const drawn = new Map(offered.filter(o => !o.opens?.length).map(o => [o.id, o.label]));
    for (const [act, words] of engine) {
      if (!drawn.has(act)) { out.add(`engine only: ${act}`); }
      else if (drawn.get(act) !== words) { out.add(`words: ${act}`); }
    }
    for (const id of drawn.keys()) { if (!engine.has(id)) { out.add(`runner only: ${id.replace(/\(.*$/, '(…)')}`); } }
    const step = said.going?.act;
    if (step && !drawn.has(step)) { out.add(`lead names no row: ${step.replace(/[(:/].*$/, '…')}`); }
  }
  // The engine's rows by the act each does, in its own words (an opener's leaves, each by its own).
  private static engine(rows: Row[]): Map<string, string> {
    return new Map(Doable.flat(rows).flatMap(r => r.does && !r.opens?.length ? [[r.does, r.called ?? r.label]] : []));
  }
  static kinds(divergences: string[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const d of divergences) { const k = d.split(':')[0]!; out[k] = (out[k] ?? 0) + 1; }
    return out;
  }
  static async main(argv: string[]): Promise<number> {
    const found = await this.divergences();
    if (argv.includes('--write')) {
      writeFileSync(join(this.root, this.baseline), `${JSON.stringify({ about: 'What the runner offers that the '
        + 'engine does not, and the reverse, over the golden walks (MT-18, scripts/offer-parity.ts): kept so that none '
        + 'is added; each removed is taken off.', kinds: this.kinds(found), divergences: found }, null, 1)}\n`);
    }
    console.log(Object.entries(this.kinds(found)).map(([k, n]) => `${n}\t${k}`).join('\n'));
    console.log(`${found.length} divergences`);
    return 0;
  }
}

if (import.meta.main) { process.exit(await OfferParity.main(process.argv.slice(2))); }
