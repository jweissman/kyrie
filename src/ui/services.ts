import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { Spatial } from '../spatial';
import { TradeModel, type Counter } from './trade-model';
import type { World } from '../lang/world';
import { Canon } from '../canon/canon';
import type { Screen } from './screen-types';
import type { Names } from './known-names';

// Where in the settlement the company is in it can find what it needs (Mission 18, the owner's fifth priority:
// rations, light, rope and a crowbar found from a typical start without searching blindly through many shops): for
// each need, who meets it and where, nearest first. Read from who is where now and what they sell, never from what a
// settlement was meant to have; somewhere shut for the night is not listed until it opens.
export class Services {
  // Each need by what the world says of the thing sold, never by its name (the architecture review's P0): food, the
  // goods sold by the measure; light, what lights or feeds a light; remedies, what is used up in the using; gear,
  // the rest of what the catalog calls gear, tools and equipment.
  static readonly needs = ['Food', 'Light', 'Gear', 'Remedies'] as const;
  static need(world: World, s: Counter['sells'][number]): (typeof Services.needs)[number] | undefined {
    if (s.good) { return 'Food'; }
    if (this.is(world, 'lightsUp', s.kind) || this.is(world, 'fuel', s.kind)) { return 'Light'; }
    if (this.is(world, 'consumable', s.kind)) { return 'Remedies'; }
    return ['gear', 'tool', 'equipment'].includes(Canon.items[s.kind]?.category ?? '') ? 'Gear' : undefined;
  }
  private static is(world: World, relation: string, kind: string): boolean {
    return world.relates(relation) && world.related(relation, kind).length > 0;
  }
  static of(campaign: Campaign, names: Names): NonNullable<Screen['services']> {
    const world = campaign.world, here = world.one('at', campaign.playerActor ?? 'party');
    const byId = new Map(campaign.module.entities.map(e => [e.id, e]));
    const town = here && Spatial.ancestry(byId, here).find(e => e.space?.kind === 'settlement');
    if (!town) { return []; }
    const rooms = this.rooms(campaign.module.entities, byId, town.id);
    const out: NonNullable<Screen['services']> = [];
    for (const room of rooms) {
      for (const counter of TradeModel.at(world, room.id, names)) {
        for (const need of this.needs) {
          const has = counter.sells.filter(s => s.stock > 0 && this.need(world, s) === need).map(s => s.name);
          if (has.length && !out.some(o => o.need === need && o.who === counter.name)) {
            out.push({ need, who: counter.name, place: { id: room.id, name: room.name, kind: room.space!.kind },
              here: room.id === here, has });
          }
        }
      }
    }
    return out;
  }
  private static rooms(entities: Entity[], byId: Map<string, Entity>, town: string): Entity[] {
    return entities.filter(e => e.type === 'place' && e.space?.kind === 'room'
      && Spatial.ancestry(byId, e.id).some(a => a.id === town));
  }
}
