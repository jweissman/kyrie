#!/usr/bin/env bun
// The layers as logical units, mechanically held (MT-16; the owner, 19 November, night: "force logical units we can
// mechanically verify nothing imports inaccurately", a `packages/kyr` the eventual shape, not now). Four units, each
// importing only from those beneath it: Kyr the language (src/lang); the runtime (campaign, rules, the engine's own
// files); a generic player that knows no setting or scenario (session, presentation, ui, narrative, creation); and
// the setting's modules (world, canon, paintings, handbook, registry, data). The clients (src/cli, src/autoplay,
// web/engine, web/reader) stand over them all. Every import that goes the wrong way is an edge; today's are kept in
// doc/architecture/mission-22/layers-baseline.json, and test/small/layers fails on a new one, or on one gone that the
// baseline still lists (so that it only shrinks, and on purpose).
//   bun scripts/layers.ts            the edges by kind, with counts
//   bun scripts/layers.ts --write    the baseline written from today's edges
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';

export type Layer = 'lang' | 'runtime' | 'player' | 'setting' | 'client';

export class Layers {
  static readonly root = join(import.meta.dir, '..');
  static readonly baseline = 'doc/architecture/mission-22/layers-baseline.json';
  static readonly rank: Record<Layer, number> = { lang: 0, runtime: 1, player: 2, setting: 3, client: 4 };
  static readonly seen = ['src', 'web/engine'];
  // Which unit a path is of, or none (a test, a script, a type stub).
  static of(path: string): Layer | undefined {
    if (path.startsWith('src/lang/')) { return 'lang'; }
    // The handbooks are a client of the installed catalogs: static reference and audit pages, not setting data. A drawn
    // world's assembly is likewise a composition helper: it owns the hand-off from a setting to a play session.
    if (path.startsWith('src/handbook/') || path === 'src/world/drawn-world.ts') { return 'client'; }
    // The registry is the setting's too: the pipeline that makes Orsino's corpus into the setting's catalog, read by
    // the handbook, the world and the clients, the runtime reading only the files it writes (MT-16).
    if (/^src\/(world|canon|paintings|registry)\//.test(path)
      || path.startsWith('data/') || path === 'src/generation-setting.ts') { return 'setting'; }
    if (/^src\/(campaign|rules)\//.test(path) || /^src\/[^/]+$/.test(path)) { return 'runtime'; }
    // The frame's menu and its marks, worked out once a frame for every client (src/frame, OR-1071), are the player's.
    // Creation is the player's (MT-16, S5): the making of a life as a flow of questions (CreationFlow and its entries,
    // spells, defaults, rules and cards, the first choice) and the protocol the engine and the page speak, moved out
    // of web/engine so that the terminal (src/cli) and the page import one model, which imports no client.
    if (/^src\/(session|presentation|ui|frame|narrative|creation)\//.test(path)) { return 'player'; }
    // Autoplay is a client: a robot that drives the player as someone at the page would, over a world it draws,
    // imported only by the clients (src/cli/reach-tool.ts), and no player imports it (MT-16). And web/engine is the
    // browser's composition root (MT-16, S5): the worker and its host, which wire a campaign or a drawn country, the
    // session, the presentation and the page's scenarios into one game (engine-host, engine-worker, engine-starts,
    // engine-creation, engine-foresight, creation.ts, which composes a setting's companies, sky and drawn world for
    // the page); and what the browser keeps of it (kept-game, parse-keep in IndexedDB, save-codec, transcript). Only
    // the clients import it (src/cli, scripts, web/reader), as src/cli is the terminal's.
    if (/^src\/(cli|autoplay)\//.test(path) || path.startsWith('web/')) { return 'client'; }
    return undefined;
  }
  // Whether one unit may import another: each from those beneath it; the setting from the language and the runtime
  // (it is written in Kyr and run by the runtime), never from the player; the clients from anything.
  static allowed(from: Layer, to: Layer): boolean {
    if (from === 'client') { return true; }
    if (from === 'setting') { return to !== 'player' && to !== 'client'; }
    return to !== 'setting' && this.rank[to] <= this.rank[from];
  }
  // Every import that goes the wrong way, as "from -> to" (each file by its path from the root, the target without its
  // extension).
  static edges(): string[] {
    const out = new Set<string>();
    for (const file of this.seen.flatMap(d => this.files(join(this.root, d)))) {
      const rel = relative(this.root, file), from = this.of(rel);
      if (!from) { continue; }
      for (const spec of this.imports(readFileSync(file, 'utf8'))) {
        const target = normalize(join(dirname(rel), spec)).replace(/\.(tsx?|js)$/, '');
        const to = this.of(target.startsWith('data/') ? target : `${target}.ts`) ?? this.of(target);
        if (to && !this.allowed(from, to)) { out.add(`${rel} -> ${target}`); }
      }
    }
    return [...out].sort();
  }
  static kinds(edges: string[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const e of edges) {
      const [a, b] = e.split(' -> ') as [string, string];
      const key = `${this.of(a)} -> ${this.of(b.startsWith('data/') ? b : `${b}.ts`) ?? this.of(b)}`;
      out[key] = (out[key] ?? 0) + 1;
    }
    return out;
  }
  // Imported from, imported when wanted, and imported for what loading it does (`import '../canon/canon-vocabulary'`).
  private static readonly importing =
    /(?:import|export)[^'"]*?from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]|^import\s+['"](\.[^'"]+)['"]/gm;
  private static imports(text: string): string[] {
    return [...text.matchAll(this.importing)].map(m => (m[1] ?? m[2] ?? m[3])!);
  }
  private static files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? this.files(join(dir, d.name))
      : /\.tsx?$/.test(d.name) && !d.name.endsWith('.d.ts') ? [join(dir, d.name)] : []);
  }
  static main(argv: string[]): number {
    const edges = this.edges();
    if (argv.includes('--write')) {
      writeFileSync(join(this.root, this.baseline), `${JSON.stringify({ about: 'Imports that go the wrong way between '
        + 'the layers (MT-16, scripts/layers.ts), kept so that none is added; each removed is taken off.',
      kinds: this.kinds(edges), edges }, null, 1)}\n`);
    }
    console.log(Object.entries(this.kinds(edges)).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}\t${k}`).join('\n'));
    console.log(`${edges.length} edges`);
    return 0;
  }
}

if (import.meta.main) { process.exit(Layers.main(process.argv.slice(2))); }
