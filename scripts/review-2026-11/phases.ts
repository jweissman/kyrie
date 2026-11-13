#!/usr/bin/env bun
// The architecture review of November 2026: where a start's time goes, by the functions it passes through, timed by
// wrapping them in place (nothing in src is changed: the wrappers are this script's). Unlike src/costs.ts, which
// notes only the boundaries src chose to note, this times the inner stages too (compilation, the shared rules cloned
// for each install, the joined module checked, facts projected, the kit composition's geography) and counts every
// structuredClone and its bytes. Inclusive times; a function re-entered while already timed is counted once.
//   bun scripts/review-2026-11/phases.ts full|scenario|tiny [--twice] [--json]
import { serialize } from 'node:v8';
import { Costs } from '../../src/costs';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleCompiler } from '../../src/lang/module-compiler';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { ModuleAssembly } from '../../src/campaign/module-assembly';
import { ModuleNamespace } from '../../src/campaign/module-namespace';
import { ModuleInstallations } from '../../src/campaign/module-installations';
import { CreatureFacts } from '../../src/campaign/creature-facts';
import { Composition } from '../../src/world/compose/composition';
import { Geography } from '../../src/world/compose/geography';
import { CanonInstall } from '../../src/campaign/canon-install';
import { EngineDeclarations } from '../../src/campaign/engine-declarations';
import { Discovery } from '../../src/information/discovery';
import { Content } from '../../src/content';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { Campaign } from '../../src/campaign/campaign';
import { Projection } from '../../src/campaign/projection';
import { PlaySession } from '../../src/session/play-session';
import { ReviewScales } from './scales';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { PlayerView } from '../../src/presentation/player-view';
import { Frontier } from '../../src/world/frontier';
import { WatchLoop } from '../../src/campaign/watch-loop';
import { CampaignTick } from '../../src/campaign/campaign-tick';
import { Perceptions } from '../../src/campaign/perceptions';
import { Telling } from '../../src/narrative/telling';
import { Undertakings } from '../../src/presentation/undertakings';
import { Digest } from '../../src/session/digest';

interface Row { n: number; ms: number; depth: number; bytes: number; each: number[] }
type Fn = (...a: unknown[]) => unknown;
// A wrapped function's calls timed into its row (inclusive; a call made while one is under way counted once): the
// handler of a Proxy over it, so that methods keep their `this`.
class Phases {
  static readonly rows = new Map<string, Row>();
  static readonly clone = globalThis.structuredClone;
  static readonly sizing = process.argv.includes('--bytes');
  constructor(private readonly label: string) {}
  apply(f: Fn, self: unknown, a: unknown[]): unknown {
    const r = Phases.row(this.label); r.n++;
    if (r.depth++) { try { return f.apply(self, a); } finally { r.depth--; } }
    const began = performance.now(), done = Phases.done.bind(Phases, r, began);
    let out: unknown;
    try { out = f.apply(self, a); } catch (e) { done(); throw e; }
    if (out instanceof Promise) { return out.finally(done); }
    done(); return out;
  }
  static row(k: string): Row {
    if (!Phases.rows.has(k)) { Phases.rows.set(k, { n: 0, ms: 0, depth: 0, bytes: 0, each: [] }); }
    return Phases.rows.get(k)!;
  }
  static done(r: Row, began: number) { const ms = performance.now() - began; r.ms += ms; r.each.push(ms); r.depth--; }
  static wrap(owner: object, name: string, label: string) {
    const o = owner as Record<string, unknown>, f = o[name] as Fn;
    if (typeof f !== 'function') { throw new Error(`no ${label}`); }
    o[name] = new Proxy(f, new Phases(label));
  }
  static copied(v: unknown, o?: StructuredSerializeOptions): unknown {
    const r = Phases.row('structuredClone (all)'), began = performance.now(); r.n++;
    try { return Phases.clone(v, o); } finally {
      r.ms += performance.now() - began;
      if (Phases.sizing) { try { r.bytes += serialize(v).length; } catch { /* not serializable by v8 */ } }
    }
  }
}
const rows = Phases.rows, wrap = Phases.wrap.bind(Phases);
globalThis.structuredClone = Phases.copied.bind(Phases) as typeof structuredClone;
wrap(ModuleParser, 'parse', 'ModuleParser.parse (incl. cache lookups)');
wrap(ModuleParser, 'predicate', 'ModuleParser.predicate');
wrap(ModuleCompiler.prototype, 'instantiate', 'ModuleCompiler.instantiate');
wrap(ModuleCompiler.prototype, 'validate', 'ModuleCompiler.validate');
wrap(ModuleBundle, 'loading', 'ModuleBundle.load (an install\'s draft)');
wrap(ModuleBundle, 'shared', 'ModuleBundle.shared (rules joined)');
wrap(ModuleBundle, 'own', 'ModuleBundle.own (a module\'s own files)');
wrap(ModuleBundle, 'generated', 'ModuleBundle.generated (Deem situation)');
wrap(ModuleAssembly, 'compose', 'ModuleAssembly.compose');
wrap(ModuleNamespace.prototype, 'draft', 'ModuleNamespace.draft');
wrap(ModuleInstallations, 'prepare', 'ModuleInstallations.prepare (join)');
wrap(ModuleInstallations, 'populate', 'ModuleInstallations.populate');
wrap(ModuleInstallations, 'check', 'ModuleInstallations.check (whole)');
wrap(ModuleInstallations, 'creature', 'ModuleInstallations.creature');
wrap(CreatureFacts, 'project', 'CreatureFacts.project');
wrap(CreatureFacts, 'initialize', 'CreatureFacts.initialize');
wrap(Projection.prototype, 'refresh', 'Projection.refresh');
wrap(Composition, 'expand', 'Composition.expand (kits)');
wrap(Composition, 'region', 'Composition.region (ledger read)');
wrap(Geography, 'distances', 'Geography.distances (all pairs)');
wrap(CanonInstall, 'first', 'CanonInstall.first (data/imbar)');
wrap(EngineDeclarations, 'declare', 'EngineDeclarations.declare');
wrap(Discovery, 'validate', 'Discovery.validate');
wrap(Content.prototype, 'createCreature', 'Content.createCreature');
wrap(Content.prototype, 'generate', 'Content.generate (Deem)');
wrap(WorldAssembler, 'built', 'WorldAssembler.assemble');
wrap(WorldAssembler, 'drew', 'WorldAssembler.region (Deem country)');
wrap(RegionWriter, 'write', 'RegionWriter.write (Kyr text)');
wrap(Campaign, 'assemble', 'Campaign.assemble');
wrap(Campaign.prototype, 'fork', 'Campaign.fork (load cache)');
wrap(Campaign.prototype, 'install', 'Campaign.install');
wrap(PlaySession, 'starting', 'PlaySession.start');
wrap(Frontier.prototype, 'expand', 'Frontier.expand');
wrap(ScreenModel, 'built', 'ScreenModel.build');
wrap(Narrator, 'leafed', 'Narrator.leaf');
wrap(PlayerView, 'observe', 'PlayerView.observe');
wrap(Campaign.prototype, 'execute', 'Campaign.execute');
wrap(Campaign.prototype, 'executeAsync', 'Campaign.executeAsync');
wrap(Campaign.prototype, 'offered', 'Campaign.offered');
wrap(WatchLoop, 'pass', 'WatchLoop.pass (the world\'s turn)');
wrap(CampaignTick, 'settle', 'CampaignTick.settle');
wrap(Perceptions, 'settle', 'Perceptions.settle');
wrap(Telling, 'tell', 'Telling.tell');
wrap(Undertakings, 'after', 'Undertakings.after');
wrap(Digest, 'of', 'Digest.of (transcript digest)');
wrap(PlaySession.prototype, 'perform', 'PlaySession.perform');

