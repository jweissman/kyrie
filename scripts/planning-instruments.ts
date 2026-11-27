#!/usr/bin/env bun
// The three instruments as generated views over the one record (the owner, 23 November: a defect register, a
// feature atlas, an architecture and maturity roadmap; "prefer generated views over several synchronized files").
// Nothing here is a new source of truth: each row's instrument follows from what register-kinds.json already says it
// is (a defect, a requirement, a direction) and its family, and its place in the atlas from features.json. So a row is
// never classified by its wording, and a reclassification is made once, in register-kinds.json, with its why.
//   defects:  every live defect; where they concentrate (feature × priority, in and out of the supported slice).
//   atlas:    the features, each with its open ambitions (directions, and requirements not of the platform).
//   roadmap:  the platform's requirements and defects (architecture, startup, testing) and capabilities.json's state.
//   trend:    the live defects and the slice's P0/P1 at past revisions, so improvement is read off the record.
//   next:     a candidate active queue: the slice's P0/P1 defects not queued, densest feature first.
//   health:   the project health score, its evidence, moves and recorded trend.
//   bun scripts/planning-instruments.ts [defects|atlas|roadmap|trend|next|health]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PlanningViews } from './planning-views';
import { RegisterKinds, type Kind } from './register-kinds';
import { RegisterTickets, type Row } from './register-tickets';

export type Instrument = 'defects' | 'atlas' | 'roadmap';
interface Placed extends Row { kind: Kind; instrument: Instrument; slice: boolean }

