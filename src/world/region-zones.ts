import { Draw } from './land/draw';
import { Terrain, type Land } from './land/terrain';
import type { Wilds } from './land/atlas';
import type { Wild } from './land/zones';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import type { Region } from './region-writer';
import tables from '../../data/generation/scenes/wilds.json';

interface Kind { id: string; name: string; scene: string; ambience: string; view?: boolean }
interface Table {
  trails: string[]; into: string; entry: { name: string; scene: string };
  lost: { name: string; scene: string; astray: string }; landmarks: Kind[]; water: Kind[];
  view: { change: string; seen: string; unseen: string };
}
// One place in a stretch of wild country, where it stands on the land and what it is.
export interface Landmark { id: string; cell: number; part: number; name: string; scene: string; ambience: string;
  view?: boolean; water?: string; side?: string }
// Where a way into wild country starts: a road running by it, or a settlement near it; the cell it starts from, and
// the settlement it is known by.
interface Start { from: string; cell: number; through: boolean; by: string }

// The wild country of a generated region as places on the ground. Each wood, fen, moor or run of fells holds
// landmarks where they stand on the land: an edge where people come in from a road or a settlement, the places
// further in (a charcoal-burners' clearing, a tarn under a crag, the ford where a river crosses), each at its own
// cell. Trails join them; every road and settlement the country borders has a way into it, so a wood can be crossed
// and come out somewhere else. Leaving the trails is quicker and can lose you; somewhere with a view tells you the
// lie of the land, running water leads out, and casting about finds a path again in time.
export class RegionZones {
  static readonly roles = ['edge', 'deep', 'heart'] as const;
  static readonly habitat: Record<Wild, string> = { wood: 'wood', fen: 'fen', heath: 'heights', fell: 'heights' };
  static readonly table = tables as unknown as Record<Wild, Table>;
  static lines(region: Region): string[] {
    return RegionGeography.atlas(region).zones.flatMap(z => this.zone(z, region));
  }
  static room(zone: Wilds, part: number): string { return `${zone.id}_${this.role(zone, part)}`; }
  private static role(zone: Wilds, part: number): string {
    return part === 0 ? 'edge' : part === zone.parts.length - 1 ? 'heart' : 'deep';
  }
  // Every place a stretch of wild country holds: its landmarks and the place where those lost in it are.
  static rooms(region: Region, zone: Wilds): string[] { return [...this.landmarks(region, zone).map(l => l.id), `${zone.id}_lost`]; }
  private static readonly drawn = new WeakMap<Region, Map<string, Landmark[]>>();
  // A part's own landmark at its centre (the edge, the places further in); a second where a part is large; and the
  // crossing of any river that runs through.
  static landmarks(region: Region, zone: Wilds): Landmark[] {
    let cache = this.drawn.get(region);
    if (!cache) { cache = new Map(); this.drawn.set(region, cache); }
    const done = cache.get(zone.id);
    if (done) { return done; }
    const t = this.table[zone.wild], draw = new Draw(`${region.name}:${zone.id}:landmarks`), land = RegionGeography.atlas(region).land;
    const kinds = draw.shuffle(t.landmarks), name = zone.naming.name, out: Landmark[] = [];
    zone.parts.forEach((cells, i) => {
      const centre = zone.centres[i]!, kind = i === 0 ? undefined : kinds.shift();
      out.push(kind ? { ...kind, id: this.room(zone, i), cell: centre, part: i }
        : { id: this.room(zone, i), cell: centre, part: 0, name: t.entry.name, scene: t.entry.scene, ambience: '' });
      const far = [...cells].sort((a, b) => Terrain.distance(land, b, centre) - Terrain.distance(land, a, centre))[0]!;
      const second = cells.length >= 8 && Terrain.distance(land, far, centre) >= 2 ? kinds.shift() : undefined;
      if (second) { out.push({ ...second, id: `${this.room(zone, i)}_2`, cell: far, part: i }); }
    });
    const river = RegionGeography.atlas(region).rivers.find(r => r.cells.some(c => zone.cells.includes(c)));
    const crossing = river?.cells.find(c => zone.cells.includes(c) && !out.some(l => l.cell === c));
    if (river && crossing !== undefined) {
      const kind = draw.pick(t.water);
      out.push({ ...kind, id: `${zone.id}_water`, cell: crossing, part: this.owner(zone, crossing), water: river.naming.name });
    }
    out.push(...this.sides(zone, region, out));
    const from = this.from(region, zone);
    const named = out.map(l => ({ ...l, name: this.fill(l.name, { zone: name, river: l.water ?? '', from: l.side ?? from }),
      scene: this.fill(l.scene, { zone: name, river: l.water ?? '', from: this.upper(l.side ?? from) }) }));
    cache.set(zone.id, named);
    return named;
  }
  // An edge of its own where a way comes in from a road or a settlement with no landmark near: the country's cell
  // nearest where the way starts, known by the settlement it faces.
  private static sides(zone: Wilds, region: Region, marks: Landmark[]): Landmark[] {
    const land = RegionGeography.atlas(region).land, t = this.table[zone.wild], out: Landmark[] = [];
    for (const s of this.starts(zone, region)) {
      const near = this.nearest(land, zone.cells.map(cell => ({ cell })), s.cell).cell;
      if ([...marks, ...out].some(l => Terrain.distance(land, l.cell, near) <= 1)
        || this.facing(region, zone, [...marks, ...out]).includes(s.by)) { continue; }
      out.push({ id: `${zone.id}_side${out.length + 1}`, cell: near, part: this.owner(zone, near), name: t.entry.name,
        scene: t.entry.scene, ambience: '', side: s.by });
    }
    return out;
  }
  // The settlements the edges already made are known by: two edges by one settlement would share a name.
  private static facing(region: Region, zone: Wilds, marks: Landmark[]): string[] {
    return marks.filter(l => l.side || (l.part === 0 && !l.water && l.name === this.table[zone.wild].entry.name))
      .map(l => l.side ?? this.from(region, zone));
  }
  private static owner(zone: Wilds, cell: number): number {
    return Math.max(0, zone.parts.findIndex(p => p.includes(cell)));
  }
  // Of some things standing on the land, the one nearest a cell.
  private static nearest<T extends { cell: number }>(land: Land, items: T[], cell: number): T {
    return [...items].sort((a, b) => Terrain.distance(land, a.cell, cell) - Terrain.distance(land, b.cell, cell))[0]!;
  }
  // What the edge of wild country is known by: the settlement it is nearest.
  private static from(region: Region, zone: Wilds): string {
    const land = RegionGeography.atlas(region).land, edge = zone.centres[0]!;
    return this.nearest(land, region.settlements.map(s => ({ name: s.name, cell: s.cell! })), edge).name;
  }
  private static fill(text: string, values: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  private static zone(zone: Wilds, region: Region): string[] {
    const q = JSON.stringify, [x, y] = RegionGeography.spot(region, zone.centres[0]!), name = zone.naming.name;
    const marks = this.landmarks(region, zone), lines = [`  Place ${zone.id} ${q(name)} is wilderness within region at ${x}, ${y}.`];
    for (const l of marks) {
      const [lx, ly] = RegionGeography.spot(region, l.cell);
      lines.push(`  Place ${l.id} ${q(l.name)} is room within ${zone.id} at ${lx}, ${ly} outdoors.`,
        `  Observe ${l.id}_scene at ${l.id} as fixture when true ${q(l.scene)}.`,
        ...l.ambience ? [`  Observe ${l.id}_life at ${l.id} as ambience when not dark() ${q(l.ambience)}.`] : [],
        ...l.view ? this.view(zone, l) : []);
    }
    lines.push(...this.trails(zone, region, marks), ...this.entries(zone, region, marks),
      ...this.astray(zone, region, marks));
    return lines;
  }
  // Somewhere high enough to see from: climbed, it tells you the lie of the land, and you will not lose your way in it.
  private static view(zone: Wilds, l: Landmark): string[] {
    const q = JSON.stringify, t = this.table[zone.wild].view, name = zone.naming.name, id = `${l.id}_view`;
    return [`  Thing ${id} ${q(l.name)} at ${l.id} is scenery {`,
      `    State below ${q(t.unseen)}.`, `    State above "You know the way up now, and what can be seen from the top.".`,
      `    Change climb ${q(this.fill(t.change, { zone: name }))} from below to above.`, '  }',
      `  Observe ${id}_learned at ${l.id} as sign when state(${id}, above) ${q(this.fill(t.seen, { zone: name }))} teaches ${zone.id}_mapped.`];
  }
  // The trails: from each part's landmark to the next part's, from a second landmark to its part's own, and from a
  // crossing to the landmark nearest it.
  private static trails(zone: Wilds, region: Region, marks: Landmark[]): string[] {
    const q = JSON.stringify, t = this.table[zone.wild], land = RegionGeography.atlas(region).land;
    const draw = new Draw(`${region.name}:${zone.id}:trails`), pairs: [Landmark, Landmark][] = [];
    const primary = marks.filter(l => !l.id.endsWith('_2') && !l.water && !l.side);
    primary.slice(1).forEach((l, i) => pairs.push([primary[i]!, l]));
    for (const l of marks.filter(m => m.id.endsWith('_2') || m.water || m.side)) {
      pairs.push([this.nearest(land, primary, l.cell), l]);
    }
    return pairs.map(([a, b], i) => `  Passage ${zone.id}_trail${i + 1} ${q(draw.pick(t.trails))} is track between ${a.id} and ${b.id} taking ${RegionRoads.time(this.minutes(land, a.cell, b.cell))}.`);
  }
  private static minutes(land: Land, a: number, b: number): number {
    return Math.max(30, Terrain.distance(land, a, b) * 40);
  }
  // How far a cell is from the nearest cell of the country.
  private static gap(zone: Wilds, land: Land, c: number): number {
    return Math.min(...zone.cells.map(z => Terrain.distance(land, z, c)));
  }
  // Where the ways in start: every road that runs within a cell of the country, and every settlement within two; at
  // least the nearest settlement.
  private static starts(zone: Wilds, region: Region): Start[] {
    const land = RegionGeography.atlas(region).land;
    const towns = region.settlements.map(s => ({ name: s.name, cell: s.cell! }));
    const roads = RegionGeography.roads(region).flatMap(r => {
      const near = [...r.route.cells].sort((a, b) => this.gap(zone, land, a) - this.gap(zone, land, b))[0]!;
      const through = r.route.cells.some(c => zone.cells.includes(c));
      const by = this.nearest(land, towns, near).name;
      return this.gap(zone, land, near) <= 1 ? [{ from: r.way, cell: near, through, by, route: r.route }] : [];
    });
    // A settlement beside the country has a way of its own into it; one a little further off has one only if no road
    // of its own runs by the country, for if one does, the way in is off that road.
    const ends = new Set(roads.flatMap(r => [r.route.cells[0], r.route.cells.at(-1)]));
    const near = region.settlements.filter(s => this.gap(zone, land, s.cell!) <= 1
      || (this.gap(zone, land, s.cell!) <= 2 && !ends.has(s.cell!)))
      .map(s => ({ from: `${s.id}_green`, cell: s.cell!, through: false, by: s.name }));
    const nearest = [...region.settlements]
      .sort((a, b) => this.gap(zone, land, a.cell!) - this.gap(zone, land, b.cell!))[0]!;
    const starts: Start[] = [...roads.map(({ route: _, ...r }) => r), ...near];
    return starts.length ? starts : [{ from: `${nearest.id}_green`, cell: nearest.cell!, through: false, by: nearest.name }];
  }
  // A way in from each start, to the landmark nearest it.
  private static entries(zone: Wilds, region: Region, marks: Landmark[]): string[] {
    const q = JSON.stringify, land = RegionGeography.atlas(region).land, t = this.table[zone.wild];
    return this.starts(zone, region).map((s, i) => {
      const to = this.nearest(land, marks, s.cell);
      const minutes = Math.max(30, Math.round(Terrain.distance(land, to.cell, s.cell) * 40 / 10) * 10);
      const way = s.through ? `a track off the road into ${zone.naming.name}` : this.fill(t.into, { zone: zone.naming.name });
      return `  Passage ${zone.id}_way${i + 1} ${q(way)} is path between ${s.from} and ${to.id} taking ${RegionRoads.time(minutes)}.`;
    });
  }
  // Leaving the trails: from a landmark, straight across the country to another the company has been to, quicker but
  // risked. Somewhere with a view, or someone who reads wild country, keeps you right; otherwise you may lose the
  // way. Lost, running water leads to the crossing, and casting about finds the edge again, in time.
  private static astray(zone: Wilds, region: Region, marks: Landmark[]): string[] {
    const q = JSON.stringify, z = zone.id, t = this.table[zone.wild], name = zone.naming.name;
    const [x, y] = RegionGeography.spot(region, zone.centres[Math.min(1, zone.centres.length - 1)]!);
    const joined = new Set(this.trails(zone, region, marks).map(l => /between (\S+) and (\S+) taking/.exec(l)!.slice(1).sort().join('|')));
    const land = RegionGeography.atlas(region).land;
    // Straight across is about three-quarters of the way round by the trails, and is risked.
    const across = marks.flatMap(a => marks.filter(b => b !== a && !joined.has([a.id, b.id].sort().join('|')))
      .map(b => `  Initially Assert ${z}_across(${a.id}, ${b.id}). Initially Set ${z}_span(${a.id}, ${b.id}) to ${Math.max(3, Terrain.distance(land, a.cell, b.cell) * 3)}.`));
    const water = marks.find(l => l.water), edge = marks[0]!;
    return [`  Place ${z}_lost ${q(this.fill(t.lost.name, { zone: name }))} is room within ${z} at ${x}, ${y} outdoors.`,
      `  Observe ${z}_lost_scene at ${z}_lost as fixture when true ${q(this.fill(t.lost.scene, { zone: name }))}.`,
      `  Entity ${z}_mapped: fact ${q(`You know the lie of ${name}: its paths, its water, and which way the edges lie.`)}.`,
      `  Relation ${z}_across(place, place). Relation ${z}_heading(group, place). Relation ${z}_astray(group). Relation ${z}_casting(group).`,
      `  Measure ${z}_span(place, place).`,
      ...across,
      `  Action ${z}_strike(actor: group, start: place, dest: place) ${q(`Strike out across ${name} toward {dest}`)} {`,
      `    Description ${q('Leave the path and go straight there across the country: quicker, if you do not lose your way.')}.`,
      `    Requires able(actor) and at(actor, start) and ${z}_across(start, dest) and been(actor, dest) and not benighted(actor).`,
      `    Time ${z}_span(start, dest). On success { Retract at(actor, start). Assert at(actor, ${z}_lost). Assert ${z}_heading(actor, dest). }`, '  }',
      `  Rule ${z}_bearing when ${z}_heading(party, ?goal) and at(party, ${z}_lost) and (capable(party, woodcraft) or capable(party, wayfinding) or knows(party, ${z}_mapped) or dice(clock) <= 60) {`,
      `    Retract ${z}_heading(party, ?goal). Retract at(party, ${z}_lost). Assert at(party, ?goal). }`,
      `  Rule ${z}_strays when ${z}_heading(party, ?goal) and at(party, ${z}_lost) says ${q(t.lost.astray)} { Retract ${z}_heading(party, ?goal). Assert ${z}_astray(party). }`,
      `  Action ${z}_cast(actor: group) "Cast about for a path you know" {`,
      `    Requires able(actor) and at(actor, ${z}_lost) and ${z}_astray(actor). Time 3. On success { Assert ${z}_casting(actor). }`, '  }',
      `  Rule ${z}_found when ${z}_casting(party) and (dice(clock) <= 45 or knows(party, ${z}_mapped)) says ${q(`At last you come out on a path you know, and follow it to ${edge.name}.`)} {`,
      `    Retract ${z}_casting(party). Retract ${z}_astray(party). Retract at(party, ${z}_lost). Assert at(party, ${edge.id}). }`,
      `  Rule ${z}_circles when ${z}_casting(party) says "After an hour you come back to a place you are sure you have passed before." { Retract ${z}_casting(party). }`,
      ...water ? [`  Action ${z}_follow(actor: group) ${q(`Follow running water down to the ${water.water}`)} {`,
        `    Requires able(actor) and at(actor, ${z}_lost) and ${z}_astray(actor). Time 6.`,
        `    On success { Retract ${z}_astray(actor). Retract at(actor, ${z}_lost). Assert at(actor, ${water.id}). }`,
        `    Result ${q(`The ground falls toward the sound of water, and you follow it down until you come out at ${water.name}.`)}.`, '  }'] : []];
  }
  static readonly named: Record<Wild, Record<'edge' | 'deep' | 'heart', string>> = {
    wood: { edge: 'the edge of {zone}', deep: 'deep in {zone}', heart: 'the heart of {zone}' },
    fen: { edge: 'the edge of {zone}', deep: 'out in {zone}', heart: 'the middle of {zone}' },
    heath: { edge: 'the foot of {zone}', deep: 'up on {zone}', heart: 'the top of {zone}' },
    fell: { edge: 'the foot of {zone}', deep: 'high on {zone}', heart: 'the roof of {zone}' } };
  // Where in a wild country something stands, as people say it: deep in Bruinforwest, at the foot of Hartholt.
  static where(zone: Wilds, part: number): string {
    return this.at[zone.wild][this.role(zone, part) as 'edge'].replace('{zone}', zone.naming.name);
  }
  static readonly at: Record<Wild, Record<'edge' | 'deep' | 'heart', string>> = {
    wood: { edge: 'at the edge of {zone}', deep: 'deep in {zone}', heart: 'in the heart of {zone}' },
    fen: { edge: 'at the edge of {zone}', deep: 'out in {zone}', heart: 'in the middle of {zone}' },
    heath: { edge: 'at the foot of {zone}', deep: 'up on {zone}', heart: 'on the top of {zone}' },
    fell: { edge: 'at the foot of {zone}', deep: 'high on {zone}', heart: 'on the roof of {zone}' } };
}
