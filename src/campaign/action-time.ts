import type { Operator } from '../lang/module';
import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';

// How long an action takes here and now: a fixed number of ticks, or a measure such as a passage's travel time.
export class ActionTime {
  static of(action: Operator, world: World): number {
    return action.duration ? Math.max(1, world.number(action.duration)) : action.time;
  }
  // The same in minutes, for whoever spends minutes as well as watches (the one who plays): an action that says its
  // minutes (Time 2 minutes), a way walked in minutes (taking 3 minutes), or its watches, ten minutes each.
  // A company that is laden (see Burden) goes at half its pace: a way takes it twice as long.
  static minutes(action: Operator, world: World): number {
    if (action.minutes !== undefined) { return action.minutes; }
    const d = action.duration, walked = d?.kind === 'call' && d.name === 'travelTime';
    const pace = walked && this.laden(action, world) ? 2 : 1;
    if (walked && world.module.measures.some(m => m.name === 'travelMinutes')) {
      const minutes = world.number(ModuleWriter.call('travelMinutes', ...d.args));
      if (minutes > 0) { return pace * minutes; }
    }
    return pace * 10 * this.of(action, world);
  }
  private static laden(action: Operator, world: World): boolean {
    return !!action.actor && world.module.queries.some(q => q.name === 'laden')
      && world.test(ModuleWriter.call('laden', action.actor));
  }
}
