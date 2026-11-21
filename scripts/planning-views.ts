import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegisterTickets, type Row } from './register-tickets';

// The three planning views (the owner, 20 November: "unlimited honesty about what's wrong; disciplined limits on what
// we're working on; demanding acceptance standards for what we claim is good"), each for its own purpose and none a
// definition of done for the others:
//   the register: every row, the authoritative record, which honest discovery and splitting may grow;
//   the supported slice: the live P0/P1 rows a player can meet in the supported first hour, its gate (no known
//     blocker left at the gate), counted against every row declared in it, so it is not made zero by narrowing;
//   the active queue: what is being worked on, at most ten blockers and three platform items; an urgent defect
//     (a blank row, an act that lies, a softlock, lost state) displaces one, never waits.
// Declared in doc/architecture/mission-22/planning.json; read from the register (RegisterTickets).
//   bun scripts/planning-views.ts
export interface Queued { id: string; owner: string; accept: string }
export interface Urgent { id: string; why: string; displaced?: string }
export interface Planning {
  slice: { name: string; since: string; scope: string; members: string[]; outside: Record<string, string> };
  active: { limits: { blockers: number; platform: number }; blockers: Queued[]; platform: Queued[]; urgent: Urgent[] };
}
export class PlanningViews {
  static readonly file = 'doc/architecture/mission-22/planning.json';
  static readonly gate = ['P0', 'P1'];
  static planning(): Planning {
    return JSON.parse(readFileSync(join(RegisterTickets.root, this.file), 'utf8')) as Planning;
  }
  static rows(): Map<string, Row> {
    return new Map(RegisterTickets.rows(RegisterTickets.text()).map(r => [r.id, r]));
  }
  static live(r: Row | undefined): boolean { return !!r && RegisterTickets.live.includes(r.state); }
  // What is wrong with the views as declared: each a sentence; none means they hold.
  static faults(p: Planning = this.planning(), rows: Map<string, Row> = this.rows()): string[] {
    const members = new Set(p.slice.members), outside = p.slice.outside, out: string[] = [];
    for (const r of rows.values()) {
      if (this.live(r) && this.gate.includes(r.pri) && !members.has(r.id) && !(r.id in outside)) {
        out.push(`${r.id} is a live ${r.pri} and neither in the slice nor said to be outside it`);
      }
    }
    for (const [id, why] of Object.entries(outside)) {
      if (!why.trim()) { out.push(`${id} is outside the slice with no reason`); }
      if (members.has(id)) { out.push(`${id} is both in the slice and outside it`); }
    }
    for (const id of members) { if (!rows.has(id)) { out.push(`${id} is in the slice and in no register`); } }
    return [...out, ...this.queued(p, rows, members)];
  }
  private static queued(p: Planning, rows: Map<string, Row>, members: Set<string>): string[] {
    const { limits, blockers, platform, urgent } = p.active, out: string[] = [];
    if (blockers.length > limits.blockers) { out.push(`${blockers.length} blockers active, over ${limits.blockers}`); }
    if (platform.length > limits.platform) { out.push(`${platform.length} platform items active, over ${limits.platform}`); }
    const active = new Set([...blockers, ...platform].map(q => q.id));
    for (const q of [...blockers, ...platform]) {
      if (!rows.has(q.id)) { out.push(`${q.id} is active and in no register`); }
      if (rows.has(q.id) && !this.live(rows.get(q.id))) { out.push(`${q.id} is active but ${rows.get(q.id)!.state}`); }
      if (!q.owner.trim() || !q.accept.trim()) { out.push(`${q.id} is active without an owner and an acceptance`); }
    }
    for (const q of blockers) { if (!members.has(q.id)) { out.push(`${q.id} is an active blocker outside the slice`); } }
    for (const u of urgent) {
      if (!blockers.some(q => q.id === u.id)) { out.push(`${u.id} is urgent and not among the blockers`); }
      if (rows.has(u.id) && !this.live(rows.get(u.id))) { out.push(`${u.id} is urgent but ${rows.get(u.id)!.state}`); }
      if (!u.why.trim()) { out.push(`${u.id} is urgent with no reason`); }
      if (u.displaced && active.has(u.displaced)) { out.push(`${u.id} displaced ${u.displaced}, still active`); }
    }
    return out;
  }
  // The views, said: the register's count, the slice's gate as live over declared, the queue against its limits.
  static said(p: Planning = this.planning(), rows: Map<string, Row> = this.rows()): string[] {
    const all = [...rows.values()], live = all.filter(r => this.live(r));
    const gated = live.filter(r => this.gate.includes(r.pri));
    const members = p.slice.members.map(id => rows.get(id));
    const open = members.filter(r => this.live(r) && this.gate.includes(r!.pri));
    const lowered = members.filter(r => this.live(r) && !this.gate.includes(r!.pri));
    return [
      `The register: ${all.length} rows, ${live.length} live, ${gated.length} live P0/P1 (the record; not a target)`,
      `${p.slice.name} (since ${p.slice.since}): ${open.length} / ${p.slice.members.length} P0/P1 rows live`,
      `  scope: ${p.slice.scope}`,
      ...open.map(r => `  ${r!.id} ${r!.pri} ${r!.state}: ${r!.what.slice(0, 90)}`),
      ...lowered.length ? [`  live, no longer P0/P1: ${lowered.map(r => `${r!.id} ${r!.pri}`).join(', ')}`] : [],
      `  outside it, each with its reason: ${Object.keys(p.slice.outside).length}`,
      `The active queue: ${p.active.blockers.length} / ${p.active.limits.blockers} blockers, `
        + `${p.active.platform.length} / ${p.active.limits.platform} platform`,
      ...p.active.blockers.map(q => this.queue(q, rows)), '  platform:', ...p.active.platform.map(q => this.queue(q, rows)),
      ...p.active.urgent.map(u => `  urgent ${u.id}: ${u.why}${u.displaced ? ` (displaced ${u.displaced})` : ''}`),
    ];
  }
  private static queue(q: Queued, rows: Map<string, Row>): string {
    return `  ${q.id} (${rows.get(q.id)?.state ?? 'no row'}, ${q.owner}): ${q.accept}`;
  }
  static main(): number {
    for (const line of this.said()) { console.log(line); }
    const faults = this.faults();
    for (const f of faults) { console.log(`FAULT: ${f}`); }
    return faults.length ? 1 : 0;
  }
}
if (import.meta.main) { process.exit(PlanningViews.main()); }
