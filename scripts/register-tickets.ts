#!/usr/bin/env bun
// The register as tickets and features (the owner, 15 November: register items as specific issues, and a formal
// feature map from the defects, reports and requests). Reads doc/architecture/open-register.md in both of its table
// layouts (six cells: id, what, sources, status, priority, home; five: id, what, status, priority, when) and
// doc/architecture/features.json, and says: how many rows there are by state; each live row's readiness (ready, wants a
// decision, wants research, unverified); and, by feature, the live defects and the specs that guard it.
//   bun scripts/register-tickets.ts                     the summary, by feature
//   bun scripts/register-tickets.ts --feature fight     a feature's live rows
//   bun scripts/register-tickets.ts --touching web/reader/stage/fight-moves.tsx   what a changed file could touch
//   bun scripts/register-tickets.ts --unmapped | --json
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type State = 'closed' | 'reference' | 'duplicate' | 'partly' | 'deferred' | 'open' | 'unverified' | 'other';
export type Readiness = 'ready' | 'decision' | 'research' | 'unverified';
export interface Row {
  id: string; section: string; what: string; status: string; pri: string; state: State; loose: boolean;
  feature: string; how: 'row' | 'text' | 'prefix' | 'none'; readiness?: Readiness;
}
export interface Feature { id: string; name: string; paths: string[]; specs: string[] }
interface Map { features: Feature[]; byPrefix: Record<string, string>; textFirst: string[]; byText: [string, string][];
  rows: Record<string, string> }

