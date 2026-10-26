import type { Operators } from './operators';
import { FictionalTime } from '../presentation/fictional-time';
import { Calendar, type CalendarStart } from '../presentation/calendar';
import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { Agency } from './agency';
import { ActionTime } from './action-time';
import { CreatureFacts } from './creature-facts';
import { Planner } from './planner';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { LocalObservations } from '../presentation/local-observations';
import { World } from '../lang/world';
import { Reads } from '../lang/reads';
import type { Call, Change, Module, Operator, WorldRule, WorldState } from '../lang/module';
import type { CampaignDefinition } from './definition';
import type { CreatureStore } from '../creature-store';

export interface PendingAction { action: string; until: number }
export interface TickHost {
  readonly world: World; readonly module: Module; readonly playerActor: string | undefined;
  readonly operators: Operators;
  readonly tickState: { definition: CampaignDefinition; creatures: CreatureStore;
    current: { seed: string; elapsed: number; minutes?: number; world: WorldState;
      pending?: Record<string, PendingAction> } };
  applyAction(action: Operator, success?: boolean): void; refreshProjection(): void; recordObservations(): void;
  commitWorld(world: World): void;
}
export interface TickDecision {
  actor: string; goal: string; action: string; plan: string[]; elapsed: number; changes: string[];
}
export type Happening = { id: string; text: string; kind: 'event' };

