// The terminal matrix (TB-06): blind walks through the runner (src/cli/runner.ts), every calling, each with a
// background of its kind and an origin, on a few seeds, by a few policies; what each build was offered, led with,
// chose and came to, written to doc/architecture/mission-21/terminal/matrix.md. Bounded: one world drawn per walk, a
// fixed number of turns. Regenerate with
//   bun scripts/terminal-matrix.ts [--lab | --create] [--seeds a1,b2,c3] [--turns 20] [--policies straight,curious]
//     [--out file]
// --lab walks the laboratory (scripts/laboratory.ts) instead, each build alone in the first town's undertown.
import { writeFile } from 'node:fs/promises';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Runner } from '../src/cli/runner';
import { RunnerWalk, type Measures, type Policy } from '../src/cli/runner-walk';
import { PlayTool } from '../src/cli/play-tool';
import type { PlaySession } from '../src/session/play-session';
import { Laboratory } from './laboratory';
import { EngineHost } from '../web/engine/engine-host';
import type { CreationState } from '../web/engine/engine-creation';

interface Row { calling: string; background: string; origin: string; seed: string; policy: Policy; m: Measures;
  can: string[]; error?: string; ms: number }
type Tallied = 'types' | 'ledTypes' | 'promoted' | 'selected' | 'realized';

