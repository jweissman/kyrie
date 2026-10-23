import { memo } from 'react';
import type { Chart } from '../../src/ui/screen-types';

interface Point { x: number; y: number }
interface Label { x: number; y: number; anchor: 'start' | 'middle' | 'end'; text: string }

// The ways around where you stand, as a small diagram: the places you know here where they lie on the land, the paths
// between them (a path you have not walked is drawn broken), the ways out to somewhere else as short arrows, and you.
// Names are set where they do not run into one another; one that cannot be set is left to the place's own page.
export class WayChart {
  static readonly width = 520;
  static readonly View = memo(WayChart.chart);
  private static chart({ chart }: { chart: Chart }) {
    const inside = chart.places.filter(p => !p.external), xs = inside.map(p => p.x), ys = inside.map(p => p.y);
    if (!inside.length) { return null; }
    const [minX, minY, maxX, maxY] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    // A cell of the land is as wide as the page allows, so the names are set at a size that can be read.
    const span = Math.max(1, maxX - minX, (maxY - minY) * 1.3), c = Math.min(150, (WayChart.width - 220) / span);
    const at = new Map(inside.map(p => [p.id, { x: (p.x - minX) * c, y: (p.y - minY) * c }]));
    WayChart.exits(chart, at, c);
    const pts = [...at.values()], labels: Label[] = [];
    const [x0, y0] = [Math.min(...pts.map(p => p.x)) - 110, Math.min(...pts.map(p => p.y)) - 40];
    const [x1, y1] = [Math.max(...pts.map(p => p.x)) + 110, Math.max(...pts.map(p => p.y)) + 44];
    return (
      <svg className="way" viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} role="img" aria-label="The ways you know around you">
        {chart.edges.map(e => {
          const a = at.get(e.from), b = at.get(e.to);
          if (!a || !b) { return null; }
          const beyond = chart.places.find(p => p.id === e.to || p.id === e.from)?.external;
          const kind = `trail ${e.status}${e.explored ? '' : ' unexplored'}${beyond ? ' out' : ''}`;
          return <path key={e.id + e.from + e.to} className={kind} d={WayChart.curve(a, b)} />;
        })}
        {chart.places.map(p => {
          const pt = at.get(p.id);
          if (!pt) { return null; }
          const label = WayChart.place(pt, p.name, labels, !!p.external);
          return (
            <g key={p.id} className={`spot${p.here ? ' here' : ''}${p.visited ? ' been' : ''}${p.external ? ' out' : ''}`}
              data-place={p.id} {...p.here ? { 'aria-current': 'location' } : {}}>
              <title>{p.name}</title>
              {p.external ? <path d={`M${pt.x - 5},${pt.y - 5} l5,5 l-5,5`} />
                : <circle cx={pt.x} cy={pt.y} r={p.here ? 7 : 4.5} />}
              {p.here && <circle className="ring" cx={pt.x} cy={pt.y} r={13} />}
              {label && <text x={label.x} y={label.y} textAnchor={label.anchor}>{label.text}</text>}
            </g>
          );
        })}
      </svg>
    );
  }
  // A way out is drawn a short way off from the place it leaves, toward where it goes; several from one place fan out.
  private static exits(chart: Chart, at: Map<string, Point>, c: number) {
    const from = new Map<string, number>();
    for (const e of chart.edges) {
      const out = chart.places.find(p => p.external && (p.id === e.to || p.id === e.from));
      const inside = out && at.get(out.id === e.to ? e.from : e.to);
      if (!out || !inside || at.has(out.id)) { continue; }
      const origin = chart.places.find(p => p.id === (out.id === e.to ? e.from : e.to))!;
      const n = from.get(origin.id) ?? 0, angle = Math.atan2(out.y - origin.y, out.x - origin.x) + (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 0.55;
      from.set(origin.id, n + 1);
      at.set(out.id, { x: inside.x + Math.cos(angle) * Math.max(70, c * 0.7), y: inside.y + Math.sin(angle) * Math.max(70, c * 0.7) });
    }
  }
  private static curve(a: Point, b: Point): string {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    return `M${a.x},${a.y} Q${mx - dy * 0.12},${my + dx * 0.12} ${b.x},${b.y}`;
  }
  // The first of below, above, right and left where the name runs into no other.
  private static place(p: Point, name: string, labels: Label[], out: boolean): Label | undefined {
    const text = name.replace(/^(the|a|an) /i, ''), w = Math.min(220, text.length * 7.2);
    const tries: Label[] = [{ x: p.x, y: p.y + 24, anchor: 'middle', text },
      { x: p.x, y: p.y - 14, anchor: 'middle', text }, { x: p.x + 14, y: p.y + 5, anchor: 'start', text },
      { x: p.x - 14, y: p.y + 5, anchor: 'end', text }];
    const order = out ? [...tries.slice(2), ...tries.slice(0, 2)] : tries;
    const fits = order.find(t => !labels.some(o => WayChart.overlap(t, o, w)));
    if (fits) { labels.push(fits); }
    return fits;
  }
  private static overlap(a: Label, b: Label, w: number): boolean {
    return Math.abs(a.y - b.y) < 16 && WayChart.left(a, w) < WayChart.left(b, w) + w && WayChart.left(b, w) < WayChart.left(a, w) + w;
  }
  private static left(l: Label, w: number): number { return l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2; }
}
