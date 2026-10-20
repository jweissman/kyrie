import type { CreatureStore } from '../creature-store';
import type { CombatEvent } from '../model';
import { FieldUse } from './field-use';
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
  // Experience for each module whose goal now holds for the first time; `seen` records when each was resolved.
  static resolutions(world: World, definition: CampaignDefinition, seen: Record<string, number>,
    award: { elapsed: number; store: CreatureStore; party: string[]; events: CombatEvent[] }) {
    for (const m of definition.installations ?? []) {
      const key = `${m.id}.resolved`;
      if (m.experience && seen[key] === undefined && world.test(m.goal)) {
        seen[key] = award.elapsed;
        FieldUse.grant(award.store, award.party, m.experience, award.events);
      }
    }
  }
  static outcomes(world: World, definition: CampaignDefinition): Record<string, boolean> {
    return Object.fromEntries(definition.outcomes.map(o => [o.id, world.test(o.predicate)]));
  }
}
