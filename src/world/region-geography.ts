import { Terrain } from './land/terrain';
import type { Atlas, Way } from './land/atlas';
import type { Landmark } from './region-land';
import type { Region, Settlement, Site } from './region-writer';

type Spot = [number, number];
// A road between two settlements and the land it is known by: the river it fords or bridges, the pass it climbs,
// the wood it runs through. Its way is the stretch of country between, where travellers meet and are waylaid.
export interface Road { from: Settlement; to: Settlement; land: string; way: string; spot: Spot; form?: Landmark;
  route: Way }
// Where a site stands: the wild country (or the stretch of open country) it is in, its cell, and the settlement
// nearest it, which knows it.
export interface Seat { site: Site; land: string; spot: Spot; town: Settlement; form?: Landmark }

// Where everything in a generated region lies, from its atlas (see Atlases): the settlements on the cells people
// settled, the roads between them as the land let them run, the wild country, and the sites in it. Positions on the
// region's chart are the cells themselves.
export class RegionGeography {
  static readonly country: Record<string, string> = { forest: 'woods', marsh: 'fen', mountain: 'fells', frost: 'snowfields' };
  static readonly looks: Record<string, string> = {
    cave: 'A dark mouth opens in the hillside.', barrow: 'A long grassed mound with a stone-lined entrance.',
    ruin: 'Fallen walls in rough grass; someone built here once.', tower: 'A lone tower stands above the land.',
    grove: 'Old trees crowd close, and the light under them is green.', bog: 'Black water between tussocks; the path is a line of stakes.',
    mine: 'Spoil heaps and a timbered adit.', sinkhole: 'Grass runs to the edge of a round pit in the ground.' };
  static atlas(region: Region): Atlas {
    if (!region.atlas) { throw new Error(`${region.name} has no atlas`); }
    return region.atlas;
  }
  static spot(region: Region, cell: number): Spot {
    const land = this.atlas(region).land;
    return [Terrain.x(land, cell), Terrain.y(land, cell)];
  }
  static town(region: Region, i: number): Spot { return this.spot(region, region.settlements[i]!.cell!); }
  static roads(region: Region): Road[] {
    const atlas = this.atlas(region);
    return atlas.ways.map(way => {
      const from = region.settlements[way.start]!, to = region.settlements[way.end]!;
      const middle = way.cells[Math.floor(way.cells.length / 2)]!, form = this.form(region, way);
      return { from, to, land: `${from.id}_${to.id}_land`, way: `${from.id}_${to.id}_way`,
        spot: this.spot(region, middle), route: way, ...form ? { form } : {} };
    });
  }
  // What a road is known by: the river it crosses (the largest, if more than one), the pass it climbs, or the wild
  // country most of it runs through.
  static form(region: Region, way: Way): Landmark | undefined {
    const atlas = this.atlas(region), crossing = way.crossings[0];
    const river = crossing && atlas.rivers[crossing.river];
    if (river) { return { id: 'river', form: 'river', ...river.naming }; }
    if (way.over) { return { id: 'pass', form: 'pass', ...way.over }; }
    const wood = atlas.zones.find(z => z.wild === 'wood' && way.cells.filter(c => z.cells.includes(c)).length * 2
      >= way.cells.length);
    return wood ? { id: 'wood', form: 'wood', ...wood.naming } : undefined;
  }
  static seats(region: Region): Seat[] {
    return region.sites.filter(site => site.cell !== undefined).map(site => ({ site, town: this.near(region, site),
      spot: this.spot(region, site.cell!), land: site.zone ?? `${site.id}_land` }));
  }
  // The settlement each site is reached from: the one it names, or the nearest.
  static near(region: Region, site: Site): Settlement {
    const named = region.settlements.find(s => s.id === site.near);
    if (named || site.cell === undefined) { return named ?? region.settlements[0]!; }
    const land = this.atlas(region).land;
    return [...region.settlements].sort((a, b) => Terrain.distance(land, a.cell!, site.cell!)
      - Terrain.distance(land, b.cell!, site.cell!))[0]!;
  }
  // Which way one spot lies from another, as people say it: "north", "south-east".
  static compass(from: Spot, to: Spot): string {
    const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
    const ns = dy < 0 ? 'north' : dy > 0 ? 'south' : '', ew = dx < 0 ? 'west' : dx > 0 ? 'east' : '';
    if (!ns && !ew) { return 'here'; }
    if (Math.abs(dx) > 2 * Math.abs(dy)) { return ew; }
    if (Math.abs(dy) > 2 * Math.abs(dx)) { return ns; }
    return `${ns}-${ew}`;
  }
  static terrain(t: string): string {
    return ({ forest: 'forest', marsh: 'fen', mountain: 'upland', frost: 'frozen', desert: 'desert' } as Record<string, string>)[t] ?? t;
  }
  // What a name means, when it was given in the folk's own tongue: " The name is Westron for “cold hill”."
  static meaning(place: { gloss?: string; tongue?: string }): string {
    if (!place.gloss || !place.tongue) { return ''; }
    return ` The name is ${place.tongue}${place.tongue === 'Aenean' ? ', the old tongue,' : ''} for “${place.gloss}”.`;
  }
  // Where a settlement stands, said in one breath: "It grew up beside the Albeex, looking out over the Seolforclaene,
  // with the fells at its back." Told with its description, so the land is met before it is crossed.
  static placement(region: Region, i: number, shore = true): string {
    const atlas = this.atlas(region), seat = atlas.seats[i], s = region.settlements[i];
    if (!seat || !s) { return ''; }
    const near = [seat.cell, ...Terrain.neighbours(atlas.land, seat.cell)];
    const rivers = atlas.rivers.filter(r => r.cells.some(c => near.includes(c))).map(r => r.naming.name);
    const lake = atlas.lakes.find(l => l.cells.some(c => near.includes(c)));
    const where = rivers.length > 1 ? `where the ${rivers[1]} runs into the ${rivers[0]}`
      : rivers.length ? `beside the ${rivers[0]}` : '';
    const about = [lake ? `looking out over the ${lake.naming.name}` : '',
      seat.lie.includes('fells') ? 'with the fells at its back' : ''].filter(Boolean);
    const stands = where ? `It grew up ${where}` : about.length ? 'It stands' : '';
    const coast = !shore ? '' : seat.lie.includes('harbour') ? 'Boats are drawn up where the shore gives a landing. '
      : seat.lie.includes('coast') ? 'The sea is close; you can smell it. ' : '';
    // "It stands with the fells at its back", without a pause; after where it grew up, each thing about it is one.
    const said = where ? [stands, ...about].join(', ') : about.length ? `${stands} ${about.join(', ')}` : '';
    return `${said ? `${said}. ` : ''}${coast}`;
  }
}
