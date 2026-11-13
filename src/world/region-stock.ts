import { Draw } from './land/draw';
import { WrittenKyr } from './written-kyr';
import { RegionEcology } from './region-ecology';
import { Challenge } from './challenge';
import { RegionWeather } from './region-weather';
import type { Region, Site } from './region-writer';

// What a makers' work holds besides what its plan wrote: its rooms had been bare but for one keeper and two
// treasures, five to nine rooms with nothing in them (the owner, 31 October: interiors thin, secrets and treasure too
// few). Of the rooms no one lives in, past the way in, one is a den of the beasts of its country, and another
// holds what someone put by there later, found only by searching it. Drawn by the work, so the same world holds the
// same.
export class RegionStock {
  static work(region: Region, site: Site, at: { great: boolean; written: string[]; values: Record<string, string> }):
    string[] {
    if (at.great) { return []; }
    const rooms = this.bare(at.written), draw = new Draw(`${region.name}:${site.id}:stock`);
    if (rooms.length < 2) { return []; }
    const [den, cache] = draw.shuffle(rooms.slice(1));
    return [...this.den(region, site, den!), ...cache ? this.cache(site, cache, at.values) : []];
  }
  // The rooms no one lives in, in the order the plan wrote them (a room with a thing of its own in it is still one a
  // beast may den in, or something be put by in): read from the written Kyr parsed, its places and who is at or lairs
  // in each, not by matching its text (the owner, 2 November: structure read as structure).
  private static bare(written: string[]): string[] {
    const kyr = WrittenKyr.of(written), lived = kyr.lived();
    return kyr.rooms().filter(r => !lived.has(r));
  }
  private static den(region: Region, site: Site, room: string): string[] {
    const habitat = RegionEcology.habitat(region, site), found = RegionEcology.den(region, habitat);
    if (!found) { return []; }
    const beast = RegionEcology.varied(found, { habitat, climate: RegionWeather.climate(region) },
      new Draw(`${site.id}:denned`));
    const q = JSON.stringify, count = RegionStock.numbers(beast.count, Challenge.of(beast.species));
    // One is called as one ("the cave hound", not "the hounds" said of one: the candidate journey of 6 November).
    const label = count > 1 ? beast.label : beast.role.replace(/^(a|an) /, 'the ');
    return [`  Person ${site.id}_denned ${q(label)} at ${room} {`,
      `    Role ${q(`${beast.role}, denned in a room of ${site.name}`)}. Species ${beast.species}. Numbers ${count}. Level 1. Temperament territorial. Lair ${room}.`
        + (beast.variations ?? []).map(v => ` Variant ${v}.`).join(''),
      '  }'];
  }
  // How many den in a work's room: half a den's number, and never one alone where two are still within a first den's
  // danger (PL-07, the lead's decision of 13 November: a first-level warrior beat every denned single in a1 every
  // time, in two to four rounds and unhurt; placements.md). Company by number, never by the kind's numbers; one too
  // dangerous to have company (beyond the budget) stays alone, as the ecology sets it.
  static numbers(den: number, challenge: number): number {
    const half = Math.max(1, Math.ceil(den / 2));
    return half < 2 && 2 * challenge <= RegionEcology.budget ? 2 : half;
  }
  private static cache(site: Site, room: string, values: Record<string, string>): string[] {
    if (!values.cache) { return []; }
    const q = JSON.stringify, found = `${site.id}_cache_found`;
    return [`  Discovery ${found} ${q(`Behind a loose stone low in the wall, someone long after the makers put by ${values.cachename}, wrapped in rotten cloth.`)} {`,
      `    Found by searching ${room} ${q('A stone low in the wall is loose; behind it, wrapped in rotten cloth, something put by.')}.`, '  }',
      `  Item ${site.id}_cache ${q(values.cachename!)} is ${values.cache} at ${room} hidden until ${found}.`];
  }
}
