import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import type { CreatureStore } from '../creature-store';
import type { CombatEvent } from '../model';
import { FieldUse } from './field-use';

// What the slain leave where they fell (M19-92, G12: nothing had been left by the slain, though Orsino's foes dropped
// what they carried): each fallen person's arms, armour and gear, the things of the world the engine made of what they
// carry (Overlays.declareGear), set down at the place of the fight, to be taken as anything lying there is. A beast's
// teeth and claws are no thing, and stay with it.
export class Spoils {
  // A fight won: the company's experience of it (FieldUse.award), and what its fallen leave where it was fought.
  static won(world: World, store: CreatureStore, fight: { opponent: string; events: CombatEvent[]; party: string[];
    fallen: string[]; company?: string }): World {
    FieldUse.award(store, fight.party, world, { opponent: fight.opponent, events: fight.events,
      members: fight.fallen });
    const place = fight.company ? world.one('at', fight.company) : undefined;
    return Spoils.left(world, store, { fallen: fight.fallen, place });
  }
  static left(world: World, store: CreatureStore, fight: { fallen: string[]; place?: string }): World {
    if (!fight.place || !fight.fallen.length || !world.relates('itemKind')) { return world; }
    const place = fight.place, set: string[] = [], lease = store.acquire(fight.fallen);
    try {
      for (const c of lease.creatures) {
        const [left, kept] = Spoils.split(world, c.state.inventory ?? []);
        if (!left.length) { continue; }
        set.push(...left); c.state.inventory = kept;
      }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    return set.length ? world.apply(set.map(id => ({ kind: 'assert' as const, call: ModuleWriter.call('at', id, place) })))
      : world;
  }
  private static split<T extends { id: string; definition: string }>(world: World, carried: T[]): [string[], T[]] {
    const things = new Set(carried.filter(i => world.test(ModuleWriter.call('itemKind', i.id, i.definition))));
    return [[...things].map(i => i.id), carried.filter(i => !things.has(i))];
  }
}
