import { memo, useEffect, useMemo, useRef } from 'react';
import type { Chart, RegionChart, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Atlas, type Drawn } from './atlas';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';

// The map, in the world's place, with the ways still beside it. The country as far as you know it, drawn plainly: its
// land in flat tones cell by cell, water in blue, roads in black and paths dashed, settlements as squares and other
// places as rings, and you in red, with the way you came. Below it, the place you are in, room by room, when it has
// rooms and is not wild country (which the land shows). Only what you have seen, or know the way to, is drawn; what
// you know only by name is grey.
export class MapView {
  static View({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const came = MapView.came(app);
    // Wild country is drawn on the land itself, landmark by landmark; the rooms of a place are drawn below it.
    const region = screen.region, wild = region?.land && region.areas.find(a => a.here)?.kind === 'wilderness';
    const local = (!wild || screen.chart?.level) && screen.chart && screen.chart.places.filter(p => !p.external).length > 1
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
  // The country is drawn larger than its cells' own size, to be read at a glance on a wide page; on a narrow one it
  // fits the page.
  static readonly scale = 1.4;
  static readonly Region = memo(MapView.region);
  private static region({ region, came }: { region: RegionChart; came?: string }) {
    const d: Drawn = useMemo(() => region.land ? Atlas.draw(region, came) : Atlas.schematic(region, came), [region, came]);
    return (
      <figure className="atlas">
        <svg viewBox={d.box.join(' ')} role="img" aria-label="The country as far as you know it"
          style={{ width: `${Math.round(d.box[2]! * MapView.scale)}px` }}>
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
  // The place you are in, room by room: each a square, joined by its ways, its name under it; where you are, filled.
  // Drawn at the size it is read at: wider than the page, it scrolls sideways rather than shrinking its names.
  static readonly across = 136;
  static readonly down = 96;
  static readonly Local = memo(MapView.local);
  private static local({ chart }: { chart: Chart }) {
    const xs = chart.places.map(p => p.x), ys = chart.places.map(p => p.y);
    const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const w = (Math.max(...xs) - x0) * MapView.across + 150, h = (Math.max(...ys) - y0) * MapView.down + 90;
    const where = new Map(chart.places.map(p => [p.id,
      { x: (p.x - x0) * MapView.across + 75, y: (p.y - y0) * MapView.down + 22 }]));
    // Opened, the sheet shows where you are, whatever lies to either side.
    const sheet = useRef<HTMLDivElement>(null), here = chart.places.find(p => p.here);
    const hx = here ? where.get(here.id)!.x : 0;
    useEffect(() => {
      const el = sheet.current;
      if (el && el.scrollWidth > el.clientWidth) { el.scrollLeft = Math.max(0, hx - el.clientWidth / 2); }
    }, [hx]);
    return (
      <figure className="local">
        {(chart.levels?.length ?? 0) > 1
          ? <ol className="levels label" aria-label="The levels you have been on, top to bottom">
            {chart.levels!.map(l => <li key={l.name} aria-current={l.here ? 'location' : undefined}>{Words.upper(l.name)}</li>)}
          </ol>
          : <p className="label">{chart.level ? Words.upper(chart.level) : 'Here'}</p>}
        <div className="local-sheet" ref={sheet}>
          <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label="The place you are in">
            {chart.edges.map(e => { const a = where.get(e.from), b = where.get(e.to); return a && b
              ? <line key={`${e.id}${e.from}`} className={`link${e.status === 'open' ? '' : ' shut'}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              : null; })}
            {chart.places.map(p => { const c = where.get(p.id)!; return <g key={p.id}>
              <rect className={`room${p.here ? ' here' : ''}${p.visited || p.here ? '' : ' unvisited'}`} x={c.x - 7} y={c.y - 7}
                width={14} height={14} />
              <text x={c.x} y={c.y + 24} textAnchor="middle">{MapView.wrap(Typography.curl(MapView.rise(p)
                + Words.upper(p.name)), 19)
                .map((line, i) => <tspan key={i} x={c.x} dy={i ? 14 : 0}>{line}</tspan>)}</text></g>; })}
          </svg>
        </div>
      </figure>
    );
  }
  // A way to another level of the site says which way it goes: up, or down.
  static rise(p: { rise?: 'up' | 'down' }): string { return p.rise === 'down' ? '↓ ' : p.rise === 'up' ? '↑ ' : ''; }
  // A name in lines of about so many letters, broken between words.
  static wrap(text: string, width: number): string[] {
    const lines: string[] = [];
    for (const word of text.split(' ')) {
      const last = lines.at(-1);
      if (last !== undefined && last.length + word.length < width) { lines[lines.length - 1] = `${last} ${word}`; }
      else { lines.push(word); }
    }
    return lines;
  }
}
