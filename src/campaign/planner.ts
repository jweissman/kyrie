import type { Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { ActionTime } from './action-time';

export type { Operator } from '../lang/module';
export interface Plan { actions: string[]; cost: number; expanded: number; explanation: string[] }
// The actions a search may take from a world: a fixed list, or a function of the world (demand-grounded).
export type Moves = Operator[] | ((world: World) => Operator[]);
export class Planner {
  static applicable(world: World, action: Operator): boolean {
    return world.test(action.requires) && world.admits(action.success);
  }
  static among(this: void, actions: Operator[], world: World): Operator[] {
    return actions.filter(a => Planner.applicable(world, a));
  }
  static apply(world: World, action: Operator): World { return world.apply(action.success); }
  static search(world: World, goal: Predicate, moves: Moves, options: { maxNodes: number;
    timeRemaining: number; maxSteps?: number } = { maxNodes: 2000, timeRemaining: Infinity }): Plan | null {
    const expand = typeof moves === 'function' ? moves : Planner.among.bind(undefined, moves);
    const frontier = [{ world, actions: [] as string[], cost: 0, time: 0 }];
    const visited = new Map<string, number>(), seen = new Map<string, Operator>();
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
          explanation: node.actions.map(id => `${seen.get(id)!.name}: ${seen.get(id)!.description}`) };
      }
      if (options.maxSteps !== undefined && node.actions.length >= options.maxSteps) { continue; }
      for (const action of expand(node.world)) {
        const time = node.time + ActionTime.of(action, node.world);
        if (time > options.timeRemaining) { continue; }
        const next = Planner.apply(node.world, action);
        if (next.key() === node.world.key()) { continue; }
        seen.set(action.id, action);
        frontier.push({ world: next, actions: [...node.actions, action.id],
          cost: node.cost + action.cost, time });
      }
    }
    return null;
  }
}
