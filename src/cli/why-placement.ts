import { Binder } from '../world/compose/binder';
import { Trace, type TraceEntry } from '../world/compose/trace';
import { RandomStreams } from '../random-streams';
import type { WorldReport } from '../world/world-assembler';
import type { WhySources } from './why-sources';
import { NodeBundleSource } from '../campaign/node-bundle-source';

type Candidate = Extract<TraceEntry, { kind: 'candidate' }>;
type Bound = Extract<TraceEntry, { kind: 'bound' }>;

// `kyrie inspect --why placement`: why a placement won where it did (the platform maturity study's §7.1; the maturity
// track's step 4), from what the assembly already keeps. A kit's placement (Composer) by its trace: each slot's
// candidates, how many each requirement ruled out, the preferences' scores, and, among those best preferred, the
// seeded draw that chose; then Deem's proposals, the facts it committed and the modules it installed. A scenario the
// world's assembler placed, by its report: the bindings, and why the scenario was eligible.
export class WhyPlacement {
  static async report(sources: WhySources, report: WorldReport | undefined, id: string): Promise<string[]> {
    const composed = (await sources.manifest()).composition;
    const kits = (composed?.placements ?? []).filter(p => p.id === id || p.kit === id
      || Object.values(p.bindings).includes(id) || p.modules.some(m => m.id === id));
    const lines = kits.flatMap(p => this.kit(composed!.trace, `${p.kit}#${p.id}`, sources.seed));
    for (const p of (report?.placements ?? []).filter(p => p.instance === id || p.scenario === id
      || Object.values(p.bindings).includes(id) || p.modules.includes(id))) {
      const fit = report!.eligibility.find(e => e.scenario === p.scenario);
      lines.push(`${p.scenario} as ${p.instance}: placed by the world's assembler in ${p.rid}`,
        ...Object.entries(p.bindings).map(([role, place]) => `  ${role} = ${place}`),
        `  eligible: ${fit ? fit.fits ? `yes${fit.why ? ` (${fit.why})` : ''}` : `no (${fit.why ?? 'unsaid'})` : 'unsaid'}`,
        `  installs ${p.modules.join(', ')}`);
    }
    for (const r of (composed?.refused ?? []).filter(r => r.id === id)) { lines.push(`${r.id}: refused (${r.reason})`); }
    return lines.length ? lines : [`Nothing was placed as or at ${id}.`];
  }
  // One kit's placement, by its trace.
  private static kit(trace: Trace, step: string, seed: string): string[] {
    const entries = trace.entries.filter(e => e.step === step), lines = [`${step}:`];
    const bound = entries.filter((e): e is Bound => e.kind === 'bound');
    for (const b of bound.filter((x, i) => bound.findLastIndex(y => y.slot === x.slot) === i)) {
      lines.push(...this.slot(entries, b, { seed: RandomStreams.key(seed, 'compose', step), step }));
    }
    const rest = entries.filter(e => e.kind === 'proposal' || e.kind === 'commit' || e.kind === 'module'
      || e.kind === 'refused');
    const told = new Trace();
    for (const e of rest) { told.add(e); }
    return [...lines, ...told.text().map(l => l.replaceAll(`${NodeBundleSource.root}/`, ''))];
  }
  // A slot: how many were weighed, what ruled the others out, the best score and how many shared it, and the draw.
  private static slot(entries: TraceEntry[], b: Bound, at: { seed: string; step: string }): string[] {
    const weighed = new Map<string, Candidate>();
    for (const e of entries) {
      if (e.kind === 'candidate' && e.slot === b.slot && !e.failed?.startsWith('nothing fits')) { weighed.set(e.candidate, e); }
    }
    const all = [...weighed.values()], out = new Map<string, number>();
    for (const c of all.filter(c => c.failed)) { out.set(c.failed!, (out.get(c.failed!) ?? 0) + 1); }
    const fits = all.filter(c => !c.failed), level = fits.filter(c => c.score === b.score);
    const backed = entries.filter(e => e.kind === 'candidate' && e.slot === b.slot && e.failed?.startsWith('nothing fits'));
    if (b.fixed) { return [`  ${b.slot} = ${b.value} (fixed by the author)`]; }
    return [`  ${b.slot} = ${b.value}: ${all.length} weighed, ${fits.length} fit`
      + `${out.size ? `; ruled out: ${[...out].map(([why, n]) => `${n} failing ${why}`).join(', ')}` : ''}`,
    `    preferred: score ${b.score}, the best, shared by ${level.length}${level.length > 1
      ? `; ${this.drawn(at, b, level)}` : ''}`,
    ...backed.map(e => `    tried first: ${(e as Candidate).candidate} (${(e as Candidate).failed})`)];
  }
  // Among the best preferred, the seeded draw chose (Binder.draw: the lowest wins), said with its number where it is
  // the placement's own draw (a slot a proposal implies is drawn by a seed of its own, and said without).
  private static drawn(at: { seed: string; step: string }, b: Bound, level: Candidate[]): string {
    const draws = level.map(c => this.draw(at, b.slot, c.candidate)).sort((x, y) => x - y);
    return draws[0] === this.draw(at, b.slot, b.value) ? `the seeded draw chose it (${draws[0]!.toFixed(3)}, lowest of`
      + ` ${draws.map(d => d.toFixed(3)).join(' ')})` : 'a seeded draw chose among them';
  }
  private static draw(at: { seed: string; step: string }, slot: string, value: string): number {
    return Binder.draw(RandomStreams.key(at.seed, at.step, slot, value));
  }
}
