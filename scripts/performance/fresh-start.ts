#!/usr/bin/env bun
// A new world's start as a player gets it, repeatably on a named seed (AX-04): the parse store answers only what
// worlds drawn on other seeds asked of it (the shared rules, the kits as written, the declaration shapes), never the
// seed's own texts, and nothing is written to it, so the third reading of s0 parses what the first did. A census of
// what other worlds ask is taken first (once for each state of the code: it is keyed by the parser's sources), then
// each reading is one process.
//   scripts/machine/heavy.sh bun scripts/performance/fresh-start.ts census          (kite and thorn, one process each)
//   scripts/machine/heavy.sh bun scripts/performance/fresh-start.ts start s0 [--texts] [--shapes] [--json]
//   scripts/machine/heavy.sh bun scripts/performance/fresh-start.ts rounds s0 a1 [--rounds 3] [--against <tree>]
// --texts: each text parsed, dearest first; --shapes: the declarations the grammar matched, by construct (what no
// known shape filled), and their texts (node_modules/.cache/fresh-start-matched.kyr); rounds: the seeds interleaved,
// one process each, here and (--against) in another worktree whose census is taken too, so that before and after are
// read under the same load, each from an empty store.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PlayTool } from '../../src/cli/play-tool';
import { Costs, type Tally } from '../../src/costs';
import { Stopwatch } from '../../src/stopwatch';
import { DeclarationShapes, ParseCache, type VocabularyContext } from '../../src/lang';
import { CensusStore } from './census-store';

