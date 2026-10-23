import { memo, useMemo } from 'react';
import type { Chart, RegionChart, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Atlas, type Drawn } from './atlas';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';

// The map, in the world's place, with the ways still beside it. The country as far as you know it, drawn plainly: its
// land in flat tones cell by cell, water in blue, roads in black and paths dashed, settlements as squares and other
// places as rings, and you in red, with the way you came. Below it, the place you are in, room by room, when it has
// rooms. Only what you have seen, or know the way to, is drawn; what you know only by name is grey.
export class MapView {
  static View({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const came = MapView.came(app);
    const region = screen.region, local = screen.chart && screen.chart.places.filter(p => !p.external).length > 1
      ? screen.chart : undefined;
    return (
      <article className="world-body map" data-region="map" aria-label="The map">
        <p className="where"><span className="title">{app.state.frame!.title}</span><span>The map</span></p>
        <h1 className="place">{Typography.curl(Words.upper(screen.place.name))}</h1>
        {region ? <MapView.Region region={region} came={came} /> : <p className="none">You have no map of this country yet.</p>}
        {local && <MapView.Local chart={local} />}
        <p><button type="button" className="act" data-action="close" onClick={app.back}>‹ Back to where you are</button></p>
      </article>
    );
  }
  // The place you were in before this one, if it was somewhere else: the way you came is drawn.
  static came(app: ReaderApp): string | undefined {
    const entries = app.state.frame?.entries ?? [], here = app.state.frame?.screen.place.id;
    return [...entries].reverse().find(e => e.place && e.place !== here)?.place;
  }
  static readonly Region = memo(MapView.region);
  private static region({ region, came }: { region: RegionChart; came?: string }) {
    const d: Drawn = useMemo(() => region.land ? Atlas.draw(region, came) : Atlas.schematic(region, came), [region, came]);
    return (
      <figure className="atlas">
        <svg viewBox={d.box.join(' ')} role="img" aria-label="The country as far as you know it"
          style={{ width: `${d.box[2]}px` }}>
          {d.unknown.map((p, i) => <circle key={`u${i}`} className="unknown" cx={p.x} cy={p.y} r={1.1} />)}
          {d.cells.map(c => <rect key={c.i} className={`cell ${c.cover}`} x={c.x} y={c.y} width={c.s} height={c.s}
            style={{ fill: `var(--${c.cover})` }} />)}
          {d.rivers.map((r, i) => <polyline key={`r${i}`} className="river" points={r} />)}
          {d.roads.map((r, i) => <polyline key={`d${i}`} className={`road${r.came ? ' came' : ''}`} points={r.points} />)}
          {d.paths.map((p, i) => <polyline key={`p${i}`} className={`path${p.shut ? ' shut' : ''}${p.came ? ' came' : ''}`}
            points={p.points}><title>{p.label}</title></polyline>)}
          {d.zones.map(z => <text key={z.id} className="name-zone" x={z.x} y={z.y} textAnchor="middle">{z.name}</text>)}
          {d.places.map(p => p.kind === 'settlement'
            ? <rect key={p.id} className={`town${p.visited ? '' : ' unvisited'}`} x={p.x - 6} y={p.y - 6} width={12} height={12} />
            : <circle key={p.id} className={`mark${p.visited ? ' visited' : ''}`} cx={p.x} cy={p.y} r={4.5} />)}
          {d.here && <g aria-current="location"><circle className="you-ring" cx={d.here.x} cy={d.here.y} r={12} />
            <circle className="you" cx={d.here.x} cy={d.here.y} r={6} /><title>You are here</title></g>}
          {d.labels.map(l => <text key={l.id} className={`${l.kind === 'settlement' ? 'name-town' : 'name-mark'}${l.known ? '' : ' name-unknown'}`}
            x={l.x} y={l.y} textAnchor={l.anchor}>{l.text}</text>)}
        </svg>
        <figcaption className="atlas-key"><span><i />A road</span><span><i className="path" />A path or a track</span>
          <span><i className="river" />Water</span><span><i className="you" />You</span></figcaption>
        {d.glosses.length > 0 && <p className="atlas-names">{d.glosses.map(([name, gloss]) => <span key={name}>
          <b>{name}</b> {gloss}. </span>)}</p>}
      </figure>
    );
  }
  static readonly step = 70;
  private static at(v: number, origin: number): number { return (v - origin) * MapView.step + 40; }
  // The place you are in, room by room: each a square, joined by its ways; where you are, filled.
  static readonly Local = memo(MapView.local);
  private static local({ chart }: { chart: Chart }) {
    const S = MapView.step, xs = chart.places.map(p => p.x), ys = chart.places.map(p => p.y);
    const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const w = (Math.max(...xs) - x0) * S + 260, h = (Math.max(...ys) - y0) * S + 80;
    const where = new Map(chart.places.map(p => [p.id, { x: MapView.at(p.x, x0), y: MapView.at(p.y, y0) }]));
    return (
      <figure className="local">
        <p className="label">Here</p>
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="The place you are in">
          {chart.edges.map(e => { const a = where.get(e.from), b = where.get(e.to); return a && b
            ? <line key={`${e.id}${e.from}`} className={`link${e.status === 'open' ? '' : ' shut'}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            : null; })}
          {chart.places.map(p => { const c = where.get(p.id)!; return <g key={p.id}>
            <rect className={`room${p.here ? ' here' : ''}${p.visited || p.here ? '' : ' unvisited'}`} x={c.x - 7} y={c.y - 7}
              width={14} height={14} />
            <text x={c.x + 12} y={c.y + 4}>{Typography.curl(Words.upper(p.name))}</text></g>; })}
        </svg>
      </figure>
    );
  }
}
