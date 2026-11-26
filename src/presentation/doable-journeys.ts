import type { Screen } from '../ui/screen-types';
import type { Route } from './glance-types';
import { JourneyFold } from './journey-fold';
import { Typography } from './typography';
import type { Row } from './doable';
import { Surfaces } from './surfaces';

interface Journey { command: string; label: string; minutes: number }

// Every journey that can be set out on from here, the engine's (MT-18): the ways about the town the scene's offer
// holds, and the roads, the places further off and a site's way out, which the runner and the page had each made for
// themselves from the screen (the parity measure: 31 journeys the two had drawn apart). Which of them are on the map
// rather than in the rest is said here too (map), by JourneyFold, which the runner alone had read.
export class DoableJourneys {
  static readonly open = 'Open the map';
  // The journeys the scene's offer leaves out, by command, words and time: none to where a way from here already goes
  // (CL-07: the same place offered twice, as a way and as a journey); inside a site, the way out as the compass gives
  // it (Compass.out), the whole route in one act (cold play 4, CL-44).
  static more(flat: readonly Row[], screen: Screen, out?: Route): Journey[] {
    const had = new Set(flat.flatMap(r => r.does ? [r.does, ...this.reached(r.does)] : []));
    const leaving = out?.command && !out.barred && !had.has(out.command)
      ? [{ command: out.command, label: `Out to ${Typography.plain(out.name)}`, minutes: out.minutes }] : [];
    return [...leaving, ...JourneyFold.every(screen).filter(d => !had.has(`travel:${d.id}`))
      .map(d => ({ command: `travel:${d.id}`, label: `Set out for ${d.name}`, minutes: d.minutes }))];
  }
  // The rows with those journeys not kept in the rest marked as on the map. In a country drawn in hexes a journey
  // across it is the map's: of those the fold keeps, only the walks about the town the company is in and the way out
  // stay in the rest (the owner, 31 October: "move all cross-hex travel out of the play environment"; the page's own
  // rule till MT-18, MenuModel.stays, which the parity measure found the runner and serve did not keep). An aim's
  // journey across the country is the map's too, the map opening on it (MapView.aim), where the engine had kept it in
  // the rest and the page had not drawn it (the parity measure's page engine only, MT-18).
  // One the four lead with that goes across the country opens the map at where it goes (chart), every client alike:
  // the page charts it, the runner opens its journeys there; the journey itself is set out on from the map (the lead's
  // ruling, 20 November, on the parity measure's page pressed: the page had opened the map, the runner set out).
  // While the world map is hidden (compactification, the owner, 26 November: "The world map can be hidden for now";
  // OR-1242), no row opens it and nothing leads to it: a way across the hex is the map's alone (Crossing), so the gold
  // that would have led there leads nowhere rather than to an act that would be refused, and the aim says in its own
  // words where it is.
  static mapped(rows: Row[], screen: Screen, out?: Route): Row[] {
    const all = this.charting(rows, screen, out);
    return Surfaces.has(screen, 'the_map') ? all : all.filter(r => r.id !== 'view:map' && !r.chart && !r.map);
  }
  private static charting(rows: Row[], screen: Screen, out?: Route): Row[] {
    const fold = JourneyFold.kept(screen, out), drawn = !!screen.region?.land?.tracts;
    // Not a walk whose way leaves the hex (Destination.crosses): that is the map's, as any crossing is.
    const about = new Set([...(screen.around ?? []).filter(d => !d.crosses).map(d => d.id),
      ...out?.command ? [out.command] : [], ...out?.to ? [out.to] : []]);
    const kept = drawn ? new Set([...fold].filter(id => about.has(id))) : fold;
    // A way walked into another hex (onto the road out, into the wood's heart) is the map's too, as the page has it
    // (MenuModel.stays, Passages.crosses): offered by its command, it had stood in the rest (the parity measure).
    const crossing = new Set(drawn ? screen.exits.filter(e => e.crosses).map(e => e.destination.id) : []);
    const marked = rows.map(r => r.led ? (drawn ? this.charted(r, about, screen) : r) : this.mark(r, kept, crossing));
    const going = new Set(marked.flatMap(r => r.does ? [r.does] : []));
    // The journey a charted row opens the map on, there to be set out on, where no row of the rest does it: in the
    // journey's own words, which the map says.
    const set = marked.flatMap((r, i) => r.chart && !going.has(`travel:${r.chart}`)
      ? [{ id: `travel:${r.chart}`, label: rows[i]!.called ?? rows[i]!.label, does: `travel:${r.chart}`,
        witnesses: r.witnesses, map: true as const, ...rows[i]!.minutes ? { minutes: rows[i]!.minutes } : {} }] : []);
    // And the map itself, where any journey is set out on from it, but underground (MenuModel.country, the page's
    // own row till now: the parity measure's page only, MT-18), the runner's journeys and serve's map alike.
    // Where the map sets out from here, it is offered whatever is yet laid (Screen.overland): the scene lays only the
    // aim's journey, the rest the map's as it opens (routes on demand). Its row says no number of journeys: a count on
    // the map's row was a notification (the owner, 25 November: "Why is the map sending you a notification?").
    const all: Row[] = [...marked, ...set], map = drawn && !screen.place.underground
      && (!!screen.overland || all.some(r => r.map || r.chart));
    // One row opens the map, never two (the owner's playtest, 25 November: the landing offered "Open the map" and
    // "Open the world map" at once): the row led with across the country where it is the aim's, in its gold; else the
    // map's own.
    const gilt = all.filter(r => r.chart && r.witnesses.some(w => w.aspects.includes('undertaking')));
    if (gilt.length) { return all.filter(r => !r.chart || gilt.includes(r)); }
    const plain = all.filter(r => !r.chart);
    return map || plain.length < all.length
      ? [...plain, { id: 'view:map', label: 'Open the world map', does: 'view:map', witnesses: [] }] : all;
  }
  // A row the four lead with across the country, as opening the map at where it goes: by the map's own id where its
  // own is the journey's (map:<place>), so that the journey keeps its id, set out on from the map.
  // Only one that leaves the hex the company is in: going into the town from the stretch of country it stands in, or
  // to a place within it, is entered, not charted (a1's Millholm from its own hex, 89: the led "To the corn-store"
  // had opened the map, and the company stayed out: test/safe-zone-browser at 390 wide).
  private static charted(r: Row, about: Set<string>, screen: Screen): Row {
    const to = /^travel:(.+)$/.exec(r.does ?? '')?.[1];
    // A way out of here says itself whether it crosses (ExitRow.crosses); a journey further, by where it goes.
    const exit = screen.exits.find(e => e.id === r.id);
    const crosses = exit ? !!exit.crosses : !!to && this.crosses(screen, to);
    if (!to || about.has(to) || about.has(r.does!) || !crosses) { return r; }
    // Said as what it does: the way leaves the hex, so the step is opening the map, gold as the aim's step is (the
    // owner, 25 November: ways to another hex appear only on the map; one act had carried a company from a town
    // across several hexes without the map opened).
    // Opening the map takes no time: the journey's minutes are its own row's, set out on from the map.
    const opening = { ...r };
    delete opening.minutes;
    return { ...opening, id: this.id(r.id), does: `view:map:${to}`, chart: to, label: DoableJourneys.open,
      called: DoableJourneys.open };
  }
  // Whether a journey leaves the hex the company is in: not one into a town a way from here walks into without
  // crossing (Millholm's corn-store from Millholm's own stretch of country, by its gate), nor to a place of the
  // country's own hex; every other journey across a country drawn in hexes does.
  private static crosses(screen: Screen, to: string): boolean {
    if (JourneyFold.every(screen).some(d => d.id === to && d.crosses)) { return true; }
    const land = screen.region?.land, towns = Object.keys(land?.towns ?? {}), at = this.town(towns, to);
    if (at && screen.exits.some(e => !e.crosses && this.town(towns, e.destination.id) === at)) { return false; }
    const tract = land?.tracts && to.startsWith(land.tracts) ? Number(to.slice(land.tracts.length)) : undefined;
    return tract === undefined || tract !== land?.here;
  }
  private static town(towns: string[], id: string): string | undefined {
    return towns.find(t => id === t || id.startsWith(`${t}_`));
  }
  // The id a row led with across the country is drawn by: map:<place> for its journey's own.
  static id(choice: string): string { return choice.replace(/^travel:/, 'map:'); }
  private static mark(r: Row, kept: Set<string>, crossing: Set<string>): Row {
    const to = /^go\([^,]+,([^)]+)\)$/.exec(r.does ?? '')?.[1];
    return r.opens ? { ...r, opens: r.opens.map(k => this.mark(k, kept, crossing)) }
      : (r.does?.startsWith('travel:') && !JourneyFold.keeps(kept, r.does)) || (to && crossing.has(to)) ? { ...r, map: true }
        : r;
  }
  static reached(does: string): string[] {
    const to = /^go\([^,]+,([^)]+)\)$/.exec(does)?.[1];
    return to ? [`travel:${to}`] : [];
  }
}
