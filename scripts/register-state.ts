#!/usr/bin/env bun
// The register's state: its rows counted by state and priority, and its hygiene. One reading of the register, the
// tickets' (RegisterTickets.rows: every table by its own columns; a row's state by its status's leading disposition),
// so that this count and the tickets' report never disagree (the planning report's Sprint 0, item 1: the two scripts
// had read 718 and 754 rows, one finding a state word anywhere in a status, the other its lead). The register and its
// archive are read as one (RegisterTickets.text).
//   bun scripts/register-state.ts [revision]
import { RegisterTickets, type Row as Ticket, type State } from './register-tickets';

export interface Row { id: string; status: string; weight: string; state: State; loose: boolean; line: string }

export class RegisterState {
  static run(args: string[]): number {
    const revision = args[0];
    const text = RegisterTickets.text(revision);
    const rows = this.rows(text), counts = new Map<string, number>(), heavy = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.state, (counts.get(r.state) ?? 0) + 1);
      const p = /P[01]\b/.exec(r.weight)?.[0];
      if (p) { heavy.set(`${p} ${r.state}`, (heavy.get(`${p} ${r.state}`) ?? 0) + 1); }
    }
    const live = rows.filter(r => RegisterTickets.live.includes(r.state)).length;
    console.log(`${rows.length} rows, ${live} live: ${[...counts].sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${n} ${k}`).join(', ')}`);
    console.log(`P0/P1: ${[...heavy].sort().map(([k, n]) => `${n} ${k}`).join(', ')}`);
    for (const line of this.hygiene(rows)) { console.log(line); }
    return 0;
  }
  // What wants mending in the register itself: ids used twice, statuses that lead with no state the reader knows, and
  // rows that say closed and still open.
  static hygiene(rows: Row[]): string[] {
    const ids = rows.map(r => r.id), twice = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    const other = rows.filter(r => r.state === 'other').map(r => r.id), loose = rows.filter(r => r.loose).map(r => r.id);
    return [`ids used twice (${twice.length}): ${twice.join(', ')}`,
      `statuses leading with no known state (${other.length}): ${other.join(', ')}`,
      `closed, yet saying open (${loose.length}): ${loose.join(', ')}`];
  }
  static rows(text: string): Row[] {
    const lines = new Map(text.split('\n').filter(l => l.startsWith('| ')).map(l => [l.split('|')[1]!.trim(), l]));
    return RegisterTickets.rows(text).map((t: Ticket) => ({ id: t.id, status: t.status, weight: t.pri, state: t.state,
      loose: t.loose, line: lines.get(t.id) ?? '' }));
  }
  static kind(status: string): State { return RegisterTickets.state(status).state; }
}
if (import.meta.main) { process.exit(RegisterState.run(process.argv.slice(2))); }
