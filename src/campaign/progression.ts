import { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';
import type { Change } from '../lang/module';
import type { CampaignDefinition } from './definition';

export class Progression {
  static check(world: World, definition: CampaignDefinition, elapsed: number): World {
    const changes: Change[] = [];
    for (const pressure of definition.pressures) {
      if (elapsed >= pressure.at && !world.test(ModuleWriter.call('recorded', pressure.id))) {
        changes.push({ kind: 'assert', call: ModuleWriter.call('recorded', pressure.id) },
          { kind: 'set', call: ModuleWriter.call('deficit', pressure.id),
            value: ModuleWriter.number(Math.max(0, pressure.required - world.number(pressure.measure))) });
      }
    }
    return world.apply(changes);
  }
  static outcomes(world: World, definition: CampaignDefinition): Record<string, boolean> {
    return Object.fromEntries(definition.outcomes.map(o => [o.id, world.test(o.predicate)]));
  }
}
