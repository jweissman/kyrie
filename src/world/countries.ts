import countries from '../../data/adventures/countries.json';
import type { Side } from './land/borders';
import type { Region } from './region-writer';

// An authored country a generated world may hold (data/adventures/countries.json): its module, the room the road
// across the march comes into, an entity only it has, what it is called and what kind of country it is, the side of a
// generated country it lies on, and the terrains of the countries it may lie beside. Each is placed once in a world;
// of those among one kind (the independent adventures), a world holds only the one its seed chooses, so that a world
// is not walled in by authored countries and its own go on beyond.
export interface Country {
  id: string; bundle: string; entry: string; marker: string; name: string; terrain: string; side: Side;
  beside: string[]; among?: string;
  // What the folk of the first region say of it ({keeper}: the innkeeper of the town the road leaves from), and what
  // the company knows of it once told.
  rumour?: string; heard?: string;
}
export class Countries {
  static readonly list = countries.countries as Country[];
  // The country that fits beyond a march of a country of this terrain, of those not yet placed and this world holds.
  static fits(terrain: string, side: Side, placed: (c: Country) => boolean, seed: string): Country | undefined {
    return this.list.find(c => c.side === side && c.beside.includes(terrain) && !placed(c)
      && this.held(c, seed, terrain));
  }
  // Whether a world whose first country is of this terrain holds a country: always, unless it is among a kind of which
  // the seed chose another of those that fit it.
  static held(c: Country, seed: string, terrain: string): boolean {
    if (!c.among) { return true; }
    const kin = this.list.filter(o => o.among === c.among && o.beside.includes(terrain));
    if (!kin.includes(c)) { return false; }
    let hash = 2166136261;
    for (const ch of `${seed}:${c.among}`) { hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619); }
    return kin[(hash >>> 0) % kin.length] === c;
  }
  // What the folk of the first region say lies beyond it, where an authored country will.
  static beyond(region: Region, seed: string): Region['beyond'] {
    const beyond = { ...region.beyond }, sides = Object.keys(beyond) as Side[];
    for (const side of sides) {
      const c = this.fits(region.terrain, side, () => false, seed);
      const told = c?.rumour ? { rumour: c.rumour, heard: c.heard } : {};
      if (c) { beyond[side] = { name: c.name, terrain: c.terrain, ...told }; }
    }
    return beyond;
  }
}
