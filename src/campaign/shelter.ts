import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import type { Operator } from './planner';

// Whether a rest's shelter still holds when the rest ends: a rough rest anywhere, a rest at a site that is restful and
// not closed. An action that is no rest is always safe. Read from the world alone (Campaign.shelter acts on it).
export class Shelter {
  static rest(action: Operator): boolean { const name = action.resolve?.name; return name === 'recover' || name === 'rough'; }
  static safe(world: World, action: Operator): boolean {
    const site = action.bindings?.site;
    return !Shelter.rest(action) || (!!site && (action.schema !== 'rest' || world.test(ModuleWriter.call('restful', site)))
      && !world.test(ModuleWriter.call('closed', site)));
  }
}
