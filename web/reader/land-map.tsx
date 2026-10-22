import { memo } from 'react';
import type { RegionChart } from '../../src/ui/screen-types';
import type { Travel } from './reader-app';

interface Point { x: number; y: number }
type Land = NonNullable<RegionChart['land']>;

// A region drawn on its own land: only the cells the company knows, each marked for what covers it (trees, fell,
// heath, reeds, open water), the rivers and roads that run through them, and the places on them. The known land
// fades into blank paper at its edges: the rest is not drawn, because the company has not seen it. Behind the page
// it shows the country around the company; opened, all the land the company knows, at a scale that can be read.
export class LandMap {
  static readonly size = 88;
  static readonly View = memo(LandMap.view);
  private static view({ region, travel, large }: { region: RegionChart; travel?: Travel; large: boolean }) {
    const land = region.land!, size = LandMap.size, known = new Set(land.known);
    const at = new Map(region.areas.map(a => [a.id, LandMap.point(a.x, a.y)]));
    const from = travel && region.within[travel.from], to = travel && region.within[travel.to];
    const box = large ? LandMap.whole(land) : LandMap.around(at.get(region.areas.find(a => a.here)?.id ?? '')
      ?? LandMap.point(land.known[0]! % land.width, Math.floor(land.known[0]! / land.width)));
    return (
      <svg className="region landed" viewBox={box.join(' ')} role="img" aria-label="The region as far as you know it"
        preserveAspectRatio="xMidYMid meet" {...large ? { width: box[2]! * 0.62, height: box[3]! * 0.62 } : {}}>
        <defs>
          <filter id="land-edge"><feGaussianBlur stdDeviation={size * 0.32} /></filter>
          <mask id="land-known"><g filter="url(#land-edge)">
            {land.known.map(c => <rect key={c} x={(c % land.width) * size} y={Math.floor(c / land.width) * size}
              width={size} height={size} fill="white" />)}</g></mask>
        </defs>
        <g className="cells" mask="url(#land-known)">
          {land.known.map(c => LandMap.tile(land, c))}
          {land.rivers.map((r, i) => <path key={`river${i}`} className={`river-course${i ? ' lesser' : ''}`}
            d={LandMap.line(r.filter(c => known.has(c)).map(c => LandMap.centre(land, c)))} />)}
          {Object.entries(land.roads).map(([id, cells]) => <path key={id} className="road-course"
            d={LandMap.line(cells.filter(c => known.has(c)).map(c => LandMap.centre(land, c)))} />)}
        </g>
        {region.edges.map(e => {
          const a = at.get(e.from), b = at.get(e.to);
          if (!a || !b) { return null; }
          const going = !!from && !!to && [e.from, e.to].sort().join() === [from, to].sort().join();
          const time = e.label.split(' · ').at(-1)!;
          return (
            <g key={`${e.from}|${e.to}`} className={`route ${e.status}${going ? ' going' : ''}`}>
              <path id={`route-${e.from}-${e.to}`} d={`M${a.x},${a.y} L${b.x},${b.y}`}><title>{e.label}</title></path>
              <text className="route-label" dy={-7}><textPath href={`#route-${e.from}-${e.to}`} startOffset="50%"
                textAnchor="middle">{time}</textPath></text>
              {going && <circle className="traveller" r={7}><animateMotion dur="1.6s" fill="freeze"
                path={from === e.to ? `M${b.x},${b.y} L${a.x},${a.y}` : `M${a.x},${a.y} L${b.x},${b.y}`} /></circle>}
            </g>
          );
        })}
        {region.areas.map(a => LandMap.area(a, at.get(a.id)!))}
      </svg>
    );
  }
  // All the land the company knows, with a cell's margin.
  private static whole(land: Land): number[] {
    const xs = land.known.map(c => c % land.width), ys = land.known.map(c => Math.floor(c / land.width));
    const [x0, y0] = [Math.min(...xs) - 1, Math.min(...ys) - 1], size = LandMap.size;
    return [x0 * size, y0 * size, (Math.max(...xs) - x0 + 2) * size, (Math.max(...ys) - y0 + 2) * size];
  }
  // The country around a point, six cells across and eight down.
  private static around(p: Point): number[] {
    const size = LandMap.size;
    return [p.x - 3 * size, p.y - 4 * size, 6 * size, 8 * size];
  }
  static point(x: number, y: number): Point { return { x: (x + 0.5) * LandMap.size, y: (y + 0.5) * LandMap.size }; }
  private static centre(land: Land, c: number): Point { return LandMap.point(c % land.width, Math.floor(c / land.width)); }
  // A smooth line through the centres of a run of cells.
  private static line(points: Point[]): string {
    if (points.length < 2) { return ''; }
    const [first, ...rest] = points;
    return `M${first!.x},${first!.y} ${rest.map((p, i) => {
      const prev = points[i]!;
      return `Q${prev.x},${prev.y} ${(prev.x + p.x) / 2},${(prev.y + p.y) / 2}`;
    }).join(' ')} L${points.at(-1)!.x},${points.at(-1)!.y}`;
  }
  // One cell of land, marked for what covers it; each cell's marks fall a little differently.
  private static tile(land: Land, c: number) {
    const s = LandMap.size, x = (c % land.width) * s, y = Math.floor(c / land.width) * s;
    const kind = LandMap.covers[land.cover[c]!] ?? 'meadow', marks = LandMap.marks(kind, s, c);
    return (
      <g key={c} className={`tile ${kind}`} transform={`translate(${x},${y})`}>
        {['water', 'sea'].includes(kind) && <rect width={s} height={s} />}
        {marks.map((d, i) => <path key={i} d={d} />)}
      </g>
    );
  }
  static readonly covers: Record<string, string> = { '~': 'sea', o: 'water', ',': 'fen', '.': 'meadow', w: 'wood',
    h: 'heath', f: 'fell', p: 'peak' };
  // How far a cell's nth mark strays from its place, the same each time the cell is drawn.
  private static jitter(c: number, n: number): number { return ((c * 7919 + n * 104729) % 23) - 11; }
  private static marks(kind: string, s: number, c: number): string[] {
    const j = [0, 1, 2, 3, 4, 5].map(n => LandMap.jitter(c, n));
    switch (kind) {
      case 'meadow': return [`M${s * 0.3 + j[1]!},${s * 0.62} l3,-6 M${s * 0.66 + j[2]!},${s * 0.4} l3,-6`];
      case 'wood': return [[0.28, 0.42], [0.66, 0.36], [0.46, 0.72]].map(([a, b], i) => {
        const x = s * a! + j[i]!, y = s * b! + j[i + 3]! / 2;
        return `M${x},${y + 9} v-6 M${x - 7},${y + 3} a7,8 0 1 1 14,0 z`;
      });
      case 'heath': return [[0.25, 0.4], [0.6, 0.3], [0.45, 0.7]].map(([a, b], i) =>
        `M${s * a! + j[i]! - 5},${s * b!} l2.5,-6 l2.5,6 l2.5,-6 l2.5,6`);
      case 'fen': return [`M${s * 0.3 + j[1]!},${s * 0.62} v-14 M${s * 0.36 + j[1]!},${s * 0.62} q1,-10 5,-14`,
        `M${s * 0.6 + j[2]!},${s * 0.42} v-12`, `M${s * 0.2},${s * 0.8} h12 M${s * 0.58},${s * 0.76} h16`];
      case 'fell': return [`M${s * 0.16 + j[1]!},${s * 0.58} q${s * 0.17},-${s * 0.26} ${s * 0.34},0`,
        `M${s * 0.48 + j[2]!},${s * 0.4} q${s * 0.16},-${s * 0.24} ${s * 0.32},0`];
      case 'peak': return [`M${s * 0.18},${s * 0.74} L${s * 0.5},${s * 0.2} L${s * 0.82},${s * 0.74}`,
        `M${s * 0.38},${s * 0.4} L${s * 0.5},${s * 0.2} L${s * 0.62},${s * 0.4}`];
      case 'water': return [`M${s * 0.25 + j[1]!},${s * 0.45} h14 M${s * 0.5 + j[2]!},${s * 0.66} h18`];
      case 'sea': return [`M${s * 0.2 + j[1]!},${s * 0.4} q5,-5 10,0 t10,0 M${s * 0.45 + j[2]!},${s * 0.7} q5,-5 10,0 t10,0`];
      default: return [];
    }
  }
  private static area(a: RegionChart['areas'][number], c: Point) {
    const mark = a.kind === 'settlement' ? <g className="glyph" transform="scale(1.1)">{[-12, 0, 12].map((x, i) =>
      <path key={x} d={`M${x - 5},${i === 1 ? -2 : 3} l5,-6 l5,6 v8 h-10 z`} />)}</g>
      : a.kind === 'site' ? <g className="glyph"><path d="M-9,10 v-13 a9,9 0 0 1 12,-7 M9,10 v-10 M-13,10 h26" /></g>
        : <circle className="spot" r={4} />;
    return (
      <g key={a.id} className={`area ${a.kind}${a.here ? ' here' : ''}${a.visited ? '' : ' unknown'}`}
        transform={`translate(${c.x},${c.y})`} {...a.here ? { 'aria-current': 'location' } : {}}>
        {mark}
        {a.here && <circle className="company" r={8} />}
        <text className="area-name" y={a.kind === 'settlement' ? 34 : 26} textAnchor="middle">{a.name}</text>
      </g>
    );
  }
}