// One watch of the world after the player's action: every NPC acts or continues what it is doing, then each rule
// fires once in authored order. A rule with ?variables fires once for every binding that satisfies it.
export class CampaignTick {
  // The clock after a watch passes: its reading, dark() from nine in the evening until six in the morning, and the
  // watch's die (dice(clock), 1 to 100, drawn from the campaign's seed) for whatever is left to chance: a wandering
  // band on a road, the weather turning.
  static readonly seasons = ['spring', 'summer', 'autumn', 'winter'];
  static clock(world: World, { elapsed, seed, calendar }: { elapsed: number; seed: string; calendar?: CalendarStart }):
    Change[] {
    const night: Change[] = world.module.relations.some(r => r.name === 'dark')
      ? [{ kind: FictionalTime.dark(elapsed) ? 'assert' : 'retract', call: ModuleWriter.call('dark') }] : [];
    // How long until the hours a company waits for: first light, a night's sleep, dark, the day's next turn.
    const until: [string, number][] = [['untilLight', FictionalTime.untilLight(elapsed)],
      ['untilMorning', FictionalTime.untilMorning(elapsed)], ['untilDark', FictionalTime.untilDark(elapsed)],
      ['untilTurn', FictionalTime.untilTurn(elapsed)]];
    until.push(['hour', FictionalTime.hour(elapsed)], ['day', FictionalTime.day(elapsed)]);
    for (const [name, watches] of until) {
      if (world.module.measures.some(m => m.name === name)) {
        night.push({ kind: 'set', call: ModuleWriter.call(name, 'clock'), value: ModuleWriter.number(watches) });
      }
    }
    if (calendar && world.module.measures.some(m => m.name === 'season')) {
      night.push({ kind: 'set', call: ModuleWriter.call('season', 'clock'),
        value: ModuleWriter.number(this.seasons.indexOf(Calendar.date(calendar, elapsed).season) + 1) });
    }
    if (world.module.measures.some(m => m.name === 'dice')) {
      night.push({ kind: 'set', call: ModuleWriter.call('dice', 'clock'),
        value: ModuleWriter.number(new Expressions(RandomStreams.key(seed, 'dice', elapsed)).number('1d100')) });
    }
    return [{ kind: 'set', call: ModuleWriter.call('watch', 'clock'), value: ModuleWriter.number(elapsed) }, ...night];
  }
  static npcs(host: TickHost, decisions: TickDecision[]) {
    const { definition, current } = host.tickState;
    // The creatures' facts are projected again before anyone chooses after someone has acted, not before everyone.
    let acted = decisions.length + 1;
    for (const actor of definition.actors.filter(a => !a.player)) {
      if (acted !== decisions.length) { host.refreshProjection(); acted = decisions.length; }
      const pending = current.pending?.[actor.id];
      if (pending) {
        if (current.elapsed < pending.until) { continue; }
        delete current.pending![actor.id];
        const action = host.operators.get(pending.action);
        // An undertaking whose conditions no longer hold when its time is up is obstructed: its authored failure
        // (the aftermath of a broken rite, a wasted journey) happens instead.
        if (action && Planner.applicable(host.world, action)) { this.act(host, decisions, { actor: actor.id, goal: 'continuing', action, plan: [] }); }
        else if (action) { this.act(host, decisions, { actor: actor.id, goal: 'obstructed', action, plan: [] }, false); }
        continue;
      }
      const choice = Agency.choose(host.world, actor, host.operators);
      if (!choice) { continue; }
      const duration = ActionTime.of(choice.action, host.world);
      if (duration > 1) {
        (current.pending ??= {})[actor.id] = { action: choice.action.id, until: current.elapsed + duration - 1 };
        continue;
      }
      const plan = choice.plan.actions;
      this.act(host, decisions, { actor: actor.id, goal: choice.goal, action: choice.action, plan });
    }
  }
  private static act(host: TickHost, decisions: TickDecision[],
    d: { actor: string; goal: string; action: Operator; plan: string[] }, success = true) {
    const prior = host.world;
    host.applyAction(d.action, success);
    decisions.push({ actor: d.actor, goal: d.goal, action: d.action.id, plan: d.plan,
      elapsed: host.tickState.current.elapsed, changes: this.diff(prior, host.world) });
    host.recordObservations();
  }
  // The world's rules, in the order they are declared; then a way's opening once more, so that a gate declared
  // before the rule that lets the company through is open as soon as it has (Low Water's 1, the Assayers' gate; What
  // Tessary Owes' W10, the black wall that shut a watch late).
  static rules(host: TickHost, happenings: Happening[]) {
    const rules = host.module.rules ?? [];
    for (const rule of rules) { this.fire(host, rule, happenings); }
    for (const rule of rules) { if (rule.upkeep) { this.fire(host, rule, happenings); } }
  }
  private static fire(host: TickHost, rule: WorldRule, happenings: Happening[]) {
    const { definition, creatures } = host.tickState;
    // A rule said within an area waits for the company to be there: news of the city is told, and done, when the
    // company comes up from under the sea (What Tessary Owes' W1, the Road's F9).
    if (rule.anchor === 'within' && rule.place
      && !(host.playerActor && LocalObservations.inArea(host.world, host.playerActor, rule.place))) { return; }
    for (const [effects, binding] of this.instances(rule, host.world)) {
      // Each instance fires only if its condition still holds after those before it (two powers cannot both seize
      // the one stronghold left vacant).
      if (Object.keys(binding).length && !host.world.test(rule.when, binding)) { continue; }
      const prior = host.world, next = prior.apply(effects);
      CreatureFacts.commitMoney(prior, next, definition.actors, creatures);
      // The world itself is kept, not a copy of its facts, which the next reading of the world would build again
      // from every fact (Mission 15's profile: most of a command's time in a country of several regions).
      host.commitWorld(next);
      const player = host.playerActor;
      if (rule.say && player && next.test(ModuleWriter.call('able', player))
        && (!rule.place || LocalObservations.perceives(next, player, rule.place, rule.anchor))) {
        happenings.push({ id: rule.id, text: ObservationText.render(rule.say, next, true, binding), kind: 'event' });
      }
    }
  }
  // The effect lists a rule contributes now: none, one, or one per satisfying binding of its ?variables. A rule that
  // held nowhere in a world holds nowhere in a later one of its line that has written nothing its condition reads, so
  // it is not asked again there (Mission 15's profile: every rule of every module asked again on every watch).
  private static readonly idle = new WeakMap<WorldRule, { reads: string[]; stamped?: number[] }>();
  static instances(rule: WorldRule, world: World): [Change[], Record<string, string>][] {
    let idle = this.idle.get(rule);
    if (!idle) { idle = { reads: Reads.names(world.module, [rule.when]) }; this.idle.set(rule, idle); }
    if (world.agrees(idle.reads, idle.stamped)) { return []; }
    const found = this.found(rule, world);
    idle.stamped = found.length ? undefined : world.stamped(idle.reads);
    return found;
  }
  private static found(rule: WorldRule, world: World): [Change[], Record<string, string>][] {
    if (!World.variables(rule.when)) { return world.test(rule.when) ? [[rule.effects, {}]] : []; }
    const seen = new Set<string>(), result: [Change[], Record<string, string>][] = [];
    for (const b of world.solve(rule.when, {})) {
      const key = JSON.stringify(Object.entries(b).sort());
      if (seen.has(key)) { continue; }
      seen.add(key);
      result.push([rule.effects.map(c => 'value' in c
        ? { ...c, call: this.bind(c.call, b), value: ModuleWriter.calls(c.value, v => this.bind(v, b)) }
        : { ...c, call: this.bind(c.call, b) }) as Change[], b]);
    }
    return result;
  }
  private static bind(call: Call, binding: Record<string, string>): Call {
    return { ...call, args: call.args.map(a => binding[a] ?? a) };
  }
  static diff(before: World, after: World): string[] { return after.changes(before); }
}