interface Reading { seed: string; startMs: number; tally: Tally; phases: { label: string; ms: number }[] }
class FreshStart {
  static readonly census = 'node_modules/.cache/fresh-start-census.json';
  static readonly seen = ['kite', 'thorn'];
  private static readonly texts: { head: string; kb: number; ms: number }[] = [];
  private static readonly matched = new Map<string, number>();
  private static readonly matchedTexts: string[] = [];
  private static set?: typeof ParseCache.set;
  private static read?: typeof DeclarationShapes.read;
  // What the store is asked, recorded (census), or answered only where another world asked it.
  private static wrap(known: Set<string>, census: boolean): void {
    if (!ParseCache.store) { throw new Error('No parse store (KYRIE_PARSE_STORE=0?): a fresh start reads the rules kept'); }
    ParseCache.store = new CensusStore(ParseCache.store, known, census);
  }
  // Each text parsed, by its first line (--texts).
  private static noted(...a: Parameters<typeof ParseCache.set>): void {
    const [, key, reading, measure = {}] = a, text = key.slice(key.indexOf('\u0000') + 1);
    const m = reading.value, counted = `${m.entities.length} entities, ${m.observations?.length ?? 0} observations`;
    this.texts.push({ head: `${text.slice(0, text.indexOf('\n')).slice(0, 60)} [${counted}]`,
      kb: (measure.bytes ?? 0) / 1024, ms: measure.ms ?? 0 });
    this.set!(...a);
  }
  // The declarations the grammar matched, by construct (--shapes).
  private static shaped(context: VocabularyContext, texts: readonly string[],
    parse: Parameters<typeof DeclarationShapes.read>[2]): ReturnType<typeof DeclarationShapes.read> {
    return this.read!(context, texts, t => {
      for (const x of t) {
        const [a, b] = x.trim().split(/\s+/), k = a === 'Initially' ? `${a} ${b}` : a!;
        this.matched.set(k, (this.matched.get(k) ?? 0) + 1);
        this.matchedTexts.push(x);
      }
      return parse(t);
    });
  }
  private static async begin(seed: string): Promise<Reading> {
    const watch = new Stopwatch(undefined, true), mark = Costs.mark(), t0 = performance.now();
    await PlayTool.start(PlayTool.parse(['--world', seed, '--as', 'human/warrior/Wenna']), watch);
    return { seed, startMs: Math.round(performance.now() - t0), tally: Costs.since(mark),
      phases: watch.phases.map(p => ({ label: p.label, ms: Math.round(p.ms) })) };
  }
  private static async taken(seed: string | undefined): Promise<number> {
    if (!seed) {
      writeFileSync(this.census, '[]');
      for (const s of this.seen) {
        const r = Bun.spawnSync(['bun', import.meta.path, 'census', s], { stdout: 'inherit', stderr: 'inherit' });
        if (r.exitCode) { return r.exitCode; }
      }
      return 0;
    }
    const asked = new Set<string>(existsSync(this.census) ? JSON.parse(readFileSync(this.census, 'utf8')) as string[]
      : []);
    this.wrap(asked, true);
    await this.begin(seed);
    writeFileSync(this.census, JSON.stringify([...asked]));
    console.log(`census ${seed}: ${asked.size} keys`);
    return 0;
  }
  static said(r: Reading): string {
    const t = r.tally;
    return `${r.seed} start ${r.startMs} ms · parse ${t.parse?.n ?? 0} (${Math.round((t.parse?.bytes ?? 0) / 1024)}`
      + ` KB) ${Math.round(t.parse?.ms ?? 0)} ms (clone ${Math.round(t['parse clone']?.ms ?? 0)}) · `
      + r.phases.map(p => `${p.label} ${p.ms}`).join(' · ');
  }
  private static async started(seed: string, args: string[]): Promise<number> {
    this.wrap(new Set(JSON.parse(readFileSync(this.census, 'utf8')) as string[]), false);
    if (args.includes('--texts')) { this.set = ParseCache.set.bind(ParseCache); ParseCache.set = this.noted.bind(this); }
    if (args.includes('--shapes')) {
      this.read = DeclarationShapes.read.bind(DeclarationShapes); DeclarationShapes.read = this.shaped.bind(this);
    }
    const r = await this.begin(seed);
    if (args.includes('--json')) { console.log(JSON.stringify(r)); return 0; }
    for (const x of this.texts.sort((a, b) => b.ms - a.ms)) {
      console.log(`  ${x.ms.toFixed(0).padStart(5)} ms ${x.kb.toFixed(0).padStart(5)} KB  ${x.head}`);
    }
    if (this.matched.size) {
      console.log(`  filled from their shapes ${DeclarationShapes.fills}; matched by the grammar: ${
        [...this.matched].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}`);
      writeFileSync('node_modules/.cache/fresh-start-matched.kyr', this.matchedTexts.join('\n'));
    }
    console.log(this.said(r));
    return 0;
  }
  // The seeds interleaved, one process each, here and in the tree against (whose census is taken first too).
  private static rounds(args: string[]): number {
    const n = Number(this.flag(args, '--rounds') ?? 3), against = this.flag(args, '--against');
    const seeds = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
    const trees = [process.cwd(), ...against ? [against] : []], readings = new Map<string, Reading[]>();
    // Each tree's store emptied first: what a start learns of its shapes is kept (DeclarationShapes), and a store that
    // had drawn s0 before would know s0's.
    for (const tree of trees) {
      rmSync(join(tree, 'node_modules/.cache/kyrie-parse'), { recursive: true, force: true });
      Bun.spawnSync(['bun', join(tree, 'scripts/performance/fresh-start.ts'), 'census'], { cwd: tree });
    }
    for (let round = 0; round < n; round++) {
      for (const seed of seeds.length ? seeds : ['s0', 'a1']) {
        for (const tree of trees) {
          const out = Bun.spawnSync(['bun', join(tree, 'scripts/performance/fresh-start.ts'), 'start', seed, '--json'],
            { cwd: tree }).stdout.toString().trim().split('\n').at(-1)!;
          const r = JSON.parse(out) as Reading, key = `${tree} ${seed}`;
          readings.set(key, [...readings.get(key) ?? [], r]);
          console.log(`${tree === process.cwd() ? 'here   ' : 'against'} ${this.said(r)}`);
        }
      }
    }
    for (const [key, rs] of readings) {
      console.log(`median ${key}: start ${this.median(rs.map(r => r.startMs))} ms, parse `
        + `${Math.round(this.median(rs.map(r => r.tally.parse?.ms ?? 0)))} ms of `
        + `${Math.round(this.median(rs.map(r => r.tally.parse?.bytes ?? 0)) / 1024)} KB`);
    }
    return 0;
  }
  private static median(xs: number[]): number { return xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)]!; }
  private static flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  }
  static async main(args: string[]): Promise<number> {
    const [mode, ...rest] = args;
    if (mode === 'census') { return this.taken(rest[0]); }
    if (mode === 'rounds') { return this.rounds(rest); }
    return this.started(rest[0] ?? 's0', rest);
  }
}
if (import.meta.main) { process.exit(await FreshStart.main(process.argv.slice(2))); }
