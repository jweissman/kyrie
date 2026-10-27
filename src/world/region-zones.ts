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
  lost: { name: string; scene: string; astray: string; guided: string }; landmarks: Kind[]; water: Kind[];
  view: { change: string; seen: string; unseen: string };
}
// One place in a stretch of wild country, where it stands on the land and what it is.
export interface Landmark { id: string; cell: number; part: number; name: string; scene: string; ambience: string;
  view?: boolean; water?: string; side?: string; kind?: string }
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
  // The ways in and the trails between landmarks, which word of a place in the country can tell (ScenarioWord).
  static passages(region: Region, zone: Wilds): string[] {
    const marks = this.landmarks(region, zone), land = RegionGeography.atlas(region).land;
    return [...this.ways(zone, region, marks).map((_, i) => `${zone.id}_way${i + 1}`),
      ...this.tree(land, marks).map((_, i) => `${zone.id}_trail${i + 1}`)];
  }
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
      out.push(kind ? { ...kind, kind: kind.id, id: this.room(zone, i), cell: centre, part: i }
        : { id: this.room(zone, i), cell: centre, part: 0, name: t.entry.name, scene: t.entry.scene, ambience: '' });
      const far = [...cells].sort((a, b) => Terrain.distance(land, b, centre) - Terrain.distance(land, a, centre))[0]!;
      const second = cells.length >= 8 && Terrain.distance(land, far, centre) >= 2 ? kinds.shift() : undefined;
      if (second) { out.push({ ...second, kind: second.id, id: `${this.room(zone, i)}_2`, cell: far, part: i }); }
    });
    const river = RegionGeography.atlas(region).rivers.find(r => r.cells.some(c => zone.cells.includes(c)));
    const crossing = river?.cells.find(c => zone.cells.includes(c) && !out.some(l => l.cell === c));
    if (river && crossing !== undefined) {
      const kind = draw.pick(t.water);
      out.push({ ...kind, kind: kind.id, id: `${zone.id}_water`, cell: crossing, part: this.owner(zone, crossing),
        water: river.naming.name });
    }
    out.push(...this.sides(zone, region, out));
    const from = this.from(region, zone).name, taken = this.taken(region, zone);
    const named = out.map(l => ({ ...l, name: this.fill(l.name, { zone: name, river: l.water ?? '', from: l.side ?? from }),
      scene: this.fill(l.scene, { zone: name, river: l.water ?? '', from: this.upper(l.side ?? from) }) }))
      // A name another wild country of the region has already is said with its own (two woods' old banks: the willow
      // was "along the old bank", and the region had two).
      .map(l => taken.has(l.name) ? { ...l, name: `${l.name} in ${name}` } : l);
    cache.set(zone.id, named);
    return named;
  }
  // The names the wild countries drawn before this one have given their landmarks.
  private static taken(region: Region, zone: Wilds): Set<string> {
    const zones = RegionGeography.atlas(region).zones;
    return new Set(zones.slice(0, zones.indexOf(zone)).flatMap(z => this.landmarks(region, z).map(l => l.name)));
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
      .map(l => l.side ?? this.from(region, zone).name);
  }
  private static owner(zone: Wilds, cell: number): number {
    return Math.max(0, zone.parts.findIndex(p => p.includes(cell)));
  }
  // Of some things standing on the land, the one nearest a cell.
  private static nearest<T extends { cell: number }>(land: Land, items: T[], cell: number): T {
    return [...items].sort((a, b) => Terrain.distance(land, a.cell, cell) - Terrain.distance(land, b.cell, cell))[0]!;
  }
  // What the edge of wild country is known by: the settlement it is nearest.
  private static from(region: Region, zone: Wilds): Region['settlements'][number] {
    const land = RegionGeography.atlas(region).land, edge = zone.centres[0]!;
    return this.nearest(land, region.settlements.map(s => ({ ...s, cell: s.cell! })), edge);
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
  // Somewhere high enough to see from: climbed, it tells you the lie of the land, and you will not lose your way in it;
  // once the company has gone from it, it is somewhere to climb again, to see what the haze hid (see RegionSights).
  private static view(zone: Wilds, l: Landmark): string[] {
    const q = JSON.stringify, t = this.table[zone.wild].view, name = zone.naming.name, id = `${l.id}_view`;
    return [`  Thing ${id} ${q(l.name)} at ${l.id} is scenery {`,
      `    State below ${q(t.unseen)}.`, `    State above "The way down is the way you came up.".`,
      `    Change climb ${q(this.fill(t.change, { zone: name }))} from below to above.`, '  }',
      `  Observe ${id}_learned at ${l.id} as sign when state(${id}, above) ${q(this.fill(t.seen, { zone: name }))} teaches ${zone.id}_mapped.`,
      `  Rule ${id}_down when state(${id}, above) and not at(party, ${l.id}) { Assert state(${id}, below). }`];
  }
  // The trails: each landmark joined to the nearest of those already joined, beginning at the edge, so that every
  // trail runs between neighbours and the whole country can be walked by way of them.
  private static trails(zone: Wilds, region: Region, marks: Landmark[]): string[] {
    const q = JSON.stringify, t = this.table[zone.wild], land = RegionGeography.atlas(region).land;
    const draw = new Draw(`${region.name}:${zone.id}:trails`);
    return this.tree(land, marks).map(([a, b], i) => `  Passage ${zone.id}_trail${i + 1} ${q(draw.pick(t.trails))} is track between ${a.id} and ${b.id} taking ${RegionRoads.time(this.minutes(land, a.cell, b.cell))}.`);
  }
  private static tree(land: Land, marks: Landmark[]): [Landmark, Landmark][] {
    const joined = marks.slice(0, 1), rest = marks.slice(1), pairs: [Landmark, Landmark][] = [];
    while (rest.length) {
      const [a, b] = joined.flatMap(j => rest.map(r => [j, r] as [Landmark, Landmark]))
        .sort(([w, x], [y, z]) => Terrain.distance(land, w.cell, x.cell) - Terrain.distance(land, y.cell, z.cell))[0]!;
      pairs.push([a, b]); joined.push(b); rest.splice(rest.indexOf(b), 1);
    }
    return pairs;
  }
  // The landmarks the trails pass from one landmark to another, both included.
  private static path(land: Land, marks: Landmark[], from: Landmark, to: Landmark): Landmark[] {
    const next = new Map<Landmark, Landmark[]>(marks.map(m => [m, []]));
    for (const [a, b] of this.tree(land, marks)) { next.get(a)!.push(b); next.get(b)!.push(a); }
    const back = new Map<Landmark, Landmark>([[from, from]]), queue = [from];
    for (let i = 0; i < queue.length; i++) {
      for (const n of next.get(queue[i]!)!) { if (!back.has(n)) { back.set(n, queue[i]!); queue.push(n); } }
    }
    const out = [to];
    while (out[0] !== from) { out.unshift(back.get(out[0]!)!); }
    return out;
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
  // A way in from each start, to the landmark nearest it; and, when none of them comes to the country's edge, one
  // from the settlement the edge is known by, so that "the foot of Barzelrehes by Muzgkom" is reached from Muzgkom.
  private static entries(zone: Wilds, region: Region, marks: Landmark[]): string[] {
    const q = JSON.stringify, land = RegionGeography.atlas(region).land, t = this.table[zone.wild];
    return this.ways(zone, region, marks).map(({ s, to }, i) => {
      const minutes = Math.max(30, Math.round(Terrain.distance(land, to.cell, s.cell) * 40 / 10) * 10);
      const way = s.through ? `a track off the road into ${zone.naming.name}` : this.fill(t.into, { zone: zone.naming.name });
      return `  Passage ${zone.id}_way${i + 1} ${q(way)} is path between ${s.from} and ${to.id} taking ${RegionRoads.time(minutes)}.`;
    });
  }
  // The ways in, each from where it starts to the landmark nearest it, and one to the edge from the settlement it is
  // known by where none comes to the edge.
  private static ways(zone: Wilds, region: Region, marks: Landmark[]) {
    const land = RegionGeography.atlas(region).land, edge = marks[0]!;
    const ways = this.starts(zone, region).map(s => ({ s, to: this.nearest(land, marks, s.cell) }));
    if (!ways.some(w => w.to === edge)) {
      const by = this.from(region, zone);
      ways.push({ s: { from: `${by.id}_green`, cell: by.cell!, through: false, by: by.name }, to: edge });
    }
    return ways;
  }
  // The ways a site's way is told by (RegionSites, leadsVia): the way in that comes to the landmark the telling begins
  // from, and the trails on from it, landmark by landmark, to where the site's track starts (as route says them).
  static told(region: Region, zone: Wilds, part: number): string[] {
    const all = this.landmarks(region, zone), land = RegionGeography.atlas(region).land;
    const to = all.find(l => l.id === this.room(zone, part))!, tree = this.tree(land, all);
    const path = all.filter((l, i) => i === 0 || l.side).map(e => this.path(land, all, e, to))
      .sort((a, b) => a.length - b.length)[0]!;
    const trails = path.slice(1)
      .map((m, i) => tree.findIndex(([a, b]) => (a === path[i] && b === m) || (a === m && b === path[i])));
    const ways = this.ways(zone, region, all).flatMap((w, i) => w.to === path[0] ? [`${zone.id}_way${i + 1}`] : []);
    return [...ways, ...trails.map(i => `${zone.id}_trail${i + 1}`)];
  }
  // Leaving the trails: from a landmark, straight across the country to another the company has been to, quicker but
  // risked. Somewhere with a view, or someone who reads wild country, keeps you right; otherwise you may lose the
  // way. Lost, running water leads to the crossing, and casting about finds the edge again, in time.
  private static astray(zone: Wilds, region: Region, marks: Landmark[]): string[] {
    const q = JSON.stringify, z = zone.id, t = this.table[zone.wild], name = zone.naming.name;
    const joined = new Set(this.trails(zone, region, marks).map(l => /between (\S+) and (\S+) taking/.exec(l)!.slice(1).sort().join('|')));
    const land = RegionGeography.atlas(region).land;
    // Straight across is about three-quarters of the way round by the trails, and is risked.
    const across = marks.flatMap(a => marks.filter(b => b !== a && !joined.has([a.id, b.id].sort().join('|')))
      .map(b => `  Initially Assert ${z}_across(${a.id}, ${b.id}). Initially Set ${z}_span(${a.id}, ${b.id}) to ${Math.max(3, Terrain.distance(land, a.cell, b.cell) * 3)}.`));
    const water = marks.find(l => l.water), edge = marks[0]!;
    // Lost is nowhere in particular: the place has no position on any chart.
    return [`  Place ${z}_lost ${q(this.fill(t.lost.name, { zone: name }))} is room within ${z} outdoors.`,
      `  Observe ${z}_lost_scene at ${z}_lost as fixture when true ${q(this.fill(t.lost.scene, { zone: name }))}.`,
      `  Entity ${z}_mapped: fact ${q(`You know the lie of ${name}: its paths, its water, and which way the edges lie.`)}.`,
      // Its paths are ways the company can set out along, as if it had walked them (leadsVia).
      ...this.passages(region, zone).map(w => `  Initially Assert leadsVia(${z}_mapped, ${w}).`),
      `  Relation ${z}_across(place, place). Relation ${z}_heading(group, place). Relation ${z}_astray(group). Relation ${z}_casting(group).`,
      `  Measure ${z}_span(place, place).`,
      ...across,
      `  Action ${z}_strike(actor: group, start: place, dest: place) ${q(`Strike out across ${name} toward {dest}`)} {`,
      `    Description ${q('Leave the path and go straight there across the country: quicker, if you do not lose your way.')}.`,
      `    Requires able(actor) and at(actor, start) and ${z}_across(start, dest) and been(actor, dest) and not benighted(actor).`,
      `    Time ${z}_span(start, dest). On success { Retract at(actor, start). Assert at(actor, ${z}_lost). Assert ${z}_heading(actor, dest). }`, '  }',
      // One of the company's fellows who reads wild country finds the way, and is seen to.
      `  Rule ${z}_guided when ${z}_heading(party, ?goal) and at(party, ${z}_lost) and memberOf(?m, party) and fellow(?m) and brings(?m, woodcraft) says ${q(t.lost.guided)} {`,
      `    Retract ${z}_heading(party, ?goal). Retract at(party, ${z}_lost). Assert at(party, ?goal). }`,
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
  // How to come to a part of a wild country, landmark by landmark, as someone who knows it would tell it: "into
  // Sharpmunt and on to the tarn, then the crag".
  static route(region: Region, zone: Wilds, part: number): string {
    const all = this.landmarks(region, zone), to = all.find(l => l.id === this.room(zone, part))!;
    const land = RegionGeography.atlas(region).land;
    // Told from the edge it is nearest by the trails, which is named for the town it is entered from (the foot of
    // Barzelrehes by Muzgkom), and on along them.
    const [entry, ...marks] = all.filter((l, i) => i === 0 || l.side).map(e => this.path(land, all, e, to))
      .sort((a, b) => a.length - b.length)[0]!;
    return `to ${entry!.name}${marks.length ? `, and on to ${marks.map(l => l.name).join(', then ')}` : ''}`;
  }
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
