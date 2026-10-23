import { memo, useMemo } from 'react';
import type { RegionChart } from '../../src/ui/screen-types';
import { Cartography, type Field, type Ground, type Pt } from './cartography';
import { MapMarks, type Mark } from './map-marks';
import { MapLabels, type Placed, type Wanted } from './map-labels';

type Land = NonNullable<RegionChart['land']>;
type Edge = RegionChart['edges'][number];
interface Spot extends Pt { id: string; name: string; kind: string; here: boolean; visited: boolean; r: number }
interface Drawing {
  box: number[]; shapes: Record<string, string>; marks: Mark[]; rivers: string[]; roads: string[];
  paths: { edge: Edge; d: string; mid: Pt }[]; stops: { edge: Edge; at: Pt }[]; places: Spot[]; labels: Placed[];
  here?: Pt; pine: boolean;
}

// A region drawn as a map of its land, only as far as the company knows it: the shores of its waters and the edges
// of its woods, fens, heaths and fells drawn over the cells rather than as them, with marks scattered by hand; the
// rivers and the known roads running through; the paths into wild country; the settlements, sites, landmarks and
// march-stones the company knows; the names of the wild country written across it; and where the company is. The
// land fades into blank paper where its knowledge ends. Every name has room: one that would cross another is left
// for a closer look.
export class LandMap {
  static readonly View = memo(LandMap.view);
  // Which mark each cover is drawn with.
  static readonly marks: Record<string, string> = { w: 'tree', ',': 'reed', h: 'tuft', f: 'hill', p: 'peak', '.': 'grass' };
  private static view({ region }: { region: RegionChart }) {
    const d = useMemo(() => LandMap.draw(region), [region]);
    const [x, y, w, h] = d.box;
    return (
      <svg className="land" viewBox={d.box.join(' ')} role="img" aria-label="The region as far as you know it"
        style={{ minWidth: `${Math.round(w! * 0.62)}px`, maxWidth: `${Math.round(w! * 0.92)}px` }}>
        <LandMap.Defs pine={d.pine} known={d.shapes.known!} />
        <g className="ground" mask="url(#land-known)">
          <rect className="paper" x={x} y={y} width={w} height={h} />
          {['fell', 'heath', 'fen', 'wood'].map(k => <path key={k} className={`cover ${k}`} d={d.shapes[k]} />)}
          <path className="cover water" d={d.shapes.water} />
          <path className="shore inner" d={d.shapes.inner} /><path className="shore far" d={d.shapes.far} />
          <path className="shore" d={d.shapes.water} />
          {d.marks.map((m, i) => <use key={i} href={`#mk-${m.cover === 'w' && d.pine ? 'pine' : LandMap.marks[m.cover]}`}
            transform={`translate(${m.x.toFixed(1)},${m.y.toFixed(1)}) scale(${m.s.toFixed(2)})`} />)}
          {d.rivers.map((r, i) => <path key={i} className={`river${i ? ' lesser' : ''}`} d={r} />)}
          {d.roads.map((r, i) => <g key={i} className="road"><path className="casing" d={r} /><path d={r} /></g>)}
        </g>
        {d.paths.map(p => <path key={`${p.edge.from}|${p.edge.to}`} className={`path ${p.edge.status}`} d={p.d}>
          <title>{p.edge.label}</title></path>)}
        {d.stops.map(s => LandMap.stop(s.edge, s.at))}
        {d.places.map(LandMap.place)}
        {d.here && <g className={`company${d.places.some(p => p.here && p.x === d.here!.x && p.y === d.here!.y) ? ' at' : ''}`}
          transform={`translate(${d.here.x},${d.here.y})`} aria-current="location">
          <circle className="halo" r={d.places.some(p => p.here && p.kind === 'settlement') ? 30 : 17} /><circle className="dot" r={7.5} />
          <title>You are here</title></g>}
        {d.labels.map(l => <text key={l.id} className={`name ${LandMap.face(l.id, d)}`} x={l.x.toFixed(1)}
          y={l.y.toFixed(1)} textAnchor={l.anchor}>{l.lines.map((line, i) => <tspan key={i} x={l.x.toFixed(1)}
            dy={i ? l.leading.toFixed(1) : 0}>{line}</tspan>)}</text>)}
        <LandMap.North x={x! + w! - 46} y={y! + 54} />
      </svg>
    );
  }
  static draw(region: RegionChart): Drawing {
    const land = region.land!, W = land.width, known = new Set(land.known);
    const ground: Ground = { width: W, height: land.height, cover: land.cover }, fields = LandMap.fields(ground, known);
    const rivers = land.rivers.map(r => Cartography.course(W, r, 0.42)), roads = Object.values(land.roads)
      .map(r => Cartography.course(W, r, 0.2));
    const places = LandMap.places(region, land), here = land.here !== undefined ? Cartography.centre(W, land.here)
      : places.find(p => p.here);
    const paths = region.edges.filter(e => e.course && !e.road && e.course.length > 1).map(e => LandMap.path(W, e));
    const middles = region.edges.flatMap(e => {
      const p = paths.find(x => x.edge === e);
      return p ? [{ edge: e, at: p.mid }] : e.course && e.road ? [{ edge: e, at: LandMap.middle(W, e.course) }] : [];
    });
    const taken = [...places.map(p => MapLabels.around(p, p.r)), ...here ? [MapLabels.around(here, 16)] : [],
      // The roads and paths themselves: a name is not written across a way.
      ...[...roads, ...paths.map(p => p.points)].flatMap(line => LandMap.along(line))];
    const labels = MapLabels.place(LandMap.wanted(land, places, middles), [...taken, LandMap.compass(land)]);
    const clear = { spots: [...places.map(p => ({ x: p.x, y: p.y, r: p.r + 8 })), ...here ? [{ ...here, r: 24 }] : []],
      lines: [...roads, ...rivers, ...paths.map(p => p.points)] };
    const marks = MapMarks.scatter(ground, land.known, fields, clear)
      .filter(m => !labels.some(l => MapLabels.inside(l.box, m, 5)));
    return { box: LandMap.whole(land), shapes: LandMap.shapes(fields), marks, rivers: rivers.map(r => Cartography.line(r)),
      roads: roads.map(r => Cartography.line(r)), paths, stops: middles.filter(m => m.edge.status !== 'open'), places,
      labels, ...here ? { here } : {}, pine: ['frost', 'mountain'].includes(region.terrain ?? '') };
  }
  // Small boxes along a line, so that names keep off it.
  private static along(line: Pt[]): ReturnType<typeof MapLabels.around>[] {
    return line.slice(1).flatMap((b, i) => {
      const a = line[i]!, n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 14));
      return Array.from({ length: n }, (_, j) => MapLabels.around({ x: a.x + (b.x - a.x) * j / n, y: a.y + (b.y - a.y) * j / n }, 3));
    });
  }
  private static covers(ground: Ground, marks: string): (c: number) => boolean {
    return c => marks.includes(ground.cover[c]!);
  }
  // How rough each cover's edges are: a shore less than a wood's edge.
  static readonly rough: Record<string, number> = { water: 0.62, w: 0.8, ',': 0.7, h: 0.7, f: 0.7, p: 0.5, '.': 0.5 };
  static readonly kinds: Record<string, string> = { water: '~o', w: 'w', ',': ',', h: 'h', f: 'fp', p: 'p', '.': '.' };
  private static fields(ground: Ground, known: Set<number>): Record<string, Field> {
    return { ...Object.fromEntries(Object.entries(LandMap.kinds).map(([k, marks]) =>
      [k, Cartography.field(ground, LandMap.covers(ground, marks), 4, LandMap.rough[k]!)])),
    known: Cartography.field(ground, c => known.has(c), 4, 0.9) };
  }
  private static outline(f: Field, level: number): string {
    return Cartography.path(Cartography.outlines(f, level).map(r => Cartography.round(r)));
  }
  private static shapes(fields: Record<string, Field>): Record<string, string> {
    const o = LandMap.outline;
    return { water: o(fields.water!, 0.5), inner: o(fields.water!, 0.7), far: o(fields.water!, 0.86),
      wood: o(fields.w!, 0.5), fen: o(fields[',']!, 0.5), heath: o(fields.h!, 0.5), fell: o(fields.f!, 0.5),
      known: o(fields.known!, 0.5) };
  }
  // The settlements the company knows, and each other place on the land it knows.
  private static places(region: RegionChart, land: Land): Spot[] {
    const W = land.width;
    const towns = region.areas.filter(a => a.kind === 'settlement').map(a => ({ id: a.id, name: a.name, kind: 'settlement',
      ...Cartography.centre(W, a.y * W + a.x), here: a.here, visited: a.visited, r: 18 }));
    const marks = land.marks.map(m => ({ id: m.id, name: m.name, kind: m.kind, ...Cartography.centre(W, m.cell),
      here: m.here, visited: m.visited, r: m.kind === 'site' ? 16 : 9 }));
    return [...towns, ...marks];
  }
  // A path between two places, bowed a little the same way each time.
  private static path(W: number, e: Edge): { edge: Edge; d: string; mid: Pt; points: Pt[] } {
    const ends = Cartography.course(W, e.course!, 0), a = ends[0]!, b = ends.at(-1)!;
    const bow = (Cartography.hash(e.course![0]!, e.course!.at(-1)!) - 0.5) * 0.36;
    const mid = { x: (a.x + b.x) / 2 - (b.y - a.y) * bow, y: (a.y + b.y) / 2 + (b.x - a.x) * bow };
    const points = ends.length > 2 ? ends : [a, mid, b];
    return { edge: e, d: Cartography.line(points), mid: points[Math.floor(points.length / 2)]!, points };
  }
  private static middle(W: number, cells: number[]): Pt {
    const a = Cartography.centre(W, cells[Math.floor((cells.length - 1) / 2)]!), b = Cartography.centre(W, cells[Math.ceil((cells.length - 1) / 2)]!);
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  // The names to write, the one that matters most first: where the company is, the settlements, the wild country,
  // the sites, the march-stones, the landmarks, and last how long the ways take.
  private static rank(p: Spot): number {
    return (p.here ? 0 : 10) + ({ settlement: 1, site: 3, stone: 4 }[p.kind] ?? 5) + (p.visited ? 0 : 0.5);
  }
  private static wanted(land: Land, places: Spot[], middles: { edge: Edge; at: Pt }[]): Wanted[] {
    const rank = LandMap.rank;
    const named = [...places].sort((a, b) => rank(a) - rank(b)).map(p => ({ id: p.id, text: p.name, at: [p],
      size: p.kind === 'settlement' ? 27 : p.kind === 'site' ? 21 : 19, face: p.kind === 'settlement' ? 'caps' : 'italic',
      gap: (p.here ? Math.max(p.r, p.kind === 'settlement' ? 30 : 17) : p.r) + 5 }) as Wanted);
    const zones = land.zones.map(z => ({ id: z.id, text: z.name.toUpperCase(), at: LandMap.across(land.width, z.cells),
      size: 20, face: 'spaced', gap: 0 }) as Wanted);
    const times = middles.map(m => ({ id: `time:${m.edge.from}|${m.edge.to}`, text: m.edge.label.split(' · ').at(-1)!,
      at: [m.at], size: 16, face: 'italic', gap: 12 }) as Wanted);
    const first = named.filter(n => rank(places.find(p => p.id === n.id)!) < 12);
    return [...first, ...zones, ...named.filter(n => !first.includes(n)), ...times];
  }
  // Where a stretch of country's name may go: over the middle of what is known of it, or else over each known part
  // of it, nearest the middle first.
  private static across(W: number, cells: number[]): Pt[] {
    const points = cells.map(c => Cartography.centre(W, c));
    const mid = { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length };
    return [mid, ...points.sort((a, b) => Math.hypot(a.x - mid.x, a.y - mid.y) - Math.hypot(b.x - mid.x, b.y - mid.y)).slice(0, 10)];
  }
  private static face(id: string, d: Drawing): string {
    if (id.startsWith('time:')) { return 'time'; }
    const p = d.places.find(x => x.id === id);
    return p ? `${p.kind}${p.visited ? '' : ' unknown'}${p.here ? ' here' : ''}` : 'zone';
  }
  // The corner the north mark takes, kept clear of names.
  private static compass(land: Land) {
    const [x, y, w] = LandMap.whole(land);
    return { x0: x! + w! - 80, y0: y!, x1: x! + w!, y1: y! + 100 };
  }
  // All the land the company knows, with half a cell's margin, and never past the edges of the land.
  private static whole(land: Land): number[] {
    const xs = land.known.map(c => c % land.width), ys = land.known.map(c => Math.floor(c / land.width)), S = Cartography.cell;
    const [x0, y0] = [Math.max(0, Math.min(...xs) - 0.5), Math.max(0, Math.min(...ys) - 0.5)];
    const [x1, y1] = [Math.min(land.width, Math.max(...xs) + 1.5), Math.min(land.height, Math.max(...ys) + 1.5)];
    return [x0 * S, y0 * S, (x1 - x0) * S, (y1 - y0) * S].map(n => Math.round(n));
  }
  private static place(p: Spot) {
    const cls = `place ${p.kind}${p.visited ? '' : ' unknown'}${p.here ? ' here' : ''}`;
    const mark = p.kind === 'settlement' ? <g className="roofs">{[[-11, 3], [0, -3], [11, 4]].map(([x, y]) =>
      <path key={x} d={`M${x! - 6},${y! + 6} v-6 l6,-6.5 l6,6.5 v6 z`} />)}</g>
      : p.kind === 'site' ? <path d="M-10,9 v-11 a10,10 0 0 1 13,-8.5 M8,9 v-9 M-14,9 h28" />
        : p.kind === 'stone' ? <path d="M-3.5,8 v-13 l3.5,-3 l3.5,3 v13 z" /> : <circle r={5} />;
    return <g key={p.id} className={cls} transform={`translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`}>{mark}<title>{p.name}</title></g>;
  }
  // What shuts a way, set across it where it runs: barred, watched, dangerous, or needing what the company lacks.
  private static stop(e: Edge, at: Pt) {
    return (
      <g key={`stop:${e.from}|${e.to}`} className={`stop ${e.status}`} transform={`translate(${at.x.toFixed(1)},${at.y.toFixed(1)})`}>
        <circle r={10} /><path d={e.status === 'hazard' ? 'M0,-5 v6 M0,4 v1' : 'M-4.5,-4.5 L4.5,4.5 M4.5,-4.5 L-4.5,4.5'} />
        <title>{e.reason ?? e.label}</title>
      </g>
    );
  }
  static North({ x, y }: { x: number; y: number }) {
    return <g className="north" transform={`translate(${x},${y})`}><path d="M0,-26 L7,6 L0,0 L-7,6 Z" />
      <text y={26} textAnchor="middle">N</text></g>;
  }
  // The marks the land is drawn with, and the bounds of what the company knows, softened into the paper.
  static Defs({ pine, known }: { pine: boolean; known: string }) {
    return (
      <defs>
        <filter id="land-fade" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={22} /></filter>
        <mask id="land-known" maskUnits="userSpaceOnUse" x="-5000" y="-5000" width="20000" height="20000">
          <path d={known} fill="white" filter="url(#land-fade)" /></mask>
        <g id="mk-tree" className="mk tree"><path className="trunk" d="M0,0 v-5" />
          <path className="crown" d="M-6.5,-4 C-8.6,-11 -3.6,-16.5 0,-16.5 C3.6,-16.5 8.6,-11 6.5,-4 Z" /></g>
        {pine && <g id="mk-pine" className="mk tree"><path className="trunk" d="M0,0 v-4" />
          <path className="crown" d="M0,-18 L6.5,-4 L-6.5,-4 Z" /></g>}
        <g id="mk-hill" className="mk hill"><path d="M-13,0 C-8,-10 8,-10 13,0" /><path className="shade" d="M4,-5.5 l3,4.5 M8,-3 l2,2.6" /></g>
        <g id="mk-peak" className="mk peak"><path className="face" d="M-14,0 L-1,-21 L13,0 Z" />
          <path className="shade" d="M-1,-21 L2,0 M2.5,-13 l4,6 M5,-8 l3.5,5" /></g>
        <g id="mk-reed" className="mk reed"><path d="M-3,0 q-1,-6 -4.5,-9 M0,0 v-10.5 M3,0 q1,-6 4.5,-8" />
          <path className="wet" d="M-10,3 h6 M2,3 h8" /></g>
        <g id="mk-tuft" className="mk tuft"><path d="M-5,0 l1.6,-4.5 M-.5,0 v-5.5 M4,0 l-1.6,-4.5" /></g>
        <g id="mk-grass" className="mk grass"><path d="M-2.5,0 l1,-4 M1.5,0 l1,-3.5" /></g>
      </defs>
    );
  }
}
