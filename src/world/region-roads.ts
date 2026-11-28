import text from '../../data/generation/wild/roads.kyrt' with { type: 'text' };
import scenes from '../../data/generation/scenes/roads.json';
import { Draw } from './land/draw';
import type { Cover } from './land/land-cover';
import { Roads } from './land/roads';
import { KyrTemplates } from './kyr-template';
import { RegionEcology } from './region-ecology';
import { RegionGeography, type Road } from './region-geography';
import type { Region } from './region-writer';

interface WayNames { land: string; way: string; out: string; on: string; kind: string; scene: string }

// A generated region's roads as Kyr. Each road is a stretch of country between two settlements: one way room, a
// passage out to it from each end, taking the time the land asks (a cell of open ground is half an hour on a road;
// woods, fen and fells slower). A road crossing a river crosses it by a ford, which a river in spate makes
// dangerous, or a bridge where the river is too deep to wade; a road over the fells crosses a pass, cold after dark,
// with the summit of its fells above it when they have one.
export class RegionRoads {
  static readonly minutesPerHour = 30;
  static lines(region: Region): string[] {
    return RegionGeography.roads(region).flatMap(r => this.road(r, region));
  }
  private static road(road: Road, region: Region): string[] {
    const q = JSON.stringify, { from, to, land, way, form } = road, [x, y] = road.spot, n = this.names(road, region);
    const [out, on] = this.halves(road, region);
    const seen = this.unnamed(road, region, n);
    const lines = [`  Place ${land} ${q(n.land)} is wilderness within region at ${x}, ${y}${seen.land}.`,
      `  Place ${way} ${q(n.way)} is room within ${land} at 1, 1${seen.way}.`, ...seen.lines,
      `  Passage road_${from.id}_${to.id} ${q(n.out)} is road between ${from.id}_green and ${way} taking ${out}.`,
      `  Passage road_${from.id}_${to.id}_on ${q(n.on)} is ${n.kind} between ${way} and ${to.id}_green taking ${on}.`,
      `  Observe ${way}_scene at ${way} when true ${q(`${n.scene} ${RegionEcology.sign(this.habitat(road, region), way)}`
        .trim())}.`];
    if (form) { lines.push(`  Initially Assert landform(${land}, land_${form.form}).`); }
    if (form?.form === 'river' && road.route.crossings[0]?.kind === 'ford') { lines.push(...this.ford(road)); }
    if (road.route.over) { lines.push(...this.pass(road)); }
    return lines;
  }
  // A road named for the towns at its ends, as it is seen by a company that does not know them both: by which way it
  // runs and the ground it crosses ("the east-west road over the meadows"), until the company stands on it and reads
  // its milestone, which names both ends (and so tells of the town at the far one). The map had named a town nobody had
  // told of in its road's name: "To the road between Mistshaw and Millholm" from Millholm (OR-810, the owner's playtest
  // of 25 November). A road named for its river, wood or pass names no town, and is seen as it is; told apart from its
  // likes by the town it is nearer ("the bridge over the Redwater by Brightbridge"), it is seen as what it is, told
  // apart by its side of the country instead ("the western bridge over the Redwater"): seen by its axis and ground
  // alone, an aim to look along the bridge for a father had named "the east-west road over the woods" (OR-940).
  private static unnamed(road: Road, region: Region, n: WayNames): { land: string; way: string; lines: string[] } {
    const { from, to, way } = road, q = JSON.stringify;
    if (![n.way, n.land].some(name => this.towns(road, name))) { return { land: '', way: '', lines: [] }; }
    const own = this.own(road, region), axis = this.axis(road, region), side = this.side(road, region);
    const ground = RegionRoads.grounds[this.ground(road, region)] ?? 'open country', fact = `${way}_named`;
    const alias = this.towns(road, own.way) ? `the ${axis} road over the ${ground}` : this.sided(own.way, side, axis);
    const land = this.towns(road, own.land) ? `the ${ground} along the ${axis} road` : this.sided(own.land, side, axis);
    const named = this.towns(road, n.way) ? alias : n.way;
    return { land: this.towns(road, n.land) ? ` seen as ${q(land)} until ${fact}` : '',
      way: this.towns(road, n.way) ? ` seen as ${q(alias)} until ${fact}` : '',
      lines: [`  Entity ${fact}: fact ${q(`The ${named.slice(4)} runs between ${from.name} and ${to.name}.`)}.`,
        `  Initially Assert leadsTo(${fact}, ${from.id}). Initially Assert leadsTo(${fact}, ${to.id}).`,
        `  Observe ${fact}_stone at ${way} as reading when true ${q(`A milestone: ${from.name} one way, ${to.name} the other.`)} teaches ${fact}.`,
        // Over once the company has been to both towns: the map names the road then, and the Notes need not (FH-25).
        `  Rule ${fact}_over when been(party, ${from.id}_green) and been(party, ${to.id}_green) and not stale(${fact})`
        + ` { Assert stale(${fact}). }`] };
  }
  // Whether a name names either town at a road's ends.
  private static towns(road: Road, name: string): boolean {
    return name.includes(road.from.name) || name.includes(road.to.name);
  }
  // A name told by the side of the country it is on ("the western bridge over the Redwater"), or, in the middle of
  // the land, by the road it is on.
  private static sided(name: string, side: string, axis: string): string {
    return side === 'here' ? `${name} on the ${axis} road` : name.replace(/^the /, `the ${side}ern `);
  }
  // The side of the country a road's way room stands on, from the middle of the land (as a site's: RegionSites.seenAs).
  private static side(road: Road, region: Region): string {
    const { width, height } = RegionGeography.atlas(region).land;
    const centre = RegionGeography.spot(region, width * Math.floor(height / 2) + Math.floor(width / 2));
    return RegionGeography.compass(centre, road.spot);
  }
  static readonly grounds: Record<string, string> = { meadow: 'meadows', heath: 'heath', wood: 'woods', fen: 'fen',
    fell: 'fells' };
  // Which way a road runs, from one end to the other: east-west, north-south, or a diagonal by its northern wind.
  private static axis(road: Road, region: Region): string {
    const w = RegionGeography.atlas(region).land.width, a = road.route.cells[0]!, b = road.route.cells.at(-1)!;
    const dx = b % w - a % w, dy = Math.floor(b / w) - Math.floor(a / w);
    if (Math.abs(dx) > 2 * Math.abs(dy)) { return 'east-west'; }
    if (Math.abs(dy) > 2 * Math.abs(dx)) { return 'north-south'; }
    return Math.sign(dx) === Math.sign(dy) ? 'north-west' : 'north-east';
  }
  // The time each half of a road takes, in the minutes Kyr counts, to the nearest ten: each half the ground it goes
  // over, out to where the way room stands (its crossing, or its middle). Halved evenly, a ford a hex from one end had
  // been as far from it as from the other, and a way through the wild beside the road came out quicker than the road
  // (the owner, 11 November: a journey had woven in and out of a wood between every stretch of road).
  private static halves(road: Road, region: Region): [string, string] {
    const total = Math.max(40, Math.round(road.route.hours * this.minutesPerHour / 10) * 10);
    const land = RegionGeography.atlas(region).land, cells = road.route.cells;
    const share = this.going(land, cells.slice(1, this.room(road) + 1))
      / Math.max(1e-9, this.going(land, cells.slice(1)));
    const first = Math.min(total - 20, Math.max(20, Math.round(total * share / 10) * 10));
    return [this.time(first), this.time(Math.max(20, total - first))];
  }
  // The hours the ground of some cells asks.
  private static going(land: { cover: readonly Cover[] }, cells: number[]): number {
    return cells.reduce((sum, c) => sum + Roads.hours[land.cover[c]!], 0);
  }
  static time(minutes: number): string {
    return minutes % 60 === 0 ? `${minutes / 60} hour${minutes === 60 ? '' : 's'}` : `${minutes} minutes`;
  }
  // What a road and its land are called. Two roads through one wood, or over one river, are told apart, each of them,
  // by the settlement it lies nearer (the M16 free play read two ways out of Marirkom alike to the letter: "To the
  // bridge over the Karnahar"; in play 10 the aim said "the ford of the Nûrnellë" where two roads went to fords of it,
  // and only the second was told "by Merinael"), or by both its ends where two lie nearer the same; never by which way
  // it goes, since it is walked both ways (a newcomer standing in Wǽtheald was offered "the ford of the Āforex toward
  // Wǽtheald"). A plain "the road" is no one's name, and is left as it is.
  static names(road: Road, region: Region): WayNames {
    const roads = RegionGeography.roads(region), owns = roads.map(r => this.own(r, region));
    const i = roads.findIndex(r => r.way === road.way);
    if (i < 0) { return this.own(road, region); }
    const [way, on, out] = (['way', 'on', 'out'] as const).map(key => this.told(roads, owns, i, key));
    return { ...owns[i]!, way: way!, on: on!, out: out! };
  }
  private static told(roads: Road[], owns: WayNames[], i: number, key: 'way' | 'on' | 'out'): string {
    const name = owns[i]![key], alike = roads.filter((_, j) => owns[j]![key] === name);
    if (!/\p{Lu}/u.test(name) || alike.length < 2) { return name; }
    const nearer = this.nearer(roads[i]!).name;
    return alike.filter(r => this.nearer(r).name === nearer).length > 1
      ? `${name} between ${roads[i]!.from.name} and ${roads[i]!.to.name}` : `${name} by ${nearer}`;
  }
  // The end of a road its crossing, or its middle, lies nearer.
  private static nearer(road: Road): Road['from'] {
    return this.room(road) > (road.route.cells.length - 1) / 2 ? road.to : road.from;
  }
  // How long the road takes between a cell it crosses and its way room (its crossing, or its middle), where a company
  // on the road is: the road walked, as its halves are (see halves). Every stretch along a road had been five minutes
  // off its way room, and every track from a road had started at its way room wherever it met the road, so a journey
  // went onto a road and off it hexes away for nothing, and was drawn jumping them (the owner, 16 November: OR-35).
  static along(region: Region, road: Road, cell: number): number {
    const land = RegionGeography.atlas(region).land, cells = road.route.cells, room = this.room(road);
    const i = cells.indexOf(cell), [a, b] = i < room ? [i, room] : [room, i];
    return Math.round(this.going(land, cells.slice(a + 1, b + 1)) * this.minutesPerHour / 5) * 5;
  }
  // Where along a road its way room stands: its crossing, or its middle.
  static room(road: Road): number {
    const cells = road.route.cells, at = road.route.crossings[0]?.cell;
    return at === undefined ? Math.floor(cells.length / 2) : cells.indexOf(at);
  }
  // What a road and its land are called, and how it looks, by what it crosses or runs through. Each half of it is
  // walked both ways, so it is named for neither end: the Karavor road, taken up from Gothgiba or down to Muzgkom.
  private static own(road: Road, region: Region): WayNames {
    const { from, to, form } = road, name = form?.name ?? '';
    const draw = new Draw(`${road.way}:prose`), bridge = road.route.crossings[0]?.kind === 'bridge';
    switch (form?.form) {
      case 'river': return { land: `the vale of the ${name}`, way: `the ${bridge ? 'bridge over' : 'ford of'} the ${name}`,
        kind: bridge ? 'bridge' : 'ford', out: `the ${name} road`,
        on: `the ${bridge ? 'bridge over' : 'ford of'} the ${name}`,
        scene: `${bridge ? draw.pick(this.bridges) : draw.pick(this.fords)}`.replaceAll('{river}', name)
          .replaceAll('{to}', to.name) };
      case 'wood': return { land: name, way: `the road through ${name}`, kind: 'road',
        out: `the ${name} road`, on: `the ${name} road`,
        scene: draw.pick(this.woods).replaceAll('{wood}', name) };
      case 'pass': return { land: `the ${name}`, way: `the top of the ${name}`, kind: 'road',
        out: `the ${name} road`, on: `the ${name} road`,
        scene: draw.pick(this.passes).replaceAll('{pass}', name) };
      default: return { land: `the country between ${from.name} and ${to.name}`,
        way: `the road between ${from.name} and ${to.name}`, kind: 'road', out: 'the road', on: 'the road', scene: draw.pick(this.open[this.ground(road, region)] ?? this.open.meadow!)
          .replaceAll('{from}', from.name).replaceAll('{to}', to.name) };
    }
  }
  // The kind of country a road's animals are of: its river, wood or pass's; else the ground it crosses.
  private static habitat(road: Road, region: Region): string {
    return (road.form ? RegionEcology.forms[road.form.form] : RegionEcology.grounds[this.ground(road, region)])
      ?? RegionEcology.country(region);
  }
  // The ground most of a road crosses.
  private static ground(road: Road, region: Region): string {
    const cover = RegionGeography.atlas(region).land.cover, counts = new Map<string, number>();
    for (const c of road.route.cells) { counts.set(cover[c]!, (counts.get(cover[c]!) ?? 0) + 1); }
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'meadow';
  }
  // How a road looks, by what it crosses or runs through: the author's, in data/generation/scenes/roads.json.
  static readonly fords = scenes.fords;
  static readonly bridges = scenes.bridges;
  static readonly woods = scenes.woods;
  static readonly passes = scenes.passes;
  static readonly open: Record<string, string[]> = scenes.open;
  // What a ford or a pass asks of a company: the author's, in data/generation/wild/roads.kyrt.
  static readonly template = KyrTemplates.parse(text);
  private static section(group: string, values: Record<string, string>): string[] {
    return KyrTemplates.declared(this.template.sections.filter(t => t.group === group).flatMap(t => t.lines), values,
      `roads ${group}`);
  }
  private static ford(road: Road): string[] {
    return this.section('ford', { w: road.way, on: `road_${road.from.id}_${road.to.id}_on`, river: road.form!.name });
  }
  private static pass(road: Road): string[] {
    return this.section('pass', { w: road.way, pass: road.route.over!.name });
  }
}
