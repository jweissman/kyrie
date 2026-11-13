#!/usr/bin/env bun
// The register's state, as its own tables record it: each row's status read from the column its table calls status,
// and its weight from the column it calls severity or pri; counted as open, partly, fixed, deferred or decided, by
// weight, and the ids used by two rows. Run at any revision to see whether the register shrinks or grows (Mission 21:
// debt accountability).
//   bun scripts/register-state.ts [revision]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export type Row = { id: string; line: string; status: string; weight: string };

export class RegisterState {
  static readonly kinds: [string, RegExp][] = [
    ['partly', /\b(partly|partial|half|in part|part\b|improved|addressed)/i],
    ['deferred', /\b(deferred|moved to m2\d|for m2\d|left (by|for) m\d+|later)\b/i],
    // An idea, a direction or a proposal is an ambition, not a defect (the M21 brief).
    ['ambition', /\b(idea|direction recorded|proposed|proposal|to build|not built|noted)\b/i],
    ['fixed', /\b(fixed|held|mended|closed|done|met|superseded|withdrawn|not reproduced|by design|answered|moot)\b/i],
    ['decided', /\b(decided|ruled|kept as)\b/i], ['open', /\b(open|todo|unmet|diagnosed|not in log|no record|no completion|unverified|disappeared|cause not found)\b/i]];
  static run(args: string[]): number {
    const revision = args[0];
    const text = revision ? execSync(`git show ${revision}:doc/architecture/open-register.md`, { maxBuffer: 1 << 26 })
      .toString() : readFileSync('doc/architecture/open-register.md', 'utf8');
    const rows = this.rows(text), counts = new Map<string, number>(), heavy = new Map<string, number>();
    for (const r of rows) {
      const kind = this.kind(r.status);
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
      if (/P[01]\b/.test(r.weight)) { heavy.set(`${r.weight.match(/P[01]/)![0]} ${kind}`, (heavy.get(`${r.weight.match(/P[01]/)![0]} ${kind}`) ?? 0) + 1); }
    }
    const ids = rows.map(r => r.id), twice = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    console.log(`${rows.length} rows: ${[...counts].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join(', ')}`);
    console.log(`P0/P1: ${[...heavy].sort().map(([k, n]) => `${n} ${k}`).join(', ')}`);
    console.log(`ids used twice (${twice.length}): ${twice.join(', ')}`);
    return 0;
  }
  // A status leads with its state ("open: … never held", "partly fixed", "no record of it done"): the state word
  // placed first decides, and of two at one place the kinds' order.
  static kind(status: string): string {
    const at = this.kinds.map(([kind, re]) => ({ kind, i: status.search(re) })).filter(k => k.i >= 0);
    return at.sort((a, b) => a.i - b.i)[0]?.kind ?? 'unstated';
  }
  // Each table's rows, by its header's own columns: the status, and the severity or pri.
  static rows(text: string): Row[] {
    const out: Row[] = [];
    let status = -1, weight = -1;
    for (const line of text.split('\n')) {
      const cells = line.split(' | ').map(c => c.replace(/^\| ?|\s*\|$/g, '').trim());
      if (/^\| (id|Id|ID) \|/.test(line)) {
        status = cells.findIndex(c => /^status/i.test(c));
        weight = cells.findIndex(c => /^(severity|pri)/i.test(c));
        continue;
      }
      if (!/^\| [A-Z][A-Z0-9]*-[0-9A-Z]+ \|/.test(line) || status < 0) { continue; }
      out.push({ id: cells[0]!, line, status: cells[status] ?? '', weight: weight >= 0 ? cells[weight] ?? '' : '' });
    }
    return out;
  }
}
if (import.meta.main) { process.exit(RegisterState.run(process.argv.slice(2))); }
