import { Draw } from './land/draw';
import { RegionGeography, type Road } from './region-geography';
import { RegionRoads } from './region-roads';
import { Roads } from './land/roads';
import type { Cover } from './land/land-cover';
import { RegionZones } from './region-zones';
import { RegionBorders } from './region-borders';
import { RegionSites } from './region-sites';
import { RegionWeather } from './region-weather';
import { RegionSights } from './region-sights';
import { Provinces } from './provinces';
import { Vantage } from './vantage';
import type { Region } from './region-writer';
import tables from '../../data/generation/scenes/tracts.json';

interface Lie { name: string; zoned: string; minutes: number; told: string[] }
// A place that stands on a cell of the land, the room the company goes into from the open country there, and what
// it looks like from afar (none: it is found only by coming to it).
export interface Standing { id: string; room: string; cell: number; afar?: string }
type Pt = [number, number];

// The open country of a generated region, a stretch to each cell of its land (Mission 18, the owner's correction:
// leaving a town simply to explore, a persistent position on intelligible land, moving into the country next to it
// and toward what can be seen). Each stretch is a place, named for its land and where it lies from the nearest town,
// and told as that land is; from each, the way across country into each of the six stretches about it, as long as its
// land is hard going, longer over a river; into whatever stands there (a town, a site, a landmark of the wild country,
// a march-stone); and onto the road that crosses it. From any of them the company can look out over the country (not
// in the dark, and in haze not far): the land about is known from then on (see LandModel.explored), further from high
// ground and for someone who knows how to look; and what stands up from the land within sight is seen, each thing
// somewhere to set out toward. A cave, a grove, a clearing is found only by coming to it.
export class RegionTracts {
  static readonly table = tables as unknown as { land: Record<string, Lie>; river: string; road: string; rises: string;
    falls: string; town: string; survey: string; surveyHaze: string; surveyFar: string };
  static readonly open = 'open_country';
  static readonly odd: Pt[] = [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]];
  static readonly even: Pt[] = [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
  static id(cell: number): string { return `t${cell}`; }
  // The cells about a cell, the land set out in hexes, every other row half a cell to the east.
  static neighbours(cell: number, W: number, H: number): number[] {
    const x = cell % W, y = Math.floor(cell / W);
    return (y % 2 ? this.odd : this.even).map(([dx, dy]) => [x + dx, y + dy])
      .filter(([a, b]) => a! >= 0 && b! >= 0 && a! < W && b! < H).map(([a, b]) => b! * W + a!);
  }
  // The cells of the land that can be walked: all but the sea and the lakes.
  static cells(region: Region): number[] {
    return RegionGeography.atlas(region).land.cover.flatMap((c, i) => c === 'sea' || c === 'lake' ? [] : [i]);
  }
  // Every place standing on a cell, the room it is gone into by, and how it looks from afar if it can be seen.
  static standing(region: Region): Standing[] {
    const atlas = RegionGeography.atlas(region), out: Standing[] = [];
    for (const s of region.settlements.filter(t => t.cell !== undefined)) {
      out.push({ id: s.id, room: `${s.id}_green`, cell: s.cell!, afar: s.name });
    }
    for (const w of region.sites.filter(x => x.cell !== undefined)) {
      const look = RegionSites.look(w, region), high = /tower|ruin|wall|keep|spire|hall|gate|arch/i.test(look);
      out.push({ id: w.id, room: w.id, cell: w.cell!, ...high ? { afar: look } : {} });
    }
    for (const l of atlas.zones.flatMap(z => RegionZones.landmarks(region, z))) {
      out.push({ id: l.id, room: l.id, cell: l.cell, ...l.view ? { afar: l.name } : {} });
    }
    for (const b of atlas.borders) {
      out.push({ id: RegionBorders.room(b), room: RegionBorders.room(b), cell: b.cell });
    }
    for (const p of region.provinces ?? []) {
      out.push({ id: Provinces.room(p.country), room: Provinces.room(p.country), cell: p.gate.cell });
    }
    return out;
  }
  static lines(region: Region): string[] {
    const atlas = RegionGeography.atlas(region), W = atlas.land.width, q = JSON.stringify;
    const cells = new Set(this.cells(region)), centre = [...cells][Math.floor(cells.size / 2)] ?? 0;
    const zoneOf = new Map(atlas.zones.flatMap(z => z.parts.flat().map(c => [c, z.id] as [number, string])));
    return [`  Place ${this.open} ${q(`the open country of ${region.name}`)} is wilderness within region at ${centre % W}, `
      + `${Math.floor(centre / W)}.`,
    '  Relation tract(place). Relation surveyed(group, place). Relation surveyedWell(group, place).',
    '  Relation surveyedDim(group, place).', ...this.surveying(region),
    ...[...cells].flatMap(c => this.stretch(region, c, { parent: zoneOf.get(c) ?? this.open, cells })),
    ...this.links(region, cells), ...this.sightings(region)];
  }
  // One stretch: its place, how it is told, and its ways into the stretches about it.
  private static stretch(region: Region, c: number, at: { parent: string; cells: Set<number> }): string[] {
    const land = RegionGeography.atlas(region).land, q = JSON.stringify, id = this.id(c);
    return [`  Place ${id} ${q(this.name(region, c))} is room within ${at.parent} at ${c % land.width}, `
      + `${Math.floor(c / land.width)} outdoors.`, `  Initially Assert tract(${id}).`,
    `  Observe ${id}_scene at ${id} as fixture when true ${q(this.told(region, c))}.`,
    ...this.neighbours(c, land.width, land.height).filter(m => m > c && at.cells.has(m)).map(n => `  Passage tw${c}_${n} `
      + `"the way across country" is overland between ${id} and ${this.id(n)} taking ${this.minutes(region, c, n)} minutes.`)];
  }
  // From a stretch into whatever stands on it, and onto the road that crosses it.
  private static links(region: Region, cells: Set<number>): string[] {
    const lines = this.standing(region).filter(s => cells.has(s.cell)).map(s => `  Passage tl_${s.room} `
      + `"the way across country" is overland between ${this.id(s.cell)} and ${s.room} taking 10 minutes.`);
    for (const r of RegionGeography.roads(region)) {
      const ends = new Set([r.from.cell, r.to.cell]);
      for (const c of new Set(r.route.cells)) {
        if (cells.has(c) && !ends.has(c)) {
          lines.push(`  Passage tr${c}_${r.way} ${JSON.stringify(this.off(region, r, c))} is overland between `
            + `${this.id(c)} and ${r.way} taking 5 minutes.`);
        }
      }
    }
    return lines;
  }
  // A way off a road into the stretch it crosses, told by where on the road it leaves it: how far along it from the
  // town it is nearer ("the road, an hour out of Wychmaere"). They had all been "the road", and on a road through a
  // wood its seven ways off into the wood read alike to the letter, "To among the trees of Beorquudu" (NAV-04).
  static off(region: Region, road: Road, cell: number): string {
    const cover = RegionGeography.atlas(region).land.cover, cells = road.route.cells, i = cells.indexOf(cell);
    const out = this.walked(cells.slice(1, i + 1), cover), back = this.walked(cells.slice(i, -1), cover);
    const [town, along] = back < out ? [road.to, back] : [road.from, out];
    return `the road, ${this.span(along)} out of ${town.name}`;
  }
  // How long a road takes over the cells it crosses, as the land they are goes (see Roads.hours).
  private static walked(cells: number[], cover: Cover[]): number {
    return cells.reduce((n, c) => n + Roads.hours[cover[c]!], 0);
  }
  // A road's length in the hours a road is walked in (a cell of open ground is half an hour: see RegionRoads), as a
  // traveller says it.
  private static span(hours: number): string {
    const halves = Math.max(1, Math.round(hours * RegionRoads.minutesPerHour / 30)), whole = Math.floor(halves / 2);
    const and = halves % 2 ? ' and a half' : '';
    return !whole ? 'half an hour' : whole === 1 ? `an hour${and}` : `${this.counts[whole] ?? whole}${and} hours`;
  }
  static readonly counts = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
    'twelve'];
  // Looking out over the country, not in the dark; in haze or rain, the nearer land only. Someone who knows how to
  // look, or has a glass, sees further (see LandModel.explored).
  private static surveying(region: Region): string[] {
    const q = JSON.stringify, t = this.table, hazy = this.hazy(region);
    const clear = hazy.map(k => ` and not state(sky, weather_${k})`).join('');
    const lines = ['  Action survey(actor: group, site: place) "Look out over the country from here" {',
      `    Requires able(actor) and company(actor) and at(actor, site) and tract(site) and not dark()${clear}`
        + ' and not surveyed(actor, site).',
      '    Time 20 minutes.', '    On success { Assert surveyed(actor, site). }', `    Result ${q(t.survey)}.`, '  }',
      '  Entity spyglass: itemkind "Spyglass".',
      '  Rule surveyed_well when surveyed(party, ?t) and (capable(party, wayfinding) or holding(party, spyglass))'
        + ' and not surveyedWell(party, ?t) { Assert surveyedWell(party, ?t). }'];
    if (!hazy.length) { return lines; }
    const haze = hazy.map(k => `state(sky, weather_${k})`).join(' or ');
    return [...lines, '  Action survey_haze(actor: group, site: place) "Look out over the country, as far as the weather lets you" {',
      `    Requires able(actor) and company(actor) and at(actor, site) and tract(site) and not dark() and (${haze})`
        + ' and not surveyed(actor, site) and not surveyedDim(actor, site).',
      '    Time 10 minutes.', '    On success { Assert surveyedDim(actor, site). }', `    Result ${q(t.surveyHaze)}.`, '  }'];
  }
  private static hazy(region: Region): string[] {
    if (!region.calendar) { return []; }
    return RegionWeather.kinds(region, region.calendar).filter(k => RegionSights.haze.includes(k));
  }
  // What stands up from the land and is seen from each stretch looked out from, by the lie of the land between (see
  // Vantage): a few, nearest first, each known from then on and somewhere to set out toward.
  private static sightings(region: Region): string[] {
    const land = RegionGeography.atlas(region).land, q = JSON.stringify, lines: string[] = [];
    const afar = this.standing(region).filter(s => s.afar), seen = new Set<string>();
    for (const c of this.cells(region).filter(x => !['wood', 'fen'].includes(land.cover[x]!))) {
      const there = afar.filter(s => s.cell !== c).map(s => ({ id: s.id, cell: s.cell }));
      const sights = Vantage.seen(land, c, there, { most: 3 });
      for (const s of sights) {
        const what = afar.find(a => a.id === s.id)!, fact = `${s.id}_sighted`;
        if (!seen.has(fact)) {
          seen.add(fact);
          lines.push(`  Entity ${fact}: fact ${q(`${this.upper(what.afar!)}, seen across the open country.`)}.`,
            `  Initially Assert leadsTo(${fact}, ${what.room}).`);
        }
        lines.push(`  Observe ${this.id(c)}_saw_${s.id} at ${this.id(c)} as sign when surveyed(party, ${this.id(c)})`
          + ` ${q(`${this.upper(s.bearing)}, ${Vantage.said(s)}: ${what.afar}.`)} teaches ${fact}.`);
      }
    }
    return lines;
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // How long the way from one stretch into the next takes: as the harder of the two lands goes, longer over water.
  static minutes(region: Region, a: number, b: number): number {
    const atlas = RegionGeography.atlas(region), land = atlas.land;
    const rivers = new Set(atlas.rivers.flatMap(r => r.cells));
    const going = Math.max(this.lie(land.cover[a]!).minutes, this.lie(land.cover[b]!).minutes);
    return going + (rivers.has(a) !== rivers.has(b) ? 20 : 0);
  }
  private static lie(cover: string): Lie { return this.table.land[cover] ?? this.table.land.meadow!; }
  // A stretch's name: its land, and where it lies from the nearest town within a day's walk, or in what wild country.
  static name(region: Region, cell: number): string {
    const atlas = RegionGeography.atlas(region), W = atlas.land.width, lie = this.lie(atlas.land.cover[cell]!);
    const town = region.settlements.find(s => s.cell === cell);
    if (town) { return `the country about ${town.name}`; }
    const zone = atlas.zones.find(z => z.parts.some(p => p.includes(cell)));
    if (zone) { return lie.zoned.replace('{zone}', zone.naming.name); }
    const near = this.nearest(region, cell);
    if (!near || near.distance > 5) { return lie.name; }
    const [x, y] = this.xy(cell, W), [nx, ny] = this.xy(near.cell, W);
    return `${lie.name} ${Vantage.bearing(x - nx, y - ny)} of ${near.name}`;
  }
  private static xy(c: number, W: number): Pt { return [c % W, Math.floor(c / W)]; }
  private static nearest(region: Region, cell: number): { name: string; cell: number; distance: number } | undefined {
    const W = RegionGeography.atlas(region).land.width, [x, y] = this.xy(cell, W);
    return region.settlements.filter(s => s.cell !== undefined).map(s => {
      const [sx, sy] = this.xy(s.cell!, W);
      return { name: s.name, cell: s.cell!, distance: Math.hypot(x - sx, y - sy) };
    }).sort((a, b) => a.distance - b.distance)[0];
  }
  // How a stretch is told: its land, the river through it, the road across it, the land rising about it, a town close.
  static told(region: Region, cell: number): string {
    const atlas = RegionGeography.atlas(region), land = atlas.land, W = land.width, t = this.table;
    const out = [new Draw(`${region.name}:tract${cell}`).pick(this.lie(land.cover[cell]!).told)];
    if (atlas.rivers.some(r => r.cells.includes(cell))) {
      out.push(t.river.replace('{river}', region.land?.find(l => l.form === 'river')?.name ?? 'river'));
    }
    if (RegionGeography.roads(region).some(r => r.route.cells.includes(cell))) { out.push(t.road); }
    const h = land.heights[cell] ?? 0, high = this.neighbours(cell, W, land.height)
      .reduce((b, n) => (land.heights[n] ?? 0) > (land.heights[b] ?? 0) ? n : b, cell);
    if (high !== cell && (land.heights[high] ?? 0) - h > 0.08) {
      const [x, y] = this.xy(cell, W), [hx, hy] = this.xy(high, W);
      out.push(t.rises.replace('{side}', Vantage.bearing(hx - x, hy - y)));
    }
    const near = this.nearest(region, cell);
    if (near && near.distance > 0 && near.distance <= 1.5) { out.push(t.town.replace('{near}', near.name)); }
    return out.join(' ');
  }
  // Where each stretch is on the land, for the chart.
  static places(region: Region): Record<string, number> {
    return Object.fromEntries(this.cells(region).map(c => [this.id(c), c]));
  }
}
