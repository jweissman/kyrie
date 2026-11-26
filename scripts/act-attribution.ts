#!/usr/bin/env bun
// Inside the act (AX-10): the golden walk timed as scripts/turn-attribution.ts times it, the engine's act broken into
// its own parts (the command found and checked, the checkpoint, what it does, the world's rules woken and settled, the
// Projection, the aftermath, what the company perceives, the change list and receipt, the copies), and the world's
// rules counted: how many are asked in an act, how many are passed over on their stamps, how many solved, and how many
// fire. Ordinary acts and a journey's legs are reported apart.
// Its absolute times are not to be trusted: every part wrapped (World.apply, structuredClone among them) pays for its
// clock and proxy, and the walk ran at 258 ms a turn wrapped against about 185 unwrapped. Its counts are exact. On it,
// the rules' scan looked like 15 ms an act; asks cut by 87% gave 3% of the act, unwrapped (25 November). Decide by
// base against branch unwrapped (scripts/turn-attribution.ts, interleaved) or a CPU profile, not by these times.
//   bun scripts/act-attribution.ts [--json] [--counts: the counts alone, untimed but for the turn's own parts]
import { TurnAttribution } from './turn-attribution';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { AsMeant } from '../test/support/as-meant';
import { GoldenWalk } from '../test/support/golden-walk';
import { Campaign } from '../src/campaign/campaign';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { WatchLoop } from '../src/campaign/watch-loop';
import { Projection } from '../src/campaign/projection';
import { Aftermath } from '../src/campaign/aftermath';
import { Perceptions } from '../src/campaign/perceptions';
import { Progression } from '../src/campaign/progression';
import { Consequences } from '../src/campaign/consequences';
import { Arrivals } from '../src/campaign/arrivals';
import { Engagement } from '../src/campaign/engagement';
import { Interruption } from '../src/campaign/interruption';
import { Journey } from '../src/campaign/journey';
import { Membership } from '../src/campaign/membership';
import { CommandResolutions } from '../src/campaign/command-resolution';
import { FieldUse } from '../src/campaign/field-use';
import { CommittedWorld } from '../src/campaign/committed-world';
import { Crossing } from '../src/campaign/crossing';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { ActionParts, World } from '../src/lang/index';

