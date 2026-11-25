#!/usr/bin/env bun
// The performance map (the owner, 24 November: "a big report that generates a nice markdown of our performance
// measurements, distance from targets, anything else we can think of; synthesize our instruments and start to draw
// useful conclusions"). Gate one's first step too (doc/architecture/mission-22-beta/execution-plan.md: the command path
// rebaselined by stage and by class of command). One fresh world started and the warrior's golden walk played through
// the runner, as the quality gate plays it, every turn timed whole and by the stages it crossed (src/costs.ts); then
// the targets and how far each is, each class of turn by its spread, where a turn's time goes, what a new world's start
// costs by stage, and the conclusions drawn: what is furthest from its target, and the largest stage within it.
//   bun scripts/performance/map.ts [--write]    prints the map; --write puts it in doc/architecture/performance-map.md
// The browser's own numbers (an act settled, Play to act) are not read here: they are the browser specs' (named below).
import { execSync } from 'node:child_process';
import { loadavg } from 'node:os';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Costs, type Stage, type Tally } from '../../src/costs';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Quality } from '../quality/quality';
import { CampaignTick } from '../../src/campaign/campaign-tick';
import { AsMeant } from '../../test/support/as-meant';
import { GoldenWalk } from '../../test/support/golden-walk';

export type Kind = 'ordinary' | 'place' | 'talk' | 'fight' | 'journey';
export interface Turn { line: string; kind: Kind; ms: number; legs: number; stages: Tally }
interface Target { label: string; target: number; now: number | null; unit: string; note: string }

