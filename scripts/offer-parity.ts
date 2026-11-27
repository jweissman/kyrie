#!/usr/bin/env bun
// Every client the same (MT-18; the owner, 20 November: "the important thing for verification would be that all the
// clients are the same, and Atlas logic is entirely in the engine"). A walk is played through the runner, and at each
// turn what the runner offers is read against the engine's one projection of the same turn (Doable, the rows every
// client is to draw): every act the engine offers and the runner does not, every row the runner offers that is no
// act of the engine's, every act both offer in different words, and every lead whose step names no row the runner
// offers. Today's divergences are kept as a baseline (doc/architecture/mission-22/offer-parity-baseline.json) that
// test/offer-parity lets only shrink, as scripts/layers.ts keeps the layers'. The runner's own, and at the same turns
// the page's and `serve`'s, named by client (scripts/client-parity.ts; mt18-grouping.md, 'The page and serve').
//   bun scripts/offer-parity.ts              the divergences by kind, with counts
//   bun scripts/offer-parity.ts --write      the baseline written from them
//   bun scripts/offer-parity.ts --where      each divergence with the turn it was first met at, and the move
//   bun scripts/offer-parity.ts --words      each words divergence with the engine's words and the client's
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../src/cli/runner';
import { RunnerOffer } from '../src/cli/runner-offer';
import { Doable, type Row } from '../src/presentation/doable';
import { ScreenModel } from '../src/ui/screen-model';
import { ClientParity } from './client-parity';
import { GoldenWalk } from '../test/support/golden-walk';
import { RunnerFight } from '../src/cli/runner-fight';

export interface Walk { world: string; as: string; lines: string }
interface EngineAct { words: string; id: string; under?: string; within?: string; map?: true; pack?: true; led?: true }

