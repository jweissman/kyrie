#!/usr/bin/env bun
// The register's state, as its own tables record it: each row's status read from the column its table calls status,
// and its weight from the column it calls severity or pri; counted as open, partly, fixed, deferred or decided, by
// weight, and the ids used by two rows. Run at any revision to see whether the register shrinks or grows (Mission 21:
// debt accountability).
//   bun scripts/register-state.ts [revision]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

type Row = { id: string; status: string; weight: string };

class RegisterState {
  static readonly kinds: [string, RegExp][] = [
    ['partly', /\b(partly|half|in part|part\b)/i], ['deferred', /\b(deferred|moved to m2\d|for m2\d)\b/i],
    ['fixed', /\b(fixed|held|mended|closed|done|met|superseded|withdrawn|not reproduced|by design|answered|moot)\b/i],
    ['decided', /\b(decided|ruled|kept as)\b/i], ['open', /\b(open|todo|unmet|diagnosed)\b/i]];
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
  private static kind(status: string): string {
    return this.kinds.find(([, re]) => re.test(status))?.[0] ?? 'unstated';
  }
  // Each table's rows, by its header's own columns: the status, and the severity or pri.
  private static rows(text: string): Row[] {
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
      out.push({ id: cells[0]!, status: cells[status] ?? '', weight: weight >= 0 ? cells[weight] ?? '' : '' });
    }
    return out;
  }
}
process.exit(RegisterState.run(process.argv.slice(2)));
