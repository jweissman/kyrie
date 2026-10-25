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
  // A company goes at its slowest member's speed, and at half that when it is laden (see Burden): a way takes it so
  // much longer.
  static minutes(action: Operator, world: World): number {
    if (action.minutes !== undefined) { return action.minutes; }
    const d = action.duration, walked = d?.kind === 'call' && d.name === 'travelTime';
    const pace = walked ? (this.laden(action, world) ? 2 : 1) * this.slowest(action, world) : 1;
    if (walked && world.module.measures.some(m => m.name === 'travelMinutes')) {
      const minutes = world.number(ModuleWriter.call('travelMinutes', ...d.args));
      if (minutes > 0) { return Math.round(pace * minutes); }
    }
    return Math.round(pace * 10 * this.of(action, world));
  }
  // How many times as long its slowest member takes (speed, in hundredths of their own; unset is their own).
  private static slowest(action: Operator, world: World): number {
    if (!action.actor || !world.module.measures.some(m => m.name === 'speed')) { return 1; }
    const speeds = world.relatedTo('memberOf', action.actor)
      .map(f => world.number(ModuleWriter.call('speed', f.args[0]!))).filter(s => s > 0);
    return speeds.length ? 100 / Math.min(...speeds) : 1;
  }
  private static laden(action: Operator, world: World): boolean {
    return !!action.actor && world.module.queries.some(q => q.name === 'laden')
      && world.test(ModuleWriter.call('laden', action.actor));
  }
}
