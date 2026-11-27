import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';

export interface ColdRound {
  date: string;
  sha: string;
  kind: string;
  session: string;
  rubric: { id: string; version: string };
  criteria: Record<string, { score: number; max: number }>;
  total: number;
  evidence: string[];
}

export class ColdPlay {
  static readonly directory = 'doc/cold-play/rounds';
  static readonly day = 86_400_000;
  static readonly criteria = ['beginning', 'agency', 'trust', 'discovery', 'continuation'];

  static date(value: string): number {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) { return NaN; }
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
  }

  static validate(round: ColdRound, file: string, root: string): void {
    const name = `${round.date}-${round.kind}.json`;
    const scores = Object.values(round.criteria ?? {});
    if (file !== name || !Number.isFinite(this.date(round.date)) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(round.kind)
      || !/^[a-f0-9]{40}$/.test(round.sha) || !round.session?.trim()
      || !round.rubric?.id?.trim() || !round.rubric?.version?.trim() || !scores.length
      || scores.some(s => !Number.isFinite(s.score) || !Number.isFinite(s.max)
        || s.max <= 0 || s.score < 0 || s.score > s.max)) {
      throw new Error(`Invalid cold-play round: ${file}`);
    }
    if (round.rubric.id !== 'first-hour' || round.rubric.version !== '1'
      || Object.keys(round.criteria).length !== this.criteria.length
      || this.criteria.some(key => !round.criteria[key] || round.criteria[key]!.max !== 4
        || !Number.isInteger(round.criteria[key]!.score))) {
      throw new Error(`Unknown rubric or invalid criteria in cold-play round: ${file}`);
    }
    const total = 100 * scores.reduce((sum, s) => sum + s.score, 0) / scores.reduce((sum, s) => sum + s.max, 0);
    if (!Number.isFinite(round.total) || Math.abs(round.total - total) > 0.01 || !round.evidence?.length
      || round.evidence.some(p => isAbsolute(p) || relative(root, resolve(root, p)).startsWith('..')
        || !existsSync(resolve(root, p)) || !statSync(resolve(root, p)).isFile())) {
      throw new Error(`Invalid total or missing evidence in cold-play round: ${file}`);
    }
  }

  static read(root: string): ColdRound[] {
    const dir = join(root, this.directory);
    if (!existsSync(dir)) { return []; }
    const sessions = new Set<string>();
    return readdirSync(dir).filter(f => f.endsWith('.json')).sort().map(file => {
      const round = JSON.parse(readFileSync(join(dir, file), 'utf8')) as ColdRound;
      this.validate(round, file, root);
      if (sessions.has(round.session)) { throw new Error(`Duplicate cold-play session: ${round.session}`); }
      sessions.add(round.session);
      return round;
    });
  }

  static qualifying(rounds: ColdRound[], today: string): ColdRound[] {
    const now = this.date(today);
    if (!Number.isFinite(now)) { throw new Error(`Invalid date: ${today}`); }
    return rounds.filter(r => {
      const age = (now - this.date(r.date)) / this.day;
      return age >= 0 && age <= 21;
    }).sort((a, b) => b.date.localeCompare(a.date) || a.session.localeCompare(b.session)).slice(0, 3);
  }

  static ready(rounds: ColdRound[]): boolean { return rounds.length === 3; }
}
