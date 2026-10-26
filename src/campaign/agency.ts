import { Planner } from './planner';
import type { CampaignActor } from './definition';
import type { Operator } from '../lang/module';
import { World } from '../lang/world';
import type { Operators } from './operators';
import { Reads } from '../lang/reads';
import { ModuleWriter } from '../lang/module-writer';

export interface GoalAssessment {
  id: string; priority: number; urgent: boolean; applicable: boolean; satisfied: boolean; plan?: string[] | null;
}
export class Agency {
  static assess(world: World, actor: CampaignActor): GoalAssessment[] {
    return actor.goals.map((goal, order) => {
      const urgent = !!goal.urgent && world.test(goal.urgent.when);
      return { id: goal.id, order, priority: urgent ? goal.urgent!.priority : goal.priority, urgent,
        applicable: world.test(goal.when), satisfied: world.test(goal.target) };
    }).sort((a, b) => b.priority - a.priority || a.order - b.order)
      .map(({ order: _order, ...goal }) => goal);
  }
  // Combat success branches and another actor's choices are not predictions available to this planner.
  // Only the actor's own actions are grounded: a person who uses four actions is not offered the whole world's.
  private static allowed(world: World, actor: CampaignActor, operators: Operators): Operator[] {
    return operators.applicable(world, actor.id, new Set(actor.actions)).filter(a => !a.resolve);
  }
  // A goal that found no plan in a world finds none in a later world of its line that has written nothing its target
  // or the actor's own actions read, and is not searched for again there. One that looked a long way (a quarter of
  // all a search may look at, or more) and found nothing is tried again an hour later, whatever has changed
  // meanwhile: someone who cannot find the way home tries again later. After a second country was drawn, half of
  // every command went on The Patient Star's Garret failing to find his way up to Quell, watch after watch (the M16
  // deepening's profile: 84 s for 105 commands of wren, 26 s after).
  static readonly retry = 6;
  private static readonly maxNodes = 2000;
  private static readonly fruitless = new Map<string, { reads: string[]; stamped: number[]; until?: number }>();
  private static plan(world: World, actor: CampaignActor, operators: Operators, goal: GoalAssessment) {
    const target = actor.goals.find(g => g.id === goal.id)!.target, key = `${actor.id}\u0000${goal.id}`;
    const kept = this.fruitless.get(key), watch = world.number(ModuleWriter.call('watch', 'clock'));
    const waiting = kept?.until !== undefined && watch < kept.until;
    if (kept && (waiting || world.agrees(kept.reads, kept.stamped))) { return null; }
    const found = Planner.search(world, target, w => this.allowed(w, actor, operators),
      { maxNodes: this.maxNodes, timeRemaining: Infinity, maxSteps: actor.horizon });
    if (found?.actions.length) { this.fruitless.delete(key); return found; }
    const reads = kept?.reads ?? Reads.names(world.module, [target, ...actor.actions.map(id => operators.get(id))
      .flatMap(a => a ? [a.requires, ...a.success, ...a.failure ?? []] : [])]);
    if (this.fruitless.size > 4000) { this.fruitless.clear(); }
    const spent = Planner.last >= this.maxNodes / 4;
    this.fruitless.set(key, { reads, stamped: world.stamped(reads), ...spent ? { until: watch + this.retry } : {} });
    return found;
  }
  static choose(world: World, actor: CampaignActor, operators: Operators) {
    for (const goal of this.assess(world, actor).filter(g => g.applicable && !g.satisfied)) {
      const plan = this.plan(world, actor, operators, goal);
      if (plan?.actions.length) {
        return { goal: goal.id, plan, action: operators.get(plan.actions[0]!)! };
      }
    }
    return null;
  }
  // Debug explanation: every goal's standing and, for pursuable goals, the plan the next opportunity would find.
  static explain(world: World, actor: CampaignActor, operators: Operators) {
    const goals = this.assess(world, actor).map(goal => goal.applicable && !goal.satisfied ?
      { ...goal, plan: this.plan(world, actor, operators, goal)?.actions ?? null } : goal);
    return { actor: actor.id, goals, selected: goals.find(g => g.plan?.length)?.id ?? null };
  }
}