export class RegisterTickets {
  static readonly root = join(import.meta.dir, '..');
  static readonly live: State[] = ['open', 'partly', 'deferred', 'unverified', 'other'];
  static map(): Map {
    return JSON.parse(readFileSync(join(this.root, 'doc/architecture/features.json'), 'utf8')) as Map;
  }
  // A status read by its first words: "**fixed (15 Nov):** … Open: …" is closed, loosely, the rest still said.
  static state(status: string): { state: State; loose: boolean } {
    const lead = status.toLowerCase().replaceAll('*', '').trim(), rest = lead.slice(20);
    const state: State = /^duplicate/.test(lead) ? 'duplicate'
      : /^(fixed|done|mended|found and mended|met\b|closed|decided|not reproduced|superseded|dropped)/.test(lead) ? 'closed'
        : /^(partly|partial|in part|improved)/.test(lead) ? 'partly'
          : /^(deferred|later|left for)/.test(lead) ? 'deferred'
            : /^open/.test(lead) ? 'open' : /unverified/.test(lead.slice(0, 80)) ? 'unverified' : 'other';
    return { state, loose: state === 'closed' && /\bopen:|\bstill open|\bnot (yet )?(built|fixed)/.test(rest) };
  }
  static readiness(row: Pick<Row, 'what' | 'status' | 'state'>): Readiness {
    const text = `${row.what} ${row.status}`.toLowerCase();
    if (/owner'?s (decision|call|ruling)|decision for the owner|a rules decision/.test(text)) { return 'decision'; }
    if (row.state === 'unverified' || /unverified/.test(row.status.toLowerCase().slice(0, 80))) { return 'unverified'; }
    return /investigat|research|cause not found|wants: the owner|needs a repro/.test(text) ? 'research' : 'ready';
  }
  // Every row of the register, placed on a feature: by its id, by its words (for the prefixes that cross features), by
  // its id's prefix.
  static rows(register: string, map: Map = this.map()): Row[] {
    const out: Row[] = [];
    let section = '';
    for (const line of register.split('\n')) {
      const heading = /^##\s+\d+\.\s+(.*)$/.exec(line);
      if (heading) { section = heading[1]!; continue; }
      const cells = line.startsWith('|') ? line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()) : [];
      if (cells.length < 5 || !/^[A-Z][A-Z0-9-]+$/.test(cells[0]!)) { continue; }
      const [id, what] = [cells[0]!, cells[1]!], status = cells.at(-3)!, pri = cells.at(-2)!;
      // The direction review's section holds pointers to rows and documents, not rows of its own (state reference).
      const pointer = /^The creative and technical direction review/.test(section);
      const { state, loose } = pointer ? { state: 'reference' as State, loose: false } : this.state(status);
      const placed = this.place(id, what, map);
      out.push({ id, section, what, status, pri: pointer ? '—' : pri, state, loose, ...placed,
        ...this.live.includes(state) ? { readiness: this.readiness({ what, status, state }) } : {} });
    }
    return out;
  }
  static place(id: string, what: string, map: Map): Pick<Row, 'feature' | 'how'> {
    if (map.rows[id]) { return { feature: map.rows[id]!, how: 'row' }; }
    const prefix = /^[A-Z]+\d*(?=-)/.exec(id)?.[0] ?? /^[A-Z]+/.exec(id)![0], text = what.toLowerCase();
    if (map.textFirst.includes(prefix) || map.textFirst.includes(prefix.replace(/\d+$/, ''))) {
      const hit = map.byText.find(([re]) => new RegExp(re).test(text));
      if (hit) { return { feature: hit[1], how: 'text' }; }
    }
    const feature = map.byPrefix[prefix] ?? map.byPrefix[prefix.replace(/\d+$/, '')];
    return feature ? { feature, how: 'prefix' } : { feature: 'unmapped', how: 'none' };
  }
  // The specs whose file names say a feature's words, in test/ and test/small.
  static specs(feature: Feature): string[] {
    const files = ['test', 'test/small'].flatMap(dir => readdirSync(join(this.root, dir)).filter(f => /\.test\.ts$/.test(f)));
    return files.filter(f => feature.specs.some(word => f.includes(word)));
  }
  static report(rows: Row[], map: Map): string[] {
    const live = rows.filter(r => r.readiness);
    const states: State[] = ['closed', 'reference', 'duplicate', 'partly', 'open', 'deferred', 'unverified', 'other'];
    const head = [`${rows.length} rows: ${states.map(s => `${rows.filter(r => r.state === s).length} ${s}`).join(', ')}; `
      + `${rows.filter(r => r.loose).length} closed but still saying open`,
    `${live.length} live: ${(['ready', 'decision', 'research', 'unverified'] as Readiness[])
      .map(k => `${live.filter(r => r.readiness === k).length} ${k}`).join(', ')}`,
    `placed by: ${(['row', 'text', 'prefix', 'none'] as const).map(h => `${rows.filter(r => r.how === h).length} ${h}`).join(', ')}`,
    '', 'feature'.padEnd(14) + 'P0  P1  P2  P3  live  specs  name'];
    const lines = map.features.map(f => {
      const mine = live.filter(r => r.feature === f.id);
      return `${f.id.padEnd(14)}${['P0', 'P1', 'P2', 'P3'].map(p => String(mine.filter(r => r.pri === p).length).padEnd(4))
        .join('')}${String(mine.length).padEnd(6)}`
        + `${String(this.specs(f).length).padEnd(7)}${f.name}`;
    });
    return [...head, ...lines];
  }
  static list(rows: Row[], feature: string): string[] {
    return rows.filter(r => r.feature === feature && r.readiness).sort((a, b) => a.pri.localeCompare(b.pri))
      .map(r => `${r.id.padEnd(8)}${r.pri.padEnd(4)}${(r.readiness ?? '').padEnd(11)}${r.what.slice(0, 100)}`);
  }
  static touching(path: string, map: Map): Feature[] {
    return map.features.filter(f => f.paths.some(p => path === p || path.startsWith(`${p}/`)));
  }
  static after(args: string[], flag: string): string { return args[args.indexOf(flag) + 1] ?? ''; }
  static main(args: string[]): number {
    const map = this.map(), rows = this.rows(readFileSync(join(this.root, 'doc/architecture/open-register.md'), 'utf8'), map);
    if (args.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); return 0; }
    if (args.includes('--unmapped')) {
      rows.filter(r => r.how === 'none').forEach(r => console.log(r.id, r.what.slice(0, 90)));
      return 0;
    }
    if (args.includes('--feature')) { console.log(this.list(rows, this.after(args, '--feature')).join('\n')); return 0; }
    if (args.includes('--touching')) {
      for (const f of this.touching(this.after(args, '--touching'), map)) { console.log(`${f.id}: ${f.name}\n${this.list(rows, f.id).join('\n')}`); }
      return 0;
    }
    console.log(this.report(rows, map).join('\n'));
    return 0;
  }
}
if (import.meta.main) { process.exit(RegisterTickets.main(process.argv.slice(2))); }
