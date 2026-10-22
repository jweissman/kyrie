import { Draw } from './land/draw';
import { Terrain } from './land/terrain';
import type { Wilds } from './land/atlas';
import type { Wild } from './land/zones';
import { RegionEcology } from './region-ecology';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import type { Region } from './region-writer';

// The wild country of a generated region as Kyr: each wood, fen, moor or run of fells a wilderness of its own, its
// parts rooms a company walks between: the edge, reached from the roads and settlements that border it, and the
// parts further in, the last of them its heart. Going between parts takes an hour or two of rough going.
export class RegionZones {
  static readonly roles = ['edge', 'deep', 'heart'] as const;
  static readonly habitat: Record<Wild, string> = { wood: 'wood', fen: 'fen', heath: 'heights', fell: 'heights' };
  static lines(region: Region): string[] {
    return RegionGeography.atlas(region).zones.flatMap(z => this.zone(z, region));
  }
  static room(zone: Wilds, part: number): string { return `${zone.id}_${this.role(zone, part)}`; }
  private static role(zone: Wilds, part: number): string {
    return part === 0 ? 'edge' : part === zone.parts.length - 1 ? 'heart' : 'deep';
  }
  private static zone(zone: Wilds, region: Region): string[] {
    const q = JSON.stringify, [x, y] = RegionGeography.spot(region, zone.centres[0]!), name = zone.naming.name;
    const lines = [`  Place ${zone.id} ${q(name)} is wilderness within region at ${x}, ${y}.`];
    zone.parts.forEach((_, i) => {
      const room = this.room(zone, i), draw = new Draw(`${room}:prose`), role = this.role(zone, i);
      const scene = draw.pick(this.scenes[zone.wild][role as 'edge'] ?? this.scenes[zone.wild].deep)
        .replaceAll('{zone}', name).replaceAll('{peak}', zone.peak?.naming.name ?? 'the summit');
      lines.push(`  Place ${room} ${q(this.named[zone.wild][role as 'edge']!.replace('{zone}', name))} is room within ${zone.id} at ${i}, 0.`,
        `  Observe ${room}_scene at ${room} when true ${q(`${scene}${i === 0 ? RegionGeography.meaning(zone.naming) : ''} ${RegionEcology.sign(this.habitat[zone.wild], room)}`.trim())}.`);
    });
    for (let i = 1; i < zone.parts.length; i++) {
      lines.push(`  Passage ${zone.id}_in${i} ${q(this.inward[zone.wild])} is track between ${this.room(zone, i - 1)} and ${this.room(zone, i)} taking ${RegionRoads.time(60 + 30 * Math.min(2, Math.floor(zone.parts[i]!.length / 8)))}.`);
    }
    lines.push(...this.entries(zone, region));
    return lines;
  }
  // The ways into a zone's edge: from the road and the settlement nearest its edge, each a walk of the cells
  // between (an hour at least).
  private static entries(zone: Wilds, region: Region): string[] {
    const q = JSON.stringify, edge = this.room(zone, 0), entry = zone.centres[0]!;
    const road = RegionGeography.roads(region).map(r => ({ from: r.way, gap: Math.min(...r.route.cells
      .map(c => this.gap(region, zone, c))), near: Math.min(...r.route.cells.map(c => this.apart(region, c, entry))) }))
      .sort((a, b) => a.gap - b.gap || a.near - b.near)[0];
    const town = region.settlements.map(s => ({ from: `${s.id}_green`, gap: this.gap(region, zone, s.cell!),
      near: this.apart(region, s.cell!, entry) })).sort((a, b) => a.gap - b.gap || a.near - b.near)[0]!;
    const starts = [...road && road.gap <= town.gap + 2 ? [road] : [], ...town.gap <= 3 || !road ? [town] : []];
    return starts.map((start, i) => {
      const minutes = Math.max(60, Math.round(start.gap * RegionRoads.minutesPerHour / 10) * 10);
      return `  Passage ${zone.id}_way${i + 1} ${q(this.into[zone.wild].replace('{zone}', zone.naming.name))} is path between ${start.from} and ${edge} taking ${RegionRoads.time(minutes)}.`;
    });
  }
  private static apart(region: Region, a: number, b: number): number {
    return Terrain.distance(RegionGeography.atlas(region).land, a, b);
  }
  private static gap(region: Region, zone: Wilds, cell: number): number {
    const land = RegionGeography.atlas(region).land;
    return Math.min(...zone.cells.map(c => Terrain.distance(land, c, cell)));
  }
  static readonly named: Record<Wild, Record<'edge' | 'deep' | 'heart', string>> = {
    wood: { edge: 'the edge of {zone}', deep: 'deep in {zone}', heart: 'the heart of {zone}' },
    fen: { edge: 'the edge of {zone}', deep: 'out in {zone}', heart: 'the middle of {zone}' },
    heath: { edge: 'the foot of {zone}', deep: 'up on {zone}', heart: 'the top of {zone}' },
    fell: { edge: 'the foot of {zone}', deep: 'high on {zone}', heart: 'the roof of {zone}' } };
  static readonly into: Record<Wild, string> = { wood: 'the path into {zone}', fen: 'the stakes out into {zone}',
    heath: 'the track up onto {zone}', fell: 'the path up onto {zone}' };
  static readonly inward: Record<Wild, string> = { wood: 'a deer-track further in', fen: 'a way between the reed-beds',
    heath: 'the old drove-way over the moor', fell: 'a sheep-track higher up' };
  static readonly scenes: Record<Wild, Record<'edge' | 'deep' | 'heart', string[]>> = {
    wood: {
      edge: ['The trees begin here: hazel and thorn at first, then oak, and the light under them goes green.',
        'A path leaves the open ground and goes in under the trees; a few steps in, the wind drops away.',
        'Old coppice at the edge of {zone}, cut long ago and grown out again into crowded grey stems.'],
      deep: ['Deep in {zone} the trees are older and further apart, and moss covers the fallen ones.',
        'No path here but what deer have made. The canopy is closed, and the ground is soft with old leaf.',
        'Under the big trees it is quiet enough to hear a twig fall a long way off.'],
      heart: ['In the heart of {zone} an oak stands in a clearing of its own, too wide for three to circle with their arms.',
        'A stream runs through the heart of {zone} between banks of fern, and the trees lean over it.',
        'Here {zone} is darkest: holly under the oaks, and old stumps furred with moss.'] },
    fen: {
      edge: ['The ground goes soft underfoot. Reeds stand higher than a man, and the path is a line of stakes.',
        'Where the fields end the fen begins: black water between tussocks, and the smell of it.',
        'A causeway of brushwood, half sunk, goes out into the reeds.'],
      deep: ['Open water and reed-beds in every direction. Herons stand in the shallows and do not move.',
        'Islands of alder stand in the fen, each with its own birds; between them the water is deeper than it looks.',
        'The stakes give out here. Mist sits on the water even at noon.'],
      heart: ['In the middle of {zone} lies a mere of black water, still as glass, rimmed with rotten stakes.',
        'Out in the middle of {zone} the reeds give way to a pool where nothing grows and no bird lands.'] },
    heath: {
      edge: ['The fields give way to heather and gorse, and the land rises to the moor.',
        'A drove road climbs out onto the moor between walls of piled stone.'],
      deep: ['Open moor under a big sky: heather, bog-cotton, and a wind that never stops.',
        'Grouse get up from under your feet. The track is a line of worn turf through the heather.'],
      heart: ['On the top of {zone} stands a single stone, taller than a man, leaning.',
        'The highest of {zone}, where the cairns are: nothing grows taller than your boots, and you can see for miles.'] },
    fell: {
      edge: ['The ground steepens. Walls run up the fellside and give out where the bracken begins.',
        'A sheep-track climbs from the valley onto the fellside among scree and juniper.'],
      deep: ['High on {zone}: bare rock, tarns in the hollows, and the valley a long way below.',
        'Crags on one hand and a long drop on the other; ravens turn overhead.'],
      heart: ['Under {peak}, in a hollow with a tarn so dark it looks bottomless, the wind falls silent.',
        'The roof of {zone}: stone, wind, and the whole region laid out below.'] },
  };
}
