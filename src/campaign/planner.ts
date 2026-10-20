import type { Call, Operator, Predicate } from '../lang/module';
import { World } from '../lang/world';
import { ActionTime } from './action-time';

export type { Operator } from '../lang/module';
export interface Plan { actions: string[]; cost: number; expanded: number; explanation: string[] }
export class Planner {
  private static actors = new WeakMap<Operator[], { length: number; index: Map<string | undefined, Operator[]> }>();
  // Grounded actions of one actor, in module order. Action lists are immutable once grounded.
  static byActor(actions: Operator[], actor: string | undefined): Operator[] {
    let cached = this.actors.get(actions);
    if (cached?.length !== actions.length) {
      const index = new Map<string | undefined, Operator[]>();
      for (const a of actions) { const list = index.get(a.actor) ?? []; list.push(a); index.set(a.actor, list); }
      cached = { length: actions.length, index };
      this.actors.set(actions, cached);
    }
    return cached.index.get(actor) ?? [];
  }
  static applicable(world: World, action: Operator): boolean {
    return world.test(action.requires) && world.admits(action.success);
  }
  // Each action is filed under one fact its precondition requires (a positive, closed conjunct on a relation,
  // preferring an exclusive one such as `at`), so applicability only evaluates actions whose guard holds.
  private static guards = new WeakMap<Operator[], { length: number; guarded: Map<string, number[]>; open: number[] }>();
  private static atoms(world: World, q: Predicate, out: Call[] = []): Call[] {
    if (q.kind === 'and') { this.atoms(world, q.left, out); this.atoms(world, q.right, out); }
    else if (q.kind === 'call' && !q.args.some(a => a.startsWith('?'))
      && world.module.relations.some(r => r.name === q.name)) { out.push(q); }
    return out;
  }
  private static guard(world: World, p: Predicate): Call | undefined {
    const atoms = this.atoms(world, p);
    return atoms.find(a => world.module.relations.find(r => r.name === a.name)!.exclusive) ?? atoms[0];
  }
  static applicableAmong(world: World, actions: Operator[]): Operator[] {
    let index = this.guards.get(actions);
    if (index?.length !== actions.length) {
      const guarded = new Map<string, number[]>(), open: number[] = [];
      actions.forEach((action, i) => {
        const atom = this.guard(world, action.requires);
        if (!atom) { open.push(i); return; }
        const key = World.key(atom), list = guarded.get(key) ?? [];
        list.push(i); guarded.set(key, list);
      });
      index = { length: actions.length, guarded, open };
      this.guards.set(actions, index);
    }
    const candidates = [...index.open];
    for (const [key, list] of index.guarded) { if (world.holds(key)) { candidates.push(...list); } }
    return candidates.sort((a, b) => a - b).map(i => actions[i]!).filter(a => this.applicable(world, a));
  }
  static apply(world: World, action: Operator): World { return world.apply(action.success); }
  static search(world: World, goal: Predicate, actions: Operator[], options: { maxNodes: number;
    timeRemaining: number; maxSteps?: number } = { maxNodes: 2000, timeRemaining: Infinity }): Plan | null {
    const frontier = [{ world, actions: [] as string[], cost: 0, time: 0 }];
    const visited = new Map<string, number>();
    let expanded = 0;
    while (frontier.length && expanded < options.maxNodes) {
      frontier.sort((a, b) => a.cost - b.cost);
      const node = frontier.shift()!;
      const key = `${node.world.key()};${node.time}`;
      if ((visited.get(key) ?? Infinity) <= node.cost) { continue; }
      visited.set(key, node.cost);
      expanded++;
      if (node.world.test(goal)) {
        return { actions: node.actions, cost: node.cost, expanded,
          explanation: node.actions.map(id => {
            const action = actions.find(a => a.id === id)!;
            return `${action.name}: ${action.description}`;
          }) };
      }
      if (options.maxSteps !== undefined && node.actions.length >= options.maxSteps) { continue; }
      for (const action of Planner.applicableAmong(node.world, actions)) {
        const time = node.time + ActionTime.of(action, node.world);
        if (time > options.timeRemaining) { continue; }
        const next = Planner.apply(node.world, action);
        if (next.key() === node.world.key()) { continue; }
        frontier.push({ world: next, actions: [...node.actions, action.id],
          cost: node.cost + action.cost, time });
      }
    }
    return null;
  }
}
