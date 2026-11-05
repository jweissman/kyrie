import { Aims } from './aims';
import { Followed } from './followed';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Knowing, RegionChart, Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from './reader-app';
import { HexLand } from './hex-land';
import { BoardField } from './board-field';
import { MenuModel } from './menu-model';
import { Notices } from './notices';
import { Typography } from '../../src/presentation/typography';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { Marks } from '../../src/ui/marks';
import { Words } from './words';
import { Act } from './stage/act';

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
    // Opened with an aim whose way is known, the map has it chosen and its set-out to hand (gone out of a town toward
    // the aim, the next thing to do is go: the owner, 31 October).
    const [aim] = useState(() => MapView.aim(app, screen));
    const [chosen, choose] = useState<string | undefined>(aim), [keyed, key] = useState(aim ? 1 : 0), region = screen.region;
    const [pointed, point] = useState<string>();
    const dialog = useRef<HTMLElement>(null), bound = region && BoardField.whither(region, app.state.frame?.bound?.id);
    // A place chosen by the keys: the way there is the next thing they reach, not the rest of the places on the map.
    // Touched, a hex or a place is chosen, and its way, how long and when the company would come there are shown with
    // a set-out; touched again, it is set out for, the way walked on the map as the company goes. A touch had set out
    // at once (OWN-48), and the owner found it took him where he had not meant to go (4 November).
    const held = useRef(chosen); held.current = chosen;
    const pick = useCallback((id: string, keys?: boolean) => {
      const again = held.current === id;
      choose(id);
      if (keys) { key(n => n + 1); return; }
      const go = again && region?.land && MapView.way(screen, id).go;
      if (go && !Act.asks(go)) { app.choose(go); }
    }, [app, screen, region]);
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
          face={screen.party[0]?.face?.src} walking={app.state.walking?.way} walked={app.state.walking?.done}
          point={point} />
          : <p className="none">You have no map of this country yet.</p>}
        <header className="field-head"><p className="where"><span className="title">{app.state.frame!.title}</span>
          <span>The map</span></p><h1 className="place">{Typography.curl(Words.upper(screen.place.name))}</h1></header>
        <MapView.Plan app={app} screen={screen} chosen={chosen} clear={forget} pointed={pointed} />
        <button type="button" className="field-shut" data-action="close" aria-label="Back to where you are" onClick={app.back}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
        <Notices.View app={app} map />
      </section>
    );
    return typeof document === 'undefined' ? map : createPortal(map, document.body);
  }
  // The place the aim shown is set out for, where the way to it is known and the map has it.
  // The aim followed, when the map cannot show where it is and it names someone who might know.
  static unplaced(app: ReaderApp, screen: Screen): { aim: string; who: string } | undefined {
    const aim = Followed.of(screen), who = screen.aims?.find(a => a.followed)?.who ?? [];
    return aim && who.length && !MapView.aim(app, screen) ? { aim, who: MapView.who(screen) } : undefined;
  }
  private static aim(app: ReaderApp, screen: Screen): string | undefined {
    // The aim followed, where it names somewhere the company knows the way to; else the one the page leads toward.
    const followed = Followed.of(screen);
    const named = followed && Aims.named(screen, screen.destinations ?? [], followed)?.id;
    if (named && screen.region?.land && MapView.way(screen, named).go) { return named; }
    const id = app.state.frame?.leaf.glance?.aimed?.find(a => a.startsWith('travel:'))?.slice('travel:'.length);
    if (id && screen.region?.land && MapView.way(screen, id).go) { return id; }
    // Where the aim is, on the map, though no way there is known yet: chosen, its card says so.
    const land = screen.region?.land, marked = new Set([...land?.marks.map(m => m.id) ?? [],
      ...(screen.region?.areas ?? []).filter(a => a.kind === 'settlement').map(a => a.id)]);
    return land ? Aims.named(screen, [...marked].map(m => ({ id: m })), followed)?.id : undefined;
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
  // When the company would come there, set out now, and whether after dark: the time a journey takes had been said,
  // and not what it would cost of the day (the cold review's "expedition ledger").
  static arrival(screen: Screen, minutes: number): string {
    const [day, time] = FictionalTime.at(screen.elapsed, minutes).split(', '), today = FictionalTime.at(screen.elapsed).split(', ')[0];
    const dark = Marks.journey(screen.elapsed, minutes) ? ', after dark' : '';
    const said = `${time}${day === today ? '' : ` on ${day!.toLowerCase()}`}${dark}`;
    return `You would come there about ${said.replace(/\.$/, '')}.`;
  }
  // Whether a place chosen is only heard of, its country not yet seen.
  private static heard(screen: Screen, chosen: string): boolean {
    return screen.region?.land?.marks.some(m => m.id === chosen && m.state === 'heard') ?? false;
  }
  // Where an aim not on the map might be learnt: from whom it names, or else that it is not on the map yet.
  static who(screen: Screen): string {
    const who = screen.aims?.find(a => a.followed)?.who ?? [];
    return who.length ? `Not yet on your map: ${Words.listed(who)} may know where.` : 'Not yet on your map.';
  }
  // The way to a place chosen by the keys, next for them: how to set out, or, where there is no way, what it is.
  private static onward(dialog: HTMLElement | null): void {
    (dialog?.querySelector<HTMLElement>('.plan .go') ?? dialog?.querySelector<HTMLElement>('.plan .to'))?.focus();
  }
  // What a hex or a place chosen is, and how to go there: by the way the page plans, leg by leg; or across country.
  // Chosen, it can be let go of again by a touch as well as by Esc. Nothing chosen, what the pointer is over is told
  // the same way, and that a touch sets out for it (the owner, OWN-47).
  static Plan({ app, screen, chosen: picked, clear, pointed }: { app: ReaderApp; screen: Screen; chosen?: string;
    clear?: () => void; pointed?: string }) {
    const region = screen.region, land = region?.land, chosen = picked ?? pointed, over = !picked;
    if (!chosen || !region || !land) {
      // The aim followed, when the map cannot show where it is: said so, not left out (the product-design review's
      // PD-12: following the crown, the map stayed on the town and said nothing of it).
      const aim = Followed.of(screen) && !MapView.aim(app, screen) ? Followed.of(screen) : undefined;
      return aim ? <aside className="plan" aria-label="A place on the map" aria-live="polite">
        <p className="label">Your aim</p><p className="aim-unplaced">{Typography.curl(aim)}</p>
        <p className="how">{Typography.curl(MapView.who(screen))}</p></aside> : null;
    }
    const { cell, name, d, here, go } = MapView.way(screen, chosen);
    return (
      <aside className={`plan${over ? ' over' : ''}`} aria-label={`The way to ${name}`} data-id={chosen}
        aria-live={over ? 'off' : 'polite'}>
        <p className="label">{MapView.told(region, chosen, here)}</p>
        <h2 className="to" tabIndex={-1}>{Typography.curl(Words.upper(name))}</h2>
        {d && <ol className="legs">{d.legs.map((l, i) => <li key={i}>{Typography.curl(Words.leg(l.way, l.to))}
          <span className="note">{Words.span(l.minutes)}</span></li>)}</ol>}
        <p className="how">{d ? `${Words.upper(Words.span(d.minutes))} in all${d.toward ? `, as far as ${d.toward}` : ''}. ${
          MapView.arrival(screen, d.minutes)}`
          : here ? 'You are here already.' : go ? 'Across the country you can see, the quickest way.'
            : cell !== undefined && !MapView.walkable(land, Number(cell)) ? 'There is no going there on foot.'
              : MapView.heard(screen, chosen) ? 'You know no way there yet: go into the country beside it, and the way will show.'
                : 'You know no way there yet.'}</p>
        {!over && go && <button type="button" className="act go" data-action="set-out" onClick={() => app.choose(go)}>
          {Typography.curl(go.label)}</button>}
        {clear && !over && <button type="button" className="unchoose" data-action="map-unchoose" aria-label={`Let go of ${name}`}
          onClick={clear}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>}
      </aside>
    );
  }
  // A hex or a place chosen: what it is called, the way the page plans there, whether you are there already, and how
  // to set out for it, if there is any way to.
  static way(screen: Screen, chosen: string) {
    const region = screen.region!, land = region.land!;
    const cell = /^hex:(\d+)$/.exec(chosen)?.[1], id = cell !== undefined ? MapView.on(land, Number(cell)) : chosen;
    const area = region.within[id] ?? id, name = cell !== undefined ? MapView.ground(land, Number(cell), region)
      : region.areas.find(a => a.id === chosen)?.name ?? land.marks.find(m => m.id === chosen)?.name ?? chosen;
    // The place itself before what it lies in: a keep in a fen is set out for, not the fen.
    const plans = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.around ?? [], ...screen.mapped ?? []];
    const d = plans.find(x => x.id === id) ?? plans.find(x => x.id === area);
    const mark = land.marks.find(m => m.id === chosen), within = region.areas.find(a => a.here)?.id === area;
    const here = cell !== undefined ? land.here === Number(cell) || (!land.tracts && within) : mark ? mark.here : within;
    // A place the page plans no way to is not set out for (a journey that knows no way leaves nothing to go on with),
    // unless its hex is country the company can see: then across it, to the place's hex (a barrow heard of, beside
    // the wood the company stands in, had been "no way there yet": Mission 19's play).
    const go: Choice | undefined = d ? MenuModel.journey(d) : here ? undefined
      : mark ? MapView.across(land, land.known.includes(mark.cell) ? mark.cell : undefined, name)
        : MapView.across(land, cell, name);
    return { cell, name, d, here, go };
  }
  // Where no way is known, across the open country to the hex: a hex chosen, the hex a place seen stands on, or one
  // with something on it not yet made out, at the edge of what is known (going to look is how it is found out); never
  // into the sea or a lake, where there is no stretch of country to come to (the navigation review).
  private static across(land: NonNullable<RegionChart['land']>, cell: string | number | undefined,
    name: string): Choice | undefined {
    const n = Number(cell), near = land.marks.some(m => m.cell === n && m.state === 'unknown');
    if (!land.tracts || cell === undefined || !(land.known.includes(n) || near) || !MapView.walkable(land, n)) {
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
  // How much the company knows of where is chosen (see Knowing): a place, as the land says; a hex, as the town or the
  // place on it, or, where nothing stands (no count is kept of open country), only that it is country it knows.
  private static told(region: RegionChart, chosen: string, here: boolean): string {
    const cell = /^hex:(\d+)$/.exec(chosen)?.[1], n = Number(cell), W = region.land?.width ?? 0;
    const on = cell === undefined ? chosen : region.land?.marks.find(m => m.cell === n)?.id
      ?? region.areas.find(a => a.kind === 'settlement' && a.y * W + a.x === n)?.id;
    if (here) { return 'You are here'; }
    if (!on) { return 'Country you know'; }
    return MapView.knowing[MapView.known(region, on) ?? 'seen'];
  }
  private static readonly knowing: Record<Knowing, string> = { visited: 'You have been here',
    seen: 'You have not been here', heard: 'You have only heard of it', unknown: 'Something you have not made out' };
  private static known(region: RegionChart, id: string): Knowing | undefined {
    const land = region.land, area = region.areas.find(a => a.id === id);
    if (!area || !land) { return land?.marks.find(m => m.id === id)?.state; }
    return area.kind === 'settlement' ? HexLand.town(land, area) : area.visited ? 'visited' : 'seen';
  }
  // A hex of open country, by its land, and where it lies: from the nearest town within a day or so, as the stretch
  // is named when you come to it ("wet ground east of Brightbridge": the bare "wet ground" said nothing of where, the
  // owner, OWN-47).
  static ground(land: NonNullable<RegionChart['land']>, cell: number, region?: RegionChart): string {
    const cover = HexLand.covers[land.cover[cell] ?? '.'] ?? 'meadow', W = land.width;
    const ground = ({ meadow: 'open fields', heath: 'open heath', wood: 'woodland', fen: 'wet ground',
      fell: 'the fellside', peak: 'the heights', sea: 'the sea', lake: 'water' } as Record<string, string>)[cover];
    const near = (region?.areas ?? []).filter(a => a.kind === 'settlement')
      .map(a => ({ a, by: MapView.apart(W, a.y * W + a.x, cell) })).sort((x, y) => x.by - y.by)[0];
    if (!near || near.by === 0 || near.by > 5) { return ground ?? 'open country'; }
    return `${ground ?? 'open country'} ${MapView.bearing(cell % W - near.a.x, Math.floor(cell / W) - near.a.y)} of ${near.a.name}`;
  }
  private static bearing(dx: number, dy: number): string {
    const ways = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
    return ways[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]!;
  }
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