export class PlanningInstruments {
  // The platform: what the game stands on rather than what a player meets.
  static readonly platform = new Set(['architecture', 'startup', 'testing', 'persistence', 'docs']);
  static readonly pris = ['P0', 'P1', 'P2', 'P3'];
  static instrument(kind: Kind, feature: string): Instrument {
    if (kind === 'defect') { return 'defects'; }
    return kind === 'requirement' && this.platform.has(feature) ? 'roadmap' : 'atlas';
  }
  static placed(register = RegisterTickets.text()): Placed[] {
    const kinds = RegisterKinds.read(), members = new Set(PlanningViews.planning().slice.members);
    return RegisterTickets.rows(register).filter(r => RegisterTickets.live.includes(r.state)).map(r => {
      const kind = RegisterKinds.kind(r.id, kinds);
      return { ...r, kind, instrument: this.instrument(kind, r.feature), slice: members.has(r.id) };
    });
  }
  static count<T>(xs: T[], key: (x: T) => string): [string, number][] {
    const by = new Map<string, number>();
    for (const x of xs) { by.set(key(x), (by.get(key(x)) ?? 0) + 1); }
    return [...by].sort((a, b) => b[1] - a[1]);
  }
  static high(r: Row): boolean { return r.pri === 'P0' || r.pri === 'P1'; }
  static defects(rows: Placed[]): string[] {
    const ds = rows.filter(r => r.instrument === 'defects');
    const out = [`defects: ${ds.length} live (${ds.filter(r => r.slice).length} in the supported slice)`,
      `  by priority: ${this.pris.map(p => `${p} ${ds.filter(r => r.pri === p).length}`).join(' · ')}`,
      '  where they concentrate (feature: P0/P1 in slice, P0/P1 outside, P2–P3):'];
    for (const [f, n] of this.count(ds, r => r.feature).slice(0, 15)) {
      const of = ds.filter(r => r.feature === f);
      out.push(`    ${f.padEnd(14)} ${String(n).padStart(3)}  ${of.filter(r => this.high(r) && r.slice).length} / `
        + `${of.filter(r => this.high(r) && !r.slice).length} / ${of.filter(r => !this.high(r)).length}`);
    }
    return out;
  }
  static atlas(rows: Placed[]): string[] {
    const as = rows.filter(r => r.instrument === 'atlas'), out = [`atlas: ${as.length} open ambitions by feature`];
    for (const f of RegisterTickets.map().features) {
      const of = as.filter(r => r.feature === f.id);
      if (!of.length) { continue; }
      out.push(`  ${f.name} (${f.id})`, ...of.map(r => `    ${r.id} ${r.pri} ${r.kind}: ${r.what.slice(0, 80)}`));
    }
    return out;
  }
  static roadmap(rows: Placed[]): string[] {
    const ps = rows.filter(r => this.platform.has(r.feature) && r.kind !== 'direction');
    const caps = JSON.parse(readFileSync(join(RegisterTickets.root, 'doc/architecture/capabilities.json'), 'utf8')) as
      { deficiencies: { rank: number; title: string; state: string }[] };
    return [`roadmap: ${ps.length} platform rows (requirements and the defects they would remove)`,
      ...ps.sort((a, b) => a.pri.localeCompare(b.pri)).map(r => `  ${r.id} ${r.pri} ${r.kind}: ${r.what.slice(0, 84)}`),
      'capabilities (capabilities.json):', ...caps.deficiencies.map(d => `  ${d.rank}. ${d.state}: ${d.title.slice(0, 80)}`)];
  }
  // The record at the last revision of each of the past days that touched it.
  static trend(days = 10): string[] {
    const log = execSync('git log --format="%h %ad" --date=short -- doc/architecture/open-register.md',
      { cwd: RegisterTickets.root }).toString().trim().split('\n').map(l => l.split(' '));
    const seen = new Set<string>();
    const at = log.filter(([, d]) => !seen.has(d!) && !!seen.add(d!)).slice(0, days).reverse();
    const out = ['trend (last revision of each day): live defects, of them P0/P1; slice P0/P1 live'];
    for (const [sha, day] of at) {
      const rows = this.placed(RegisterTickets.text(sha)), ds = rows.filter(r => r.instrument === 'defects');
      const hi = ds.filter(r => r.pri === 'P0' || r.pri === 'P1');
      out.push(`  ${day} ${String(ds.length).padStart(4)} ${String(hi.length).padStart(4)} `
        + `${String(hi.filter(r => r.slice).length).padStart(4)}`);
    }
    return out;
  }
  static next(rows: Placed[], size = 10): string[] {
    const p = PlanningViews.planning(), queued = new Set([...p.active.blockers, ...p.active.platform].map(q => q.id));
    const cands = rows.filter(r => r.instrument === 'defects' && r.slice && (r.pri === 'P0' || r.pri === 'P1')
      && r.state !== 'deferred' && !queued.has(r.id));
    const dense = new Map(this.count(cands, r => r.feature));
    cands.sort((a, b) => a.pri.localeCompare(b.pri) || dense.get(b.feature)! - dense.get(a.feature)!);
    return [`next: ${cands.length} slice P0/P1 defects not queued; the first ${size}, P0 first, densest feature first`,
      ...cands.slice(0, size).map(r => `  ${r.id} ${r.pri} ${r.feature}: ${r.what.slice(0, 84)}`)];
  }
  static async run(args: string[]): Promise<number> {
    const view = args.find(a => !a.startsWith('--')) ?? 'defects';
    if (view === 'trend') { console.log(this.trend().join('\n')); return 0; }
    if (view === 'health') {
      const { HealthReport } = await import('./health/report');
      console.log(HealthReport.run(!args.includes('--no-record')).join('\n'));
      return 0;
    }
    const rows = this.placed();
    const out = view === 'defects' ? this.defects(rows) : view === 'atlas' ? this.atlas(rows)
      : view === 'roadmap' ? this.roadmap(rows) : view === 'next' ? this.next(rows) : undefined;
    if (!out) { console.error(`no view ${view}: defects, atlas, roadmap, trend, next, health`); return 1; }
    if (view === 'next') {
      const { HealthRead } = await import('./health/read'), { HealthReport } = await import('./health/report');
      const today = new Date().toISOString().slice(0, 10);
      out.push('', ...HealthReport.moves(HealthRead.snapshot(today).components.moves));
    }
    console.log(out.join('\n'));
    return 0;
  }
}

if (import.meta.main) { process.exit(await PlanningInstruments.run(process.argv.slice(2))); }
