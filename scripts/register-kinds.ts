#!/usr/bin/env bun
// What each live row of the register is (the owner, 20 November: "identify forward-looking/future design; as well as
// trying to work out which tickets are blocked by architectural changes (but note if it's a true defect it shouldn't
// count as deferred/future work even if it requires arch changes)"). A row is a defect unless it is named a direction
// (future design or scope, counted apart: the register's own header) or a gate (a playtest or a reading only a person
// can give); the families the header names as directions (KX, SS, PG, SR, IM) are directions by their prefix. Any row,
// a defect above all, may be blocked by an architecture row (MT-16, AX-03…), which it names; a blocked defect is still
// a defect, open at its own priority. Kept in doc/architecture/register-kinds.json, held by test/small/register-kinds.
//   bun scripts/register-kinds.ts            live rows by kind and priority, the blocked by blocker
//   bun scripts/register-kinds.ts --defects  the live defects, P0 and P1 first, each with what blocks it
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegisterTickets } from './register-tickets';

export type Kind = 'defect' | 'direction' | 'gate';
interface Kinds { about: string; direction: Record<string, string>; gate: Record<string, string>;
  blockedBy: Record<string, string> }
interface Live { id: string; pri: string; what: string; kind: Kind; blockedBy?: string }

export class RegisterKinds {
  static readonly file = 'doc/architecture/register-kinds.json';
  static readonly families = ['KX', 'SS', 'PG', 'SR', 'IM'];
  static read(): Kinds {
    return JSON.parse(readFileSync(join(RegisterTickets.root, this.file), 'utf8')) as Kinds;
  }
  static kind(id: string, kinds: Kinds = this.read()): Kind {
    if (id in kinds.gate) { return 'gate'; }
    return id in kinds.direction || this.families.includes(id.replace(/-.*$/, '')) ? 'direction' : 'defect';
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
    const out = (['defect', 'direction', 'gate'] as Kind[]).map(k => {
      const of = rows.filter(r => r.kind === k);
      const by = pris.map(p => `${p} ${of.filter(r => r.pri === p).length}`).join(' · ');
      return `${k.padEnd(10)}${String(of.length).padStart(4)}  ${by}`;
    });
    const by = new Map<string, Live[]>();
    for (const r of rows.filter(x => x.blockedBy)) { by.set(r.blockedBy!, [...by.get(r.blockedBy!) ?? [], r]); }
    return [...out, '', 'blocked, by what blocks them (a blocked defect is still a defect):',
      ...[...by].sort((a, b) => b[1].length - a[1].length)
        .map(([b, rs]) => `  ${b.padEnd(8)}${rs.length}: ${rs.map(r => `${r.id} (${r.kind}, ${r.pri})`).join(', ')}`)];
  }
  static main(argv: string[]): number {
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
