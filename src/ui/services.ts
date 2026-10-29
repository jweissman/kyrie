import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { Spatial } from '../spatial';
import { TradeModel } from './trade-model';
import type { Screen } from './screen-types';

// Where in the settlement the company is in it can find what it needs (Mission 18, the owner's fifth priority:
// rations, light, rope and a crowbar found from a typical start without searching blindly through many shops): for
// each need, who meets it and where, nearest first. Read from who is where now and what they sell, never from what a
// settlement was meant to have; somewhere shut for the night is not listed until it opens.
export class Services {
  static readonly needs: [string, RegExp][] = [
    ['Food', /^(ration|bread|pie|gingerbread|eels|honey|cheese|ale)/i],
    ['Light', /(torch|candle|lantern|lamp)/i],
    ['Gear', /(rope|crowbar|sack|chalk|bedroll|waterskin|pole|spikes|piton|shovel|blanket|net)/i],
    ['Remedies', /(herb|bandage|antidote|poultice|potion|salve|remed)/i],
  ];
  static of(campaign: Campaign, names: Map<string, string>): NonNullable<Screen['services']> {
    const world = campaign.world, here = world.one('at', campaign.playerActor ?? 'party');
    const byId = new Map(campaign.module.entities.map(e => [e.id, e]));
    const town = here && Spatial.ancestry(byId, here).find(e => e.space?.kind === 'settlement');
    if (!town) { return []; }
    const rooms = this.rooms(campaign.module.entities, byId, town.id);
    const out: NonNullable<Screen['services']> = [];
    for (const room of rooms) {
      for (const counter of TradeModel.at(world, room.id, names)) {
        for (const [need, re] of this.needs) {
          const has = counter.sells.filter(s => re.test(s.name) && s.stock > 0).map(s => s.name);
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
