import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ColdPlay } from './cold-play';
import { HealthRead, type Snapshot } from './read';
import type { Move } from './score';

export class HealthReport {
  static history(): Snapshot[] {
    const path = join(HealthRead.root, HealthRead.history);
    if (!existsSync(path)) { return []; }
    return readFileSync(path, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line) as Snapshot)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  static number(n: number): string { return n.toFixed(2).replace(/\.?0+$/, ''); }
  static sources(snapshot: Snapshot, paths: string[]): string {
    return paths.map(path => {
      const sha = snapshot.sources[path];
      if (!sha) { throw new Error(`Missing health source hash: ${path}`); }
      return `${path}@${sha}`;
    }).join(', ');
  }
  static headline(snapshot: Snapshot): string {
    const s = snapshot.components;
    return s.verified ? this.number(s.headline) : `unverified (provisional ${this.number(s.headline)})`;
  }
  static moves(moves: Move[]): string[] {
    return ['Five cheapest moves (one unit per round, P1 or capability; a ratchet takes its count in units):',
      ...moves.map(m => `  ${m.text}: +${this.number(m.points)} raw points, +${this.number(m.net)} after clamp`),
      ...moves.length ? [] : ['  none currently identified']];
  }
  static reasons(previous: Snapshot, current: Snapshot): string[] {
    const old = previous.components, now = current.components, reasons: string[] = [];
    for (const r of old.cold.rounds) {
      if (now.cold.value < old.cold.value && !now.cold.rounds.some(n => n.session === r.session)
        && (ColdPlay.date(current.date) - ColdPlay.date(r.date)) / ColdPlay.day >= 21) {
        reasons.push(`cold-play round ${r.date} ${r.kind} expired`);
      }
    }
    if (now.cold.value < old.cold.value && !reasons.length) { reasons.push('the cold-play mean fell'); }
    for (const d of now.p1.defects) {
      const before = old.p1.defects.find(x => x.id === d.id);
      if (before && d.cost > before.cost) {
        reasons.push(`${d.id} ${before.cost === 0 ? 'passed its grace' : 'aged'} (${before.cost} → ${d.cost})`);
      } else if (!before && d.cost) { reasons.push(`${d.id} added ${d.cost} P1 age cost`); }
    }
    for (const r of now.debt.ratchets) {
      const before = old.debt.ratchets.find(x => x.id === r.id);
      if (r.count > 0 && (before?.count ?? 0) === 0) {
        reasons.push(`${r.name} rose (${before?.count ?? 0} → ${r.count})`);
      }
    }
    for (const a of now.feature.aspects) {
      const before = old.feature.aspects.find(x => x.id === a.id);
      if (before && a.value < before.value) { reasons.push(`aspect ${a.id} feature health fell`); }
    }
    return reasons.length ? reasons : ['the component mix changed'];
  }
  static trend(previous: Snapshot[], current: Snapshot): string[] {
    const last = previous.at(-1), out = ['Trend (most recent snapshots):',
      ...previous.slice(-5).map(s => `  ${s.date} ${s.sha.slice(0, 12)} ${this.headline(s)}`),
      `  ${current.date} ${current.sha.slice(0, 12)} ${this.headline(current)}`];
    if (last && current.components.headline < last.components.headline) {
      out.push(`  fell: ${this.reasons(last, current).join('; ')}`);
    }
    return out;
  }
  static render(snapshot: Snapshot, previous: Snapshot[]): string[] {
    const s = snapshot.components, out = [
      `P0 release blockers: ${s.p0.length ? s.p0.join(', ') : 'none'}`,
      `Project health: ${this.headline(snapshot)}`,
      'Performance is outside this score and held by its own ratchets.',
      `Cold play: ${this.number(s.cold.value)}${s.cold.rounds.length ? '' : ' (no rounds; provisional zero)'}`,
      ...s.cold.rounds.map(r => `  ${r.date} ${r.kind}, ${r.rubric.id} v${r.rubric.version}, ${r.sha}, ${r.total}`),
      `  source: ${this.sources(snapshot, ['scripts/health/cold-play.ts',
        ...s.cold.rounds.map(r => `${ColdPlay.directory}/${r.date}-${r.kind}.json`)])}`,
      `Feature health: ${this.number(s.feature.value)}`,
      `  source: ${this.sources(snapshot, ['doc/architecture/feature-map.json', 'doc/architecture/features.json'])}`,
      `  request history: ${snapshot.historyReferences.grace}; pin-file hashes below`,
      '  Each aspect is the share of capabilities with all pins met among those asked for at least 7 days;',
      '  the six aspects are equally weighted. An aspect with no mature requests is 100 (nothing due).',
      '  Request age is established by its presence in the register at the seven-day cutoff;',
      '  pin states are as declared by the feature map, not a fresh test run.',
      ...s.feature.aspects.map(a => `  ${a.id} ${a.name}: ${this.number(a.value)} (${a.met}/${a.eligible})`),
      `P1 age cost: −${s.p1.cost}`,
      `  source: ${this.sources(snapshot, ['doc/architecture/open-register.md',
        'doc/architecture/register-kinds.json', 'doc/architecture/mission-22/planning.json'])}`,
      `  filing-day history: ${snapshot.historyReferences.yesterday}`,
      '  Dates come from the first date in the status; a row first filed today costs nothing, even if undated.',
      ...s.p1.defects.filter(d => d.cost || !d.date).map(d => `  ${d.id}: ${d.days === null ? 'undated' : `${d.days} days`}`
        + `, −${d.cost}${d.newToday ? ' (filed today)' : ''}`),
      `Zero-target ratchets: −${s.debt.cost} (recorded CI ratchets, except the live eligible slice P1 count)`,
      `  sources: ${this.sources(snapshot, Object.keys(snapshot.sources).filter(path =>
        path.endsWith('-baseline.json') || path === 'scripts/health/zero-targets.json'
        || path === 'scripts/quality/baseline.json' || path === 'scripts/quantity/baseline.json'))}`,
      ...s.debt.ratchets.filter(r => r.count > 0).map(r => `  ${r.name}: ${r.count}`
        + (r.recorded === undefined ? '' : ` (CI P0/P1 baseline ${r.recorded}; excludes P0 and today's filings)`)),
      ...this.moves(s.moves), ...this.trend(previous, snapshot), 'Source blob SHAs:',
      ...Object.entries(snapshot.sources).map(([path, sha]) => `  ${path}: ${sha}`),
      `  measured checkout: ${snapshot.sha}`,
    ];
    return out;
  }
  static run(record = true): string[] {
    const previous = this.history(), date = new Date().toISOString().slice(0, 10), snapshot = HealthRead.snapshot(date);
    const lines = this.render(snapshot, previous);
    if (record) { appendFileSync(join(HealthRead.root, HealthRead.history), `${JSON.stringify(snapshot)}\n`); }
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Project health\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n`);
    }
    return lines;
  }
}
