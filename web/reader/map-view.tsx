import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react';
import { createPortal } from 'react-dom';
import type { RegionChart, Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from './reader-app';
import { HexLand, type Drawn, type Mark } from './hex-land';
import { HexSymbols } from './hex-symbols';
import { MenuModel } from './menu-model';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';

type Box = [number, number, number, number];
interface Held { x: number; y: number; view: Box; moved: boolean }
// The map (Mission 18, the owner's correction): the whole screen, the country as an illustrated hex crawl, with as
// little else over it as will do. Every hex the company knows is drawn as its land, the ring just beyond as country
// glimpsed, the rest dark; rivers and roads run across it as the land's own; each place known stands on it with its
// sign, towns named large; you in gold, where you are bound ringed in gold. Over it, quietly: where you are, at the
// top; nearer, further and back to you, at the top right with the close; a hex or place chosen, at the foot, with how
// to go there. Dragged to move about it; its wheel or its buttons bring it nearer. A hex you know is somewhere to go,
// next door or across the country you can see.
export class MapView {
  static View({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const [chosen, choose] = useState<string>(), region = screen.region;
    const map = (
      <section className="field-map" data-region="map" aria-label="The map" role="dialog">
        {region?.land ? <MapView.Field region={region} chosen={chosen} choose={choose} bound={app.state.frame?.bound?.id} />
          : <p className="none">You have no map of this country yet.</p>}
        <header className="field-head"><p className="where"><span className="title">{app.state.frame!.title}</span>
          <span>The map</span></p><h1 className="place">{Typography.curl(Words.upper(screen.place.name))}</h1></header>
        <MapView.Plan app={app} screen={screen} chosen={chosen} />
        <button type="button" className="field-shut" data-action="close" aria-label="Back to where you are" onClick={app.back}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
      </section>
    );
    return typeof document === 'undefined' ? map : createPortal(map, document.body);
  }
  // What a hex or a place chosen is, and how to go there: by the way the page plans, leg by leg; or across country.
  static Plan({ app, screen, chosen }: { app: ReaderApp; screen: Screen; chosen?: string }) {
    const region = screen.region, land = region?.land;
    if (!chosen || !region || !land) {
      return <aside className="plan" aria-label="A place on the map"><p className="label">Somewhere to go</p>
        <p className="how">Choose a hex or a place to see what it is, and to go there.</p></aside>;
    }
    const cell = /^hex:(\d+)$/.exec(chosen)?.[1], id = cell !== undefined ? `${land.tracts ?? ''}${cell}` : chosen;
    const area = region.within[id] ?? id, name = cell !== undefined ? MapView.ground(land, Number(cell))
      : region.areas.find(a => a.id === chosen)?.name ?? land.marks.find(m => m.id === chosen)?.name ?? chosen;
    const d = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.around ?? []].find(x => x.id === id || x.id === area);
    const here = cell !== undefined ? land.here === Number(cell) : region.areas.find(a => a.here)?.id === area;
    const go: Choice | undefined = d ? MenuModel.journey(d) : !here && land.tracts && cell !== undefined
      ? { id: `travel:${id}`, label: `Go across country to ${name}`, tone: 'way', command: `travel:${id}` } : undefined;
    return (
      <aside className="plan" aria-label={`The way to ${name}`} data-id={chosen}>
        <p className="label">{here ? 'You are here' : MapView.been(region, chosen) ? 'You have been here' : 'You have not been here'}</p>
        <h2 className="to">{Typography.curl(Words.upper(name))}</h2>
        {d && <ol className="legs">{d.legs.map((l, i) => <li key={i}>{Typography.curl(Words.leg(l.way, l.to))}
          <span className="note">{Words.span(l.minutes)}</span></li>)}</ol>}
        <p className="how">{d ? `${Words.upper(Words.span(d.minutes))} in all${d.toward ? `, as far as ${d.toward}` : ''}.`
          : here ? 'You are here already.' : go ? 'Across the country you can see, the quickest way.' : 'You know no way there yet.'}</p>
        {go && <button type="button" className="act go" data-action="set-out" onClick={() => app.choose(go)}>
          {Typography.curl(go.label)}</button>}
      </aside>
    );
  }
  private static been(region: RegionChart, id: string): boolean {
    return !!(region.areas.find(a => a.id === id)?.visited ?? region.land?.marks.find(m => m.id === id)?.visited);
  }
  // A hex of open country, by its land.
  static ground(land: NonNullable<RegionChart['land']>, cell: number): string {
    const cover = HexLand.covers[land.cover[cell] ?? '.'] ?? 'meadow';
    return ({ meadow: 'open fields', heath: 'open heath', wood: 'woodland', fen: 'wet ground', fell: 'the fellside',
      peak: 'the heights', sea: 'the sea', lake: 'water' } as Record<string, string>)[cover] ?? 'open country';
  }
  static readonly Field = memo(MapView.field);
  private static field({ region, chosen, choose, bound }: { region: RegionChart; chosen?: string; choose: (id: string) => void;
    bound?: string }) {
    const d: Drawn = useMemo(() => HexLand.draw(region), [region]), start = MapView.fit(d.box as Box, d.here);
    const [view, look] = useState<Box>(start), [wide, measure] = useState(0);
    useEffect(() => { look(start); }, [start[0], start[1], start[2], start[3]]);
    const sheet = useRef<SVGSVGElement>(null), held = useRef<Held | undefined>(undefined);
    useEffect(() => {
      const el = sheet.current;
      if (!el) { return; }
      const watch = new ResizeObserver(() => measure(el.clientWidth));
      watch.observe(el);
      return () => watch.disconnect();
    }, []);
    const k = wide ? Math.min(1.6, view[2] / wide) : 1, pick = (id: string) => { if (!held.current?.moved) { choose(id); } };
    return (
      <div className="field-land">
        <svg ref={sheet} viewBox={view.join(' ')} role="img" aria-label="The country as far as you know it"
          style={{ '--k': k } as CSSProperties} onWheel={e => look(MapView.wheel(e, sheet.current, view))}
          onPointerDown={e => { held.current = { x: e.clientX, y: e.clientY, view, moved: false }; }}
          onPointerMove={e => { const b = MapView.drag(e, held.current, sheet.current); if (b) { look(b); } }}
          onPointerUp={() => { setTimeout(() => { held.current = undefined; }, 0); }}>
          <HexSymbols.Defs />
          <MapView.Land d={d} pick={pick} chosen={chosen} width={region.land!.width} />
          {d.zones.map(z => <text key={z.id} className="name-zone" x={z.x} y={z.y} textAnchor="middle">{z.name}</text>)}
          {d.marks.map(m => <MapView.Sign key={m.id} m={m} chosen={chosen === m.id} bound={bound === m.id} choose={pick} />)}
          {d.here && <g aria-current="location" className="you"><circle cx={d.here.x} cy={d.here.y} r={34} fill="url(#h-glow)" />
            <polygon className="you-hex" points={HexLand.hex(d.here, HexLand.R * 0.9)} />
            <circle className="you-dot" cx={d.here.x} cy={d.here.y} r={6} /><title>You are here</title></g>}
        </svg>
        <div className="field-tools">
          <button type="button" aria-label="Nearer" data-action="map-nearer" onClick={() => look(MapView.zoom(view, 0.8))}>+</button>
          <button type="button" aria-label="Further" data-action="map-further" onClick={() => look(MapView.zoom(view, 1.25))}>−</button>
          <button type="button" aria-label="Where you are" data-action="map-here" onClick={() => look(start)}>◎</button>
        </div>
      </div>
    );
  }
  // The land: the edge of the unknown, the hexes known with their marks, the rivers and the roads across them.
  private static Land({ d, pick, chosen, width }: { d: Drawn; pick: (id: string) => void; chosen?: string; width: number }) {
    const picked = chosen?.startsWith('hex:') ? Number(chosen.slice(4)) : undefined;
    return <>
      <g className="unknown">{d.edge.map(t => <polygon key={t.i} points={t.points} />)}</g>
      <g className="tiles">{d.tiles.map(t => <polygon key={t.i} className={`tile ${t.cover}`} points={t.points}
        data-action="map-hex" data-cell={t.i} onClick={() => pick(`hex:${t.i}`)} />)}</g>
      <g className="glyphs">{d.glyphs.map((g, i) => <use key={i} href={`#h-${g.id}`} className={`glyph ${g.id}`}
        x={g.x - g.s / 2} y={g.y - g.s * 0.8} width={g.s} height={g.s} />)}</g>
      {d.rivers.map((r, i) => <g key={`r${i}`} className="river"><path className="bed" d={r} /><path className="water" d={r} /></g>)}
      {d.roads.map((r, i) => <g key={`d${i}`} className="road"><path className="bed" d={r} /><path className="way" d={r} /></g>)}
      {picked !== undefined && <polygon className="picked" points={HexLand.hex(HexLand.centre(picked, width), HexLand.R * 0.92)} />}
    </>;
  }
  // A place on the land: its sign, and its name (a town's large), chosen by pointing or the keys.
  private static Sign({ m, chosen, bound, choose }: { m: Mark; chosen: boolean; bound: boolean; choose: (id: string) => void }) {
    const pick = () => choose(m.id);
    return (
      <g className={`spot${m.town ? ' town' : ''}${m.visited ? ' visited' : ''}${chosen ? ' chosen' : ''}${bound ? ' bound' : ''}`}
        role="button" tabIndex={0} data-action="map-place" data-id={m.id} aria-label={m.name} aria-pressed={chosen} onClick={pick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } }}>
        <circle className="reach" cx={m.x} cy={m.y} r={18} />
        {!m.town && <circle className="disc" cx={m.x} cy={m.y - 1} r={11} />}
        {bound && <circle className="whither" cx={m.x} cy={m.y} r={19} />}
        <use href={`#s-${m.sign}`} className={`sign ${m.sign}`} x={m.x - (m.town ? 14 : 10)} y={m.y - (m.town ? 14 : 12)}
          width={m.town ? 28 : 20} height={m.town ? 22 : 20} />
        <text className={m.town ? 'name-town' : 'name-mark'} x={m.x} y={m.y + (m.town ? 26 : 24)} textAnchor="middle">
          {m.town ? m.name.toUpperCase() : m.name}</text>
      </g>
    );
  }
  // What the map opens on: what is known, never so near that a hex fills a hand, drawn toward you.
  private static fit(box: Box, here?: { x: number; y: number }): Box {
    const w = Math.max(box[2], HexLand.W * 12), h = Math.max(box[3], HexLand.R * 10);
    const cx = here ? (here.x + box[0] + box[2] / 2) / 2 : box[0] + box[2] / 2;
    const cy = here ? (here.y + box[1] + box[3] / 2) / 2 : box[1] + box[3] / 2;
    return [cx - w / 2, cy - h / 2, w, h];
  }
  static zoom(view: Box, by: number, about?: { x: number; y: number }): Box {
    const w = Math.min(HexLand.W * 60, Math.max(HexLand.W * 4, view[2] * by)), k = w / view[2], h = view[3] * k;
    const at = about ?? { x: view[0] + view[2] / 2, y: view[1] + view[3] / 2 };
    return [at.x - (at.x - view[0]) * k, at.y - (at.y - view[1]) * k, w, h];
  }
  // The scale of the sheet on the screen (the view is fitted, kept whole, within it).
  private static scale(view: Box, r: DOMRect): number { return Math.max(view[2] / r.width, view[3] / r.height); }
  private static wheel(e: WheelEvent, svg: SVGSVGElement | null, view: Box): Box {
    if (!svg) { return view; }
    const r = svg.getBoundingClientRect(), s = MapView.scale(view, r);
    const at = { x: view[0] + view[2] / 2 + (e.clientX - r.left - r.width / 2) * s,
      y: view[1] + view[3] / 2 + (e.clientY - r.top - r.height / 2) * s };
    return MapView.zoom(view, e.deltaY > 0 ? 1.15 : 0.87, at);
  }
  private static drag(e: PointerEvent, h: Held | undefined, svg: SVGSVGElement | null): Box | undefined {
    if (!h || !svg || !(e.buttons & 1)) { return undefined; }
    const s = MapView.scale(h.view, svg.getBoundingClientRect()), dx = e.clientX - h.x, dy = e.clientY - h.y;
    if (Math.hypot(dx, dy) > 4) { h.moved = true; }
    return [h.view[0] - dx * s, h.view[1] - dy * s, h.view[2], h.view[3]];
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
