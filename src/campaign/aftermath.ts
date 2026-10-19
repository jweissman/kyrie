import { Exposure } from './exposure';
import { Witnesses } from './witnesses';
import type { World } from '../lang/world';
import type { Operator } from '../lang/module';
import type { CombatEvent } from '../model';

// What a committed command leaves behind in the world: who saw an attack, and which elements it let loose where.
export class Aftermath {
  static record(before: World, after: World, action: Operator, events: CombatEvent[]): World {
    return Exposure.record(before, Witnesses.record(before, after, action, events), action, events);
  }
}
