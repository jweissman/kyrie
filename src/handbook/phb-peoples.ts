import tongues from 'languages';
import peoples from '../../data/generation/tables/peoples.json';
import folk from '../../data/generation/scenes/folk.json';
import { Canon } from '../canon/canon';
import { CommonNames } from '../world/common-names';
import { PlaceNames } from '../world/place-names';

interface Settled { majority: string; others: string[] }
// What the encyclopedia tells of a people beside its qualities, as a stat block (the owner, 18 November, OR-83: "the
// encyclopedia entries we show for ancestries and classes should be a bit deeper ... Ancestries especially seem like
// they need a SRD style stat block"): its build and ages as written, and what the world is drawn from: the country
// it is the folk of and the country it lives among others in (the region tables), the tongue its places are named in
// (see PlaceNames), and names its children are given.
export class PeopleFacts {
  static of(id: string): [string, string][] {
    const a = Canon.ancestries[id]!, lives = this.lives(id), tongue = this.tongue(id), names = this.names(id);
    return [...a.build ? [['Build', a.build] as [string, string]] : [], ...a.ages ? [['Ages', a.ages] as [string, string]] : [],
      ...lives, ...tongue ? [['Tongue', tongue] as [string, string]] : [], ...names ? [['Names', names] as [string, string]] : []];
  }
  // The country it is the folk of, and where it lives among another folk, by terrain.
  private static lives(id: string): [string, string][] {
    const groups = Object.entries(peoples.regionPeoples.groups as Record<string, Settled[]>);
    const own = groups.filter(([, g]) => g.some(x => x.majority === id)).map(([t]) => t);
    const among = groups.filter(([t, g]) => !own.includes(t) && g.some(x => x.others.includes(id))).map(([t]) => t);
    return [...own.length ? [['Folk of', this.listed(own)] as [string, string]] : [],
      ...among.length ? [['Lives among others in', this.listed(among)] as [string, string]] : []];
  }
  private static tongue(id: string): string | undefined {
    const own = PlaceNames.tongues[id];
    if (!own) { return undefined; }
    const name = tongues.getDictionary(own).name;
    return CommonNames.lexicon.heartland.includes(id) ? `Common; ${name} in what the old kingdom named` : name;
  }
  private static names(id: string): string | undefined {
    const given = (folk.given as Record<string, Record<string, string[]>>)[id];
    return given ? ['she', 'he', 'they'].flatMap(k => (given[k] ?? []).slice(0, 3)).join(', ') : undefined;
  }
  private static listed(terrains: string[]): string {
    const words = terrains.map(t => `${t} country`);
    return words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words.at(-1)}` : words[0]!;
  }
}
