#!/usr/bin/env bun
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Agency } from '../../src/campaign/agency';
import { DangerSense } from '../../src/presentation/danger-sense';
import { FightHelp } from '../../src/presentation/fight-help';
import { Glance } from '../../src/presentation/glance';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerRevision } from '../../src/presentation/player-revision';
import { PlayerView } from '../../src/presentation/player-view';
import { ChoiceGrouping } from '../../src/ui/choice-grouping';
import { Itineraries } from '../../src/ui/itinerary';
import { KeptParts } from '../../src/ui/kept-parts';
import { Quarters } from '../../src/ui/quarters';
import { ScreenModel } from '../../src/ui/screen-model';
import { Services } from '../../src/ui/services';
import { TownPlan } from '../../src/ui/town-plan';
import { Withheld } from '../../src/ui/withheld';
import { KeptReading } from '../../src/lang';
import { World } from '../../src/lang/world';
import { AsMeant } from '../../test/support/as-meant';
import { GoldenWalk } from '../../test/support/golden-walk';

type Timing = { ms: number; calls: number };
type Method = (...args: unknown[]) => unknown;
const parts = ['screen', 'playerFrame', 'choiceRows', 'frameRows', 'keptParts', 'glanceRouting', 'fightHelp', 'dangerSense',
  'dangerSimulation', 'observe', 'withheld', 'choiceGrouping', 'townPlan', 'services', 'quarters', 'itineraries',
  'fees', 'prices', 'agency', 'revisionCheck', 'perceive', 'keptHolds', 'keptReads', 'worldAgrees'];
class FrameParts {
  private static readonly samples = new Map(parts.map(name => [name, [] as Timing[]]));
  private static current = new Map<string, Timing>();
  private static measure(owner: object, method: string, part: string) {
    const methods = owner as Record<string, Method>, original = methods[method]!;
    methods[method] = new Proxy(original, { apply: FrameParts.apply.bind(FrameParts, part) });
  }
  private static apply(part: string, target: Method, receiver: unknown, args: unknown[]): unknown {
    const timing = this.current.get(part) ?? { ms: 0, calls: 0 };
    timing.calls++; this.current.set(part, timing);
    const start = performance.now();
    try { return target.apply(receiver, args); } finally { timing.ms += performance.now() - start; }
  }
  private static quantile(values: number[], q: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(q * (sorted.length - 1))] ?? 0;
  }
  static async run() {
    this.measure(ScreenModel, 'built', 'screen');
    this.measure(PlayerFrame, 'of', 'playerFrame');
    this.measure(PlayerView, 'choices', 'choiceRows');
    this.measure(PlayerView, 'frameRows', 'frameRows');
    this.measure(PlayerView, 'observe', 'observe');
    this.measure(PlayerRevision, 'of', 'revisionCheck');
    this.measure(PlayerView, 'perceive', 'perceive');
    this.measure(KeptReading, 'holds', 'keptHolds');
    this.measure(KeptReading, 'read', 'keptReads');
    this.measure(World.prototype, 'agrees', 'worldAgrees');
    this.measure(KeptParts, 'of', 'keptParts');
    this.measure(KeptParts, 'named', 'keptParts');
    this.measure(Glance, 'reading', 'glanceRouting');
    this.measure(FightHelp, 'reckoning', 'fightHelp');
    this.measure(DangerSense, 'reckon', 'dangerSense');
    this.measure(DangerSense, 'play', 'dangerSimulation');
    this.measure(Withheld, 'rows', 'withheld');
    this.measure(ChoiceGrouping, 'group', 'choiceGrouping');
    this.measure(TownPlan, 'of', 'townPlan');
    this.measure(Services, 'of', 'services');
    this.measure(Quarters, 'shown', 'quarters');
    this.measure(Itineraries, 'shown', 'itineraries');
    this.measure(ScreenModel, 'fees', 'fees');
    this.measure(ScreenModel, 'prices', 'prices');
    this.measure(Agency, 'explain', 'agency');
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const runner = new Runner(journey.session);
    runner.said();
    for (const line of GoldenWalk.lines()) {
      this.current = new Map();
      await AsMeant.ask(runner, line);
      for (const name of parts) { this.samples.get(name)!.push(this.current.get(name) ?? { ms: 0, calls: 0 }); }
    }
    console.log(`Golden walk, ${this.samples.get('screen')!.length} turns; timings are inclusive and nested.`);
    console.log('| Part | p50 ms/turn | p95 ms/turn | Total calls | Turns called |');
    console.log('|---|---:|---:|---:|---:|');
    for (const name of parts) {
      const readings = this.samples.get(name)!;
      console.log(`| ${name} | ${this.quantile(readings.map(x => x.ms), 0.5).toFixed(1)} | `
        + `${this.quantile(readings.map(x => x.ms), 0.95).toFixed(1)} | `
        + `${readings.reduce((n, x) => n + x.calls, 0)} | ${readings.filter(x => x.calls).length} |`);
    }
  }
}

if (import.meta.main) { await FrameParts.run(); }