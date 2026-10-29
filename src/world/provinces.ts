import type { Cover } from './land/land-cover';
import { Gates, type Gate } from './land/gates';
import { Countries, type Country } from './countries';
import { RegionGeography } from './region-geography';
import type { Region } from './region-writer';
import type { BundleSource } from '../campaign/bundle-source';

// The provinces of a world's first country: authored adventures installed as parts of it rather than as countries of
// their own beyond its marches (Mission 18's Gate B). Each has a way in on the country's land, a little in from the
// side its folk have always said it lies on, on the kind of land it is, with a road to it from the nearest town; the
// adventure itself is installed within the country the first time a company stands there (Frontier.province), as a
// country beyond a march is the first time one stands at its march-stone.
// region: the adventure's own region, as installed (its module's id and its region's), drawn at the way in.
export interface Province { country: string; name: string; gate: Gate; region?: string }
export class Provinces {
  // The land each kind of country is found on, where its own entry does not say.
  static readonly lands: Record<string, Cover[]> = { mountain: ['fell', 'peak', 'heath'], hills: ['heath', 'meadow', 'fell'],
    marsh: ['fen', 'meadow'], frost: ['heath', 'fell'], forest: ['wood'], desert: ['heath', 'meadow'] };
  static situate(region: Region): Province[] {
    const atlas = RegionGeography.atlas(region), built = new Set(atlas.ways.flatMap(w => w.cells));
    const taken = [...atlas.borders.map(b => b.cell),
      ...region.sites.flatMap(w => w.cell === undefined ? [] : [w.cell])];
    const wanted = Countries.provinces.map(c => ({ id: c.id, side: c.side,
      covers: c.covers ?? this.lands[c.terrain] ?? [] }));
    return Gates.make(atlas.land, { seats: atlas.seats, built, taken }, wanted)
      .map(gate => ({ country: gate.id, name: this.country(gate.id).name, gate }));
  }
  static country(id: string): Country { return Countries.provinces.find(c => c.id === id)!; }
  // Each province's own region as it will be installed, read from its module's manifest (what it exports as region).
  static async regions(provinces: Province[], base: BundleSource): Promise<Province[]> {
    return Promise.all(provinces.map(async p => {
      const manifest = JSON.parse(await base.read(base.resolve(`data/adventures/${this.country(p.country).bundle}`))) as
        { exports?: Record<string, string> };
      const own = manifest.exports?.region;
      return own ? { ...p, region: `${this.install(p.country)}__${own}` } : p;
    }));
  }
  // The room a province is entered by, in its country; the module installed for it; and the place it lies within.
  static room(id: string): string { return `gate_${id}`; }
  static install(id: string): string { return `p${id}`; }
}
