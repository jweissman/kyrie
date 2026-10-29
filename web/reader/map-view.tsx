import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react';
import type { Chart, RegionChart, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Atlas, type Drawn } from './atlas';
import { Terrain } from './terrain';
import { PaintedLand } from './painted-land';
import { MenuModel } from './menu-model';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';

type Box = [number, number, number, number];
// The map, in the world's place, with the way to a place chosen on it beside it (Mission 18, the owner's review: the
// map was hexes wrapped round a network, beside a diagram of rooms). The country as far as you know it, painted as
// land: wood, fell, fen, heath, peak and water in their own tones, lit from the north-west so the heights stand up,
// with their marks scattered over them; rivers; roads quiet across it, paths fainter; settlements as roofs, sites as
// broken arches; you in gold, where you are bound ringed in gold, the way there dashed in gold when a place is chosen.
// The rooms of the settlement or site you are in, where its author set them out, are drawn on its own stretch of the
// land, not apart from it. What the company does not know fades into the dark. It is dragged to move about it, and
// its wheel or buttons bring it nearer or further.
export class MapView {
  static View({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const came = MapView.came(app), [chosen, choose] = useState<string>();
    const region = screen.region;
    return (
      <article className="world-body map" data-region="map" aria-label="The map">
        <p className="where"><span className="title">{app.state.frame!.title}</span><span>The map</span></p>
        <h1 className="place">{Typography.curl(Words.upper(screen.place.name))}</h1>
        <div className="map-spread">
          {region ? <MapView.Region region={region} came={came} chosen={chosen} choose={choose}
            bound={app.state.frame?.bound?.id} local={screen.chart} />
            : <p className="none">You have no map of this country yet.</p>}
          <MapView.Plan app={app} screen={screen} chosen={chosen} />
        </div>
        <p><button type="button" className="option back-to" data-action="close" onClick={app.back}>Back to where you are</button></p>
      </article>
    );
  }
  // The place you were in before this one, if it was somewhere else: the way you came is drawn.
  static came(app: ReaderApp): string | undefined {
    const entries = app.state.frame?.entries ?? [], here = app.state.frame?.screen.place.id;
    return [...entries].reverse().find(e => e.place && e.place !== here)?.place;
  }
  // A place chosen on the map: what the company knows of it, and the way there, leg by leg, with setting out; or that
  // it knows no way there yet. A place is chosen by pointing at it, or by the keys (Tab to it, Enter).
  static Plan({ app, screen, chosen }: { app: ReaderApp; screen: Screen; chosen?: string }) {
    const region = screen.region, area = chosen ? region?.within[chosen] ?? chosen : undefined;
    const name = chosen && (region?.areas.find(a => a.id === chosen)?.name
      ?? region?.land?.marks.find(m => m.id === chosen)?.name ?? chosen);
    if (!chosen || !name) {
      return <aside className="plan" aria-label="A place on the map"><p className="label">Somewhere to go</p>
        <p className="how">Choose a place on the map to see the way there, and to set out.</p></aside>;
    }
    const d = [...screen.destinations ?? [], ...screen.roads ?? []].find(x => x.id === chosen || x.id === area);
    const here = screen.region?.areas.find(a => a.here)?.id === area;
    const visited = region?.areas.find(a => a.id === chosen)?.visited ?? region?.land?.marks.find(m => m.id === chosen)?.visited;
    const go = d && MenuModel.journey(d);
    return (
      <aside className="plan" aria-label={`The way to ${name}`} data-id={chosen}>
        <p className="label">{here ? 'You are here' : visited ? 'You have been here' : 'You have not been here'}</p>
        <h2 className="to">{Typography.curl(Words.upper(name))}</h2>
        {d ? <>
          <ol className="legs">{d.legs.map((l, i) => <li key={i}>{Typography.curl(Words.leg(l.way, l.to))}
            <span className="note">{Words.span(l.minutes)}</span></li>)}</ol>
          <p className="how">{Words.upper(Words.span(d.minutes))} in all{d.toward ? `, as far as ${d.toward}` : ''}. Each leg is
            walked as it comes; the journey stops for anything that wants you.</p>
          {go && <button type="button" className="act go" data-action="set-out" onClick={() => app.choose(go)}>
            Set out {d.toward ? 'toward' : 'for'} {Typography.curl(name)}</button>}
        </> : <p className="how">{here ? 'You are here already.' : 'You know no way there yet.'}</p>}
      </aside>
    );
  }
  static readonly Region = memo(MapView.region);
  private static region({ region, came, chosen, choose, bound, local }: { region: RegionChart; came?: string;
    chosen?: string; choose: (id: string) => void; bound?: string; local?: Chart }) {
    const d: Drawn = useMemo(() => region.land ? Atlas.draw(region, came) : Atlas.schematic(region, came), [region, came]);
    const painting = useMemo(() => region.land && MapView.painting(region.land, region.terrain), [region.land, region.terrain]);
    const plan = useMemo(() => local && region.land?.blocks ? MapView.plan(local, region) : undefined, [local, region]);
    // Opened on the place you are in where it has its rooms drawn, else on what you know of the country.
    const start = (plan?.box ?? d.box) as Box;
    const [view, look] = useState<Box>(start);
    useEffect(() => { look(start); }, [start[0], start[1], start[2], start[3]]);
    const sheet = useRef<SVGSVGElement>(null), held = useRef<{ x: number; y: number; view: Box } | undefined>(undefined);
    const [wide, measure] = useState(0);
    useEffect(() => {
      const el = sheet.current;
      if (!el) { return; }
      const watch = new ResizeObserver(() => measure(el.clientWidth));
      watch.observe(el);
      return () => watch.disconnect();
    }, []);
    // Names are read at the same size however near the map is brought, and never larger than they were set to be
    // placed (on a phone the whole map is smaller, its names with it).
    const k = wide ? Math.min(1, view[2] / wide) : 1, you = plan?.rooms.find(r => r.here) ?? d.here;
    const route = useMemo(() => MapView.route(region, chosen ?? bound), [region, chosen, bound]);
    return (
      <figure className="atlas">
        <div className="atlas-view" style={{ aspectRatio: `${start[2]} / ${start[3]}` }}>
          <svg ref={sheet} viewBox={view.join(' ')} role="img" aria-label="The country as far as you know it"
            style={{ '--k': k } as CSSProperties}
            onWheel={e => MapView.wheel(e, sheet.current, view, look, d.size)}
            onPointerDown={e => MapView.hold(e, held, view)} onPointerMove={e => MapView.drag(e, held, sheet.current, look, d.size)}
            onPointerUp={() => { held.current = undefined; }} onPointerLeave={() => { held.current = undefined; }}>
            <Terrain.Defs />
            {painting && <image href={painting} x={0} y={0} width={d.size.w} height={d.size.h} preserveAspectRatio="none" />}
            <Terrain.Land cells={d.cells} />
            {d.rivers.map((r, i) => <g key={`r${i}`}><path className="river-bed" d={r} /><path className="river" d={r} /></g>)}
            {d.roads.map((r, i) => <g key={`d${i}`}><path className="road-bed" d={r.d} />
              <path className={`road${r.came ? ' came' : ''}`} d={r.d} /></g>)}
            {d.paths.map((p, i) => <path key={`p${i}`} className={`path${p.shut ? ' shut' : ''}${p.came ? ' came' : ''}`}
              d={p.d}><title>{p.label}</title></path>)}
            {route.map((r, i) => <path key={`w${i}`} className="route" d={r} />)}
            {plan && <MapView.LocalPlan plan={plan} />}
            {d.zones.map(z => <text key={z.id} className="name-zone" x={z.x} y={z.y} textAnchor="middle">{z.name}</text>)}
            {d.places.map(p => <g key={p.id} className={`spot${chosen === p.id ? ' chosen' : ''}${bound === p.id ? ' bound' : ''}`}
              role="button" tabIndex={0} data-action="map-place" data-id={p.id}
              aria-label={d.labels.find(l => l.id === p.id)?.text ?? p.name}
              aria-pressed={chosen === p.id} onClick={() => choose(p.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); choose(p.id); } }}>
              <circle className="reach" cx={p.x} cy={p.y} r={14} />
              {bound === p.id && <circle className="whither" cx={p.x} cy={p.y} r={13} />}
              <Terrain.Mark p={p} /></g>)}
            {you && <g aria-current="location"><circle className="you-glow" cx={you.x} cy={you.y} r={26}
              fill="url(#map-glow)" /><circle className="you-ring" cx={you.x} cy={you.y} r={11} />
              <circle className="you" cx={you.x} cy={you.y} r={4.5} /><title>You are here</title></g>}
            {d.labels.map(l => <text key={l.id} className={`${l.kind === 'settlement' ? 'name-town' : 'name-mark'}${l.known ? '' : ' name-unknown'}`}
              x={l.x} y={l.y} textAnchor={l.anchor}>{l.text}</text>)}
          </svg>
          <div className="atlas-tools">
            <button type="button" aria-label="Nearer" data-action="map-nearer" onClick={() => look(MapView.zoom(view, 0.8, d.size))}>+</button>
            <button type="button" aria-label="Further" data-action="map-further" onClick={() => look(MapView.zoom(view, 1.25, d.size))}>−</button>
            <button type="button" aria-label="Where you are" data-action="map-here" onClick={() => look(start)}>◎</button>
          </div>
        </div>
        <figcaption className="atlas-key"><span><i />A road</span><span><i className="path" />A path or a track</span>
          <span><i className="river" />Water</span><span><i className="you" />You</span>
          <span><i className="whither" />Where you are bound</span></figcaption>
        {d.glosses.length > 0 && <p className="atlas-names">{d.glosses.map(([name, gloss]) => <span key={name}>
          <b>{name}</b> {gloss}. </span>)}</p>}
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
  // The land painted (see PaintedLand), as an image to set under the map's marks; none where there is no page to paint
  // it on (the map drawn as text, in a test).
  static painting(land: NonNullable<RegionChart['land']>, terrain?: string): string | undefined {
    if (typeof document === 'undefined') { return undefined; }
    const p = PaintedLand.paint(land, terrain), canvas = document.createElement('canvas');
    canvas.width = p.width; canvas.height = p.height;
    canvas.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(p.data), p.width, p.height), 0, 0);
    return canvas.toDataURL();
  }
  // Nearer or further, about the middle of what is shown, never further than the whole land and a little.
  static zoom(view: Box, by: number, size: { w: number; h: number }, about?: { x: number; y: number }): Box {
    const w = Math.min(size.w * 1.3, Math.max(Atlas.S * 4, view[2] * by)), k = w / view[2], h = view[3] * k;
    const at = about ?? { x: view[0] + view[2] / 2, y: view[1] + view[3] / 2 };
    return [at.x - (at.x - view[0]) * k, at.y - (at.y - view[1]) * k, w, h];
  }
  private static wheel(e: WheelEvent, svg: SVGSVGElement | null, view: Box, look: (b: Box) => void, size: { w: number; h: number }) {
    if (!svg) { return; }
    const r = svg.getBoundingClientRect(), at = { x: view[0] + (e.clientX - r.left) / r.width * view[2],
      y: view[1] + (e.clientY - r.top) / r.height * view[3] };
    look(MapView.zoom(view, e.deltaY > 0 ? 1.15 : 0.87, size, at));
  }
  private static hold(e: PointerEvent, held: { current?: { x: number; y: number; view: Box } }, view: Box) {
    if ((e.target as Element).closest('[data-action="map-place"]')) { return; }
    held.current = { x: e.clientX, y: e.clientY, view };
  }
  private static drag(e: PointerEvent, held: { current?: { x: number; y: number; view: Box } }, svg: SVGSVGElement | null,
    look: (b: Box) => void, size: { w: number; h: number }) {
    const h = held.current;
    if (!h || !svg) { return; }
    const r = svg.getBoundingClientRect(), k = h.view[2] / r.width;
    const x = Math.min(size.w - h.view[2] / 2, Math.max(-h.view[2] / 2, h.view[0] - (e.clientX - h.x) * k));
    const y = Math.min(size.h - h.view[3] / 2, Math.max(-h.view[3] / 2, h.view[1] - (e.clientY - h.y) * k));
    look([x, y, h.view[2], h.view[3]]);
  }
  // The way to a place, area by area over the ways the company knows, each leg's course on the land.
  static route(region: RegionChart, to?: string): string[] {
    const W = region.land?.width, from = region.areas.find(a => a.here)?.id, goal = to && (region.within[to] ?? to);
    if (!W || !from || !goal || from === goal) { return []; }
    const came = new Map<string, RegionChart['edges'][number]>([[from, undefined as never]]);
    for (const queue = [from]; queue.length && !came.has(goal);) {
      const at = queue.shift()!;
      for (const e of region.edges.filter(x => (x.from === at || x.to === at) && x.status === 'open')) {
        const next = e.from === at ? e.to : e.from;
        if (!came.has(next)) { came.set(next, e); queue.push(next); }
      }
    }
    if (!came.has(goal)) { return []; }
    const legs: string[] = [];
    for (let at = goal; at !== from;) {
      const e = came.get(at)!;
      if (e.course?.length) { legs.push(Atlas.curve(e.course.map(c => Atlas.centre(c, W)))); }
      at = e.from === at ? e.to : e.from;
    }
    return legs;
  }
  // The rooms of the place the company is in, set out on its own stretch of the land as its author set them out:
  // the streets and open places as dots, the rooms under a roof as small squares, joined by their ways.
  static plan(chart: Chart, region: RegionChart): { box: Box; rooms: { id: string; name: string; x: number; y: number;
    here: boolean; indoors: boolean; visited: boolean; named: boolean }[];
    ways: { a: { x: number; y: number }; b: { x: number; y: number }; open: boolean }[] } | undefined {
    const home = region.areas.find(a => a.here), area = home?.id, cells = area ? region.land?.blocks?.[area] : undefined;
    const W = region.land!.width, inner = chart.places.filter(p => !p.external);
    if (!cells?.length || inner.length < 2) { return undefined; }
    const xs = cells.map(c => c % W), ys = cells.map(c => Math.floor(c / W)), S = Atlas.S;
    // Set a cell in from the edges of its stretch, so that a fair on a river stands on the ice, not its banks.
    const [bx, by] = [Math.min(...xs) * S + S * 1.5, Math.min(...ys) * S + S * 1.5];
    const [bw, bh] = [(Math.max(...xs) - Math.min(...xs) - 2) * S, (Math.max(...ys) - Math.min(...ys) - 2) * S];
    const px = inner.map(p => p.x), py = inner.map(p => p.y), [x0, y0] = [Math.min(...px), Math.min(...py)];
    const nx = Math.max(1, Math.max(...px) - x0), ny = Math.max(1, Math.max(...py) - y0);
    const at = new Map(inner.map(p => [p.id, { x: bx + (p.x - x0) / nx * bw, y: by + (p.y - y0) / ny * bh }]));
    const rooms = inner.map(p => ({ id: p.id, name: p.name, ...at.get(p.id)!, here: p.here, visited: p.visited,
      indoors: !!p.area && p.area !== home?.name, named: false }));
    MapView.name(rooms);
    const pad = S * 4;
    return { box: [bx - pad, by - pad, bw + pad * 2, bh + pad * 2], rooms,
    ways: chart.edges.flatMap(e => { const a = at.get(e.from), b = at.get(e.to);
      return a && b ? [{ a, b, open: e.status === 'open' }] : []; }) };
  }
  // Which rooms of a plan are named on it: where you are first, then those been to, then the rest, each only where
  // its name crosses no other.
  private static name(rooms: { name: string; x: number; y: number; here: boolean; visited: boolean; named: boolean }[]) {
    const boxes: number[][] = [];
    for (const r of [...rooms].sort((a, b) => Number(b.here) - Number(a.here) || Number(b.visited) - Number(a.visited))) {
      const w = r.name.length * 4.6, box = [r.x - w / 2, r.y - 16, r.x + w / 2, r.y - 6];
      if (boxes.some(b => box[0]! < b[2]! && box[2]! > b[0]! && box[1]! < b[3]! && box[3]! > b[1]!)) { continue; }
      boxes.push(box);
      r.named = true;
    }
  }
  private static LocalPlan({ plan }: { plan: NonNullable<ReturnType<typeof MapView.plan>> }) {
    return <g className="local-plan">
      {plan.ways.map((w, i) => <line key={i} className={`street${w.open ? '' : ' shut'}`} x1={w.a.x} y1={w.a.y} x2={w.b.x} y2={w.b.y} />)}
      {plan.rooms.map(r => <g key={r.id} className={`room${r.here ? ' here' : ''}${r.visited ? '' : ' unvisited'}`}>
        {r.indoors ? <rect x={r.x - 4} y={r.y - 4} width={8} height={8} /> : <circle cx={r.x} cy={r.y} r={4} />}
        {r.named && <text x={r.x} y={r.y - 8} textAnchor="middle">{Typography.curl(Words.upper(r.name))}</text>}
        <title>{Typography.curl(Words.upper(r.name))}</title></g>)}
    </g>;
  }
}
