#!/usr/bin/env bun
// The register's archive (the owner, 20 November: "We could also archive out old items once they're verified or have a
// proof spec"). A closed row moves from doc/architecture/open-register.md to doc/architecture/register-archive.md
// only when all of these hold: its status cites a spec that exists; the closure lint (scripts/closure-lint.ts) finds
// nothing wrong with its evidence (a path, a spec or a size: its parts unanswered stay in the lint's baseline); and
// its status names a second reading (verified, the tribunal's, a second reader's) or its closure is older than
// fourteen days. A row closed "for a second reading" waits for it; a row met only in part waits for its
// split. Open, deferred, duplicate and reference rows never move. The archive keeps the register's sections and
// table layouts, so that a row reads there as it read here; both readers read both files (RegisterTickets.text).
//   bun scripts/register-archive.ts                     what would move, and why
//   bun scripts/register-archive.ts --apply             moved
//   bun scripts/register-archive.ts --today 2026-11-20  the day a closure's age is counted from
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ClosureLint } from './closure-lint';
import { RegisterTickets, type Row } from './register-tickets';

// A row's place in the register: the section it stands in and the table layout it is read by.
export interface Place { heading: string; header: string; rule: string }
export interface Move extends Place { id: string; line: string; why: string }
interface Table { header: string; rule: string; rows: string[] }
interface Section { heading: string; tables: Table[] }

