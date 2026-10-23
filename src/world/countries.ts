import countries from '../../data/adventures/countries.json';
import type { Side } from './land/borders';
import type { Region } from './region-writer';

// An authored country a generated world may hold (data/adventures/countries.json): its module, the room the road
// across the march comes into, an entity only it has, what it is called and what kind of country it is, the side of a
// generated country it lies on, and the terrains of the countries it may lie beside. Each is placed once in a world.
export interface Country {
  id: string; bundle: string; entry: string; marker: string; name: string; terrain: string; side: Side;
  beside: string[];
}
export class Countries {
  static readonly list = countries.countries as Country[];
  // The country that fits beyond a march of a country of this terrain, of those not yet placed.
  static fits(terrain: string, side: Side, placed: (c: Country) => boolean): Country | undefined {
    return this.list.find(c => c.side === side && c.beside.includes(terrain) && !placed(c));
  }
  // What the folk of the first region say lies beyond it, where an authored country will.
  static beyond(region: Region): Region['beyond'] {
    const beyond = { ...region.beyond }, sides = Object.keys(beyond) as Side[];
    for (const side of sides) {
      const c = this.fits(region.terrain, side, () => false);
      if (c) { beyond[side] = { name: c.name, terrain: c.terrain }; }
    }
    return beyond;
  }
}