export class PerformanceMap {
  static readonly root = join(import.meta.dir, '../..');
  static readonly walk = join(this.root, 'doc/architecture/mission-22/golden/warrior-walk.txt');
  static readonly file = join(this.root, 'doc/architecture/performance-map.md');
  // The stages a turn is told by, those within another said beside it (a stage's time includes those within it).
  static readonly shown: [Stage, string][] = [['act', 'the act (its watches and rules within)'],
    ['rules', 'rules asked and fired (within the act)'], ['legal', 'what may be done, worked out'],
    ['screen', 'the screen built'], ['itinerary', 'ways set out (within the screen)'], ['leaf', 'what is told'],
    ['glance', 'the glance (within what is told)'], ['observe', 'what the company perceives'],
    ['resolve', 'the command resolved, the aims held read'], ['expand', 'the country beyond drawn'],
    ['tell', 'what the company is told of it'], ['aims', 'undertakings settled and resumed'],
    ['digest', 'the step\'s digest']];
  // The stages a turn's time is made of at the top: the rest of its time is told as unattributed.
  static readonly top: Stage[] = ['act', 'legal', 'screen', 'leaf', 'resolve', 'expand', 'tell', 'aims', 'digest'];
  // A turn's kind, by the act its line asks for (the walk's lines are the runner's own: {"act": id}) and its legs.
  static kind(line: string, legs: number): Kind {
    const act = /"act":\s*"([^"]*)"/.exec(line)?.[1] ?? '';
    if (legs > 1 || act.startsWith('travel:')) { return 'journey'; }
    if (/:Attack\b|^fight:/.test(act)) { return 'fight'; }
    if (/#talk$|^talk:/.test(act)) { return 'talk'; }
    if (/^exit:|^go\(/.test(act)) { return 'place'; }
    return 'ordinary';
  }
  // A new world started and the walk played: the start's stages, and every turn's.
  static async play(): Promise<{ start: { ms: number; stages: Tally }; turns: Turn[] }> {
    const lines = readFileSync(this.walk, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const mark = Costs.mark(), t0 = performance.now();
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const start = { ms: performance.now() - t0, stages: Costs.since(mark) };
    // The engine's act and what may be done after it, timed apart, as the quality gate times them.
    Quality.timing(journey.session.campaign);
    this.rules();
    const r = new Runner(journey.session), turns: Turn[] = [];
    for (const line of lines) {
      const at = Costs.mark(), t = performance.now();
      await AsMeant.ask(r, line);
      const ms = performance.now() - t, stages = Costs.since(at), legs = stages.act?.n ?? 0;
      turns.push({ line, kind: this.kind(line, legs), ms, legs, stages });
    }
    return { start, turns };
  }
  // Each watch's rules timed as 'rules', from here, so that the runtime imports nothing to be measured (as the quality
  // gate times the act): CampaignTick.rules wrapped once.
  private static original?: typeof CampaignTick.rules;
  static rules(): void {
    if (this.original) { return; }
    this.original = CampaignTick.rules.bind(CampaignTick);
    CampaignTick.rules = this.timedRules.bind(this);
  }
  private static timedRules(...a: Parameters<typeof CampaignTick.rules>): void {
    Costs.time('rules', () => this.original!(...a));
  }
  static at(xs: number[], q: number): number {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))]! : NaN;
  }
  static ms(x: number): string { return Number.isFinite(x) ? x < 10 ? x.toFixed(1) : String(Math.round(x)) : '—'; }
  static targets(start: number, turns: Turn[]): Target[] {
    const decisions = turns.filter(t => t.legs === 1).map(t => (t.stages.act?.ms ?? 0) + (t.stages.legal?.ms ?? 0));
    const legs = turns.filter(t => t.legs > 1).map(t => (t.stages.act?.ms ?? 0) / t.legs);
    const plain = turns.filter(t => t.kind !== 'journey').map(t => t.ms);
    return [
      { label: 'A decision (the act and what may be done after it), median', target: 15, now: this.at(decisions, 0.5),
        unit: 'ms', note: `BRIEF §4; ${decisions.length} acts` },
      { label: 'A turn that is no journey, median', target: 30, now: this.at(plain, 0.5), unit: 'ms',
        note: `BRIEF §4; ${plain.length} turns, p95 ${this.ms(this.at(plain, 0.95))}` },
      { label: 'A journey leg, median', target: 5, now: this.at(legs, 0.5), unit: 'ms',
        note: `BRIEF §4 (AX-05, AX-10); ${legs.length} journeys` },
      { label: 'A new world started, headless', target: 3000, now: start, unit: 'ms',
        note: 'OR-144 asks 3 s on the deployed page; this is the engine\'s share' },
    ];
  }
  static table(rows: string[][]): string[] {
    return [`| ${rows[0]!.join(' | ')} |`, `|${rows[0]!.map(() => '---').join('|')}|`,
      ...rows.slice(1).map(r => `| ${r.join(' | ')} |`)];
  }
  static report(start: { ms: number; stages: Tally }, turns: Turn[]): string[] {
    const targets = this.targets(start.ms, turns), sha = this.sha();
    const out = ['# The performance map', '',
      `Generated by \`bun scripts/performance/map.ts --write\` on ${new Date().toISOString().slice(0, 10)} at ${sha}, `
      + `load average ${loadavg()[0]!.toFixed(1)} (a busy machine reads slower: compare maps made alike). One fresh world, `
      + `the warrior's golden walk (${turns.length} turns) through the runner, as the quality gate plays it.`, '',
      '## Targets', '', ...this.table([['Measure', 'Target', 'Now', 'Times the target', 'Note'],
        ...targets.map(t => [t.label, `${t.target} ${t.unit}`, `${this.ms(t.now ?? NaN)} ${t.unit}`,
          t.now === null ? '—' : `**${(t.now / t.target).toFixed(1)}×**`, t.note])]), '',
      'Not read here: an act settled in the browser (under 300 ms p95, OR-145: test/input-answered-browser) and Play to '
      + 'the first act (1.5 s, OR-23: test/play-first-act-browser), the browser specs\' own measures.', '',
      ...this.classes(turns), ...this.where(turns), ...this.started(start), ...this.conclusions(targets, turns)];
    return out;
  }
  static classes(turns: Turn[]): string[] {
    const kinds: Kind[] = ['ordinary', 'place', 'talk', 'fight', 'journey'];
    const rows = kinds.map(k => {
      const ms = turns.filter(t => t.kind === k).map(t => t.ms);
      return [k, String(ms.length), ...[0.5, 0.9, 0.95].map(q => this.ms(this.at(ms, q))),
        this.ms(ms.length ? Math.max(...ms) : NaN)];
    }).filter(r => r[1] !== '0');
    return ['## Turns by kind (ms)', '', ...this.table([['Kind', 'Turns', 'p50', 'p90', 'p95', 'Worst'], ...rows]), ''];
  }
  // Each stage's median per turn that crossed it, by kind of turn; and what no stage tells.
  static where(turns: Turn[]): string[] {
    const kinds = [...new Set(turns.map(t => t.kind))];
    const rows = this.shown.map(([s, label]) => [label, ...kinds.map(k => {
      const ms = turns.filter(t => t.kind === k && t.stages[s]).map(t => t.stages[s]!.ms);
      return ms.length ? this.ms(this.at(ms, 0.5)) : '—';
    })]);
    const un = kinds.map(k => this.ms(this.at(turns.filter(t => t.kind === k).map(t => this.unattributed(t)), 0.5)));
    return ['## Where a turn goes (median ms of the turns that crossed each stage)', '',
      ...this.table([['Stage', ...kinds], ...rows, ['unattributed (the runner, the session, what no stage tells)', ...un]]),
      ''];
  }
  static unattributed(t: Turn): number { return t.ms - this.top.reduce((a, s) => a + (t.stages[s]?.ms ?? 0), 0); }
  static started(start: { ms: number; stages: Tally }): string[] {
    const rows = Object.entries(start.stages).sort((a, b) => b[1]!.ms - a[1]!.ms).slice(0, 12)
      .map(([s, c]) => [s, String(c!.n), this.ms(c!.ms), c!.bytes ? `${Math.round(c!.bytes / 1024)} KB` : '']);
    const parsed = start.stages.parse?.n ?? 0, kept = start.stages['parse kept']?.n ?? 0;
    return [`## A new world's start, by stage (${this.ms(start.ms)} ms in all; a stage includes those within it)`, '',
      `The parse store ${parsed > 80 ? 'was cold' : 'was warm'}: ${parsed} texts parsed, ${kept} kept. The golden walk's `
      + 'world is one seed, so a warm store keeps even its country; a new seed parses its own country afresh (about 60 '
      + 'texts, start-cost-spike.md), and a cold store the shared rules too.', '',
      ...this.table([['Stage', 'Times', 'ms', 'Read'], ...rows]), ''];
  }
  // What follows from the readings: each target's distance, the furthest first, and within the turns furthest from
  // theirs, the largest stage and what no stage tells.
  static conclusions(targets: Target[], turns: Turn[]): string[] {
    const far = [...targets].filter(t => t.now !== null && t.now > t.target)
      .sort((a, b) => b.now! / b.target - a.now! / a.target);
    const lines = ['## Conclusions', ''];
    for (const t of far) { lines.push(`- ${t.label}: ${(t.now! / t.target).toFixed(1)}× its target.`); }
    const legs = turns.filter(t => t.kind === 'journey'), plain = turns.filter(t => t.kind !== 'journey');
    for (const [name, set] of [['A journey', legs], ['A turn that is no journey', plain]] as const) {
      if (!set.length) { continue; }
      const total = set.reduce((a, t) => a + t.ms, 0);
      const parts = [...this.top, 'rules' as Stage].map(s => [s, this.share(set, s) / total] as const)
        .sort((a, b) => b[1] - a[1]);
      const un = set.reduce((a, t) => a + this.unattributed(t), 0) / total;
      lines.push(`- ${name}'s time: ${parts.map(([s, x]) => `${s} ${Math.round(x * 100)}%`).join(', ')}; `
        + `unattributed ${Math.round(un * 100)}%.${un > 0.2 ? ' A fifth or more unattributed: a stage is missing there.' : ''}`);
    }
    lines.push('', '(The act includes its rules: their share is the act\'s part that AX-10 would index. A fight\'s act '
      + 'waits on its controller and may close in a later turn than it began, so its turns read short.)');
    return lines;
  }
  static share(set: readonly Turn[], s: Stage): number { return set.reduce((a, t) => a + (t.stages[s]?.ms ?? 0), 0); }
  static sha(): string {
    try { return execSync('git rev-parse --short HEAD', { cwd: this.root }).toString().trim(); } catch { return '—'; }
  }
  static async main(args: string[]): Promise<number> {
    const { start, turns } = await this.play();
    const text = `${this.report(start, turns).join('\n')}\n`;
    if (args.includes('--write')) { writeFileSync(this.file, text); console.log(`written: ${this.file}`); }
    else { console.log(text); }
    return 0;
  }
}

if (import.meta.main) { process.exit(await PerformanceMap.main(process.argv.slice(2))); }