export class RegisterArchive {
  static readonly register = RegisterTickets.files[0]!;
  static readonly archive = RegisterTickets.files[1]!;
  static readonly days = 14;
  private static readonly months: Record<string, number> = { Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  // A second reading the status names, in its lead (its first parenthesis): not one it still waits for.
  static secondReading(status: string): boolean {
    const lead = status.replaceAll('*', '').slice(0, 160);
    return /\bverified\b|\btribunal\b|second reader|second reading of/.test(lead) && !/for a second reading/.test(lead);
  }
  // The day a closure was made, from the first date its status gives ("fixed (5 Nov): …"), in 2026.
  static closedOn(status: string): Date | undefined {
    const m = /\b(\d{1,2}) (Sep|Oct|Nov|Dec)/.exec(status);
    return m ? new Date(Date.UTC(2026, this.months[m[2]!]!, Number(m[1]))) : undefined;
  }
  // Why a row may move, or why it may not (a reason that begins "stays").
  // Old and settled (the owner, 20 November: "archive old/solved defects"): a duplicate, and a row closed before a
  // proof spec was asked for, once older than the fortnight (an undated one is of the register's first compiling, 11
  // November or before) moves under a heading of its own that says so (RegisterArchive.apart); a recent one waits.
  static why(row: Pick<Row, 'id' | 'what' | 'status' | 'state' | 'loose'>, today: Date): string {
    if (row.state === 'duplicate' && !row.loose) {
      return this.old(row.status, today) ? RegisterArchive.duplicate : 'stays: duplicate, lately';
    }
    if (row.state !== 'closed' || row.loose) { return `stays: ${row.state}`; }
    if (/^\W*\w+ in part/i.test(row.status)) { return 'stays: met in part'; }
    const specs = ClosureLint.cites(row.status).filter(c => c.spec && c.files.some(f => f.endsWith('.test.ts')));
    if (!specs.length) { return this.old(row.status, today) ? RegisterArchive.unproved : 'stays: no spec that exists'; }
    const found = ClosureLint.findings(row).filter(f => ClosureLint.evidence.includes(f.kind));
    if (found.length) { return `stays: ${found.map(f => ClosureLint.key(f)).join('; ')}`; }
    const on = this.closedOn(row.status), age = on ? (today.getTime() - on.getTime()) / 86_400_000 : 0;
    const read = this.secondReading(row.status) ? 'a second reading' : age > this.days ? `closed ${age} days ago` : '';
    return read ? `${read}; held by ${specs.map(c => c.said).join(', ')}` : 'stays: no second reading, closed lately';
  }
  // Each row's section and table layout, by walking the register as its readers do.
  static places(text: string): Map<string, Place & { line: string }> {
    const out = new Map<string, Place & { line: string }>(), lines = text.split('\n');
    let heading = '', header = '', rule = '';
    lines.forEach((line, i) => {
      if (line.startsWith('## ')) { heading = line; return; }
      if (/^\| ?(id|review) ?\|/i.test(line)) { [header, rule] = [line, lines[i + 1] ?? '']; return; }
      const id = /^\| ([A-Z][A-Z0-9-]+[a-z]?) \|/.exec(line)?.[1];
      if (id && !out.has(id)) { out.set(id, { heading, header, rule, line }); }
    });
    return out;
  }
  // The two kinds of row archived apart from those proved: what each is said to be, and the heading it is kept under.
  static readonly duplicate = 'a duplicate, older than the fortnight';
  static readonly unproved = 'closed before a proof spec was asked for, older than the fortnight';
  static apart(why: string): string | undefined {
    return why === this.duplicate ? '## Duplicates, archived (20 November)'
      : why === this.unproved ? '## Closed before proof specs were asked for, archived (20 November)' : undefined;
  }
  private static old(status: string, today: Date): boolean {
    const on = this.closedOn(status);
    return !on || (today.getTime() - on.getTime()) / 86_400_000 > this.days;
  }
  static moves(text: string, today: Date): { moves: Move[]; kept: number } {
    const places = this.places(text), moves: Move[] = [];
    const rows = RegisterTickets.rows(text);
    for (const row of rows) {
      const why = this.why(row, today), place = places.get(row.id);
      if (!why.startsWith('stays') && place) {
        moves.push({ id: row.id, ...place, ...this.apart(why) ? { heading: this.apart(why)! } : {}, why });
      }
    }
    return { moves, kept: rows.length - moves.length };
  }
  // The register without the rows moved.
  static lift(text: string, moves: Move[]): string {
    const gone = new Set(moves.map(m => m.line));
    return text.split('\n').filter(l => !gone.has(l)).join('\n');
  }
  // The archive read as its sections and their tables, after its header.
  static read(text: string): { intro: string; sections: Section[] } {
    const lines = text.split('\n'), first = lines.findIndex(l => l.startsWith('## '));
    const intro = (first < 0 ? lines : lines.slice(0, first)).join('\n').trimEnd(), sections: Section[] = [];
    for (const [i, line] of lines.entries()) {
      if (first < 0 || i < first) { continue; }
      if (line.startsWith('## ')) { sections.push({ heading: line, tables: [] }); continue; }
      const section = sections.at(-1)!;
      if (/^\| ?(id|review) ?\|/i.test(line)) {
        section.tables.push({ header: line, rule: lines[i + 1] ?? '', rows: [] });
      } else if (/^\| [A-Z]/.test(line)) { section.tables.at(-1)?.rows.push(line); }
    }
    return { intro, sections };
  }
  // The archive with the rows moved placed under their sections and layouts, the sections in the register's order.
  static place(archive: string, moves: Move[], register: string): string {
    const { intro, sections } = this.read(archive);
    for (const m of moves) {
      let section = sections.find(s => s.heading === m.heading);
      if (!section) { sections.push(section = { heading: m.heading, tables: [] }); }
      let table = section.tables.find(t => t.header === m.header);
      if (!table) { section.tables.push(table = { header: m.header, rule: m.rule, rows: [] }); }
      if (!table.rows.includes(m.line)) { table.rows.push(m.line); }
    }
    const order = register.split('\n').filter(l => l.startsWith('## '));
    const body = sections.sort((a, b) => this.rank(order, a) - this.rank(order, b)).map(s => [s.heading, '',
      ...s.tables.map(t => [t.header, t.rule, ...t.rows].join('\n'))].join('\n')).join('\n\n');
    return `${intro}\n\n${body}\n`;
  }
  private static rank(order: string[], s: Section): number {
    return order.includes(s.heading) ? order.indexOf(s.heading) : order.length;
  }
  static main(argv: string[]): number {
    const at = argv.indexOf('--today'), today = at < 0 ? new Date() : new Date(`${argv[at + 1]}T00:00:00Z`);
    const root = RegisterTickets.root, register = readFileSync(join(root, this.register), 'utf8');
    const archived = existsSync(join(root, this.archive)) ? readFileSync(join(root, this.archive), 'utf8') : '';
    const { moves, kept } = this.moves(register, today);
    for (const m of moves) { console.log(`${m.id.padEnd(8)}${m.why}`); }
    console.log(`${moves.length} closed rows would move; ${kept} stay`);
    if (argv.includes('--apply') && moves.length) {
      writeFileSync(join(root, this.archive), this.place(archived, moves, register));
      writeFileSync(join(root, this.register), this.lift(register, moves));
      console.log(`moved ${moves.length} to ${this.archive}`);
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(RegisterArchive.main(process.argv.slice(2))); }
