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
//   bun scripts/offer-parity.ts --where      each divergence with the turn it was first met at, and the move
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
  static async divergences(walks = this.walks, turns = Infinity, where?: Map<string, string>): Promise<string[]> {
    const out = new Set<string>();
    for (const w of walks) {
      const lines = readFileSync(join(this.root, w.lines), 'utf8').split('\n').filter(Boolean).slice(0, turns);
      const { journey } = await PlayTool.start(PlayTool.parse(['--world', w.world, '--as', w.as]));
      const runner = new Runner(journey.session);
      this.turn(runner, runner.said(), out);
      for (const line of lines) {
        const said = await runner.ask(line), before = new Set(out);
        if ('error' in said) { continue; }
        this.turn(runner, said, out);
        // Where each was first met, for --where: the turn, its moment, and the move that came to it.
        for (const d of out) {
          if (!before.has(d) && where && !where.has(d)) { where.set(d, `T${said.turn} ${said.moment} after ${line}`); }
        }
      }
    }
    return [...out].sort();
  }
  // One turn: the runner's rows against the engine's, by the act each does.
  private static turn(runner: Runner, said: Said, out: Set<string>) {
    const glance = runner.leaf?.glance;
    if (!glance) { return; }
    const rows = Doable.of(glance, ScreenModel.build(runner.session.campaign)), engine = this.engine(rows);
    const doing = new Map(Doable.flat(rows).flatMap(r => r.does ? [[r.id, r.does] as const] : []));
    const offered = RunnerOffer.flat([...said.offer.primary, ...said.offer.rest,
      ...Object.values(said.offer.lenses ?? {}).flatMap(os => os ?? [])] as Offered[]);
    const drawn = new Map(offered.filter(o => !o.opens?.length).map(o => [o.id, o.label]));
    // An act held under an opener (a person's asks under their talk) is offered where the opener is, by the engine's
    // own id: opened, it shows them, as the page's drawer does.
    const openers = new Set(offered.filter(o => o.opens?.length).map(o => o.id));
    // A journey the engine puts on the map is offered there (the runner's folded journeys, counted in more), never in
    // the rest.
    const mapped = [...engine].filter(([, e]) => e.map);
    if (mapped.length !== (said.offer.more?.journeys ?? 0)) {
      out.add(`map count: engine ${mapped.length}, runner ${said.offer.more?.journeys ?? 0}`);
    }
    for (const [act] of mapped) { if (drawn.has(act)) { out.add(`unfolded: ${act}`); } }
    for (const [act, { words, id, under, within }] of engine.entries().filter(([, e]) => !e.map)) {
      if (!drawn.has(act) && ![under, within].some(h => h && this.held(h, drawn, openers, doing))) {
        out.add(`engine only: ${act}`); continue;
      }
      if (drawn.has(act) && drawn.get(act) !== words) { out.add(`words: ${act}`); }
      // The same act under another name: the runner names a row by what it does, the engine by the row (AT-13).
      if (drawn.has(act) && id !== act) { out.add(`named apart: ${id.replace(/[(:/#].*$/, '…')}`); }
    }
    // A row the runner names by the engine's own id, or by what a row of the engine's does (a talk led for a
    // question, offered as the talk), is the engine's: a companion's talk only holds.
    const ids = new Set([...Doable.flat(rows).map(r => r.id), ...doing.values()]);
    for (const id of drawn.keys()) {
      if (!engine.has(id) && !ids.has(id)) { out.add(`runner only: ${id.replace(/\(.*$/, '(…)')}`); }
    }
    const step = said.going?.act;
    if (step && !drawn.has(step)) { out.add(`lead names no row: ${step.replace(/[(:/].*$/, '…')}`); }
  }
  // Whether the row an act is held within or under is offered: by its id, by what it does, or as the runner names a
  // person's talk (talk:<person>, itself counted runner only); an opener drawn as one row is turned to.
  private static held(within: string, drawn: Map<string, string>, openers: Set<string>,
    doing: Map<string, string>): boolean {
    return openers.has(within) || drawn.has(within) || drawn.has(doing.get(within) ?? '')
      || drawn.has(`talk:${within.replace(/#talk$/, '')}`);
  }
  // The engine's rows by the act each does, in its own words, with the opener each is held under (if any), and whether
  // it is on the map.
  private static engine(rows: Row[], under?: string)
    : Map<string, { words: string; id: string; under?: string; within?: string; map?: true }> {
    return new Map(rows.flatMap(r => r.opens?.length ? [...this.engine(r.opens, under ?? r.id)]
      : r.for ?? r.does ? [[(r.for ?? r.does)!, { words: r.called ?? r.label, id: r.id,
        ...under ? { under } : {}, ...r.within ? { within: r.within } : {}, ...r.map ? { map: r.map } : {} }] as const]
        : []));
  }
  static kinds(divergences: string[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const d of divergences) { const k = d.split(':')[0]!; out[k] = (out[k] ?? 0) + 1; }
    return out;
  }
  static async main(argv: string[]): Promise<number> {
    const where = argv.includes('--where') ? new Map<string, string>() : undefined;
    const found = await this.divergences(this.walks, Infinity, where);
    if (where) { console.log([...where].map(([d, w]) => `${w}\t${d}`).sort().join('\n')); }
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
