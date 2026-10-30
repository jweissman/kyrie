import type { Moment } from '../src/model';
import type { Danger } from '../src/presentation/danger-sense';
import type { Country } from './novice-country';
import type { Tally } from './novice-fights';
import type { Meeting } from './novice-meeting';

// One band met by one company in one world, and what came of it both ways: the page's reckoning before a fight it is
// given a turn to choose (danger), and for one that comes at once, what the page says in the moment (said).
export interface Row {
  seed: string; calling: string; company: string; band: string; trouble: string; scopes: string[];
  meeting: Meeting; moment?: Moment; signed?: boolean; danger: Danger; said?: Danger; stand: Tally; careful: Tally;
}
// A calling and company over a scope's bands: how many came at the company at once (and of them from hiding), how
// many warned it first, the share of all the bands that gave it no turn (unwarned), and how many of those the page in
// the moment called beyond the company though it wins three in five standing (misread); the median and the spread of
// the countries' medians of the win standing (PT-11's measure); the careful company's outcomes over its trials.
export interface Line {
  calling: string; company: string; scope: string; bands: number; atOnce: number; sprung: number; warns: number;
  unwarned: number; misread: number; stand: number; standDied: number;
  spread: [number, number]; won: number; declined: number; escaped: number; died: number; taken: number;
  undecided: number; fell: number; tried: number; flight: number; attempts: number;
}
// title: what the run measures ("the baseline", "after the repairs"), for the page's heading.
export interface Spec {
  seeds: string[]; origin: string; callings: string[]; trials: number; maxTurns: number; title?: string;
}

