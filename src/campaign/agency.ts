import { Planner } from './planner';
import type { CampaignActor } from './definition';
import type { Operator } from '../lang/module';
import { World } from '../lang/world';

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
  private static memo = new WeakMap<Operator[], WeakMap<CampaignActor, Operator[]>>();
  private static allowed(actor: CampaignActor, actions: Operator[]): Operator[] {
    let byActor = this.memo.get(actions);
    if (!byActor) { byActor = new WeakMap(); this.memo.set(actions, byActor); }
    let allowed = byActor.get(actor);
    if (!allowed) {
      allowed = Planner.byActor(actions, actor.id).filter(a => actor.actions.includes(a.schema ?? a.id) && !a.resolve);
      byActor.set(actor, allowed);
    }
    return allowed;
  }
  private static plan(world: World, actor: CampaignActor, allowed: Operator[], goal: GoalAssessment) {
    const target = actor.goals.find(g => g.id === goal.id)!.target;
    return Planner.search(world, target, allowed, { maxNodes: 2000, timeRemaining: Infinity, maxSteps: actor.horizon });
  }
  static choose(world: World, actor: CampaignActor, actions: Operator[]) {
    const allowed = this.allowed(actor, actions);
    for (const goal of this.assess(world, actor).filter(g => g.applicable && !g.satisfied)) {
      const plan = this.plan(world, actor, allowed, goal);
      if (plan?.actions.length) {
        return { goal: goal.id, plan, action: allowed.find(a => a.id === plan.actions[0])! };
      }
    }
    return null;
  }
  // Debug explanation: every goal's standing and, for pursuable goals, the plan the next opportunity would find.
  static explain(world: World, actor: CampaignActor, actions: Operator[]) {
    const allowed = this.allowed(actor, actions);
    const goals = this.assess(world, actor).map(goal => goal.applicable && !goal.satisfied ?
      { ...goal, plan: this.plan(world, actor, allowed, goal)?.actions ?? null } : goal);
    return { actor: actor.id, goals, selected: goals.find(g => g.plan?.length)?.id ?? null };
  }
}
