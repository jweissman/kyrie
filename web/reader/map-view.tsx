import {
  memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent,
  type WheelEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type { RegionChart, Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from './reader-app';
import { HexLand, type Drawn, type Mark } from './hex-land';
import { HexSymbols } from './hex-symbols';
import { BoardField } from './board-field';
import { MenuModel } from './menu-model';
import { Notices } from './notices';
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
// next door or across the country you can see. Open, it has the keys, and what would be said over the page is said
// over it; what is chosen is let go of by Esc, before it closes the map, or by the Plan's own quiet cross.
export class MapView {
  static View({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const [chosen, choose] = useState<string>(), [keyed, key] = useState(0), region = screen.region;
    const dialog = useRef<HTMLElement>(null), bound = region && BoardField.whither(region, app.state.frame?.bound?.id);
    // A place chosen by the keys: the way there is the next thing they reach, not the rest of the places on the map.
    const pick = useCallback((id: string, keys?: boolean) => { choose(id); if (keys) { key(n => n + 1); } }, []);
    const forget = useCallback(() => { MapView.forget(dialog.current, choose); }, []);
    useEffect(() => {
      const before = MapView.hold(dialog.current);
      return () => { MapView.release(before); };
    }, []);
    useEffect(() => { if (keyed) { MapView.onward(dialog.current); } }, [keyed]);
    const map = (
      <section className="field-map" data-region="map" aria-label="The map" role="dialog" aria-modal="true"
        tabIndex={-1} ref={dialog} onKeyDown={e => MapView.escape(e, app, chosen ? forget : undefined)}>
        {region?.land ? <BoardField.View region={region} chosen={chosen} choose={pick} bound={bound}
          flat={<MapView.Field region={region} chosen={chosen} choose={pick} bound={bound} />} />
          : <p className="none">You have no map of this country yet.</p>}
        <header className="field-head"><p className="where"><span className="title">{app.state.frame!.title}</span>
          <span>The map</span></p><h1 className="place">{Typography.curl(Words.upper(screen.place.name))}</h1></header>
        <MapView.Plan app={app} screen={screen} chosen={chosen} clear={forget} />
        <button type="button" className="field-shut" data-action="close" aria-label="Back to where you are" onClick={app.back}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
        <Notices.View app={app} map />
      </section>
    );
    return typeof document === 'undefined' ? map : createPortal(map, document.body);
  }
  // Opened, the map takes the keys' focus and holds it: what is under it is out of reach (and unread) until it
  // closes, when the focus goes back to what had it, or, where that has gone, to the first thing to do.
  private static hold(dialog: HTMLElement | null): Element | null {
    const before = document.activeElement, under = document.querySelector<HTMLElement>('.frame');
    if (under) { under.inert = true; }
    dialog?.focus({ preventScroll: true });
    return before;
  }
  // Closed, the focus back on what had it; where that has gone, or was only the page itself (opened by its key from a
  // place, what had the focus went with the place's page), on the first thing to do there, or else on the map's tab.
  private static release(before: Element | null): void {
    const under = document.querySelector<HTMLElement>('.frame');
    if (under) { under.inert = false; }
    const back = before instanceof HTMLElement && before.isConnected && before !== document.body ? before
      : document.querySelector<HTMLElement>('[data-action="choice"]')
        ?? document.querySelector<HTMLElement>('[data-action="mode"][data-view="map"]');
    back?.focus({ preventScroll: true });
  }
  // What is chosen let go of, the keys kept on the map (what had them may have gone with it).
  private static forget(dialog: HTMLElement | null, choose: (id?: string) => void): void {
    choose(undefined); dialog?.focus({ preventScroll: true });
  }
  // Esc over the map lets go of what is chosen, if anything is and the keys are not being shown (those are put away
  // first, as anywhere); otherwise it goes on to the page, which closes the map.
  private static escape(e: KeyboardEvent, app: ReaderApp, forget?: () => void): void {
    if (e.key !== 'Escape' || !forget || app.state.help) { return; }
    e.stopPropagation(); forget();
  }
  // The way to a place chosen by the keys, next for them: how to set out, or, where there is no way, what it is.
  private static onward(dialog: HTMLElement | null): void {
    (dialog?.querySelector<HTMLElement>('.plan .go') ?? dialog?.querySelector<HTMLElement>('.plan .to'))?.focus();
  }
  // What a hex or a place chosen is, and how to go there: by the way the page plans, leg by leg; or across country.
  // Chosen, it can be let go of again by a touch as well as by Esc.
  static Plan({ app, screen, chosen, clear }: { app: ReaderApp; screen: Screen; chosen?: string;
    clear?: () => void }) {
    const region = screen.region, land = region?.land;
    if (!chosen || !region || !land) {
      return <aside className="plan" aria-label="A place on the map" aria-live="polite">
        <p className="label">Somewhere to go</p>
        <p className="how">Choose a hex or a place to see what it is, and to go there.</p></aside>;
    }
    const cell = /^hex:(\d+)$/.exec(chosen)?.[1], id = cell !== undefined ? MapView.on(land, Number(cell)) : chosen;
    const area = region.within[id] ?? id, name = cell !== undefined ? MapView.ground(land, Number(cell))
      : region.areas.find(a => a.id === chosen)?.name ?? land.marks.find(m => m.id === chosen)?.name ?? chosen;
    // The place itself before what it lies in: a keep in a fen is set out for, not the fen.
    const plans = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.around ?? [], ...screen.mapped ?? []];
    const d = plans.find(x => x.id === id) ?? plans.find(x => x.id === area);
    const mark = land.marks.find(m => m.id === chosen), within = region.areas.find(a => a.here)?.id === area;
    const here = cell !== undefined ? land.here === Number(cell) || (!land.tracts && within) : mark ? mark.here : within;
    // A place the page plans no way to is not set out for (a journey that knows no way leaves nothing to go on with).
    const go: Choice | undefined = d ? MenuModel.journey(d) : here || mark ? undefined : MapView.across(land, cell, name);
    return (
      <aside className="plan" aria-label={`The way to ${name}`} data-id={chosen} aria-live="polite">
        <p className="label">{MapView.told(region, chosen, here)}</p>
        <h2 className="to" tabIndex={-1}>{Typography.curl(Words.upper(name))}</h2>
        {d && <ol className="legs">{d.legs.map((l, i) => <li key={i}>{Typography.curl(Words.leg(l.way, l.to))}
          <span className="note">{Words.span(l.minutes)}</span></li>)}</ol>}
        <p className="how">{d ? `${Words.upper(Words.span(d.minutes))} in all${d.toward ? `, as far as ${d.toward}` : ''}.`
          : here ? 'You are here already.' : go ? 'Across the country you can see, the quickest way.'
            : cell !== undefined && !MapView.walkable(land, Number(cell)) ? 'There is no going there on foot.'
              : 'You know no way there yet.'}</p>
        {go && <button type="button" className="act go" data-action="set-out" onClick={() => app.choose(go)}>
          {Typography.curl(go.label)}</button>}
        {clear && <button type="button" className="unchoose" data-action="map-unchoose" aria-label={`Let go of ${name}`}
          onClick={clear}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>}
      </aside>
    );
  }
  // A hex chosen, across the open country the company knows: not into the sea or a lake, where there is no stretch
  // of country to come to (the card had offered "Go across country to the sea", and said "You know no way on to
  // region__t177": the navigation review).
  private static across(land: NonNullable<RegionChart['land']>, cell: string | undefined,
    name: string): Choice | undefined {
    if (!land.tracts || cell === undefined || !land.known.includes(Number(cell)) || !MapView.walkable(land, Number(cell))) {
      return undefined;
    }
    const id = `${land.tracts}${cell}`;
    return { id: `travel:${id}`, label: `Go across country to ${name}`, tone: 'way', command: `travel:${id}` };
  }
  // What a hex chosen is gone to as: the stretch of open country on it; on an authored country's land, which has no
  // stretches, the place whose block of the land it lies in, or, between the places its author set (the margin of
  // the map, a square of the author's grid with nothing in it), the place nearest it (over the march into Merrowdale
  // every hex had said "You know no way there yet": the owner, OWN-43). A place on the map is set out for itself, by
  // the way the page plans (Itineraries.mapped), never for the hex it stands on: the map had stopped beside it, and
  // from beside a march-stone the country beyond was never drawn (the navigation review).
  static on(land: NonNullable<RegionChart['land']>, cell: number): string {
    if (land.tracts) { return `${land.tracts}${cell}`; }
    const blocks = Object.entries(land.blocks ?? {}).filter(([, cells]) => cells.length)
      .map(([id, cells]) => ({ id, by: Math.min(...cells.map(c => MapView.apart(land.width, c, cell))) }));
    return blocks.sort((a, b) => a.by - b.by)[0]?.id ?? `hex:${cell}`;
  }
  private static apart(width: number, a: number, b: number): number {
    return Math.hypot(a % width - b % width, Math.floor(a / width) - Math.floor(b / width));
  }
  // Whether a hex is land to walk: the sea and the lakes have no stretch of country (see RegionTracts.cells).
  private static walkable(land: NonNullable<RegionChart['land']>, cell: number): boolean {
    return !['sea', 'lake'].includes(HexLand.covers[land.cover[cell] ?? '.'] ?? '');
  }
  // Whether the company has been where is chosen: a place, as it was kept; a hex, as the town or the place on it was,
  // or, where nothing stands (no count is kept of open country), only that it is country it knows.
  private static told(region: RegionChart, chosen: string, here: boolean): string {
    const cell = /^hex:(\d+)$/.exec(chosen)?.[1], n = Number(cell), W = region.land?.width ?? 0;
    const on = cell === undefined ? chosen : region.land?.marks.find(m => m.cell === n)?.id
      ?? region.areas.find(a => a.kind === 'settlement' && a.y * W + a.x === n)?.id;
    if (here) { return 'You are here'; }
    if (!on) { return 'Country you know'; }
    return MapView.been(region, on) ? 'You have been here' : 'You have not been here';
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
  private static field({ region, chosen, choose, bound }: { region: RegionChart; chosen?: string;
    choose: (id: string, keyed?: boolean) => void; bound?: string }) {
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
    const k = wide ? Math.min(1.6, view[2] / wide) : 1;
    const pick = (id: string, keyed?: boolean) => { if (!held.current?.moved) { choose(id, keyed); } };
    return (
      <div className="field-land">
        <svg ref={sheet} viewBox={view.join(' ')} role="img" aria-label="The country as far as you know it"
          style={{ '--k': k } as CSSProperties} onWheel={e => look(MapView.wheel(e, sheet.current, view))}
          onPointerDown={e => { held.current = { x: e.clientX, y: e.clientY, view, moved: false }; }}
          onPointerMove={e => { const b = MapView.drag(e, held.current, sheet.current); if (b) { look(b); } }}
          onPointerUp={() => { setTimeout(() => { held.current = undefined; }, 0); }}>
          <HexSymbols.Defs />
          <MapView.Land d={d} pick={pick} chosen={chosen} bound={bound} land={region.land!} />
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
  // The land: the edge of the unknown, the hexes known with their marks, the rivers and the roads across them; the hex
  // chosen, and the hex where you are bound (when it is open country, not a place with its own sign) ringed in gold.
  private static Land({ d, pick, chosen, bound, land }: { d: Drawn; pick: (id: string) => void; chosen?: string;
    bound?: string; land: NonNullable<RegionChart['land']> }) {
    const picked = MapView.hexOf(chosen), whither = MapView.hexOf(bound), width = land.width;
    return <>
      <g className="unknown">{d.edge.map(t => <polygon key={t.i} points={t.points} />)}</g>
      <g className="tiles">{d.tiles.map(t => <polygon key={t.i} className={`tile ${t.cover}`} points={t.points}
        data-action="map-hex" data-cell={t.i} onClick={() => pick(`hex:${t.i}`)} />)}</g>
      <g className="glyphs">{d.glyphs.map((g, i) => <use key={i} href={`#h-${g.id}`} className={`glyph ${g.id}`}
        x={g.x - g.s / 2} y={g.y - g.s * 0.8} width={g.s} height={g.s} />)}</g>
      {d.rivers.map((r, i) => <g key={`r${i}`} className="river"><path className="bed" d={r} /><path className="water" d={r} /></g>)}
      {d.roads.map((r, i) => <g key={`d${i}`} className="road"><path className="bed" d={r} /><path className="way" d={r} /></g>)}
      {picked !== undefined && <polygon className="picked"
        points={HexLand.hex(HexLand.centre(picked, width), HexLand.R * 0.92)} />}
      {whither !== undefined && whither !== land.here && <polygon className="whither"
        points={HexLand.hex(HexLand.centre(whither, width), HexLand.R * 0.78)} />}
    </>;
  }
  private static hexOf(id?: string): number | undefined {
    return id?.startsWith('hex:') ? Number(id.slice(4)) : undefined;
  }
  // A place on the land: its sign, and its name (a town's large), chosen by pointing or the keys.
  private static Sign({ m, chosen, bound, choose }: { m: Mark; chosen: boolean; bound: boolean;
    choose: (id: string, keyed?: boolean) => void }) {
    const pick = () => choose(m.id);
    return (
      <g className={`spot${m.town ? ' town' : ''}${m.visited ? ' visited' : ''}${chosen ? ' chosen' : ''}${bound ? ' bound' : ''}`}
        role="button" tabIndex={0} data-action="map-place" data-id={m.id} aria-label={m.name} aria-pressed={chosen} onClick={pick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); choose(m.id, true); }
        }}>
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
