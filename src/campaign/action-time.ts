import type { Operator } from '../lang/module';
import type { World } from '../lang/world';

// How long an action takes here and now: a fixed number of ticks, or a measure such as a passage's travel time.
export class ActionTime {
  static of(action: Operator, world: World): number {
    return action.duration ? Math.max(1, world.number(action.duration)) : action.time;
  }
}
