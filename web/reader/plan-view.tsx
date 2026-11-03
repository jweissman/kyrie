import { memo } from 'react';
import type { Chart, Screen } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';

interface Point { x: number; y: number }
interface Label { x: number; y: number; anchor: 'start' | 'middle' | 'end'; text: string }

// Inside somewhere (a site, its levels), the Map is the plan of where you are, not the country (the navigation
// review's NVR-15 and NVR-16: the screen built a plan of each level that nothing drew, and the map showed the first
// town): the rooms known on this level where they lie, the ways between them (a way not yet walked drawn broken), the
// ways out of the level as short arrows toward where they go, up or down, the rooms not yet been to hollow, and you.
// Names are set where they do not run into one another; one that cannot be set is left to the room's own page.
export class PlanView {
  static readonly width = 520;
  // Whether there is a plan to show: below ground, with rooms known there (above ground, the Map is the country's,
  // and the world map is offered there).
  static inside(screen: Screen): boolean {
    return !!screen.place.underground && !!screen.chart?.places.some(p => !p.external);
  }
  static View({ screen }: { screen: Screen }) {
    const chart = screen.chart!, level = chart.level ?? screen.path.at(-1)?.name ?? screen.place.name;
    return (
      <section className="plan" data-region="plan" aria-label="The plan">
        <p className="where">The plan</p>
        <h1 className="place">{Typography.curl(level.charAt(0).toUpperCase() + level.slice(1))}</h1>
        {chart.levels && chart.levels.length > 1 && <ol className="levels" aria-label="The levels you have been on">
          {chart.levels.map(l => <li key={l.name} {...l.here ? { 'aria-current': 'location' as const } : {}}>
            {Typography.curl(l.name)}</li>)}</ol>}
        <PlanView.Drawn chart={chart} />
        <p className="key">Where you are is ringed; a room you have not been in is hollow; a way you have not taken is
          broken; an arrow is a way out of this level.</p>
      </section>
    );
  }
  static readonly Drawn = memo(PlanView.drawn);
  private static drawn({ chart }: { chart: Chart }) {
    const inside = chart.places.filter(p => !p.external), xs = inside.map(p => p.x), ys = inside.map(p => p.y);
    const [minX, minY, maxX, maxY] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    // A cell of the plan is as wide as the page allows, so the names are set at a size that can be read.
    const span = Math.max(1, maxX - minX, (maxY - minY) * 1.3), c = Math.min(150, (PlanView.width - 220) / span);
    const at = new Map(inside.map(p => [p.id, { x: (p.x - minX) * c, y: (p.y - minY) * c }]));
    PlanView.exits(chart, at, c);
    const pts = [...at.values()], labels: Label[] = [];
    const [x0, y0] = [Math.min(...pts.map(p => p.x)) - 110, Math.min(...pts.map(p => p.y)) - 40];
    const [x1, y1] = [Math.max(...pts.map(p => p.x)) + 110, Math.max(...pts.map(p => p.y)) + 44];
    return (
      <svg className="plan-drawn" viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} role="img"
        aria-label="The rooms and ways you know on this level">
        {chart.edges.map(e => PlanView.trail(chart, at, e))}
        {chart.places.map(p => PlanView.spot(p, at.get(p.id), labels))}
      </svg>
    );
  }
  private static trail(chart: Chart, at: Map<string, Point>, e: Chart['edges'][number]) {
    const a = at.get(e.from), b = at.get(e.to);
    if (!a || !b) { return null; }
    const beyond = chart.places.find(p => p.id === e.to || p.id === e.from)?.external;
    const kind = `trail ${e.status}${e.explored ? '' : ' unexplored'}${beyond ? ' out' : ''}`;
    return <path key={e.id + e.from + e.to} className={kind} d={PlanView.curve(a, b)} />;
  }
  private static spot(p: Chart['places'][number], pt: Point | undefined, labels: Label[]) {
    if (!pt) { return null; }
    const way = p.rise === 'up' ? 'up' : p.rise === 'down' ? 'down' : '';
    const label = PlanView.place(pt, `${way ? `${way} to ` : ''}${p.name}`, labels, !!p.external);
    return (
      <g key={p.id} className={`spot${p.here ? ' here' : ''}${p.visited ? ' been' : ''}${p.external ? ' out' : ''}`}
        data-place={p.id} {...p.here ? { 'aria-current': 'location' as const } : {}}>
        <title>{p.name}</title>
        {p.external ? <path d={`M${pt.x - 5},${pt.y - 5} l5,5 l-5,5`} />
          : <circle cx={pt.x} cy={pt.y} r={p.here ? 7 : 4.5} />}
        {p.here && <circle className="ring" cx={pt.x} cy={pt.y} r={13} />}
        {label && <text x={label.x} y={label.y} textAnchor={label.anchor}>{label.text}</text>}
      </g>
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
      const n = from.get(origin.id) ?? 0;
      const angle = Math.atan2(out.y - origin.y, out.x - origin.x) + (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 0.55;
      from.set(origin.id, n + 1);
      const r = Math.max(70, c * 0.7);
      at.set(out.id, { x: inside.x + Math.cos(angle) * r, y: inside.y + Math.sin(angle) * r });
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
    const fits = order.find(t => !labels.some(o => PlanView.overlap(t, o, w)));
    if (fits) { labels.push(fits); }
    return fits;
  }
  private static overlap(a: Label, b: Label, w: number): boolean {
    return Math.abs(a.y - b.y) < 16 && PlanView.left(a, w) < PlanView.left(b, w) + w
      && PlanView.left(b, w) < PlanView.left(a, w) + w;
  }
  private static left(l: Label, w: number): number {
    return l.anchor === 'middle' ? l.x - w / 2 : l.anchor === 'end' ? l.x - w : l.x;
  }
}
