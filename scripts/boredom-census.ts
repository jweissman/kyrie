#!/usr/bin/env bun
// The boredom census (the owner, 17 November evening: "treat boredom as a first-class defect"; mission-22/
// boredom-brief.md). The first hour of a generated country walked by unguided players of the autoplay laboratory, and
// what each act gave: a line not met before, a change to the company or what it acted on, a thing learned, a new
// thing the company can do. Read per region, against what was placed there:
//   repetition  acts whose every line was met before, word for word or but for its names, and that taught nothing
//   depth       places where looking, listening or searching gave nothing beneath the arrival
//   wonder      wonders placed in the country, met by an unguided player, and how far into the hour
//   capability  verbs first offered (topics aside), of the shared rules or of a module's own, by source
//   dead time   acts that changed nothing of note and told nothing new, and the minutes they took
// A measure, not a gate; numbers to read later reports against (doc/architecture/mission-22/boredom-census.md).
//   bun scripts/boredom-census.ts [--seeds a1,kite,thorn,b2,ember] [--policies wander,investigate,expedition,mixed]
//     [--steps 60] [--json out.json]
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type PolicyName } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { PlayerView } from '../src/presentation/player-view';
import { VisitedPlaces } from '../src/presentation/visited-places';
import { WorldAssembler } from '../src/world/world-assembler';
import type { PlaySession } from '../src/session/play-session';
import type { CampaignEvent } from '../src/campaign/campaign';

export interface Act {
  step: number; command: string; kind: string; place: string; minute: number; took: number;
  lines: string[]; fresh: string[]; changes: string[]; learned: string[]; dead: boolean; repeat: boolean;
}
export interface Run {
  seed: string; policy: string; terrain: string; acts: Act[]; minutes: number;
  wonders: { id: string; name: string; place: string; met?: number; seen?: number; heard?: number }[];
  places: { id: string; name: string; looks: number; found: number }[];
  verbs: { verb: string; step: number; minute: number; source: string; places: number }[];
}
interface Walk {
  s: PlaySession; start: number; met: Set<string>; shapes: Set<string>; names?: RegExp; acts: Act[];
  verbs: Map<string, Run['verbs'][number]>; at: Map<string, Set<string>>;
}

