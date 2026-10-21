import { Planner } from './planner';
import type { CampaignActor } from './definition';
import type { Operator } from '../lang/module';
import { World } from '../lang/world';
import type { Operators } from './operators';

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
  private static plan(world: World, actor: CampaignActor, operators: Operators, goal: GoalAssessment) {
    const target = actor.goals.find(g => g.id === goal.id)!.target;
    return Planner.search(world, target, w => this.allowed(w, actor, operators),
      { maxNodes: 2000, timeRemaining: Infinity, maxSteps: actor.horizon });
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