export class TerminalMatrix {
  // Each calling with a background of a kind that suits it; an origin turned round the seeds.
  static readonly builds: [calling: string, background: string][] = [['warrior', 'blacksmith'],
    ['mage', 'apothecary'], ['thief', 'burglar'], ['cleric', 'doctor'], ['bard', 'entertainer'], ['ranger', 'archer'],
    ['monk', 'gardener']];
  static readonly origins = ['debt', 'kin', 'herbs', 'order', 'wanderer', 'map', 'lost', 'courier'];
  static flag(name: string, fallback: string): string {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1]! : fallback;
  }
  // In the laboratory (scripts/laboratory.ts), each build alone in the first town's undertown, by the seed; else a
  // world drawn from the seed with the build's origin.
  static readonly lab = process.argv.includes('--lab');
  static async start(seed: string, origin: string, calling: string, background: string): Promise<PlaySession> {
    if (this.lab) {
      const args = [Laboratory.file, '--as', `human/${calling}/Wynn/${background}`, '--seed', seed];
      return (await PlayTool.start(PlayTool.parse(args))).journey.session;
    }
    if (this.create) { return this.made(seed, origin, calling); }
    const party = [{ name: 'Wynn', raceId: 'human', classId: calling, backgroundId: background }];
    return DrawnWorld.start(seed, { origin, party }, NodeBundleSource.shared);
  }
  // --create: the life made from the real entry point, as Gate 1's first tier asks: the engine's own requests (world,
  // creation, set-out) through EngineHost, choosing the origin and the calling, the rest as the page has them.
  static readonly create = process.argv.includes('--create');
  static async made(seed: string, origin: string, calling: string): Promise<PlaySession> {
    const host = new EngineHost(() => undefined);
    await host.handle({ kind: 'world', seed });
    let state = await host.handle({ kind: 'creation' }) as CreationState;
    for (let i = 0; i < state.steps.length; i++) {
      // Human, whom every calling is open to: b2's default dwarf offers a warrior or a cleric only, and six of the
      // seven callings had been made warriors there, the same walk six times over (the experience baseline).
      const step = state.steps[i]!, want = ({ why: origin, you: 'human', calling } as Record<string, string>)[step.id];
      const value = want && step.cards.some(c => c.id === want && !c.shut) ? want : step.chosen ?? '';
      state = await host.handle({ kind: 'creation', step: step.id, value }) as CreationState;
    }
    await host.handle({ kind: 'set-out' });
    return host.played!;
  }
  static async walks(seeds: string[], policies: Policy[], turns: number): Promise<Row[]> {
    const rows: Row[] = [];
    for (const [si, seed] of seeds.entries()) {
      for (const [bi, [calling, background]] of this.builds.entries()) {
        const origin = this.lab ? 'laboratory' : this.origins[(bi + si * 3) % this.origins.length]!;
        for (const policy of policies) {
          const t0 = performance.now();
          const session = await this.start(seed, origin, calling, background);
          const walk = await RunnerWalk.run(new Runner(session), policy, turns, si + 1);
          const can = [...new Set(walk.turns.flatMap(t => [...t.offer.primary, ...t.offer.rest].map(o => o.type)))];
          const ms = performance.now() - t0;
          rows.push({ calling, background, origin, seed, policy, m: RunnerWalk.measure(walk), can: can.sort(), ms,
            ...walk.error ? { error: walk.error } : {} });
          console.error(`${seed} ${calling}/${background} ${origin} ${policy}: ${Math.round(ms)} ms`);
        }
      }
    }
    return rows;
  }
  static tally(r: Record<string, number>): string {
    return Object.entries(r).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ') || '–';
  }
  static sum(rows: Row[], f: (r: Row) => number): number { return rows.reduce((n, r) => n + f(r), 0); }
  static merged(rows: Row[], k: Tallied): Record<string, number> {
    const m: Record<string, number> = {};
    for (const r of rows) { for (const [x, n] of Object.entries(r.m[k])) { m[x] = (m[x] ?? 0) + n; } }
    return m;
  }
  static walk(r: Row): string {
    const m = r.m, end = m.ended ? 'yes' : r.error ? `error: ${r.error}` : 'no';
    return `| ${r.seed} | ${r.calling} / ${r.background} | ${r.origin} | ${r.policy} | ${m.arrivals} | `
      + `${m.mean.toFixed(1)} | ${m.worst.join(' ')} | ${m.within ? 'yes' : '**no**'} | ${m.places} | ${m.revisits} | `
      + `${m.attention.repaid} / ${m.attention.empty} | ${m.fights} | ${m.loops} | ${m.deadEnds} | ${m.lost} | ${end} |`;
  }
  static calling(rows: Row[], calling: string): string {
    const of = rows.filter(r => r.calling === calling);
    const [types, led, promoted, selected, realized] = (['types', 'ledTypes', 'promoted', 'selected', 'realized'] as
      Tallied[]).map(k => this.tally(this.merged(of, k)));
    return `| ${calling} | ${[...new Set(of.flatMap(r => r.can))].sort().join(', ')} | ${types} | `
      + `${led} | ${promoted} | ${selected} | ${realized} | `
      + `${this.sum(of, r => r.m.attention.repaid)} / ${this.sum(of, r => r.m.attention.empty)} |`;
  }
  // The round's line for Gate 1: the build, what was walked, and its blockers by class.
  static gate(rows: Row[], seeds: string[]): string {
    const build = Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']).stdout.toString().trim();
    const classes = (['creation', 'no way forward', 'unpursuable', 'crash', 'hang'] as const)
      .map(k => this.sum(rows, r => r.m.blockers[k]));
    return `| ${build} | ${seeds.join(', ')} | ${[...new Set(rows.map(r => r.origin))].join(', ')} | `
      + `${[...new Set(rows.map(r => r.calling))].length} | ${classes.join(' | ')} |`;
  }
  // Each turn an aim was followed and nothing led to it: the walk, the turn, where, after what, and the aim.
  static lost(rows: Row[]): string[] {
    const out = rows.flatMap(r => r.m.lostAt.map(l => `- ${r.seed} ${r.calling}/${r.background} ${r.origin} ${r.policy}, `
      + `turn ${l.turn}, at ${l.at.replace(/ · .*$/, '') || 'the same place'} after "${l.after}": ${l.aim}`));
    return out.length ? out : ['- none'];
  }
  static broken(rows: Row[]): string[] {
    const out = rows.flatMap(r => r.m.broken.map(b => `- ${r.seed} ${r.calling}/${r.background} ${r.origin} ${r.policy}, `
      + `turn ${b.turn}, at ${b.at.replace(/ · .*$/, '') || 'the same place'}: ${b.text}`));
    return out.length ? out : ['- none'];
  }
  static said(rows: Row[]): string[] {
    const n = new Map<string, number>();
    for (const l of rows.flatMap(r => r.m.repeated)) { n.set(l, (n.get(l) ?? 0) + 1); }
    return [...n].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([l, k]) => `- ${k}× ${l}`);
  }
  static report(rows: Row[], seeds: string[], policies: Policy[], turns: number): string {
    const emptied = [...new Map(rows.flatMap(r => r.m.attention.emptied).map(e => [e.label, e])).values()];
    return [this.lab ? '# The laboratory matrix' : '# The terminal matrix', '',
      `Generated by \`bun scripts/terminal-matrix.ts${this.lab ? ' --lab' : ''}\` (TB-06): blind walks through the runner`
        + ` (\`bin/kyrie run\`)${this.lab ? ' in the laboratory (the first town\'s undertown alone)' : ''}, which`,
      'sees only what the terminal and the page would show. Each build is a human of one calling with a background of a',
      `kind that suits it, on seeds ${seeds.join(', ')}, by policies ${policies.join(', ')}, ${turns} turns each. The`,
      `scene budget is a mean of ${RunnerWalk.budget} sentences of narration on arriving; an arrival of more than`,
      `${RunnerWalk.outlier} is an outlier. Attention (doc/design/DOCTRINE.md §2) is a look, search, question or study,`,
      'repaid when what came of it told something new.', '', '## Every walk', '',
      '| seed | calling / background | origin | policy | arrivals | mean | worst | in budget | places | revisits '
        + '| attention repaid / empty | fights | loops | dead ends | lost | ended |',
      '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|', ...rows.map(r => this.walk(r)), '',
      '## By calling', '',
      '| calling | can do (types offered) | chose (types) | led with (types) | atlas led | atlas chosen '
        + '| atlas realized | attention repaid / empty |',
      '|---|---|---|---|---|---|---|---|', ...this.builds.map(([c]) => this.calling(rows, c)), '', '## Totals', '',
      `- walks: ${rows.length}; within the budget: ${rows.filter(r => r.m.within).length}; outlier arrivals: `
        + `${this.sum(rows, r => r.m.outliers)}`,
      `- attention repaid ${this.sum(rows, r => r.m.attention.repaid)}, empty ${this.sum(rows, r => r.m.attention.empty)}`,
      `- fights ${this.sum(rows, r => r.m.fights)}, retreats ${this.sum(rows, r => r.m.retreats)}, loops ${this.sum(rows, r => r.m.loops)}, dead ends `
        + `${this.sum(rows, r => r.m.deadEnds)}, ended ${rows.filter(r => r.m.ended).length}, errors `
        + `${rows.filter(r => r.error).length}`,
      `- blockers: ${rows.filter(r => r.error).length} errors, ${this.sum(rows, r => r.m.deadEnds)} dead ends, `
        + `${this.sum(rows, r => r.m.lost)} turns lost (an aim followed and nothing leading to it), `
        + `${this.sum(rows, r => r.m.stranded)} of them unpursuable (not amid the site the aim is about with somewhere there to explore)`,
      `- intention to a consequence: ${rows.filter(r => r.m.consequence).length} of ${rows.length} walks`,
      `- mean time per walk: ${Math.round(this.sum(rows, r => r.ms) / Math.max(1, rows.length))} ms`, '',
      '## Gate 1, tier 1', '', '| build | worlds | origins | callings | creation | no way forward | unpursuable | crash | hang |',
      '|---|---|---|---|---|---|---|---|---|', this.gate(rows, seeds), '',
      '### Unpursuable turns', '', ...this.lost(rows), '',
      '### Promises the screens did not keep', '', ...this.broken(rows), '',
      '## Lines said again (in most walks first)', '', ...this.said(rows), '',
      '## Attention repaid with nothing (the first of each label)', '',
      ...emptied.slice(0, 20).map(e => `- ${e.label}: ${e.said.join(' ') || '(nothing said)'}`), ''].join('\n');
  }
  static async main() {
    const seeds = this.flag('seeds', 'a1,b2,c3').split(','), turns = Number(this.flag('turns', '20'));
    const policies = this.flag('policies', 'straight,curious').split(',') as Policy[];
    const out = this.flag('out', this.lab ? 'doc/architecture/mission-21/laboratory/matrix.md'
      : 'doc/architecture/mission-21/terminal/matrix.md');
    await writeFile(out, this.report(await this.walks(seeds, policies, turns), seeds, policies, turns));
    console.error(`wrote ${out}`);
  }
}
if (import.meta.main) { await TerminalMatrix.main(); }