// The summary and its page: the baseline W2 of Mission 18's audit is measured against.
export class NoviceReport {
  static readonly beyond: readonly Danger[] = ['grave', 'deadly'];
  static readonly scopes: Record<string, string> = { first: 'The first ruin',
    near: 'The way into the first ruin (its three nearest bands)',
    placed: 'The placed troubles (dens, raiders, tolls and the rest)',
    country: 'The whole first country (every band out of town)', big: 'The big ruin (PT-11)' };
  static median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
    return !s.length ? 0 : s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
  }
  static summary(rows: Row[], spec: Spec): Line[] {
    const lines: Line[] = [];
    for (const scope of Object.keys(this.scopes)) {
      for (const calling of spec.callings) {
        for (const company of ['alone', 'hired']) {
          const those = rows.filter(r => r.calling === calling && r.company === company && r.scopes.includes(scope));
          if (those.length) { lines.push(this.line(those, { calling, company, scope }, spec)); }
        }
      }
    }
    return lines;
  }
  private static line(rows: Row[], key: { calling: string; company: string; scope: string }, spec: Spec): Line {
    const trials = this.sum(rows, 'trials') || 1, tried = this.sum(rows, 'tried');
    const medians = spec.seeds.map(s => rows.filter(r => r.seed === s)).filter(rs => rs.length)
      .map(rs => this.median(rs.map(r => this.win(r))));
    return { ...key, bands: rows.length,
      ...this.met(rows),
      stand: this.round(this.median(rows.map(r => this.win(r)))), standDied: this.died(rows),
      spread: [this.round(Math.min(...medians)), this.round(Math.max(...medians))],
      won: this.share(rows, 'won', trials), declined: this.share(rows, 'declined', trials),
      escaped: this.share(rows, 'escaped', trials), died: this.share(rows, 'died', trials),
      taken: this.share(rows, 'taken', trials), undecided: this.share(rows, 'undecided', trials),
      fell: this.share(rows, 'fell', trials), tried, flight: this.round(this.sum(rows, 'escaped') / (tried || 1)),
      attempts: this.round(this.sum(rows, 'away') / (this.sum(rows, 'attempts') || 1)) };
  }
  private static met(rows: Row[]): Pick<Line, 'atOnce' | 'sprung' | 'warns' | 'unwarned' | 'misread'> {
    const atOnce = rows.filter(r => r.meeting === 'at once').length;
    const warns = rows.filter(r => r.meeting === 'warns').length;
    const misread = rows.filter(r => r.said && NoviceReport.beyond.includes(r.said) && this.win(r) >= 0.6).length;
    return { atOnce, sprung: rows.filter(r => r.moment === 'sprung').length, warns,
      unwarned: this.round(atOnce / (rows.length || 1)), misread };
  }
  private static share(rows: Row[], k: keyof Tally, trials: number): number {
    return this.round(this.sum(rows, k) / trials);
  }
  private static sum(rows: Row[], k: keyof Tally): number { return rows.reduce((n, r) => n + r.careful[k], 0); }
  private static win(r: Row): number { return r.stand.won / (r.stand.trials || 1); }
  // Of the fights stood to the end, the share that killed the company.
  private static died(rows: Row[]): number {
    return this.round(rows.reduce((n, r) => n + r.stand.died, 0) / (rows.reduce((n, r) => n + r.stand.trials, 0) || 1));
  }
  private static round(x: number): number { return Math.round(x * 1000) / 1000; }
  static pct(x: number): string { return `${Math.round(x * 100)}%`; }
  static page(spec: Spec, worlds: Country[], rows: Row[], lines: Line[]): string {
    const out = [`# Novice viability: ${spec.title ?? 'the baseline'}`, '',
      `Every calling the creation offers (${spec.callings.join(', ')}), at level 1, alone and with the first town's hire,`
      + ` in ${spec.seeds.length} generated countries (${spec.seeds.join(', ')}; origin ${spec.origin}), against every`
      + ` band of the first country out of town, ${spec.trials} fights a band each way (both sides by the game's own`
      + ' tactics, at full health, from the moment it is met). Made by `bun scripts/novice-viability.ts`; deterministic'
      + ' by seed.', '',
      '- **Unwarned**: of the bands, the share that come at the company the moment it arrives, with no turn to back'
      + ' away; how many (and how many of them spring from hiding: the rest are seen as they move, and the company acts'
      + ' first); and how many warn first. The rest hold off on arrival (they let the company be, demand, or wait to be'
      + ' set on). **Misread**: of those that come at once, how many the page in the moment calls grave or deadly'
      + ' though the company wins at least three in five standing.',
      '- **Stand**: fought to the end, the share of the fights that killed the company, and the median, over bands,'
      + ' of the share won (PT-11\'s measure), with the spread of the countries\' medians.',
      '- **Careful**: a novice that, given a turn (a warning, or the sign one lying in wait gives a company next door,'
      + ' where the rules give it one), takes on no fight the page reckons grave or deadly, and runs when'
      + ' the one who plays is at half their hit points, or at once from a fight that came at it reckoned grave or'
      + ' deadly: of its trials, won, declined, got away, died (or taken prisoner). **Flight**: of the fights it ran'
      + ' in, the share it got away from.',
      '- **Limits**: every fight starts at full health, one band at a time (no attrition, no rest); nothing carried to'
      + ' use up is used (the game\'s own turns leave that to the player: Battle.plain); the meeting is read from the'
      + ' rules of the watch the company arrives in, not from what other actors decide in it.', ''];
    for (const scope of ['first', 'near', 'placed', 'country', 'big']) {
      out.push(`## ${this.scopes[scope]}`, '', ...this.table(lines.filter(l => l.scope === scope)), '');
    }
    out.push('## By trouble, alone (standing: median win / died)', '', ...this.troubles(rows, spec), '');
    out.push('## The countries', '', ...this.worlds(worlds, rows), '');
    return out.join('\n');
  }
  private static table(lines: Line[]): string[] {
    const rows = lines.map(l => `| ${l.calling} | ${l.company} | ${l.bands} `
      + `| ${this.pct(l.unwarned)}: ${l.atOnce}${l.sprung ? ` (${l.sprung} sprung)` : ''}, ${l.warns} warn `
      + `| ${l.misread} | ${this.pct(l.standDied)} `
      + `| ${l.stand.toFixed(2)} (${l.spread[0].toFixed(2)}–${l.spread[1].toFixed(2)}) | ${this.pct(l.won)} `
      + `| ${this.pct(l.declined)} | ${this.pct(l.escaped)} `
      + `| ${this.pct(l.died)}${l.taken ? ` (+${this.pct(l.taken)} taken)` : ''} `
      + `| ${this.pct(l.flight)} of ${l.tried} |`);
    return ['| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries)'
      + ' | Careful: won | declined | got away | died | Flight |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...rows];
  }
  private static troubles(rows: Row[], spec: Spec): string[] {
    const alone = rows.filter(r => r.company === 'alone'), names = [...new Set(alone.map(r => r.trouble))].sort();
    const lines = names.map(name => {
      const of = alone.filter(r => r.trouble === name);
      const cells = spec.callings.map(c => {
        const rs = of.filter(r => r.calling === c);
        return `${this.median(rs.map(r => this.win(r))).toFixed(2)} / ${this.pct(this.died(rs))}`;
      });
      const first = of.filter(r => r.calling === spec.callings[0]);
      const met = this.met(first);
      return `| ${name} | ${first.length} | ${met.atOnce}, ${met.warns} | ${cells.join(' | ')} |`;
    });
    return [`| Trouble | Bands | At once, warn (${spec.callings[0]}) | ${spec.callings.join(' | ')} |`,
      `|---|---:|---:|${spec.callings.map(() => '---:').join('|')}|`, ...lines];
  }
  private static worlds(worlds: Country[], rows: Row[]): string[] {
    const lines = worlds.map(w => {
      const first = w.sites.find(s => s.id === w.firstRuin), big = w.sites.find(s => s.id === w.bigRuin), hire = w.hire;
      const at = rows.filter(r => r.seed === w.seed && r.company === 'alone' && r.calling === rows[0]?.calling);
      const hours = first ? Math.round(first.minutes / 6) / 10 : 0;
      return `| ${w.seed} | ${first ? `${first.name}, ${hours} h, ${first.bands}` : '—'} `
        + `| ${big ? `${big.name}, ${big.bands}` : '—'} `
        + `| ${hire ? `${hire.name} (${hire.calling}), ${hire.fee} of ${hire.gold} coin` : '—'} `
        + `| ${w.bands.length} | ${at.filter(r => r.meeting === 'at once').length} |`;
    });
    return ['| Seed | First ruin (from the start, bands) | Big ruin (bands) | First hire (fee of the coin carried) | Bands'
      + ' | Unwarned |', '|---|---|---|---|---:|---:|', ...lines];
  }
}
