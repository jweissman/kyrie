import atlas from '../../data/imbar/atlas.json';
import type { DeemValue } from 'deem';
import type { Side } from './land/borders';
import type { Region } from './region-writer';

// A country of the strategic atlas (data/imbar/atlas.json): what it is, as facts the lower generators read, in the
// worlds the atlas is for. Westernesse's, not the kernel's: a country, a reeve and a salt-tax are this setting's words.
export interface AtlasCountry {
  id: string; cell: [number, number]; name: string; terrain: string; ancestry?: string; domain?: string;
  shore?: Side; port?: boolean; arts?: string[]; goings?: string[]; exclude?: string[];
  livelihoods?: Record<string, string>;
  settlements?: string[];
  facts: Record<string, string>; neighbours?: Partial<Record<Side, string>>;
}
// Each world listed draws the atlas's countries at their cells: the same countries, named and made as the atlas says,
// each with its own seed's detail (its people, its minor places, its sites). Every other world is drawn as before.
export class StrategicAtlas {
  static readonly worlds: string[] = atlas.worlds;
  static readonly countries = atlas.countries as unknown as AtlasCountry[];
  // The atlas's country at a cell of a world, if the world is one of the atlas's.
  static at(seed: string, x: number, y: number): AtlasCountry | undefined {
    if (!this.worlds.includes(seed)) { return undefined; }
    return this.countries.find(c => c.cell[0] === x && c.cell[1] === y);
  }
  static byId(id: string | undefined): AtlasCountry | undefined { return this.countries.find(c => c.id === id); }
  // What the Deem `region` generator is given for a country of the atlas: its kind of country, people and faith.
  static given(seed: string, x: number, y: number): Record<string, DeemValue> {
    const c = this.at(seed, x, y);
    if (!c) { return {}; }
    return { terrain: c.terrain, ...c.ancestry ? { ancestry: c.ancestry } : {},
      ...c.domain ? { domain: c.domain } : {} };
  }
  // A country drawn where the atlas holds its cell: called its own name, its land falling to the sea where it says.
  // Its drawn name's parts are dropped, so that its neighbours call it what it is called.
  static shaped(region: Region, seed: string, [x, y]: [number, number]): Region {
    const c = this.at(seed, x, y);
    if (!c) { return region; }
    const shaped: Region = { ...region, name: c.name, country: c.id, ...c.shore ? { shore: c.shore } : {} };
    delete shaped.feature; delete shaped.affix; delete shaped.gloss; delete shaped.tongue;
    return shaped;
  }
  // What a settlement of the country lives by, from what lies around it: the country's own, where the atlas says.
  static livelihoods(region: Region): Record<string, string> | undefined {
    return this.byId(region.country)?.livelihoods;
  }
  // How the country's land is laid: the side of it that falls to the sea, if one does, and whether its chief town is
  // its port, standing on a harbour where its land has one.
  static land(region: Region): { shore?: Side; port?: true } {
    return { ...region.shore ? { shore: region.shore } : {}, ...this.byId(region.country)?.port ? { port: true } : {} };
  }
  // What is going on in the country that is its own (data/scenarios/<id>.scenario.json): placed in it whenever it is
  // drawn, before anything drawn at random, as a herald is.
  static goings(region: Region): string[] {
    return (this.byId(region.country)?.goings ?? []).map(id => `data/scenarios/${id}.scenario.json`);
  }
  // The library's goings-on a country of the atlas does not hold: those its own would contradict (a second drover).
  static exclude(region: Region): string[] { return this.byId(region.country)?.exclude ?? []; }
  // The arts of the makers whose works are in the country, where the atlas says.
  static arts(region: Region): string[] | undefined { return this.byId(region.country)?.arts; }
  // The country named as the atlas names it: its chief settlements (a city of the canon keeps the canon's name).
  static named(region: Region): Region {
    const c = this.byId(region.country);
    if (!c) { return region; }
    const settlements = region.settlements.map((s, i) => {
      const name = c.settlements?.[i];
      if (!name || s.seat) { return s; }
      const named = { ...s, name };
      delete named.feature; delete named.affix; delete named.gloss; delete named.tongue;
      return named;
    });
    return { ...region, name: c.name, settlements };
  }
  // The country's facts as Kyr: an entity for it, each fact of it said, and the countries beside it by side.
  static lines(region: Region): string[] {
    const c = this.byId(region.country);
    if (!c) { return []; }
    const q = JSON.stringify;
    return [`  Entity country_${c.id}: fact ${q(`${c.name} is ${c.facts.polity ?? 'a country'}.`)}.`,
      ...Object.entries(c.facts).filter(([k]) => k !== 'polity').map(([k, text]) =>
        `  Entity country_${c.id}_${k}: fact ${q(`${c.name}: ${text}.`)}.`),
      ...Object.entries(c.neighbours ?? {}).flatMap(([side, id]) => {
        const n = this.byId(id);
        return n ? [`  Entity country_${c.id}_${side}: fact ${q(`${side[0]!.toUpperCase()}${side.slice(1)} of `
          + `${c.name} is ${n.name}, ${n.facts.polity}.`)}.`] : [];
      })];
  }
}
