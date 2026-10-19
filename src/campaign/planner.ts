import type { Operator, Predicate } from '../lang/module';
import { World } from '../lang/world';
import { ActionTime } from './action-time';

export type { Operator } from '../lang/module';
export interface Plan { actions: string[]; cost: number; expanded: number; explanation: string[] }
export class Planner {
  static applicable(world: World, action: Operator): boolean {
    if (!world.test(action.requires)) { return false; }
    try { world.apply(action.success); return true; }
    catch { return false; }
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
      for (const action of actions) {
        const time = node.time + ActionTime.of(action, node.world);
        if (!Planner.applicable(node.world, action) || time > options.timeRemaining) { continue; }
        const next = Planner.apply(node.world, action);
        if (next.key() === node.world.key()) { continue; }
        frontier.push({ world: next, actions: [...node.actions, action.id],
          cost: node.cost + action.cost, time });
      }
    }
    return null;
  }
}
