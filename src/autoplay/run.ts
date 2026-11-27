import { Guidance } from './guidance';
import { WorldAssembler } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { PlaySession, type SessionCheckpoint, type TranscriptStep } from '../session/play-session';
import { Frontier } from '../world/frontier';
import { PlayerFrame } from '../presentation/player-frame';
import { VisitedPlaces } from '../presentation/visited-places';
import { Itineraries } from '../ui/itinerary';
import { Travel } from '../session/travel';
import { Focusing } from '../session/focus';
import { ModuleWriter } from '../lang/module-writer';
import type { CampaignEvent } from '../campaign/campaign';
import { AutoPlayer, type Move, type PolicyName, type Situation } from './player';
import { Draw } from './draw';
import { Invariants, type Violation } from './invariants';
import { Widening } from './widening';
import { DangerSense } from '../presentation/danger-sense';
import { ScreenModel } from '../ui/screen-model';
import { Doable } from '../presentation/doable';
import { Engaged } from '../presentation/engaged';
import { Patience } from '../ui/patience';
import { Narrator } from '../presentation/narrator';
import { ChoiceList, type Choice } from '../ui/choice-list';
import type { Aspect } from '../presentation/glance-types';

export interface Protagonist { name: string; raceId: string; classId: string }
export interface RunSpec {
  seed: string; origin: string; protagonist: Protagonist; policy: PolicyName; steps: number;
  // Every how many steps the game is kept and opened again; whether the run is played again from its commands at the
  // end; whether the world widens when the company crosses a march.
  keep?: number; replay?: boolean; frontier?: boolean;
  // The debt's chain fixed, not drawn (see DebtShapes).
  chain?: string;
  // A stock opening begun in ahead of the origin (the adit: StockOpenings), as creation begins one.
  opening?: string;
}
export interface Failure { kind: string; message: string; step: number; move?: Move; stack?: string }
export interface Metrics {
  steps: number; commands: number; travels: number; arrivals: number; fights: number; won: number; lost: number;
  fled: number; kinds: Record<string, number>; places: number; countries: number; watches: number; ms: number;
  // Fights lost that the company took on, and those that came to it (on the road, where it arrived, as it waited).
  chosen: number; unchosen: number;
  // Steps with an aim followed, where the page led with its next step, and where it did not (see Guidance).
  guided: number; unguided: number;
}
export interface RunResult {
  spec: RunSpec; steps: TranscriptStep[]; metrics: Metrics; failure?: Failure; ended: boolean;
  // The game as last kept whole, from which the failure can be played forward.
  kept?: SessionCheckpoint;
}

