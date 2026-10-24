import type { CreatureStore } from '../creature-store';
import type { CombatEvent } from '../model';
import { FieldUse } from './field-use';
import { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';
import type { Change } from '../lang/module';
import type { CampaignDefinition, InstalledModule } from './definition';
import type { ModuleStatus } from './campaign-types';

export class Progression {
  // Each installed module's standing: failed by an unmet pressure, succeeded by its goal, or still active.
  static statuses(installations: InstalledModule[], world: World,
    observations: Record<string, number>): ModuleStatus[] {
    return installations.map(m => ({ id: m.id, name: m.name, installedAt: m.installedAt, deadline: m.deadline,
      outcome: m.pressures.some(id => world.number(ModuleWriter.call('deficit', id)) > 0) ? 'failure' as const
        : world.test(m.goal) ? 'success' as const : 'active' as const,
      outcomes: Object.fromEntries(m.outcomes.map(o => [o.id, world.test(o.predicate)])),
      developments: m.outcomes.filter(o => observations[`${m.id}.${o.id}`] !== undefined)
        .map(o => ({ id: o.id, elapsed: observations[`${m.id}.${o.id}`]! })) }));
  }
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
  // A module resolved by the company's own action, or while the company is at one of its places, is worth its
  // experience; one resolved by others elsewhere (a shepherd burning out a nest while the company sleeps) is not.
  static resolutions(world: World, definition: CampaignDefinition, seen: Record<string, number>,
    award: { elapsed: number; store: CreatureStore; party: string[]; events: CombatEvent[]; own: boolean }) {
    const player = definition.actors.find(a => a.player)?.id;
    for (const m of definition.installations ?? []) {
      const key = `${m.id}.resolved`;
      if (m.experience && seen[key] === undefined && world.test(m.goal)) {
        seen[key] = award.elapsed;
        if (award.own || (player && this.present(world, m, player))) {
          // Said for what it was, so it is not taken for a fight's ("experience: deserters on the road, seen through").
          const from = award.events.length;
          FieldUse.grant(award.store, award.party, m.experience, award.events);
          for (const e of award.events.slice(from)) {
            if (e.type === 'gain') { e.detail = `experience: ${m.name.charAt(0).toLowerCase()}${m.name.slice(1)}, seen through`; }
          }
        }
      }
    }
  }
  private static present(world: World, m: InstalledModule, player: string): boolean {
    const places = [...world.module.entities.filter(e => e.type === 'place' && e.id.startsWith(`${m.id}__`)).map(e => e.id),
      ...(m.roles ?? []).filter(r => r.type === 'place').map(r => r.entity)];
    return places.some(p => world.test(ModuleWriter.call('at', player, p)));
  }
  static outcomes(world: World, definition: CampaignDefinition): Record<string, boolean> {
    return Object.fromEntries(definition.outcomes.map(o => [o.id, world.test(o.predicate)]));
  }
}