export class BoredomCensus {
  // What a player would not count as a change: where the company stands, the clock and its dice, who has addressed
  // whom, the engine's own marks of having been, lingered, tried or searched (what a search finds is counted apart).
  static readonly kept = new Set(['at', 'stoodAt', 'visitedNow', 'visitedBefore', 'tookWay', 'arrivedAt', 'acquainted',
    'addressed', 'dice', 'hour', 'untilDark', 'untilShow', 'untilLight', 'untilMorning', 'watch', 'been', 'seen',
    'awake', 'lastAte', 'lastSlept', 'greeted', 'noticed', 'looked', 'answered', 'asked', 'lingered', 'tried',
    'searched', 'tolerates', 'wary']);
  static readonly looks = /^(\w+__)?(examine|read|look|listen|prod|search|study|inspect|watch|feel|smell)\w*\(?/;
  static option(argv: string[], flag: string, fallback: string): string {
    const at = argv.indexOf(flag);
    return at < 0 ? fallback : argv[at + 1] ?? fallback;
  }
  static async main(argv: string[]): Promise<number> {
    const seeds = this.option(argv, '--seeds', 'a1,kite,thorn,b2,ember').split(',');
    const policies = this.option(argv, '--policies', 'wander,investigate,expedition,mixed').split(',') as PolicyName[];
    const steps = Number(this.option(argv, '--steps', '60')), json = this.option(argv, '--json', '');
    const runs: Run[] = [];
    for (const seed of seeds) {
      for (const policy of policies) {
        const run = await this.walk(seed, policy, steps)
          .catch((e: Error) => { console.error(`${seed} ${policy}: ${e.message}`); });
        if (run) { runs.push(run); console.error(`${seed} ${policy}: ${run.acts.length} acts, ${run.minutes} min`); }
      }
    }
    if (json) { await Bun.write(json, JSON.stringify(runs, null, 1)); }
    console.log([this.table(runs, seeds), '', ...this.evidence(runs)].join('\n'));
    return 0;
  }
  // One walk: the lab's player of one temper, on the protagonist every walk shares, each act read as it comes.
  static async walk(seed: string, policy: PolicyName, steps: number): Promise<Run> {
    const spec = { seed, origin: 'wanderer', policy, steps,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' } };
    const metrics = AutoplayRun.empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
    const player = new AutoPlayer(policy, new Draw(`${seed}:wanderer:${policy}`));
    const w: Walk = { s, start: this.minutes(s), met: new Set(), shapes: new Set(), acts: [], verbs: new Map(),
      at: new Map() };
    const wonders = this.wonders(s);
    for (let step = 0; step < steps && c.running; step++) {
      this.offer(w, step);
      const move = player.next(AutoplayRun.situation(s, step, AutoPlayer.paged.includes(policy),
        AutoPlayer.prefers[policy]));
      if (!move) { break; }
      const before = c.history.length, from = this.minutes(s), here = this.here(s);
      try { await AutoplayRun.apply(s, move, player, metrics); } catch { break; }
      const events = c.history.slice(before), command = move.kind === 'travel' ? `travel(${move.to})` : move.id;
      w.acts.push(this.act(w, events, { step, command, place: here, minute: from - w.start,
        took: this.minutes(s) - from }));
      for (const x of wonders) {
        if (x.met === undefined && events.some(e => e.action.includes(x.id))) { x.met = from - w.start; }
        if (x.seen === undefined && this.here(s) === x.place) { x.seen = this.minutes(s) - w.start; }
        const known = c.world.related('knows', c.playerActor!);
        if (x.heard === undefined && known.some(r => r.args[1] === `${x.id}_heard`)) {
          x.heard = this.minutes(s) - w.start;
        }
      }
    }
    for (const v of w.verbs.values()) { v.places = w.at.get(v.verb)?.size ?? 0; }
    return { seed, policy, terrain: WorldAssembler.region(seed, [0, 0]).terrain, acts: w.acts,
      minutes: this.minutes(s) - w.start, wonders, places: this.places(s, w.acts), verbs: [...w.verbs.values()] };
  }
  // The verbs offered where the company stands: each first one kept with what the act before it gave.
  private static offer(w: Walk, step: number) {
    const here = this.here(w.s), last = w.acts.at(-1);
    // A topic is something to say, not a thing the company can do; a module's own act is marked (`own:` its verb).
    for (const verb of new Set(PlayerView.choices(w.s.campaign).filter(x => !x.action.topic)
      .map(x => x.choice.id.split('(')[0]!.replace(/^[\w-]+__(.*)$/, 'module:$1')))) {
      (w.at.get(verb) ?? w.at.set(verb, new Set()).get(verb)!).add(here);
      if (w.verbs.has(verb)) { continue; }
      w.verbs.set(verb, { verb, step, minute: this.minutes(w.s) - w.start,
        source: last ? this.source(last) : 'start', places: 0 });
    }
  }
  static act(w: Walk, events: CampaignEvent[], at: Pick<Act, 'step' | 'command' | 'place' | 'minute' | 'took'>): Act {
    const told = events.flatMap(e => [e.response ?? '', ...(e.perceptions ?? []).filter(p => p.kind !== 'observation')
      .map(p => p.text), ...(e.voiced ?? []).map(v => v.text)]).map(l => l.trim()).filter(Boolean);
    const scene = events.flatMap(e => (e.perceptions ?? []).filter(p => p.kind === 'observation').map(p => p.text));
    const lines = [...new Set([...told, ...scene].map(l => l.trim()).filter(Boolean))];
    const fresh = lines.filter(l => !w.met.has(l)), shapes = told.map(l => this.shape(w, l));
    const known = shapes.length > 0 && shapes.every(x => w.shapes.has(x));
    for (const l of lines) { w.met.add(l); }
    for (const x of shapes) { w.shapes.add(x); }
    const c = w.s.campaign, own = new Set([c.playerActor!, ...c.readout.partyIds,
      ...at.command.replace(/^[\w-]+\(|\)$/g, '').split(',').map(x => x.trim())]);
    // Changes to the company, its members, or what it acted on, but its standing and the clock's.
    const changes = events.flatMap(e => e.changes).filter(ch => {
      const m = /^[+-] (?:[\w-]+__)?(\w+)\(([^)]*)\)/.exec(ch);
      return !!m && !this.kept.has(m[1]!) && m[2]!.split(',').some(a => own.has(a.trim()));
    });
    const learned = changes.filter(ch => /^\+ knows\(/.test(ch));
    const kind = this.looks.test(at.command) ? 'look' : AutoPlayer.kind(at.command);
    const gained = changes.some(ch => /^\+ (quantity|owns|ownedItem|carries)\(/.test(ch));
    return { ...at, kind, lines, fresh, changes, learned, dead: !fresh.length && !changes.length,
      repeat: known && !learned.length && !gained };
  }
  // A line but for the names in it (a search of the Clink yard and of the big top are the same search).
  private static shape(w: Walk, line: string): string {
    w.names ??= new RegExp(`\\b(${[...new Set(w.s.campaign.module.entities.map(e => e.name ?? '')
      .filter(n => n.length > 3).map(n => n.replace(/^(the|a|an) /i, '')))].sort((a, b) => b.length - a.length)
      .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    return line.replace(w.names, '~').replace(/\d+/g, '#');
  }
  // What a new verb came by: what the act before it gave.
  static source(last: Act): string {
    const said = last.changes.join('\n');
    if (/^\+ (\w+__)?(level|knowsSpell|learned|proficient|skill|trained|lesson|taught)/m.test(said)) {
      return 'lesson';
    }
    if (/^\+ (\w+__)?(memberOf|travelsWith|joined|hired)\(/m.test(said)) { return 'companion'; }
    if (/^\+ (\w+__)?(carries|owns|ownedItem|holds|equipped|wields|capable)\(/m.test(said)) { return 'tool'; }
    if (last.kind === 'go' || last.command.startsWith('travel(')) { return 'place'; }
    return last.learned.length ? 'knowledge' : 'other';
  }
  static here(s: PlaySession): string { return s.campaign.world.one('at', s.campaign.playerActor ?? 'party') ?? ''; }
  static minutes(s: PlaySession): number { return s.campaign.readout.elapsed * 10 + (s.campaign.readout.minutes ?? 0); }
  // The generated wonders of the country (`wonder_…` things: see RegionMarvels), and the place each stands in.
  static wonders(s: PlaySession): Run['wonders'] {
    const w = s.campaign.world;
    return s.campaign.module.entities.filter(e => /(^|_)wonder_[a-z0-9]/.test(e.id) && e.type !== 'fact')
      .map(e => ({ id: e.id, name: e.name ?? e.id, place: w.one('at', e.id) ?? '' })).filter(x => x.place);
  }
  // Each place come to: how many of the acts there were looks, and how many of those gave a line or a fact new.
  static places(s: PlaySession, acts: Act[]): Run['places'] {
    const names = new Map(s.campaign.module.entities.map(e => [e.id, e.name ?? e.id]));
    return [...VisitedPlaces.of(s.campaign, s.campaign.playerActor!)].map(id => {
      const looks = acts.filter(a => a.place === id && a.kind === 'look');
      return { id, name: names.get(id) ?? id, looks: looks.length,
        found: looks.filter(a => this.beneath(a)).length };
    });
  }
  // Whether a look gave something beneath the place: a fact, a thing, a change, or more than its own answer (a search
  // that finds nothing says only that it was made; a look at a thing, its likeness the first time).
  static beneath(a: Act): boolean {
    if (a.learned.length || a.changes.length) { return true; }
    return /search/.test(a.command) ? a.fresh.length > 1 : !a.repeat && a.fresh.length > 0;
  }
  static table(runs: Run[], seeds: string[]): string {
    const out = ['| region | terrain | walks | acts | hours | repeat % | dead % | dead min | places | looked at, '
      + 'nothing beneath | wonders met / heard of / seen / placed | first met (min) | '
      + 'new verbs a walk: shared / a module\'s |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|---|'];
    for (const seed of seeds) {
      const rs = runs.filter(r => r.seed === seed);
      if (rs.length) { out.push(this.row(seed, rs)); }
    }
    return out.join('\n');
  }
  private static row(seed: string, rs: Run[]): string {
    const acts = rs.flatMap(r => r.acts), n = acts.length || 1;
    const looked = rs.flatMap(r => r.places.filter(p => p.looks > 0)), wonders = rs.flatMap(r => r.wonders);
    const first = Math.min(...wonders.filter(w => w.met !== undefined).map(w => w.met!));
    const verbs = rs.flatMap(r => r.verbs.filter(v => v.step > 0)), own = verbs.filter(v => !this.local(v)).length;
    const dead = acts.filter(a => a.dead);
    return `| ${[seed, rs[0]!.terrain, rs.length, acts.length, (rs.reduce((a, r) => a + r.minutes, 0) / 60).toFixed(1),
      this.pct(acts.filter(a => a.repeat).length, n), this.pct(dead.length, n), dead.reduce((a, x) => a + x.took, 0),
      rs.reduce((a, r) => a + r.places.length, 0), `${looked.filter(p => !p.found).length} of ${looked.length}`,
      `${this.ids(wonders, w => w.met !== undefined)} / ${this.ids(wonders, w => w.heard !== undefined)} / `
        + `${this.ids(wonders, w => w.seen !== undefined)} / `
        + `${this.ids(wonders, () => true)}`,
      Number.isFinite(first) ? first : '-', `${(own / rs.length).toFixed(1)} / ${((verbs.length - own) / rs.length)
        .toFixed(1)}`].join(' | ')} |`;
  }
  private static pct(k: number, n: number): string { return (100 * k / n).toFixed(0); }
  private static ids(wonders: Run['wonders'], f: (w: Run['wonders'][number]) => boolean): number {
    return new Set(wonders.filter(f).map(w => w.id)).size;
  }
  private static list(xs: [string, number][], n = 15): string[] {
    return xs.slice(0, n).map(([k, v]) => `- ${v}× ${k}`);
  }
  private static verb(a: Act): string { return a.command.split('(')[0]!.replace(/^[\w-]+__/, ''); }
  private static local(v: Run['verbs'][number]): boolean { return v.verb.startsWith('module:'); }
  private static count<T>(xs: T[], key: (x: T) => string): [string, number][] {
    const m = new Map<string, number>();
    for (const x of xs) { m.set(key(x), (m.get(key(x)) ?? 0) + 1); }
    return [...m].sort((a, b) => b[1] - a[1]);
  }
  // The evidence behind the numbers: the lines met most, the acts that are dead most, the places looked at for
  // nothing, the wonders nobody met, and where the new verbs came from.
  static evidence(runs: Run[]): string[] {
    const acts = runs.flatMap(r => r.acts), list = this.list.bind(this), verb = this.verb.bind(this);
    const searches = acts.filter(a => a.command.startsWith('search('));
    return [`Searches: ${searches.length}; found something ${searches.filter(a => this.beneath(a)).length}; ended on `
      + `their plain words alone ${searches.filter(a => a.lines.length && /a little at a time\.$/.test(a.lines[0]!)
        && !this.beneath(a)).length}`, '', '## Repeated (verb: first line), most met',
      ...list(this.count(acts.filter(a => a.repeat), a => `${verb(a)}: ${(a.lines[0] ?? '').slice(0, 100)}`)),
      '', '## Dead acts by verb', ...list(this.count(acts.filter(a => a.dead), verb), 12),
      '', '## Looked at, nothing beneath', ...list(this.count(runs.flatMap(r => r.places
        .filter(p => p.looks && !p.found).map(p => `${r.seed} ${p.name} (${p.id})`)), x => x)),
      '', '## Wonders not met (walks)', ...list(this.count(runs.flatMap(r => r.wonders.filter(w => w.met === undefined)
        .map(w => `${r.seed} ${w.name} at ${w.place}${w.seen !== undefined ? ', stood beside' : ''}`)), x => x), 40),
      '', '## New verbs by source (all walks)', ...list(this.count(runs.flatMap(r => r.verbs.filter(v => v.step > 0)
        .map(v => `${this.local(v) ? 'a module\'s' : 'shared'}, by ${v.source}`)), x => x)),
      '', '## Shared verbs gained (walk: verb at step, by source)', ...runs.map(r => `- ${r.seed} ${r.policy}: ${r.verbs
        .filter(v => v.step > 0 && !this.local(v)).map(v => `${v.verb} ${v.step} (${v.source})`).join(', ')
        || 'none'}`)];
  }
}
if (import.meta.main) { process.exit(await BoredomCensus.main(process.argv.slice(2))); }
