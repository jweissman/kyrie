#!/usr/bin/env bun
// What each live row of the register is (the owner, 20 November: "I'd distinguish release-blocking defects,
// outstanding requirements, and future directions rather than making a single register-zero count carry all three
// meanings"). A row is a defect unless named otherwise: a real observed failure stays a defect even when its remedy is
// authored content. A requirement is a committed obligation unmet (a brief, an owner's ask, an acceptance gate), kept
// visible though it is no software failure; a direction is future design or research, counted apart (the register's
// header names the families KX, SS, PG, SR, IM). Every reclassification is auditable: what the row was, its priority
// then (which the register must still show: a kind never moves a priority), and why. Any row may be blocked by an
// architecture row it names; a blocked defect is still a defect. Kept in doc/architecture/register-kinds.json, held by
// test/small/register-kinds.
//   bun scripts/register-kinds.ts            live rows by kind and priority; the release-blocking; the blocked
//   bun scripts/register-kinds.ts --audit    every row reclassified: was, now, priority, why
//   bun scripts/register-kinds.ts --defects  the live defects, P0 and P1 first, each with what blocks it
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegisterTickets } from './register-tickets';

export type Kind = 'defect' | 'requirement' | 'direction';
export interface Named { kind: Exclude<Kind, 'defect'>; was: Kind; pri: string; why: string }
interface Kinds { about: string; rows: Record<string, Named>; blockedBy: Record<string, string> }
interface Live { id: string; pri: string; what: string; kind: Kind; blockedBy?: string }

export class RegisterKinds {
  static readonly file = 'doc/architecture/register-kinds.json';
  static readonly families = ['KX', 'SS', 'PG', 'SR', 'IM'];
  static readonly blocking = ['P0', 'P1'];
  static read(): Kinds {
    return JSON.parse(readFileSync(join(RegisterTickets.root, this.file), 'utf8')) as Kinds;
  }
  static kind(id: string, kinds: Kinds = this.read()): Kind {
    return kinds.rows[id]?.kind ?? (this.families.includes(id.replace(/-.*$/, '')) ? 'direction' : 'defect');
  }
  // Every live row not deferred (open, partly, unverified: deferred rows wait on the owner's rulings and are counted
  // apart), its kind and what blocks it.
  static live(kinds: Kinds = this.read()): Live[] {
    return RegisterTickets.rows(RegisterTickets.text())
      .filter(r => RegisterTickets.live.includes(r.state) && r.state !== 'deferred').map(r => ({ id: r.id, pri: r.pri,
        what: r.what, kind: this.kind(r.id, kinds),
        ...kinds.blockedBy[r.id] ? { blockedBy: kinds.blockedBy[r.id] } : {} }));
  }
  static report(rows: Live[]): string[] {
    const pris = [...new Set(rows.map(r => r.pri))].sort();
    const out = (['defect', 'requirement', 'direction'] as Kind[]).map(k => {
      const of = rows.filter(r => r.kind === k), by = pris.map(p => `${p} ${of.filter(r => r.pri === p).length}`);
      return `${k.padEnd(12)}${String(of.length).padStart(4)}  ${by.join(' · ')}`;
    });
    const blocking = rows.filter(r => r.kind === 'defect' && this.blocking.includes(r.pri));
    const by = new Map<string, Live[]>();
    for (const r of rows.filter(x => x.blockedBy)) { by.set(r.blockedBy!, [...by.get(r.blockedBy!) ?? [], r]); }
    return [...out, `release-blocking defects (${this.blocking.join(', ')}): ${blocking.length}`, '',
      'blocked, by what blocks them (a blocked defect is still a defect):',
      ...[...by].sort((a, b) => b[1].length - a[1].length)
        .map(([b, rs]) => `  ${b.padEnd(8)}${rs.length}: ${rs.map(r => `${r.id} (${r.kind}, ${r.pri})`).join(', ')}`)];
  }
  static audit(kinds: Kinds = this.read()): string[] {
    return Object.entries(kinds.rows).sort(([a], [b]) => a.localeCompare(b))
      .map(([id, n]) => `${id.padEnd(8)}${n.was} → ${n.kind}  ${n.pri}  ${n.why}`);
  }
  static main(argv: string[]): number {
    if (argv.includes('--audit')) { console.log(this.audit().join('\n')); return 0; }
    const rows = this.live();
    if (argv.includes('--defects')) {
      for (const r of rows.filter(x => x.kind === 'defect').sort((a, b) => a.pri.localeCompare(b.pri))) {
        const by = r.blockedBy ? `[blocked by ${r.blockedBy}] ` : '';
        console.log(`${r.id.padEnd(8)}${r.pri.padEnd(4)}${by}${r.what.slice(0, 90)}`);
      }
      return 0;
    }
    console.log(this.report(rows).join('\n'));
    return 0;
  }
}

if (import.meta.main) { process.exit(RegisterKinds.main(process.argv.slice(2))); }
