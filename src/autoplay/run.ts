import { WorldAssembler } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { PlaySession, type SessionCheckpoint, type TranscriptStep } from '../session/play-session';
import { Frontier } from '../world/frontier';
import { PlayerView } from '../presentation/player-view';
import { VisitedPlaces } from '../presentation/visited-places';
import { Itineraries } from '../ui/itinerary';
import { Travel } from '../session/travel';
import { ModuleWriter } from '../lang/module-writer';
import type { CampaignEvent } from '../campaign/campaign';
import { AutoPlayer, type Move, type PolicyName, type Situation } from './player';
import { Draw } from './draw';
import { Invariants, type Violation } from './invariants';
import { Widening } from './widening';
import { DangerSense } from '../presentation/danger-sense';
import { ScreenModel } from '../ui/screen-model';
import { ChoiceList, type Choice } from '../ui/choice-list';

export interface Protagonist { name: string; raceId: string; classId: string }
export interface RunSpec {
  seed: string; origin: string; protagonist: Protagonist; policy: PolicyName; steps: number;
  // Every how many steps the game is kept and opened again; whether the run is played again from its commands at the
  // end; whether the world widens when the company crosses a march.
  keep?: number; replay?: boolean; frontier?: boolean;
}
export interface Failure { kind: string; message: string; step: number; move?: Move; stack?: string }
export interface Metrics {
  steps: number; commands: number; travels: number; arrivals: number; fights: number; won: number; lost: number;
  fled: number; kinds: Record<string, number>; places: number; countries: number; watches: number; ms: number;
  // Fights lost that the company took on, and those that came to it (on the road, where it arrived, as it waited).
  chosen: number; unchosen: number;
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
      { origin: spec.origin, party: [spec.protagonist] });
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
      const move = player.next(this.situation(s, step));
      if (!move) { failure = { kind: 'softlock', message: 'nothing to choose', step }; break; }
      const said = move.kind === 'travel' ? undefined : this.said(s, move.id), from = this.minutes(s);
      try { await this.apply(s, move, player, metrics); } catch (error) {
        failure = { kind: 'exception', message: (error as Error).message, step, move, stack: (error as Error).stack };
        break;
      }
      const keep = spec.keep && step % spec.keep === spec.keep - 1;
      const event = move.kind === 'travel' ? undefined : c.history.at(-1);
      const violations: Violation[] = [...Invariants.creatures(s), ...Invariants.offered(s), ...Invariants.party(s),
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
  static situation(s: PlaySession, step: number): Situation {
    const c = s.campaign, offered = PlayerView.choices(c).map(x => ({ id: x.choice.id, name: x.choice.name }));
    return { offered, destinations: Itineraries.destinations(c).map(d => ({ id: d.id, name: d.name })),
      visited: VisitedPlaces.of(c, c.playerActor!), step, dangers: this.dangers(s, offered),
      dark: Travel.night(c.readout.elapsed) };
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
    this.counted(await s.perform(move.id, player.controller), move.id, metrics);
  }
  private static async performing(s: PlaySession, player: AutoPlayer, metrics: Metrics, command: string) {
    return this.counted(await s.perform(command, player.controller), command, metrics);
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
      countries: 0, watches: 0, ms: 0, chosen: 0, unchosen: 0 };
  }
}