type Count = 'state' | 'asked' | 'gated' | 'idle' | 'solved' | 'held' | 'fired' | 'answer' | 'acts' | 'watches';
export class ActAttribution {
  static readonly counts = { act: new Map<Count, number>(), leg: new Map<Count, number>() };
  private static onLeg(): boolean {
    const stack = (TurnAttribution as unknown as { stack: { part: string }[] }).stack;
    return stack.some(f => f.part === 'leg');
  }
  static count(c: Count, n = 1) {
    const m = this.onLeg() ? this.counts.leg : this.counts.act;
    m.set(c, (m.get(c) ?? 0) + n);
  }
  static parts() {
    const w = TurnAttribution.wrap.bind(TurnAttribution), c = Campaign.prototype as object;
    w(c, 'action', 'act:find'); w(c, 'checkpoint', 'act:checkpoint'); w(c, 'encounterBattle', 'act:battle');
    w(c, 'settle', 'act:settle'); w(c, 'apply', 'act:apply'); w(c, 'updateOutcome', 'act:membership');
    w(c, 'observe', 'act:progression'); w(c, 'resolutions', 'act:progression');
    w(c, 'advanceWatch', 'act:clock');
    w(Projection.prototype, 'refresh', 'act:projection');
    w(CommittedWorld.prototype, 'commit', 'act:commit');
    w(Aftermath, 'record', 'act:aftermath');
    w(Perceptions, 'settle', 'act:perceive');
    w(Progression, 'check', 'act:progression'); w(Progression, 'outcomes', 'act:progression');
    w(Progression, 'resolutions', 'act:progression');
    for (const m of ['strike', 'restore', 'slay', 'hand']) { w(Consequences, m, 'act:consequences'); }
    w(Arrivals, 'present', 'act:arrivals'); w(Arrivals, 'tell', 'act:arrivals');
    for (const m of ['foe', 'halt', 'assault', 'announced']) { w(Engagement, m, 'act:engagement'); }
    w(Interruption, 'begin', 'act:interruption'); w(Interruption, 'check', 'act:interruption');
    for (const m of ['of', 'depart', 'open', 'arrive', 'landed', 'along']) { w(Journey, m, 'act:journey'); }
    w(Membership, 'depart', 'act:membership');
    w(CommandResolutions, 'survived', 'act:survived'); w(CommandResolutions, 'receipt', 'act:receipt');
    w(FieldUse, 'advance', 'act:fielduse');
    w(Crossing, 'kept', 'act:crossing');
    w(CreatureFacts, 'commitMoney', 'act:money');
    w(ActionParts, 'told', 'act:told');
    w(CampaignTick, 'rules', 'act:rules'); w(CampaignTick, 'answer', 'act:rules'); w(CampaignTick, 'endings', 'act:rules');
    w(CampaignTick, 'npcs', 'act:npcs'); w(CampaignTick, 'clock', 'act:clock');
    w(CampaignTick, 'diff', 'act:diff');
    w(World.prototype, 'apply', 'world:apply');
    w(WatchLoop, 'pass', 'act:watchloop');
    const g = globalThis as unknown as Record<string, unknown>;
    w(g, 'structuredClone', 'act:clone');
    this.counters();
    w(CampaignTick, 'found', 'act:rules:solve'); w(CampaignTick, 'stays', 'act:rules:stays');
    w(CampaignTick, 'heard', 'act:rules:heard'); w(CampaignTick, 'yielding', 'act:rules:yielding');
  }
  // The rules counted where they are asked: fire is each rule's turn in a pass, instances its stamps read and,
  // where they do not hold it idle, its condition solved (held, where it has instances); the witness, each instance
  // that fires.
  private static counters() {
    const c = Campaign.prototype as object;
    this.counted(CampaignTick, 'fire', 'asked'); this.counted(CampaignTick, 'instances', 'idle');
    this.counted(CampaignTick, 'found', 'solved', 'held'); this.counted(CampaignTick, 'answer', 'answer');
    this.counted(c, 'executeAsync', 'acts'); this.counted(c, 'advanceWatch', 'watches');
    CampaignTick.witness = ActAttribution.count.bind(ActAttribution, 'fired', 1);
    const state = Object.getOwnPropertyDescriptor(c, 'tickState')!;
    Object.defineProperty(c, 'tickState', { ...state, get: new Proxy(state.get!, { apply: ActAttribution.stated.bind(ActAttribution) }) });
  }
  // The company's state read in an act (Campaign.tickState): its definition spread, its actors made live.
  private static stated(get: () => unknown, self: unknown): unknown {
    this.count('state');
    return get.apply(self);
  }
  // A method counted each time it is called, and again (as found) each time it gives back a nonempty list.
  private static counted(owner: object, name: string, called: Count, found?: Count) {
    const o = owner as Record<string, (...a: unknown[]) => unknown>;
    o[name] = new Proxy(o[name]!, { apply: ActAttribution.tally.bind(ActAttribution, { called, found }) });
  }
  private static tally({ called, found }: { called: Count; found?: Count }, f: (...a: unknown[]) => unknown,
    self: unknown, a: unknown[]) {
    this.count(called);
    const out = f.apply(self, a);
    if (found && Array.isArray(out) && out.length) { this.count(found); }
    return out;
  }
  static async walk(counting = false) {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    TurnAttribution.parts();
    if (counting) { this.counters(); } else { this.parts(); }
    // From here on: what was counted while the world was drawn is not the walk's.
    this.counts.act.clear(); this.counts.leg.clear();
    let total = 0, turns = 0;
    const parts = new Map<string, number>();
    for (const line of GoldenWalk.lines()) {
      const t = performance.now();
      const { parts: p } = await TurnAttribution.within(() => AsMeant.ask(r, line));
      total += performance.now() - t; turns++;
      for (const [k, v] of p) { parts.set(k, (parts.get(k) ?? 0) + v); }
    }
    return { turns, total, parts };
  }
  private static per(m: Map<Count, number>, n: number, c: Count): string {
    return ((m.get(c) ?? 0) / Math.max(1, n)).toFixed(1);
  }
  static async run(args: string[]) {
    const { turns, total, parts } = await this.walk(args.includes('--counts'));
    const legs = TurnAttribution.legs(), ordinary = this.counts.act.get('acts') ?? 0;
    const acts = ordinary + (this.counts.leg.get('acts') ?? 0);
    // The act's own parts, and the act's own time, over ordinary acts (the legs' share taken out).
    const act = [...parts].filter(([k]) => k.startsWith('act') || k.startsWith('world:'))
      .map(([k, ms]) => [k, ms, TurnAttribution.onLeg.get(k) ?? 0] as const)
      .sort((a, b) => b[1] - b[2] - (a[1] - a[2]));
    if (args.includes('--json')) {
      console.log(JSON.stringify({ turns, total, acts, ordinary, legs: legs.n,
        parts: Object.fromEntries(act.map(([k, ms, leg]) => [k, { ordinary: ms - leg, leg }])),
        counts: { act: Object.fromEntries(this.counts.act), leg: Object.fromEntries(this.counts.leg) } }));
      return 0;
    }
    console.log(`${turns} turns, ${Math.round(total / turns)} ms a turn; ${acts} acts, ${ordinary} ordinary, ${legs.n} legs`);
    console.log('part                ms/ordinary act   ms/leg');
    for (const [k, ms, leg] of act) {
      const own = ((ms - leg) / Math.max(1, ordinary)).toFixed(2), onLeg = (leg / Math.max(1, legs.n)).toFixed(2);
      console.log(`${k.padEnd(20)} ${own.padStart(8)}  ${onLeg.padStart(8)}`);
    }
    for (const [name, m, n] of [['ordinary act', this.counts.act, ordinary], ['leg', this.counts.leg, legs.n]] as const) {
      const per = ActAttribution.per.bind(ActAttribution, m, n);
      console.log(`rules a ${name}: ${per('asked')} asked, ${per('idle')} read for stamps, ${per('solved')} solved, `
        + `${per('held')} held, ${per('fired')} fired; ${per('watches')} watches, ${per('answer')} answers; `
        + `the company's state read ${per('state')} times`);
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(await ActAttribution.run(process.argv.slice(2))); }
