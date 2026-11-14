import type { RegionChart, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { MapView } from './map-view';
import { HexLand } from './hex-land';
import { Words } from './words';
import { Typography } from '../../src/presentation/typography';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { Marks } from '../../src/ui/marks';

type Way = ReturnType<typeof MapView.way>;
type Fact = [label: string, value: string];

// A place chosen on the map, as a decision over a landscape (the owner, 11 November: "present a place and a meaningful
// decision, not a collection of loosely formatted application data"). What the choice is, in a word; the place, by the
// name it is known by; where it lies, quietly; how long, when, over what land and at what cost of food, in a few
// set facts; the way itself and the place's whole name a touch further in; and one short command, with what else the
// company can do here only where there is something to do. Nothing here plans: the way, its time and the set-out are
// the map's (see MapView.way), as the journey goes them.
export class RouteCard {
  static View({ app, screen, chosen, clear, over }: { app: ReaderApp; screen: Screen; chosen: string;
    clear?: () => void; over?: boolean }) {
    const region = screen.region!, way = MapView.way(screen, chosen), { title, context } = RouteCard.named(region, chosen, way);
    const nearby = RouteCard.nearby(region);
    return (
      <aside className={`plan route-card${over ? ' over' : ''}`} aria-label={`The way to ${way.name}`} data-id={chosen}
        aria-live={over ? 'off' : 'polite'}>
        <p className="rc-eyebrow">{RouteCard.eyebrow(screen, way)}</p>
        <h2 className="rc-title to" tabIndex={-1}>{Typography.curl(Words.upper(title))}</h2>
        {context && <p className="rc-context">{Typography.curl(context)}</p>}
        {!over && <dl className="rc-facts">{RouteCard.facts(screen, chosen, way, context).map(([k, v]) => <div key={k}>
          <dt>{k}</dt><dd>{Typography.curl(v)}</dd></div>)}</dl>}
        {!over && RouteCard.warnings(screen, way).map(w => <p key={w} className="rc-warn">{Typography.curl(w)}</p>)}
        {!over && !way.d && !way.here && <p className="rc-how">{Typography.curl(RouteCard.unplanned(screen, chosen, way))}</p>}
        {!over && way.d && <details className="rc-route"><summary>The way</summary>
          <ol>{way.d.legs.map((l, i) => <li key={i}><span>{Typography.curl(Words.leg(l.way, l.to))}</span>
            <span className="rc-span">{Words.span(l.minutes)}</span></li>)}</ol>
          {title !== way.name && <p className="rc-formal">{Typography.curl(Words.upper(way.name))}</p>}
        </details>}
        {!over && (way.go || nearby.length > 0) && <div className="rc-acts">
          {way.go && <button type="button" className="act go rc-go" data-action="set-out" data-act={way.go.id} aria-label={way.go.label}
            title={way.go.label} onClick={() => app.choose(way.go!)}>Set out</button>}
          {nearby.length > 0 && <button type="button" className="option rc-near" data-action="explore-nearby"
            onClick={() => RouteCard.explore(app)}>{Typography.curl(RouteCard.around(screen))}<span className="rc-span">
              {Words.many(nearby.length, 'place')}</span></button>}
        </div>}
        {clear && !over && <button type="button" className="unchoose" data-action="map-unchoose"
          aria-label={`Let go of ${way.name}`} onClick={clear}><svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" /></svg></button>}
      </aside>
    );
  }
  // What the choice is: a journey by known ways, across open country, or no way known; where the company is already.
  static eyebrow(screen: Screen, way: Way): string {
    if (way.here) { return 'Where you are'; }
    if (!way.go) { return 'No way known'; }
    return way.d ? 'Journey to' : 'Across country to';
  }
  // The place by the name it is known by, and where it lies. A stretch of road is named for the road and told apart
  // from others by the towns it lies between, or the one it lies by: those, read off the map's own ways from it, are
  // its context, and its title is its name without them; a name that does not end so is left whole. Else where it
  // lies is its land and the nearest town, as a stretch is named when come to.
  static named(region: RegionChart, chosen: string, way: Way): { title: string; context?: string } {
    const area = region.within[chosen] ?? chosen, towns = new Map(region.areas.filter(a => a.kind === 'settlement')
      .map(a => [a.id, a.name]));
    const ends = [...new Set(region.edges.flatMap(e => e.from === area && towns.has(e.to) ? [towns.get(e.to)!]
      : e.to === area && towns.has(e.from) ? [towns.get(e.from)!] : []))];
    const tails = [...ends.flatMap(a => ends.filter(b => b !== a).map(b => `between ${a} and ${b}`)),
      ...[...towns.values()].map(t => `by ${t}`)];
    const tail = tails.find(t => way.name.endsWith(` ${t}`));
    if (tail) { return { title: way.name.slice(0, -tail.length - 1), context: Words.upper(tail) }; }
    const land = region.land!, cell = way.cell !== undefined ? Number(way.cell)
      : land.marks.find(m => m.id === chosen)?.cell ?? RouteCard.cell(region, area);
    const kind = region.areas.find(a => a.id === chosen)?.kind;
    const ground = cell === undefined || kind === 'settlement' ? undefined : Words.upper(MapView.ground(land, cell, region));
    return { title: way.name, ...ground && ground.toLowerCase() !== way.name.toLowerCase() ? { context: ground } : {} };
  }
  // How long, when, over what land, what it eats of the company's food, and what is known of the place.
  // The land, where the context has not said it already.
  static facts(screen: Screen, chosen: string, way: Way, context?: string): Fact[] {
    const region = screen.region!, land = region.land!, d = way.d;
    const cell = way.cell !== undefined ? Number(way.cell) : land.marks.find(m => m.id === chosen)?.cell
      ?? RouteCard.cell(region, region.within[chosen] ?? chosen);
    const cover = cell === undefined ? undefined : HexLand.covers[land.cover[cell] ?? ''];
    const known = RouteCard.known(region, chosen);
    return [...d ? [['Time', Words.upper(Words.span(d.minutes))] as Fact, ['Arrive', RouteCard.when(screen, d.minutes)] as Fact,
      ...RouteCard.food(screen, d.minutes)] : [],
    ...cover && !way.here && ![context, way.name].some(t => t?.toLowerCase().includes((RouteCard.lands[cover] ?? cover).toLowerCase()))
      ? [['Land', RouteCard.lands[cover] ?? cover] as Fact] : [],
    ...known ? [['Known', known] as Fact] : []];
  }
  private static readonly lands: Record<string, string> = { meadow: 'Open fields', heath: 'Heath', wood: 'Woodland',
    fen: 'Wet ground', fell: 'Fellside', peak: 'Heights', sea: 'Sea', lake: 'Water' };
  // When the company would come there, set out now: the hour, the day if not today, and after dark if so.
  static when(screen: Screen, minutes: number): string {
    const [day, time] = FictionalTime.at(screen.elapsed, minutes).split(', '), today = FictionalTime.at(screen.elapsed).split(', ')[0];
    return `${time}${day === today ? '' : `, ${day!.toLowerCase()}`}`;
  }
  // The rations it would eat of those carried (see MapView.provision).
  private static food(screen: Screen, minutes: number): Fact[] {
    const e = screen.expedition, arrive = screen.elapsed + minutes / FictionalTime.minutesPerTick;
    const meals = e.mealAt === undefined || arrive < e.mealAt ? 0 : 1 + Math.floor((arrive - e.mealAt) / MapView.day);
    return meals ? [['Food', `${Words.many(meals, 'ration')} of the ${e.rations} you carry`]] : [];
  }
  // What would go wrong on the way, said apart: dark, hunger, weariness.
  static warnings(screen: Screen, way: Way): string[] {
    const d = way.d;
    if (!d) { return []; }
    const e = screen.expedition, arrive = screen.elapsed + d.minutes / FictionalTime.minutesPerTick;
    const meals = e.mealAt === undefined || arrive < e.mealAt ? 0 : 1 + Math.floor((arrive - e.mealAt) / MapView.day);
    return [...Marks.journey(screen.elapsed, d.minutes) ? ['You would come there after dark.'] : [],
      ...meals > e.rations ? ['You have not food enough for the way, and would go hungry.'] : [],
      ...e.weary ? ['You are weary, and would go on without sleep.'] : []];
  }
  private static known(region: RegionChart, id: string): string | undefined {
    const state = region.land?.marks.find(m => m.id === id)?.state
      ?? (region.areas.find(a => a.id === id)?.visited ? 'visited' : undefined);
    return state && ({ visited: 'You have been there', seen: 'Seen, not visited', heard: 'Only by report' } as
      Record<string, string>)[state];
  }
  private static unplanned(screen: Screen, chosen: string, way: Way): string {
    const land = screen.region!.land!;
    if (way.go) { return 'Across the country you can see, the quickest way.'; }
    if (way.cell !== undefined && !MapView.walkable(land, Number(way.cell))) { return 'There is no going there on foot.'; }
    // In the company's own hex, by the ways about where it stands, not across the country.
    if (land.marks.some(m => m.id === chosen && m.cell === land.here)) { return 'Close by: its way is from where you are, under Go….'; }
    return land.marks.some(m => m.id === chosen && m.state === 'heard')
      ? 'You know no way there yet: go into the country beside it, and the way will show.' : 'You know no way there yet.';
  }
  // The places in the hex where the company stands that it knows of and is not at: what Explore nearby goes among.
  static nearby(region: RegionChart): NonNullable<RegionChart['land']>['marks'] {
    const land = region.land;
    return land?.here === undefined ? [] : land.marks.filter(m => m.cell === land.here && !m.here && m.state !== 'unknown');
  }
  // What the way back to where the company stands is called on the card: around the town or the place it is in, not
  // "Explore nearby", which beside a place that has no way known had read as the way there (the cold playtest of 14
  // November, CO-09: "Explore nearby · 31 places" was the town the company was leaving).
  static around(screen: Screen): string {
    const town = screen.path.find(p => p.kind === 'settlement')?.name;
    return `Around ${(town ?? screen.place.name).replace(/^The /, 'the ')}`;
  }
  // Back to where the company stands, whose ways go among them (Go…), the map put away.
  private static explore(app: ReaderApp): void {
    if (app.state.outdoors) { app.outdoor(false); } else { app.back(); }
  }
  // Inside a town or a site, where setting out leaves it (see MapView.leaving).
  private static inside(screen: Screen): boolean {
    return screen.place.kind === 'room' && screen.path.some(p => ['settlement', 'site'].includes(p.kind));
  }
  private static cell(region: RegionChart, id: string): number | undefined {
    const a = region.areas.find(x => x.id === id);
    return a && a.y * region.land!.width + a.x;
  }
}
