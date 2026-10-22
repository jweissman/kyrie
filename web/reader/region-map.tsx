import { memo, useEffect, type CSSProperties } from 'react';
import type { Chart, RegionChart, Screen } from '../../src/ui/screen-types';
import type { Travel } from './reader-app';

interface Point { x: number; y: number }

// The land behind the page, drawn only from what the world says and the company knows: the areas of the region where
// their grid puts them, the routes between them with how long each takes, and where the company is. A journey is
// drawn as it is made. Inside, the rooms the company knows are drawn instead.
export class RegionMap {
  static readonly cell = { w: 210, h: 170 };
  static View({ screen, travel, large }: { screen: Screen; travel?: Travel; large: boolean }) {
    const region = screen.region;
    // Opened on a phone, a wide region scrolls sideways at a scale that can be read, from where the company is.
    useEffect(() => {
      if (large) { document.querySelector('.backdrop.large .area.here')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }
    }, [large, region]);
    return (
      <div className={`backdrop${large ? ' large' : ''}${travel ? ' journey' : ''}`} aria-hidden={!large}>
        {region ? <RegionMap.Region region={region} travel={travel} large={large} /> : screen.chart
          ? <RegionMap.Local chart={screen.chart} /> : null}
        {large && region && screen.chart && <div className="inset"><RegionMap.Local chart={screen.chart} /></div>}
      </div>
    );
  }
  static readonly Region = memo(RegionMap.region);
  private static region({ region, travel, large }: { region: RegionChart; travel?: Travel; large: boolean }) {
    const xs = region.areas.map(a => a.x), ys = region.areas.map(a => a.y);
    const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
    // A wide region is drawn on a closer grid, so its names stay legible when it fits the pane.
    const w = Math.max(110, Math.min(RegionMap.cell.w, 840 / Math.max(1, Math.max(...xs) - minX)));
    const h = Math.max(100, Math.min(RegionMap.cell.h, 480 / Math.max(1, Math.max(...ys) - minY)));
    const width = (Math.max(...xs) - minX) * w, height = (Math.max(...ys) - minY) * h;
    const at = new Map(region.areas.map(a => [a.id, { x: (a.x - minX) * w, y: (a.y - minY) * h }]));
    const from = travel && region.within[travel.from], to = travel && region.within[travel.to];
    // Drawn tight around what is known, with room for the names, so the land fills the space it has; but behind the
    // page, never so close that two known places fill the whole pane.
    const [w0, h0] = [Math.max(width + 260, large ? 560 : 820), Math.max(height + 150, large ? 400 : 560)];
    const box = [-130 - (w0 - width - 260) / 2, -70 - (h0 - height - 150) / 2, w0, h0];
    return (
      <svg className="region" viewBox={box.join(' ')} role="img" style={{ '--span': Math.max(...xs) - minX } as CSSProperties}
        aria-label="The region as far as you know it" preserveAspectRatio="xMidYMid meet">
        {region.terrain && RegionMap.texture(region.terrain, box)}
        {region.areas.filter(a => a.form === 'river').map(a => RegionMap.river(at.get(a.id)!, box, a.id))}
        {region.edges.map(e => {
          const a = at.get(e.from)!, b = at.get(e.to)!, d = RegionMap.curve(a, b, e.from + e.to);
          const going = !!from && !!to && [e.from, e.to].sort().join() === [from, to].sort().join();
          const [name, time] = [e.label.split(' · ')[0]!, e.label.split(' · ').at(-1)!];
          return (
            <g key={`${e.from}|${e.to}`} className={`route ${e.status}${going ? ' going' : ''}`}>
              <path id={`route-${e.from}-${e.to}`} d={d}><title>{name} · {time}</title></path>
              <text className="route-label" dy={-7}><textPath href={`#route-${e.from}-${e.to}`} startOffset="50%"
                textAnchor="middle">{time}</textPath></text>
              {going && <circle className="traveller" r={7}><animateMotion dur="1.6s" fill="freeze"
                path={RegionMap.curve(a, b, e.from + e.to, from === e.to)} /></circle>}
            </g>
          );
        })}
        {region.areas.map(a => RegionMap.area(a, at.get(a.id)!))}
      </svg>
    );
  }
  // A road is never drawn ruler-straight: it bows a little, the same way each time.
  static curve(a: Point, b: Point, seed: string, reverse = false): string {
    const [p, q] = reverse ? [b, a] : [a, b];
    const hash = [...seed].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 997, 7), bow = ((hash % 7) - 3) * 0.06;
    const mx = (p.x + q.x) / 2 - (q.y - p.y) * bow * (reverse ? -1 : 1);
    const my = (p.y + q.y) / 2 + (q.x - p.x) * bow * (reverse ? -1 : 1);
    return `M${p.x},${p.y} Q${mx},${my} ${q.x},${q.y}`;
  }
  // The lie of the land behind everything: small marks of the region's terrain, trees, reeds, fells or snow.
  private static texture(terrain: string, box: number[]) {
    const marks: Record<string, string> = { forest: 'M14,40 l9,-18 l9,18 M23,40 v6 M70,96 l9,-18 l9,18 M79,96 v6',
      marsh: 'M10,40 q2,-14 -4,-22 M16,40 v-24 M22,40 q-2,-14 4,-20 M66,96 q2,-14 -4,-22 M72,96 v-24 M78,96 q-2,-14 4,-20',
      mountain: 'M6,40 q14,-22 28,0 M62,96 q14,-22 28,0', frost: 'M14,30 h12 M20,24 v12 M70,86 h12 M76,80 v12' };
    if (!marks[terrain]) { return null; }
    return (
      <g className={`terrain-texture ${terrain}`}>
        <defs><pattern id={`terrain-${terrain}`} width={112} height={112} patternUnits="userSpaceOnUse">
          <path d={marks[terrain]} /></pattern></defs>
        <rect x={box[0]} y={box[1]} width={box[2]} height={box[3]} fill={`url(#terrain-${terrain})`} />
      </g>
    );
  }
  // A river is drawn through the country it crosses, from beyond the top of what is known to beyond the bottom.
  private static river(c: Point, box: number[], id: string) {
    const [top, bottom] = [box[1]!, box[1]! + box[3]!];
    const d = `M${c.x - 60},${top} C${c.x + 50},${(top + c.y) / 2} ${c.x - 50},${c.y - 40} ${c.x},${c.y}`
      + ` S${c.x + 80},${(c.y + bottom) / 2} ${c.x + 30},${bottom}`;
    return <path key={`river-${id}`} className="river-course" d={d} />;
  }
  private static area(a: RegionChart['areas'][number], c: Point) {
    return (
      <g key={a.id} className={`area ${a.kind}${a.form ? ` ${a.form}` : ''}${a.here ? ' here' : ''}${a.visited ? '' : ' unknown'}`}
        transform={`translate(${c.x},${c.y})`} {...a.here ? { 'aria-current': 'location' } : {}}>
        {a.form ? RegionMap.land(a.form) : RegionMap.glyph(a.kind)}
        {a.here && <circle className="company" r={8} />}
        <text className="area-name" y={44} textAnchor="middle">{a.name}</text>
      </g>
    );
  }
  // How each kind of area is marked: a few roofs for a settlement, tufts for open country, a broken arch for a site.
  private static glyph(kind: string) {
    if (kind === 'settlement') {
      return <g className="glyph" transform="scale(1.4)">{[-14, 0, 14].map((x, i) => <path key={x}
        d={`M${x - 6},${i === 1 ? -2 : 4} l6,-7 l6,7 v9 h-12 z`} />)}</g>;
    }
    if (kind === 'site') {
      return <g className="glyph" transform="scale(1.4)"><path d="M-11,12 v-16 a11,11 0 0 1 14,-8 M11,12 v-12" />
        <path d="M-15,12 h30" /></g>;
    }
    return <g className="glyph" transform="scale(1.4)">{[[-14, 6], [0, -2], [13, 8]].map(([x, y]) => <path key={x}
      d={`M${x! - 5},${y} l5,-9 l5,9`} />)}</g>;
  }
  // How each kind of land is marked: the ford's water, a wood's trees, a mere, a pass between peaks.
  private static land(form: string) {
    const shapes: Record<string, string[]> = {
      river: ['M-20,-6 q5,-5 10,0 t10,0 t10,0 t10,0', 'M-20,4 q5,-5 10,0 t10,0 t10,0 t10,0'],
      wood: [-14, 0, 14].flatMap((x, i) => [`M${x},${12 - i * 2} v-7`, `M${x - 7},${5 - i * 2} a7,8 0 1 1 14,0 z`]),
      lake: ['M-20,4 a20,9 0 1 0 40,0 a20,9 0 1 0 -40,0', 'M-9,2 h8 M3,7 h7'],
      pass: ['M-22,12 L-10,-10 L-3,1 L3,-4 L10,-13 L22,12', 'M-3,1 L0,12'],
      peak: ['M-18,12 L0,-16 L18,12 Z', 'M-6,-7 L0,-16 L6,-7'] };
    return <g className="glyph land" transform="scale(1.4)">{(shapes[form] ?? []).map(d => <path key={d} d={d} />)}</g>;
  }
  static readonly Local = memo(RegionMap.local);
  // The rooms the company knows in the area or level it is in, where the author's grid puts them.
  private static local({ chart }: { chart: Chart }) {
    const w = 150, h = 96, xs = chart.places.map(p => p.x), ys = chart.places.map(p => p.y);
    const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
    const width = (Math.max(...xs) - minX + 1) * w, height = (Math.max(...ys) - minY + 1) * h;
    const at = new Map(chart.places.map(p => [p.id, { x: (p.x - minX) * w + w / 2, y: (p.y - minY) * h + h / 2 }]));
    return (
      <svg className="local" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="The places you know here">
        {chart.edges.map(e => {
          const a = at.get(e.from), b = at.get(e.to);
          return a && b ? <line key={e.id + e.from} className={`way ${e.status}${e.explored ? '' : ' unexplored'}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> : null;
        })}
        {chart.places.map(p => {
          const c = at.get(p.id)!;
          return (
            <g key={p.id} className={`room${p.here ? ' here' : ''}${p.visited ? '' : ' unknown'}${p.external ? ' beyond' : ''}`}
              data-place={p.id} {...p.here ? { 'aria-current': 'location' } : {}}>
              <circle cx={c.x} cy={c.y} r={p.here ? 7 : 4.5} />
              <text x={c.x} y={c.y + 22} textAnchor="middle">{p.name.replace(/^(the|a|an) /i, '')}</text>
            </g>
          );
        })}
      </svg>
    );
  }
}