// One run of the autoplay laboratory: a generated world drawn for a protagonist, played by a player of one temper (or
// of all of them in turn) through the game's own offered commands and journeys, with every step checked against what
// play must keep true. A failure is caught with what is needed to make it again: the world's seed and draw, every
// command, the move that failed, and the game as it was last kept.
export class AutoplayRun {
  static async start(spec: RunSpec, metrics?: Metrics): Promise<PlaySession> {
    const w = await WorldAssembler.assemble(spec.seed, NodeBundleSource.shared,
      { origin: spec.origin, party: [spec.protagonist], ...spec.chain ? { chain: spec.chain } : {},
        ...spec.opening ? { opening: spec.opening } : {} });
    const s = await PlaySession.start(w.path, spec.seed, w.source);
    if (spec.frontier !== false) {
      const widening = new Widening(new Frontier(spec.seed, NodeBundleSource.shared), metrics);
      s.extend({ expand: widening.expand });
    }
    return s;
  }
  static async run(spec: RunSpec): Promise<RunResult> {
    const metrics = this.empty(), began = Date.now(), s = await this.start(spec, metrics), c = s.campaign;
    const player = new AutoPlayer(spec.policy, new Draw(`${spec.seed}:${spec.origin}:${spec.policy}`));
    const from = this.watch(s);
    let kept: SessionCheckpoint | undefined = s.checkpoint(), failure: Failure | undefined;
    for (let step = 0; step < spec.steps && c.running && !failure; step++) {
      if (spec.policy === 'gold') { await Guidance.follow(s); }
      const guided = Guidance.guided(s);
      if (guided !== undefined) { metrics[guided ? 'guided' : 'unguided']++; }
      const move = player.next(this.situation(s, step, AutoPlayer.paged.includes(spec.policy),
        AutoPlayer.prefers[spec.policy]));
      if (!move) { failure = { kind: 'softlock', message: 'nothing to choose', step }; break; }
      const said = move.kind === 'travel' ? undefined : this.said(s, move.id), from = this.minutes(s);
      try { await this.apply(s, move, player, metrics); } catch (error) {
        failure = { kind: 'exception', message: (error as Error).message, step, move, stack: (error as Error).stack };
        break;
      }
      const keep = spec.keep && step % spec.keep === spec.keep - 1;
      const event = move.kind === 'travel' ? undefined : c.history.at(-1);
      const violations: Violation[] = [...Invariants.creatures(s), ...Invariants.offered(s), ...Invariants.party(s),
        ...Invariants.faces(s),
        ...event ? [...Invariants.told(event), ...Invariants.time(said, this.minutes(s) - from, event)] : [],
        ...keep ? Invariants.roundtrip(s) : []];
      if (violations.length) { failure = { kind: violations[0]!.kind, message: violations[0]!.message, step, move }; }
      else if (keep) { kept = s.checkpoint(); }
      metrics.steps = step + 1;
    }
    if (!failure && spec.replay) { failure = await this.replayed(spec, s); }
    Object.assign(metrics, { places: VisitedPlaces.of(c, c.playerActor!).size, watches: this.watch(s) - from,
      ms: Date.now() - began });
    return { spec, steps: s.transcript.steps, metrics, ended: !c.running, ...failure ? { failure, kept } : {} };
  }
  static watch(s: PlaySession): number { return s.campaign.world.number(ModuleWriter.call('watch', 'clock')); }
  private static minutes(s: PlaySession): number {
    return s.campaign.readout.elapsed * 10 + (s.campaign.readout.minutes ?? 0);
  }
  // How long the page says a command takes, as it offers it.
  private static said(s: PlaySession, command: string): number | undefined {
    const screen = ScreenModel.build(s.campaign);
    return this.leaves([...ChoiceList.explore(screen), ...ChoiceList.pack(screen)].flatMap(x => x.choices))
      .find(x => x.command === command)?.minutes;
  }
  private static leaves(choices: Choice[]): Choice[] {
    return choices.flatMap(c => c.children ? this.leaves(c.children) : [c]);
  }
  // The acts that go somewhere by a way (which may be into another hex: PlaySession.crosses).
  private static readonly moving = /^(go|walk|climb|cross|slip_past|passage|risk_passage|cleared_passage|escort)\(/;
  static situation(s: PlaySession, step: number, led = false, prefer?: Aspect): Situation {
    const c = s.campaign, engaged = this.engaged(s);
    // Never a way walked into another hex: that is set out on from the map, among the destinations (the owner, 25
    // November: ways to another hex appear only on the map), as the scene's rows leave it (DoableJourneys.mapped).
    const offered = PlayerFrame.of(c).rows.filter(x => (!engaged || engaged.has(x.choice.id))
      && !(AutoplayRun.moving.test(x.choice.id) && s.crosses(x.choice.id)))
      .map(x => ({ id: x.choice.id, name: x.choice.name }));
    return { offered, destinations: engaged ? []
      : Itineraries.destinations(c).map(d => ({ id: d.id, name: d.name })),
      visited: VisitedPlaces.of(c, c.playerActor!), step, dangers: this.dangers(s, offered),
      dark: Travel.dark(c), ...led ? { led: this.led(s, prefer) } : {} };
  }
  // While a warning stands, what the engaged frame offers, by command (Doable's rows: OR-166): every policy answers
  // what is in front of it as a player must (OR-163), where the campaign's offer had kept its waits and its search;
  // and no journey. Undefined where nothing warns, the campaign's offer as it was.
  private static engaged(s: PlaySession): Set<string> | undefined {
    // The warning asked first (Patience, what the frame reads it by), the frame built only where one stands.
    if (!Engaged.threat(Patience.of(s.campaign))) { return undefined; }
    const screen = ScreenModel.build(s.campaign);
    const glance = Narrator.leaf(s.campaign, screen).glance;
    return new Set(glance ? Doable.flat(Doable.of(glance, screen)).flatMap(r => r.does ? [r.does] : []) : []);
  }
  // What the page leads with where the company stands, best first, by command (see Glance); for a walker that
  // prefers an aspect (silver: what is worth exploring; gold: the aim followed), what has it first, the page's order
  // kept otherwise (amendment 6, H).
  // A way led with into another hex is set out on from the map, as the page charts it (DoableJourneys.mapped).
  private static charted(s: PlaySession, command: string): string {
    const to = AutoplayRun.moving.test(command) ? s.crosses(command) : undefined;
    return to ? `travel:${to}` : command;
  }
  private static led(s: PlaySession, prefer?: Aspect): string[] {
    const screen = ScreenModel.build(s.campaign), glance = Narrator.leaf(s.campaign, screen).glance;
    const acts = [...glance?.acts ?? []]
      .sort((a, b) => Number(!this.prefers(a, prefer)) - Number(!this.prefers(b, prefer)));
    // A conversation it leads with is opened as the page opens it, by talking to them; what it is led for in it is
    // done there (see Promoted.for), and nothing else said beside it in its place (a bed had been taken four times
    // over by ten in the morning, the innkeeper's first reply).
    // Then what the offer's four add (the roads of a crossroads among them): the menu is all a player is given.
    const added = (glance?.offer?.primary ?? []).filter(o => o.command && !acts.some(a => a.command === o.command))
      .map(o => o.command!);
    // The talk itself is what its row does (Doable), not a command made of its id: the one command, never its letters
    // (a row's does spread as a list had led "t", "a", "l", "k" … ahead of the walk out, OR-172).
    return [...acts.flatMap(a => a.choice.endsWith('#talk')
      ? [...a.for ? [a.for] : [], ...a.command?.startsWith('ask(') ? [a.command] : [],
        ...[Doable.one(glance!, screen, a.choice, a.command).does ?? []].flat()]
      : a.command ? [this.charted(s, a.command)] : []), ...added]
      // A turning to someone with no greeting is the session's own (focus:talk), no act of the world to play.
      .filter(c => !Focusing.is(c));
  }
  // Whether a led act is what a walker prefers: the gold walker goes by the one the glance marks as carrying the aim
  // on (Promoted.continues); the silver by what is worth exploring.
  private static prefers(a: { aspects: Aspect[]; continues?: true }, prefer?: Aspect): boolean {
    return prefer === 'undertaking' ? !!a.continues : !!prefer && a.aspects.includes(prefer);
  }
  // How each fight offered would go, as the page reckons it, for those it reckons (a group the company could fight).
  private static dangers(s: PlaySession, offered: { id: string }[]): Record<string, string> {
    const c = s.campaign, groups = c.readout.inhabitants;
    return Object.fromEntries(offered.filter(o => AutoPlayer.kind(o.id) === 'fight').flatMap(o => {
      const group = /^\w+\(([^,)]+)/.exec(o.id)?.[1];
      const danger = group && groups[group] && DangerSense.reckon(c, group)?.danger;
      return danger ? [[o.id, danger]] : [];
    }));
  }
  static async apply(s: PlaySession, move: Move, player: AutoPlayer, metrics: Metrics) {
    if (move.kind === 'travel') {
      metrics.travels++;
      const done = await Travel.go({ campaign: s.campaign, perform: this.performing.bind(this, s, player, metrics) },
        move.to);
      if (done.arrived) { metrics.arrivals++; }
      // A journey along known ways arrives, or says what stopped it (route reachability).
      else if (!done.stopped) { throw new Error(`A journey to ${move.to} neither arrived nor said why it stopped`); }
      return;
    }
    this.counted(await s.leg(move.id, player.controller), move.id, metrics);
  }
  private static async performing(s: PlaySession, player: AutoPlayer, metrics: Metrics, command: string) {
    return this.counted(await s.leg(command, player.controller), command, metrics);
  }
  private static counted(event: CampaignEvent, command: string, metrics: Metrics): CampaignEvent {
    metrics.commands++;
    const kind = AutoPlayer.kind(command);
    metrics.kinds[kind] = (metrics.kinds[kind] ?? 0) + 1;
    for (const end of event.combat.filter(e => e.type === 'end')) {
      metrics.fights++;
      if (end.type !== 'end') { continue; }
      if (end.outcome === 'fighters') { metrics.won++; } else if (end.outcome === 'escaped') { metrics.fled++; }
      else { metrics.lost++; metrics[kind === 'fight' ? 'chosen' : 'unchosen']++; }
    }
    return event;
  }
  // Played again from its commands in a world drawn again, the run is the same game.
  private static async replayed(spec: RunSpec, s: PlaySession): Promise<Failure | undefined> {
    try {
      const again = await this.start(spec);
      await again.replay(s.transcript.steps);
      return again.canonical() === s.canonical() ? undefined
        : { kind: 'replay', message: 'played again from its commands, the game differs', step: s.transcript.steps.length };
    } catch (error) {
      return { kind: 'replay', message: (error as Error).message, step: s.transcript.steps.length };
    }
  }
  static empty(): Metrics {
    return { steps: 0, commands: 0, travels: 0, arrivals: 0, fights: 0, won: 0, lost: 0, fled: 0, kinds: {}, places: 0,
      countries: 0, watches: 0, ms: 0, chosen: 0, unchosen: 0, guided: 0, unguided: 0 };
  }
}
