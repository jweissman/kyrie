import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { KnowledgeDoor } from '../../scripts/knowledge-door';
import type { Screen } from '../../src/ui/screen-types';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionRoads } from '../../src/world/region-roads';
import { RegionGeography } from '../../src/world/region-geography';
import { RegionTracts } from '../../src/world/region-tracts';
import { RegionZones } from '../../src/world/region-zones';
import { RegionSites } from '../../src/world/region-sites';
import { ModuleSource } from '../../src/lang';

// The map draws the character's knowledge, not the world's truth (OR-741's first slice, ways and destinations; the
// owner's playtest, 25 November: "The world map is still quite chaotic; things were unfolding that were nowhere near
// where I was, and I hadn't explored yet"). A fresh life's map had named every town of the country, drawn every road
// between them and offered a journey to each, since the country's roads are known to its folk (a journey may follow
// them: ChartModel.ways). Now it draws where the company is and has been, the ways from there and where they come to,
// what it has seen from afar, and what it has been told of; and a place told of by someone comes onto it.
// Three towns along the road east: Hythe, where the company stands; Ashby, where the fen road from Hythe comes to;
// Calder, past Ashby by the salt road, which Odo can tell of.
const reedlands = `
  Place shire "the Reedlands" is region.
  Place hythe "Hythe" is settlement within shire at 0, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place ashby "Ashby" is settlement within shire at 2, 0.
  Place cross "Ashby cross" is room within ashby at 0, 0 outdoors.
  Place calder "Calder" is settlement within shire at 4, 0.
  Place quay "Calder quay" is room within calder at 0, 0 outdoors.
  Passage fen_road "the fen road" is road between green and cross taking 2 hours.
  Passage salt_road "the salt road" is road between cross and quay taking 3 hours.
  Person reeve "Odo" at green { Role "the reeve of Hythe". Ancestry human. Peaceable. Pronouns he. }
  Entity calder_told: fact "Calder lies past Ashby, at the end of the salt road.".
  Initially Assert established(calder_told). Initially Assert leadsTo(calder_told, quay).
  Topic ask_east with reeve "Ask Odo what lies east" when true once {
    Says "'Ashby, and past it Calder, where the salt road ends,' he says.".
    On discuss { Assert knows(actor, calder_told). }
  }
  Company party "You" of 1 at green.
  Observe g at green when true "A green, and a road going east over the fen.".
  Goal false.`;
// Every id the map and its journeys name: its areas, the places within them, its marks, and every place a journey
// of the screen (the page's, the terminal's travel question, the runner's) sets out for.
const named = (s: Screen): Set<string> => new Set([...s.region?.areas.map(a => a.id) ?? [],
  ...Object.keys(s.region?.within ?? {}), ...s.region?.land?.marks.map(m => m.id) ?? [],
  ...[...s.destinations ?? [], ...s.roads ?? [], ...s.around ?? [], ...s.mapped ?? []].map(d => d.id)]);
const calder = ['t__calder', 't__quay'];

describe('a fresh life\'s map', () => {
  it('holds no place the company has not been to, seen the way to, or been told of', async () => {
    const t = await Tiny.start(reedlands), region = t.screen.region!;
    // Ashby is where the road the company stands at comes to; Calder, two roads off, nobody has told of.
    expect(region.areas.map(a => a.id).sort()).toEqual(['t__ashby', 't__hythe']);
    expect(calder.filter(id => named(t.screen).has(id))).toEqual([]);
    expect(region.edges.map(e => [e.from, e.to].sort().join('–'))).toEqual(['t__ashby–t__hythe']);
    expect(region.land!.towns).toEqual({ t__hythe: 'visited', t__ashby: 'heard' });
  });
  it('comes to hold a place someone tells of: on the map, heard of, and somewhere to set out for', async () => {
    const t = await Tiny.start(reedlands);
    await t.perform('t__ask_east');
    const region = t.screen.region!;
    expect(region.areas.map(a => a.id)).toContain('t__calder');
    expect(region.land!.towns.t__calder).toBe('heard');
    expect([...t.screen.destinations ?? [], ...t.screen.roads ?? []].map(d => d.id)).toContain('t__quay');
    // The salt road is not drawn for being told of the town at its end: its course is the company's to find.
    expect(region.edges.map(e => [e.from, e.to].sort().join('–'))).toEqual(['t__ashby–t__hythe']);
  });
  it('draws what it walks: gone down the road, the next road and the town at its end are on it', async () => {
    const t = await Tiny.start(reedlands);
    await t.perform('travel:t__cross');
    expect(t.where()).toBe('t__cross');
    const region = t.screen.region!;
    expect(region.areas.map(a => a.id).sort()).toEqual(['t__ashby', 't__calder', 't__hythe']);
    expect(region.edges.map(e => [e.from, e.to].sort().join('–')).sort()).toEqual(['t__ashby–t__calder',
      't__ashby–t__hythe']);
  });
});

