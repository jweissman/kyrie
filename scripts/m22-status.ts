#!/usr/bin/env bun
// Where the mission stands, on one screen (the owner, 19 November: "a report script that can print out how far we are
// along the SRD migration for creatures and spells; and some general printout of the state of the register"; M22's
// goal is register zero). Read only from what the repository keeps: the register (RegisterState's one reading), the
// sprint board, the maturity track's rows, and the SRD reports the generators write (srd-fidelity.md, srd-manifest.md).
// Regenerate those first for a current SRD reading: bun scripts/srd-fidelity.ts; bun scripts/srd-manifest.ts.
//   bun scripts/m22-status.ts [--families N]
import { readFileSync } from 'node:fs';
import { RegisterState, type Row } from './register-state';
import { RegisterTickets } from './register-tickets';

export class MissionStatus {
  static readonly register = 'doc/architecture/open-register.md';
  static readonly sprint = 'doc/architecture/mission-22/current-sprint.md';
  static readonly fidelity = 'doc/architecture/mission-21/rules/srd-fidelity.md';
  static readonly manifest = 'doc/architecture/mission-21/rules/srd-manifest.md';
  static main(argv: string[]): number {
    const at = argv.indexOf('--families'), families = at < 0 ? 15 : Number(argv[at + 1] ?? 15);
    const rows = RegisterState.rows(readFileSync(this.register, 'utf8'));
    console.log([...this.overall(rows), '', ...this.families(rows, families), '', ...this.board(rows), '',
      ...this.srd()].join('\n'));
    return 0;
  }
  static live(r: Row): boolean { return RegisterTickets.live.includes(r.state); }
  // The register as a whole: how many rows are still to be done, and how heavy.
  static overall(rows: Row[]): string[] {
    const live = rows.filter(r => this.live(r)), by = this.by.bind(this, rows), heavy = this.heavy.bind(this, live);
    const done = by('closed') + by('duplicate') + by('reference');
    return ['# Register zero', `${rows.length} rows: ${live.length} live (${by('open')} open, ${by('partly')} partly, `
      + `${by('deferred')} deferred, ${by('unverified')} unverified); ${done} done (${by('closed')} closed, `
      + `${by('duplicate')} duplicate, ${by('reference')} reference)`,
      `live by weight: ${heavy('P0')} P0, ${heavy('P1')} P1, ${live.length - heavy('P0') - heavy('P1')} other`,
      `progress: ${Math.round(100 * done / Math.max(1, rows.length))} % of rows done`];
  }
  static by(rows: Row[], state: string): number { return rows.filter(r => r.state === state).length; }
  static heavy(rows: Row[], p: string): number { return rows.filter(r => new RegExp(`\\b${p}\\b`).test(r.weight)).length; }
  // Live rows by their id's family (CL-, OR-, MT-…), most first: where register zero is furthest.
  static families(rows: Row[], n: number): string[] {
    const counts = new Map<string, { open: number; partly: number; other: number }>();
    for (const r of rows.filter(x => this.live(x))) {
      const f = /^[A-Z0-9]+(?=-)/.exec(r.id)?.[0] ?? '?', c = counts.get(f) ?? { open: 0, partly: 0, other: 0 };
      if (r.state === 'open') { c.open++; } else if (r.state === 'partly') { c.partly++; } else { c.other++; }
      counts.set(f, c);
    }
    const sorted = [...counts].sort((a, b) => this.sum(b[1]) - this.sum(a[1]));
    return ['## Live rows by family', '| family | live | open | partly | deferred/other |', '|---|---:|---:|---:|---:|',
      ...sorted.slice(0, n).map(([f, c]) => `| ${f} | ${this.sum(c)} | ${c.open} | ${c.partly} | ${c.other} |`),
      ...sorted.length > n ? [`(and ${sorted.length - n} smaller families)`] : []];
  }
  static sum(c: { open: number; partly: number; other: number }): number { return c.open + c.partly + c.other; }
  // The sprint board's rows and the maturity track's, by their own state words.
  static board(rows: Row[]): string[] {
    const text = readFileSync(this.sprint, 'utf8'), current = /^# Sprint (\d+)/m.exec(text)?.[1];
    const sprint = text.split('\n').filter(l => /^\| S\d+-\d+ \|/.test(l));
    const mine = sprint.filter(l => l.startsWith(`| S${current}-`)).map(l => {
      const cells = l.split('|').map(x => x.trim());
      return `${cells[1]}: ${(/^(met|done|partly|open|carried|deferred)/i.exec(cells.at(-2) ?? '')?.[1] ?? '?')}`;
    });
    const mt = rows.filter(r => r.id.startsWith('MT-')).map(r => `${r.id}: ${r.state}`);
    return [`## Sprint ${current ?? '?'}`, mine.join(', ') || '(no rows)', '', '## Maturity track', mt.join(', ')];
  }
  // How far the SRD migration has come, as its generated reports say.
  static readonly spells = new RegExp('Spells with an SRD counterpart \\((\\d+) of (\\d+) catalog spells\\): (\\d+) pass '
    + 'in structure.*?, (\\d+) in resolution.*?(\\d+) proved in\\s+play identity');
  static readonly kinds = new RegExp('Creatures with one \\((\\d+)\\):\\s*(\\d+) in structure.*?(\\d+) in '
    + 'resolution.*?(\\d+) proved in\\s+play identity');
  static srd(): string[] {
    const f = readFileSync(this.fidelity, 'utf8').replace(/\n(?!\n)/g, ' ');
    const spells = this.spells.exec(f), kinds = this.kinds.exec(f);
    const placed = /(\d+) of (\d+) placed encounters in a1 SRD-faithful/.exec(f);
    const m = readFileSync(this.manifest, 'utf8').split('\n').filter(l => /^\| [a-z]+ \| \d+/.test(l))
      .map(l => l.split('|').slice(1, 6).map(x => x.trim()));
    const total = this.column.bind(this, m), pct = this.pct.bind(this);
    return ['## SRD migration',
      spells ? `spells: ${spells[1]} of ${spells[2]} catalog spells have an SRD counterpart; of those ${spells[3]} pass in `
        + `structure (${pct(spells[3], spells[1])}), ${spells[4]} in resolution (${pct(spells[4], spells[1])}), `
        + `${spells[5]} proved in play` : 'spells: (not read)',
      kinds ? `creatures: ${kinds[1]} with a counterpart; ${kinds[2]} pass in structure (${pct(kinds[2], kinds[1])}), `
        + `${kinds[3]} in resolution (${pct(kinds[3], kinds[1])}), ${kinds[4]} proved in play` : 'creatures: (not read)',
      placed ? `a1's placed encounters SRD-faithful: ${placed[1]} of ${placed[2]}` : '',
      m.length ? `SRD records (manifest): ${total(1)}; mapped ${total(2)}, ready for an adapter ${total(3)}, `
        + `blocked on the engine ${total(4)}` : ''].filter(Boolean);
  }
  static pct(a?: string, b?: string): string {
    return a && b ? `${Math.round(100 * Number(a) / Math.max(1, Number(b)))} %` : '?';
  }
  static column(rows: string[][], i: number): number { return rows.reduce((n, r) => n + Number(r[i]), 0); }
}

if (import.meta.main) { process.exit(MissionStatus.main(process.argv.slice(2))); }