export class OfferParity {
  static readonly root = join(import.meta.dir, '..');
  static readonly baseline = 'doc/architecture/mission-22/offer-parity-baseline.json';
  // The golden route's warrior (S3-0): the drove, the fuel boat, the night road and the gate-well; its lines as the
  // route is played now (warrior-walk.txt, re-taken from the kept warrior-lines.txt on 20 November: the fuel boat's
  // and the sea-gate's aims taken up by asking Holgar and the reeve, as they now arise, and three lines dropped that
  // the runner refused, an aim already done and a journey no longer offered).
  static readonly walks: Walk[] = [{ world: 'iscoed', as: 'human/warrior/Wenna',
    lines: 'doc/architecture/mission-22/golden/warrior-walk.txt' }];
  // Every divergence of every walk, as "kind: what" (one entry however many turns it stands at).
  static async divergences(walks = this.walks, turns = Infinity, where?: Map<string, string>): Promise<string[]> {
    const out = new Set<string>();
    for (const w of walks) {
      const lines = readFileSync(join(this.root, w.lines), 'utf8').split('\n').filter(Boolean).slice(0, turns);
      const { journey } = await PlayTool.start(PlayTool.parse(w.world === 'iscoed' ? GoldenWalk.args(w.as, w.lines) : ['--world', w.world, '--as', w.as]));
      const runner = new Runner(journey.session);
      this.turn(runner, runner.said(), out);
      for (const line of lines) {
        // A walk's own "through" for a fight this has already played through by the runner's hand (below).
        if (line.includes(RunnerFight.through)) { continue; }
        let said = await runner.ask(line);
        const before = new Set(out);
        // A fight a line brings on is played through by the runner's own hand (fight:auto), as the conger's spec plays
        // it (CP-18): a walk cannot say how many rounds it takes, and a fight's turns are its own surface (below).
        for (let n = 0; !('error' in said) && said.moment === 'fight' && n < 40; n++) {
          said = await runner.ask('{"act":"fight:auto"}');
        }
        // A line refused is a walk gone stale, not a turn to pass over: the measure would cover less than it says
        // (lead-contract.md: four follows of the fuel boat's aim had said "no aim", following nothing after T8).
        if ('error' in said) { throw new Error(`${w.lines}: ${line}: ${said.error}`); }
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
  // Not a fight's turn: its hand is a surface of its own (RunnerFight), not the scene's rows, and read against the
  // scene's it had counted every act of both as a divergence (the gate-well's conger on the warrior's walk, CP-18).
  private static turn(runner: Runner, said: Said, out: Set<string>) {
    const glance = runner.leaf?.glance;
    if (!glance || said.moment === 'fight') { return; }
    // Nor a turn in a talk: its rows are the talk's question (MenuTree.question, OR-1451), held across the clients by
    // test/focus-parity, not the scene's.
    if (runner.session.focus.kind === 'talk') { return; }
    // The page and serve at the same turn (scripts/client-parity.ts), named by client.
    ClientParity.turn(runner, out);
    const rows = Doable.of(glance, ScreenModel.build(runner.session.campaign)), engine = this.engine(rows);
    const doing = new Map(Doable.flat(rows).flatMap(r => r.does ? [[r.id, r.does] as const] : []));
    const offered = RunnerOffer.flat([...said.offer.primary, ...said.offer.rest,
      ...Object.values(said.offer.lenses ?? {}).flatMap(os => os ?? [])] as Offered[]);
    // What the runner draws by the act each does (its words, and the id it names it by), and every id it names.
    const leaves = offered.filter(o => !o.opens?.length);
    const drawn = new Map(leaves.map(o => [o.does ?? o.id, o.label])), named = new Map(leaves.map(o => [o.does ?? o.id,
      o.id])), ids = new Set(offered.map(o => o.id));
    // An act held under an opener (a person's asks under their talk) is offered where the opener is, by the engine's
    // own id: opened, it shows them, as the page's drawer does.
    const openers = new Set(offered.filter(o => o.opens?.length).map(o => o.id));
    // A journey the engine puts on the map is offered there (the runner's folded journeys), never in the rest; and
    // uncounted, the map's row saying no number (the owner, 25 November: "Why is the map sending you a notification?").
    const mapped = [...engine].filter(([, e]) => e.map);
    if (said.offer.more?.journeys !== undefined) { out.add(`map count: runner ${said.offer.more.journeys}`); }
    for (const [act] of mapped) { if (drawn.has(act)) { out.add(`unfolded: ${act}`); } }
    // And what the engine holds in the pack (Row.pack: setting down, giving across) is there, counted, not in the rest
    // (CL-67).
    const packed = [...engine].filter(([, e]) => e.pack);
    if (packed.length !== (said.offer.more?.pack ?? 0)) {
      out.add(`pack count: engine ${packed.length}, runner ${said.offer.more?.pack ?? 0}`);
    }
    for (const [act] of packed) { if (drawn.has(act)) { out.add(`unpacked: ${act}`); } }
    for (const [act, { words, id, under, within }] of engine.entries().filter(([, e]) => !e.map && !e.pack)) {
      if (!drawn.has(act) && ![under, within].some(h => h && this.held(h, { drawn, ids, openers }, doing))) {
        out.add(`engine only: ${act}`); continue;
      }
      if (drawn.has(act) && drawn.get(act) !== words) { out.add(`words: ${act}`); }
      // The same act under another name: the runner names it by no row of the engine's that does it (AT-13).
      const its = Doable.flat(rows).filter(r => (r.for ?? r.does) === act).map(r => r.id);
      if (drawn.has(act) && !its.includes(named.get(act)!)) {
        out.add(`named apart: ${id.replace(/[(:/#].*$/, '…')}`);
      }
    }
    // A row the runner names by an id that is no row of the engine's.
    const rowIds = new Set(Doable.flat(rows).map(r => r.id));
    for (const o of offered) { if (!rowIds.has(o.id)) { out.add(`runner only: ${o.id.replace(/\(.*$/, '(…)')}`); } }
    // A step across the country is named by the row that opens the map at where it goes (Row.chart).
    const step = said.going?.act, charted = step && drawn.has(step.replace(/^travel:/, 'view:map:'));
    if (step && !drawn.has(step) && !ids.has(step) && !charted) { out.add(`lead names no row: ${step.replace(/[(:/].*$/, '…')}`); }
  }
  // Whether the row an act is held within or under is offered: by its id, by what it does, or as the runner names a
  // person's talk (talk:<person>, itself counted runner only); an opener drawn as one row is turned to.
  private static held(within: string, at: { drawn: Map<string, string>; ids: Set<string>; openers: Set<string> },
    doing: Map<string, string>): boolean {
    const { drawn, ids, openers } = at;
    return openers.has(within) || ids.has(within) || drawn.has(within) || drawn.has(doing.get(within) ?? '')
      || drawn.has(`talk:${within.replace(/#talk$/, '')}`);
  }
  // The engine's rows by the act each does, in its own words, with the opener each is held under (if any), and whether
  // it is on the map.
  // An act both a talk is led for and a question's own row does (the question held within the talk, MT-18) is the
  // talk's, as the four lead with it.
  private static engine(rows: Row[], under?: string): Map<string, EngineAct> {
    const out = new Map<string, EngineAct>();
    for (const [act, e] of rows.flatMap(r => r.opens?.length ? [...this.engine(r.opens, under ?? r.id)]
      : r.for ?? r.does ? [[(r.for ?? r.does)!, { words: r.called ?? r.label, id: r.id,
        ...under ? { under } : {}, ...r.within ? { within: r.within } : {}, ...r.map ? { map: r.map } : {},
        ...r.pack ? { pack: r.pack } : {},
        ...r.for ? { led: true as const } : {} }] as const] : [])) {
      if (!out.get(act)?.led) { out.set(act, e); }
    }
    return out;
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
    if (argv.includes('--words')) {
      console.log([...ClientParity.examples].map(([d, [e, c]]) => `${d}\n  engine: ${e}\n  client: ${c}`).join('\n'));
    }
    if (argv.includes('--write')) {
      writeFileSync(join(this.root, this.baseline), `${JSON.stringify({ about: 'What the runner, the page and serve '
        + 'offer that the engine does not, and the reverse, over the golden walks (MT-18, scripts/offer-parity.ts, '
        + 'scripts/client-parity.ts): kept so that none is added; each removed is taken off.', kinds: this.kinds(found),
      divergences: found }, null, 1)}\n`);
    }
    console.log(Object.entries(this.kinds(found)).map(([k, n]) => `${n}\t${k}`).join('\n'));
    console.log(`${found.length} divergences`);
    return 0;
  }
}

if (import.meta.main) { process.exit(await OfferParity.main(process.argv.slice(2))); }