// A road is named by what is known of it: a road named for the towns at its ends is seen by its way and its ground
// until the company stands on it and reads its milestone ("To the road between Mistshaw and Millholm" had named, from
// Millholm, a town nobody had told of: the lead's review of OR-810). Iscoed's and a1's roads, as Kyr.
describe('a road between two towns', () => {
  it('is seen by its way and ground, naming neither town, until its milestone is read', () => {
    const seen = /^the (east-west|north-south|north-east|north-west) road over the \w+$/;
    let roads = 0;
    for (const seed of ['iscoed', 'a1']) {
      const region = WorldAssembler.region(seed, [0, 0]), kyr = RegionRoads.lines(region).join('\n');
      for (const r of RegionGeography.roads(region).filter(x => !x.form)) {
        const room = new RegExp(`Place ${r.way} "[^"]*" is room within ${r.land} at 1, 1 seen as "([^"]*)" until ${r.way}_named\\.`)
          .exec(kyr);
        expect([r.way, room?.[1]]).toEqual([r.way, expect.stringMatching(seen)]);
        expect(kyr).toContain(`Observe ${r.way}_named_stone at ${r.way} as reading`);
        expect(kyr).toContain(`Initially Assert leadsTo(${r.way}_named, ${r.to.id}).`);
        // Its milestone's note is over once the company has been to both towns (the first day's load, FH-25).
        expect(kyr).toContain(`Rule ${r.way}_named_over when been(party, ${r.from.id}_green) and been(party, ${r.to.id}_green)`);
        roads++;
      }
    }
    expect(roads).toBeGreaterThan(3);
  });
  // A bridge, a ford, a wood or a pass told apart from its likes by the town it is nearer ("the bridge over the
  // Redwater by Brightbridge") is seen as what it is, told apart by its side of the country: by its axis and ground
  // alone, an aim to look along the bridge for a father had named "the east-west road over the woods" (OR-940).
  it('named for its river, wood or pass and a town, is seen as what it is, naming no town', () => {
    let roads = 0;
    for (const seed of ['iscoed', 'a1', 'kite']) {
      const region = WorldAssembler.region(seed, [0, 0]), kyr = RegionRoads.lines(region).join('\n');
      const towns = region.settlements.map(t => t.name);
      for (const r of RegionGeography.roads(region).filter(x => x.form)) {
        const room = new RegExp(`Place ${r.way} "([^"]*)" is room within ${r.land} at 1, 1 seen as "([^"]*)" until`).exec(kyr);
        if (!room) { continue; }
        expect([r.way, room[2]]).toEqual([r.way, expect.stringContaining(r.form!.name)]);
        expect(towns.filter(t => room[2]!.includes(t)).map(t => [r.way, t])).toEqual([]);
        roads++;
      }
    }
    expect(roads).toBeGreaterThan(0);
  });
});

// Wild country is named by what is known of it too (OR-812): a stretch of open country, or the country about a site,
// named for where it lies from a town ("the woods south-east of Windscar"), and the edge of a wood known by the town
// it faces ("the edge of Birchwood by Newmeet"), are seen by their land, or the side of the wild country they are on,
// until the company has seen that town (its green by day teaches <town>_why). Iscoed's and a1's country, as Kyr.
class Wild {
  static readonly place =
    /^ {2}Place (\w+) "([^"]*)" is (?:room|wilderness)[^"]*?(?: seen as "([^"]*)" until (\w+))?\.$/;
}
describe('wild country named for a town', () => {
  it('is seen by its land, naming no town, until that town is seen', () => {
    let named = 0;
    for (const seed of ['iscoed', 'a1']) {
      const region = WorldAssembler.region(seed, [0, 0]), towns = region.settlements;
      // (Read as Kyr: the stretches' places are declared as values, AX-04.)
      const places = ModuleSource.text([...RegionTracts.lines(region), ...RegionZones.lines(region),
        ...RegionSites.lines(region)]).join('\n').split('\n')
        .map(l => Wild.place.exec(l))
        .filter((m): m is RegExpExecArray => !!m);
      for (const [, id, name, seen = '', until] of places) {
        const town = towns.find(t => new RegExp(`(of|by) ${t.name}$`).test(name!));
        if (!town) { continue; }
        expect([id, until]).toEqual([id, `${town.id}_why`]);
        expect(towns.filter(t => seen.includes(t.name)).map(t => [id, t.name])).toEqual([]);
        named++;
      }
    }
    expect(named).toBeGreaterThan(10);
  });
  // A site's name as it is told says its land as the company knows it, by reference: "Black Keep: a walled keep on its
  // rise in the fen east of Sedgebrook", told at Brightford, had named Sedgebrook before it was seen (OR-942).
  it('is told, in a site\'s name, as the company knows the land, naming no town', () => {
    let told = 0;
    for (const seed of ['iscoed', 'a1']) {
      const region = WorldAssembler.region(seed, [0, 0]), towns = region.settlements;
      for (const line of RegionSites.lines(region).filter(l => /^ {2}Discovery \w+_named /.test(l))) {
        expect(towns.filter(t => new RegExp(`(of|around) ${t.name}\\b`).test(line)).map(t => [line, t.name])).toEqual([]);
        told += Number(/\{\w+_land\}/.test(line));
      }
    }
    expect(told).toBeGreaterThan(0);
  });
});

describe('the map\'s reads of the world', () => {
  // Through the knowledge door (src/ui/known-country.ts), not of the world: 35 and 33 before the map was
  // drawn from what the company knows (25 November), each only to fall (test/small/knowledge-door).
  it('fall, the company\'s knowledge of the country asked of the door', () => {
    const kept = KnowledgeDoor.read(), now = KnowledgeDoor.count('.', kept.manifest);
    expect(KnowledgeDoor.total({ m: now['src/ui/chart-model.ts'] ?? {} })).toBeLessThanOrEqual(17);
    expect(KnowledgeDoor.total({ m: now['src/ui/itinerary.ts'] ?? {} })).toBeLessThanOrEqual(24);
    expect(kept.manifest['src/ui/known-country.ts']).toBeTruthy();
  });
});