const scale = process.argv[2] ?? 'full', twice = process.argv.includes('--twice');
const start = ReviewScales.start.bind(ReviewScales, scale, 'a1');
// --turns=N: after one start, N commands of waiting, timed alone (what a turn costs at this scale).
const turns = Number(process.argv.find(a => a.startsWith('--turns='))?.slice(8) ?? 0);
if (turns) {
  const session = await start();
  rows.clear();
  const t = performance.now();
  for (let i = 0; i < turns; i++) {
    await session.perform(ReviewScales.wait(session));
    Narrator.leaf(session.campaign, ScreenModel.build(session.campaign));
  }
  console.log(`\n${scale}: ${turns} turns of waiting, ${Math.round((performance.now() - t) / turns)} ms a turn with its screen and leaf`);
  for (const [k, r] of [...rows].sort((a, b) => b[1].ms - a[1].ms)) {
    console.log(`${Math.round(r.ms / turns).toString().padStart(7)} ms/turn ${(r.n / turns).toFixed(1).padStart(8)}×/turn  ${k}`);
  }
  process.exit(0);
}
for (let round = 0; round < (twice ? 2 : 1); round++) {
  rows.clear();
  const mark = Costs.mark(), t = performance.now();
  const session = await start();
  Narrator.leaf(session.campaign, ScreenModel.build(session.campaign));
  const total = performance.now() - t;
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ scale, round, total, rows: Object.fromEntries(rows) })); continue;
  }
  console.log(`\n${scale} round ${round}: ${Math.round(total)} ms; ${Costs.said(Costs.since(mark))}`);
  for (const [k, r] of [...rows].sort((a, b) => b[1].ms - a[1].ms)) {
    console.log(`${Math.round(r.ms).toString().padStart(7)} ms ${r.n.toString().padStart(7)}×  ${k}`
      + (r.bytes ? `  ${(r.bytes / 2 ** 20).toFixed(1)} MB` : ''));
  }
  // --series=<label prefix>: each call's time in order (does a stage grow with what is installed before it?).
  for (const prefix of process.argv.filter(a => a.startsWith('--series=')).map(a => a.slice(9))) {
    for (const [k, r] of rows) {
      if (k.startsWith(prefix)) { console.log(`${k}: ${r.each.map(ms => Math.round(ms)).join(' ')}`); }
    }
  }
  // --installs: each install's id beside the time its draft took (Costs notes the ids in order).
  if (process.argv.includes('--installs')) {
    const ids = Costs.since(mark).install?.ids ?? [], each = rows.get('ModuleBundle.load (an install\'s draft)')?.each ?? [];
    console.log(ids.map((id, i) => `${id} ${Math.round(each[i] ?? 0)}`).join(' · '));
  }
}
