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
  // A goal that found no plan in a world finds none in a later world of its line, of the same module, that has written
  // nothing its target or the actor's own actions read: the search is not made again there (Mission 16's profile:
  // half of every command on The Patient Star's Garret failing to find his way up to Quell). That is a memory of the
  // search alone, which makes no game differ from any other (a world of another line, or a world joined to more
  // modules, is searched afresh). Someone who looked a long way (a quarter of all a search may look at, or more) and
  // found nothing tries again an hour later, whatever has changed meanwhile: that is the world's, kept with the
  // campaign's own state (waiting), so a game kept and opened again, undone, or only looked at, goes as it would have
  // (the architecture review's A1: a cache in the process, written by the page).
  static readonly retry = 6;
  private static readonly maxNodes = 2000;
  private static readonly fruitless = new Map<string, { module: object; reads: string[]; stamped: number[] }>();
  private static plan(world: World, actor: CampaignActor, operators: Operators,
    at: { goal: GoalAssessment; waiting?: Record<string, number>; looking?: boolean }) {
    const { goal, waiting } = at, target = actor.goals.find(g => g.id === goal.id)!.target;
    const key = `${actor.id}\u0000${goal.id}`, watch = world.number(ModuleWriter.call('watch', 'clock'));
    if ((waiting?.[key] ?? -1) > watch) { return null; }
    const kept = this.fruitless.get(key);
    if (kept?.module === world.module && world.agrees(kept.reads, kept.stamped)) { return null; }
    const found = Planner.search(world, target, w => this.allowed(w, actor, operators),
      { maxNodes: this.maxNodes, timeRemaining: Infinity, maxSteps: actor.horizon });
    if (found?.actions.length) {
      this.fruitless.delete(key);
      if (waiting && key in waiting && !at.looking) { delete waiting[key]; }
      return found;
    }
    // What its own actions read, as schemas: an action with parameters is no operator until it is bound (the memory
    // once read the target alone, and so outlived a gate opened on the walker's way home).
    const own = new Set(actor.actions), reads = kept?.module === world.module ? kept.reads
      : Reads.names(world.module, [target, ...world.module.actions.filter(a => own.has(a.id))
        .flatMap(a => [a.requires, ...a.success, ...a.failure ?? []])]);
    if (this.fruitless.size > 4000) { this.fruitless.clear(); }
    this.fruitless.set(key, { module: world.module, reads, stamped: world.stamped(reads) });
    if (waiting && !at.looking && Planner.last >= this.maxNodes / 4) { waiting[key] = watch + this.retry; }
    return found;
  }
  // The campaign's own state (current), where who is waiting to try again is kept.
  static choose(world: World, actor: CampaignActor, operators: Operators,
    state?: { waiting?: Record<string, number> }) {
    for (const goal of this.assess(world, actor).filter(g => g.applicable && !g.satisfied)) {
      const waiting = state ? state.waiting ??= {} : undefined;
      const plan = this.plan(world, actor, operators, { goal, ...waiting ? { waiting } : {} });
      if (state?.waiting && !Object.keys(state.waiting).length) { delete state.waiting; }
      if (plan?.actions.length) {
        return { goal: goal.id, plan, action: operators.get(plan.actions[0]!)! };
      }
    }
    return null;
  }
  // Debug explanation: every goal's standing and, for pursuable goals, the plan the next opportunity would find. It
  // only looks: whoever is waiting to try again is waiting, and nothing of the game is written (waiting is read).
  static explain(world: World, actor: CampaignActor, operators: Operators, waiting?: Readonly<Record<string, number>>) {
    const goals = this.assess(world, actor).map(goal => goal.applicable && !goal.satisfied ? { ...goal,
      plan: this.plan(world, actor, operators, { goal, ...waiting ? { waiting: { ...waiting } } : {}, looking: true })
        ?.actions ?? null } : goal);
    return { actor: actor.id, goals, selected: goals.find(g => g.plan?.length)?.id ?? null };
  }
}
