import { ColdPlay, type ColdRound } from './cold-play';

export interface Capability {
  id: string;
  title: string;
  due: boolean;
  met: boolean;
}
export interface AspectInput { id: string; name: string; capabilities: Capability[] }
export interface DefectInput { id: string; status: string; existedYesterday: boolean }
export interface Ratchet { id: string; name: string; why: string; count: number; recorded?: number }
export interface HealthInput {
  date: string;
  rounds: ColdRound[];
  aspects: AspectInput[];
  p0: string[];
  p1: DefectInput[];
  ratchets: Ratchet[];
}
export interface Age { id: string; date: string | null; days: number | null; cost: number; newToday: boolean }
export interface AspectScore {
  id: string; name: string; value: number; eligible: number; met: number; missing: Capability[];
}
export interface Move { text: string; points: number; net: number; effort: number }
export interface HealthScore {
  verified: boolean;
  headline: number;
  cold: { value: number; rounds: ColdRound[] };
  feature: { value: number; aspects: AspectScore[] };
  p0: string[];
  p1: { cost: number; defects: Age[] };
  debt: { cost: number; ratchets: Ratchet[] };
  moves: Move[];
}

export class HealthScoreModel {
  static readonly months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  static clamp(n: number): number { return Math.max(0, Math.min(100, n)); }
  static age(today: string, date: string): number {
    return (ColdPlay.date(today) - ColdPlay.date(date)) / ColdPlay.day;
  }
  static calendar(day: string, month: string, year: string | undefined, today: string): string {
    const m = String(this.months.indexOf(month.toLowerCase().slice(0, 3)) + 1).padStart(2, '0');
    const suffix = `${m}-${day.padStart(2, '0')}`;
    const inferred = Number(today.slice(0, 4)) - (suffix > today.slice(5) ? 1 : 0);
    return `${year ?? inferred}-${suffix}`;
  }
  static statusDate(status: string, today: string): string | null {
    const lead = status.replaceAll('*', '').split(':')[0]!.slice(0, 120);
    const dates: { date: string; index: number }[] = [];
    for (const match of lead.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)) {
      dates.push({ date: match[1]!, index: match.index });
    }
    const dated = /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:[a-z]*)\.?(?:\s+(\d{4}))?\b/gi;
    for (const match of lead.matchAll(dated)) {
      dates.push({ date: this.calendar(match[1]!, match[2]!, match[3], today), index: match.index });
    }
    const reversed = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/gi;
    for (const match of lead.matchAll(reversed)) {
      dates.push({ date: this.calendar(match[2]!, match[1]!, match[3], today), index: match.index });
    }
    return dates.filter(d => Number.isFinite(ColdPlay.date(d.date)) && d.date <= today)
      .sort((a, b) => a.index - b.index)[0]?.date ?? null;
  }
  static defect(input: DefectInput, today: string): Age {
    const date = this.statusDate(input.status, today), days = date ? this.age(today, date) : null;
    const cost = !input.existedYesterday ? 0 : days === null ? 1
      : days < 7 ? 0 : Math.min(3, 1 + Math.floor((days - 7) / 14));
    return { id: input.id, date, days, cost, newToday: !input.existedYesterday };
  }
  static aspect(input: AspectInput): AspectScore {
    const due = input.capabilities.filter(c => c.due), met = due.filter(c => c.met);
    return { id: input.id, name: input.name, value: due.length ? 100 * met.length / due.length : 100,
      eligible: due.length, met: met.length, missing: due.filter(c => !c.met) };
  }
  static compute(input: HealthInput): HealthScore {
    if (input.aspects.length !== 6) { throw new Error('Health requires six aspects'); }
    const rounds = ColdPlay.qualifying(input.rounds, input.date);
    const cold = rounds.length ? rounds.reduce((sum, r) => sum + r.total, 0) / rounds.length : 0;
    const aspects = input.aspects.map(a => this.aspect(a));
    const feature = aspects.reduce((sum, a) => sum + a.value, 0) / aspects.length;
    const defects = input.p1.map(d => this.defect(d, input.date)), cost = defects.reduce((n, d) => n + d.cost, 0);
    const ratchets = input.ratchets.map(r => r.id === 'slice'
      ? { ...r, recorded: r.count, count: input.p1.filter(d => d.existedYesterday).length } : r);
    const debt = 2 * ratchets.filter(r => r.count > 0).length;
    const raw = cold / 2 + feature / 2 - cost - debt, headline = this.clamp(raw);
    const result: HealthScore = { verified: rounds.length === 3, headline,
      cold: { value: cold, rounds }, feature: { value: feature, aspects }, p0: input.p0,
      p1: { cost, defects }, debt: { cost: debt, ratchets }, moves: [] };
    result.moves = this.moves(result, raw);
    return result;
  }
  static move(text: string, points: number, effort: number, basis: { raw: number; headline: number }): Move {
    return { text, points, effort, net: this.clamp(basis.raw + points) - basis.headline };
  }
  static moves(score: HealthScore, raw: number): Move[] {
    const moves: Move[] = [], basis = { raw, headline: score.headline };
    if (!score.verified) {
      const rounds = score.cold.rounds;
      const potential = (rounds.reduce((sum, r) => sum + r.total, 0) + 100) / (rounds.length + 1);
      moves.push(this.move('Cold play is stale: run a round (up to)',
        Math.max(0, (potential - score.cold.value) / 2), 1, basis));
    }
    for (const r of score.debt.ratchets.filter(r => r.count > 0)) {
      moves.push(this.move(`${r.name}: ${r.count} away from zero`, 2, r.count, basis));
    }
    for (const d of score.p1.defects.filter(d => d.cost > 0)) {
      moves.push(this.move(`${d.id}, P1, ${d.days === null ? 'undated' : `${d.days} days open`}`, d.cost, 1, basis));
    }
    for (const a of score.feature.aspects) {
      for (const c of a.missing) {
        moves.push(this.move(`Aspect ${a.id}: ${c.title} lacks met pins`, 50 / 6 / a.eligible, 1, basis));
      }
    }
    return moves.sort((a, b) => a.effort - b.effort || b.points - a.points || a.text.localeCompare(b.text)).slice(0, 5);
  }
}
