import type { Campaign } from '../campaign/campaign';
import { Undertakings } from '../presentation/undertakings';
import type { Call, Entity } from '../lang/module';
import { ActionTime } from '../campaign/action-time';
import { ObservationText } from '../lang/observation-text';
import { LandModel } from './land-model';
import type { WayInfo } from './passage-model';
import { VisitedPlaces } from '../presentation/visited-places';
import { Spatial } from '../lang/spatial';
import type { RegionChart, Screen } from './screen-types';
import { SiteScale } from './site-scale';
import { RegionIds } from '../region-ids';
import { EntityIndex } from '../lang/entity-index';
import { Overland } from './overland';
import { Costs } from '../costs';
import { WorldMemo } from '../lang/world-memo';
import { KeptParts } from './kept-parts';
import { KnownWays, type Leg, type Tree } from './known-ways';
import { Passages } from './passages';
import { KnownCountry } from './known-country';
import { Descents } from './descents';

export type { Leg } from './known-ways';
// The way to a known place over ways the company knows: the place asked for, the room the way comes to, its legs in
// order, and the time they take together; or, where the way there is not known, toward it, as far as the wild country
// it is said to lie in (`toward` names it).
// beyond: a way known to it that leaves the hex the company is in, its legs not laid: all an ordinary turn's scene
// needs of the aim's journey across the country, which the map lays when it opens (see aimed).
export interface Itinerary { id: string; to: string; name: string; legs: Leg[]; minutes: number; toward?: string;
  beyond?: true }

type Destination = NonNullable<Screen['destinations']>[number];
// Which places a list of journeys keeps (only), and how each is laid (lay: a plan, where none is said).
interface Laying { only?: (id: string, ways?: readonly Call[]) => boolean; lay?: (id: string) => Itinerary | undefined }

// The way to somewhere known, over the ways the company knows: those it has walked from, been told of, the country's
// roads (which its folk know), and with wayfinding every road and path of the country (see ChartModel.ways).
export class Itineraries {
  // The known ways the company could take now, or risk, or fight its way through: not one that needs what it has not
  // got (a chimney to climb, without climbing or a rope). Read for the rest of a site to go on toward: the hobs' hold's
  // chimney, known once the smoke-hole was looked up (AT-01: the look teaches), had been "the rest of it" from the
  // cave mouth, and a company led to the cavern was led back out of it, round and round (test/honest-start).
  static able(campaign: Campaign): Map<string, WayInfo[]> {
    return new Map([...this.graph(campaign)].map(([from, ways]) => [from, ways.filter(w => w.status !== 'needs')]));
  }
  // The known ways from each place; or only those open now, with nothing in the way and nothing to risk (a ford in
  // spate is risked, not taken); roam: with every way across the open country besides, walked or not, for a journey
  // toward a place seen (see seen); barred: with the ways something bars besides (a locked door), what the compass
  // says stands in the way out (see KnownWays).
  static graph(campaign: Campaign, clear = false, roam = false, barred = false): Map<string, WayInfo[]> {
    return KnownWays.graph(campaign, clear, roam, barred);
  }
  // Whether a place is one the company may strike out across the open country toward: a stretch of it chosen on the
  // map, something it has seen from high ground (RegionTracts), or somewhere it has been (the way home). Toward a
  // place only heard of, a journey goes by known ways to the edge of its wild country, and asks there (the
  // play-structure investigation's PT-16).
  static seen(campaign: Campaign, destination: string): boolean {
    if (LandModel.tract.test(destination)) { return true; }
    const been = VisitedPlaces.of(campaign, campaign.playerActor!);
    if (been.has(destination) || been.has(`${destination}_green`)) { return true; }
    // Or told the way to it, over the open country as it is told (the innkeeper "tells you how each is come to"): the
    // debt's next old place, Marsh Howe, known by its way, had no journey to it, and the gold was lost (R10-17).
    const country = this.country(campaign);
    return ['sighted', 'found'].some(k => country.knows(`${destination}_${k}`));
  }
  // The quickest known way from where the company stands to a place, or to anywhere within an area: by ways open
  // now if there are any (mere's march-stone by the bridge, while both fords are in spate), else by those that ask
  // something of the company on the way; failing that, toward it: to the edge of the wild country it is said to lie
  // in, whose ways on the company does not know.
  // Toward anywhere on the company's map it knows of, the way is laid across the open country as the company reckons
  // it (see Overland, roams), the roads it knows taken where they are quicker; where there is none so, by the ways
  // known.
  static plan(campaign: Campaign, destination: string): Itinerary | undefined {
    const roam = this.roams(campaign, destination);
    return this.by(campaign, destination, roam) ?? (roam ? this.by(campaign, destination, false) : undefined)
      ?? this.toward(campaign, destination);
  }
  private static by(campaign: Campaign, destination: string, roam: boolean): Itinerary | undefined {
    return this.route(campaign, destination, true, roam) ?? this.route(campaign, destination, false, roam);
  }
  // Whether a journey to a place is planned across the open country: to one seen (see seen), or to any the company
  // knows of, by a way it knows to it or into the wild country it lies in, that stands on its country's map. Only
  // toward one seen had it been: toward the rest a journey went by the roads, and a way into a province nine hexes
  // off went twenty-three, out east and back (the owner, 16 November: "going very far away from the shortest path and
  // then coming back"; OR-35).
  private static roams(campaign: Campaign, destination: string): boolean {
    if (this.seen(campaign, destination)) { return true; }
    const here = campaign.world.one('at', campaign.playerActor!);
    if (!here || !Overland.placed(campaign, destination)) { return false; }
    const reach = this.reach(campaign, here), byId = this.byId(campaign);
    // The place itself, or the town or site it is in; not the wild country it lies in (toward a place there only
    // heard of, the way goes to the edge of that country: see toward).
    return Spatial.ancestry(byId, destination)
      .some((e, i) => reach.has(e.id) && (i === 0 || !['region', 'plane', 'wilderness'].includes(e.space!.kind)));
  }
  // Every place a known way comes to from here, or someone has told of, and what each lies within.
  // Once a world, and what it read noted wherever it is asked again (see WorldMemo).
  private static readonly reached = new WorldMemo<Set<string>>();
  private static reach(campaign: Campaign, here: string): Set<string> {
    const world = campaign.world;
    return this.reached.of(world, `${campaign.playerActor}:${campaign.history.length}:${here}`, () => {
      const tree = this.tree(campaign, here, false, false), byId = this.byId(campaign);
      const told = this.country(campaign).told;
      return new Set([...tree.order, ...told].flatMap(id => Spatial.ancestry(byId, id).map(e => e.id)));
    });
  }
  private static toward(campaign: Campaign, destination: string): Itinerary | undefined {
    const entities = this.byId(campaign);
    const here = campaign.world.one('at', campaign.playerActor!);
    for (const area of Spatial.ancestry(entities, destination).slice(1).filter(e => e.space?.kind === 'wilderness')) {
      if (!here || this.within(entities, here, area.id)) { return undefined; }
      const p = this.route(campaign, area.id, true) ?? this.route(campaign, area.id);
      const name = this.label(campaign, destination);
      if (p) { return { ...p, id: destination, name, toward: p.name }; }
    }
    return undefined;
  }
  private static route(campaign: Campaign, destination: string, clear = false,
    roam = this.roams(campaign, destination)): Itinerary | undefined {
    const world = campaign.world, here = world.one('at', campaign.playerActor!);
    if (!here || here === destination) { return undefined; }
    const tree = this.tree(campaign, here, clear, roam), entities = this.byId(campaign);
    // The first place settled that is the destination or within it: as near as the search came to it.
    const at = KnownWays.firstWithin(tree, entities, destination);
    if (!at) { return undefined; }
    const so = tree.best.get(at)!;
    return { id: destination, to: at, name: this.label(campaign, destination), legs: so.legs,
      minutes: so.minutes };
  }
  // A place by the words the company knows it by.
  private static label(campaign: Campaign, id: string): string { return ObservationText.label(campaign.world, id); }
  // The nearest way from here to every place the company can reach (see KnownWays.tree).
  private static tree(campaign: Campaign, here: string, clear: boolean, roam: boolean): Tree {
    return KnownWays.tree(campaign, here, { clear, roam });
  }
  // Whether the company stands inside a place's site: the ruin behind its door, or a site gone into from it.
  private static inside(byId: Map<string, Entity>,
    at: { here?: string; id: string; ways: readonly Call[]; entities: readonly Entity[] }): boolean {
    const { here, id, ways, entities } = at;
    return !!here && [`${id}_site`, SiteScale.behind(entities, id, ways)].some(site => site && this.within(byId, here, site));
  }
  // Whether a way out sets out from a place below the company made sure (Descents.up).
  static secured(campaign: Campaign, plan: Pick<Itinerary, 'legs'>): boolean {
    return Descents.up(plan, this.country(campaign));
  }
  static within(entities: Map<string, Entity>, id: string, place: string): boolean {
    return id === place || Spatial.ancestry(entities, id).some(e => e.id === place);
  }
  static minutes(campaign: Campaign, passage: string): number {
    return ActionTime.passage(campaign.world, passage);
  }
  // The places worth setting out for that the company knows the way to and that are more than a step away: the
  // settlements and sites it has been to or been told of, and the edges of the country where a road goes on. These
  // are the leads a place offers to set out for; the towns the known roads go to besides are `roads`.
  // Only those `on.only` keeps, each laid by `on.lay` (a plan, unless said otherwise: see aimed).
  static destinations(campaign: Campaign, on: Laying = {}): Itinerary[] {
    const actor = campaign.playerActor!, world = campaign.world, entities = campaign.module.entities;
    const told = [...this.country(campaign).told];
    const visited = VisitedPlaces.of(campaign, actor), byId = this.byId(campaign);
    const here = world.one('at', actor), area = here ? this.area(byId, here) : undefined;
    const known = new Set([...told, ...[...visited].map(v => this.area(byId, v)?.id ?? v)]);
    // A place someone has told of is somewhere to set out for, whatever it is (a pit in the ground, a lone tower);
    // somewhere been is, when it is a settlement, a site or the edge of the country. One a step away is a way about
    // here, not somewhere to set out for; but setting out toward a place in wild country is not the step into it (the
    // raiders' hold a widow looks toward, a path's walk into the wood it stands in).
    // Nor is the place the company is inside (Sanhtusrecs, offered from its own long passage: the cold evaluation).
    const ways = world.related('connects');
    const lay = on.lay ?? this.plan.bind(this, campaign);
    const plans = [...known].filter(id => id !== area?.id && (!on.only || on.only(id, ways))
      && !this.inside(byId, { here, id, ways, entities }) && (told.includes(id) || this.worth(byId.get(id))))
      .flatMap(id => { const p = lay(id); return p && (p.legs.length > 1 || p.toward || p.beyond) ? [p] : []; });
    const toward = { ...Undertakings.aimed(campaign), told, visited };
    plans.sort((a, b) => this.rank(byId, toward, a.id) - this.rank(byId, toward, b.id) || a.minutes - b.minutes);
    // A door someone told of and the ruin gone into behind it are one place, not two: the ruin, whose way goes by its
    // door, is left out ("Riwustagn" was offered twice, back in town: play 7; a lone tower's foot and the keep gone
    // into from it were "Aurumvigilia" and "The tower": play 8).
    return plans.filter(p => !plans.some(o => o !== p && (o.name === p.name && p.legs.some(l => l.to === o.id)
      || SiteScale.behind(entities, o.id, ways) === p.id)));
  }
  // The towns the roads the company knows go to, that it has not been to or been told of, and the march-stones and the
  // ways into provinces at their ends: the map draws them, and they can be set out for from it, and from the notes (the
  // map had said "You know no way there yet" of a town at the end of a road it drew; and it went across country to the
  // hex beside a march-stone, so the country beyond was never drawn: the navigation review). One a single road away
  // too: the map and the notes set out by it. Not leads (but see MenuModel.destinations).
  static roads(campaign: Campaign, leads: Itinerary[], on: Laying = {}): Itinerary[] {
    const byId = this.byId(campaign), here = campaign.world.one('at', campaign.playerActor!);
    const area = here ? this.area(byId, here)?.id : undefined, listed = new Set(leads.map(d => d.id));
    const ends = new Set([...this.graph(campaign).values()].flat()
      .map(w => this.outward(w.to) ? w.to : this.area(byId, w.to)?.id)
      .filter((id): id is string => !!id && id !== area && id !== here && !listed.has(id)
        && (this.outward(id) || byId.get(id)?.space?.kind === 'settlement') && (!on.only || on.only(id))));
    const lay = on.lay ?? this.plan.bind(this, campaign);
    return [...ends].flatMap(id => { const p = lay(id); return p?.legs.length || p?.beyond ? [p!] : []; })
      .sort((a, b) => a.minutes - b.minutes);
  }
  // A march-stone, where a road goes on into the country beyond, or the way into one of the country's provinces. No
  // fact says so of a place: the ids RegionBorders and Provinces give their rooms (x1y0__edge_east, region__gate_…)
  // are the only handle on them today, as Frontier reads them.
  static outward(id: string): boolean { return this.ends.some(r => r.test(id)); }
  private static readonly ends = [/__edge_(north|east|south|west)$/,
    new RegExp(`^${RegionIds.region}__${RegionIds.room('')}\\w+$`)];
  // Where the company could set out for, and the towns its roads go to besides, each leg named as the page names its
  // way and place (the Bushweald play read "By the track to {region__w13}"): what the page is given of them. And the
  // other places of the town it is in, further than a step.
  // In a country drawn in hexes, only the aim's journey: the rest, and every other place the map draws, are the
  // map's alone, worked out where the map is asked for (see charted).
  // Kept from one world to the next while nothing they read has been written, and the company has been where it had
  // been, follows the aim it followed and has the region drawn as it was (see KeptParts).
  static shown(campaign: Campaign, names: Map<string, Entity>, region?: RegionChart) {
    return Costs.time('itinerary', () => this.kept(campaign, { names, region, key: 'itineraries' },
      this.showing.bind(this, campaign, region)));
  }
  // What the map alone sets out for and draws besides, for a screen the map is asked of: in a country drawn in hexes,
  // every lead and road the company knows a way to (destinations, roads), a plan to each, where the scene had only the
  // aim's (see aimed); and every other place on its land it knows a way to (mapped). Worked out only here, where a
  // client asks for the map (the page as it raises it, the terminal's travel question, serve's crossings, the
  // runner's journeys), never for an ordinary turn's scene, which reads none of it: a screen had planned to every lead,
  // road, area and mark of the country on every turn, the map open or not (platform-separation.md's immediate queue,
  // step 3: routes on demand). The screen is as it was, with these.
  static charted(campaign: Campaign, screen: Screen): Screen {
    if (screen.mapped) { return screen; }
    const kept = this.charts.get(screen);
    if (kept) { return kept; }
    const chart = this.charting.bind(this, campaign, screen);
    const at = { region: screen.region, key: 'charted', also: (screen.around ?? []).map(d => d.id).join('\u0000') };
    const out = { ...screen, ...Costs.time('itinerary', () => campaign.within(() => this.kept(campaign, at, chart))) };
    this.charts.set(screen, out);
    return out;
  }
  private static readonly charts = new WeakMap<Screen, Screen>();
  private static charting(campaign: Campaign, screen: Screen, names: Map<string, Entity>):
    Pick<Screen, 'destinations' | 'roads' | 'mapped'> {
    const { at, inside } = this.standing(campaign);
    if (!campaign.running || inside) { return { mapped: [] }; }
    // Undrawn, the scene's journeys are all of them already (see showing).
    const all = this.drawn(screen.region) ? this.lists(campaign, { at, names, leads: this.destinations(campaign),
      region: screen.region })
      : { destinations: screen.destinations ?? [], roads: screen.roads ?? [] };
    const listed = new Set([...all.destinations, ...all.roads, ...screen.around ?? []].map(d => d.id));
    return { ...all, mapped: this.mapped(campaign, screen.region, listed).map(d => this.named(d, names)) };
  }
  // A country drawn in hexes, whose journeys across it are the map's (the owner, 25 November).
  private static drawn(region?: RegionChart): boolean { return !!region?.land?.tracts; }
  // The leads and the roads as a screen gives them, each saying whether its way leaves the hex (Passages.leaves),
  // which makes it the map's (DoableJourneys.mapped).
  private static lists(campaign: Campaign, on: { at: string; names: Map<string, Entity>; leads: Itinerary[];
    roads?: Itinerary[]; region?: RegionChart }):
    Pick<Screen, 'destinations' | 'roads'> & { destinations: Destination[]; roads: Destination[] } {
    const { at, names, leads } = on, leaving = { module: campaign.module, from: at };
    const roads = this.onMap(on.roads ?? this.roads(campaign, leads), on.region);
    return { destinations: leads.map(d => this.marked(leaving, d, this.scaled(campaign, d, names))),
      roads: roads.map(d => this.marked(leaving, d, this.named(d, names))) };
  }
  // A journey whose legs are not laid (beyond) leaves the hex: the scene knew only that.
  private static marked(leaving: { module: Campaign['module']; from: string }, d: Itinerary, shown: Destination):
    Destination {
    return d.beyond ? { ...shown, crosses: true as const } : Passages.leaving(leaving, shown);
  }
  // A part kept from one world to the next (see shown), worded by the names the page is given; or worked out afresh
  // by other names (names: those asked for, the world's presented where none are).
  private static kept<T>(campaign: Campaign, at: { names?: Map<string, Entity>; region?: RegionChart; key: string;
    also?: string }, read: (names: Map<string, Entity>) => T): T {
    const world = campaign.world, actor = campaign.playerActor, { region, key } = at;
    const presented = ObservationText.presented(world), names = at.names ?? presented;
    if (!actor || names !== presented) { return read(names); }
    const following = campaign.tickState.current.following;
    const from = [campaign.running, following?.id, following?.chosen, KeptParts.token(region),
      ...VisitedPlaces.of(campaign, actor), at.also ?? ''].join('\u0000');
    return KeptParts.of(world, `${key}:${actor}`, from, () => read(ObservationText.presented(world)));
  }
  // The scene's journeys: the walks about the town, and, in a country not drawn in hexes, every lead and road; in one
  // drawn, only the journey of the aim followed, the rest the map's (see charted). Of that one, where its way leaves
  // the hex, only that it does (see aimed): the scene leads to the map with it, and the map lays it.
  private static showing(campaign: Campaign, region: RegionChart | undefined, names: Map<string, Entity>):
    Pick<Screen, 'destinations' | 'roads' | 'around' | 'overland'> {
    if (!campaign.running) { return { destinations: [], roads: [], around: [] }; }
    // From an enclosed place, nothing overland: the way out is walked first (CN-02; see Compass). Inside a building
    // the world map had opened, and set out across the country past the site's own ways.
    // But a house of a town, on the ground, is left by its door: a journey from it goes out of doors first, its way out
    // the first leg (OR-151: at Porthalen's customs-house the map drew the country and set out for none of it).
    const { at, inside } = this.standing(campaign), around = this.around(campaign);
    const leaving = { module: campaign.module, from: at };
    const aim = this.drawn(region) && !inside ? this.aimed(campaign, at) : undefined;
    const leads = inside ? [] : aim ? this.destinations(campaign, aim) : this.destinations(campaign);
    const lists = inside ? { destinations: [], roads: [] }
      : this.lists(campaign, { at, names, leads, region, ...aim ? { roads: this.roads(campaign, leads, aim) } : {} });
    // And the ways down the company has made sure, from above ground in the town (Descents).
    const down = Descents.of(campaign, this.plan.bind(this), this.country(campaign))
      .map(d => ({ ...this.named(d, names), name: d.name, descent: true as const }));
    return { ...lists, around: [...around.map(d => Passages.leaving(leaving, this.named(d, names))), ...down],
      ...aim ? { overland: true as const } : {} };
  }
  // The journey of the aim followed alone (to a place it names, or a town or site one lies within): planned where its
  // way stays in the hex, and where it leaves (the place in another hex), only known to be had, its legs not laid,
  // nor any other journey (platform-separation.md's immediate queue, step 3: the followed aim's route only when
  // guidance needs it). None where no aim is followed. Not to where a way from here goes already: that way is the
  // aim's step, as it was.
  // Or to the place a site the aim names is gone into from (Moonlake, for the Wardens' cisterns behind it): an aim
  // names a work's rooms, not the place it is set out for by (OWN-56); laid only to the places it names, nothing had
  // led toward the cisterns at all (OR-871).
  private static aimed(campaign: Campaign, at: string): Laying {
    const followed = Undertakings.aimed(campaign).followed, byId = this.byId(campaign);
    const ways = new Set((this.graph(campaign).get(at) ?? []).map(w => w.to));
    return { only: this.aimsAt.bind(this, { byId, ways, followed, entities: campaign.module.entities }),
      lay: this.layAimed.bind(this, campaign, at) };
  }
  private static aimsAt(on: { byId: Map<string, Entity>; ways: Set<string>; followed: string[];
    entities: readonly Entity[] }, id: string, connects?: readonly Call[]): boolean {
    if (on.ways.has(id)) { return false; }
    const into = connects ? SiteScale.behind(on.entities, id, connects) : undefined;
    return on.followed.some(p => this.within(on.byId, p, id) || (!!into && this.within(on.byId, p, into)));
  }
  private static layAimed(campaign: Campaign, at: string, id: string): Itinerary | undefined {
    return Passages.leaves(campaign.module, at, [id]) ? this.reaching(campaign, at, id) : this.plan(campaign, id);
  }
  // A journey to a place in another hex, as far as the scene needs it: that a way the company knows goes there or
  // toward it, as a plan would find (see plan), its legs not laid.
  private static reaching(campaign: Campaign, here: string, destination: string): Itinerary | undefined {
    if (!here || here === destination) { return undefined; }
    // Across the open country toward a place it may strike out for (see roams), a way there is had: the country is
    // crossed as the company reckons it. Else by the ways it knows, the search roams already reads (see reach): no
    // other search of the country's ways is made for it (the open country's had been, a third of the turn's routes).
    const known = this.roams(campaign, destination)
      || !!KnownWays.firstWithin(this.tree(campaign, here, false, false), this.byId(campaign), destination);
    const name = this.label(campaign, destination);
    return known || this.toward(campaign, destination)
      ? { id: destination, to: destination, name, legs: [], minutes: 0, beyond: true } : undefined;
  }
  // Where the company stands, and whether inside somewhere enclosed that is no house of a town (see showing).
  private static standing(campaign: Campaign): { at: string; inside: boolean } {
    const at = campaign.world.one('at', campaign.playerActor!) ?? '';
    return { at, inside: this.enclosed(campaign, at) && !this.house(campaign, at) };
  }
  // Whether a place is enclosed: indoors or under the ground, or within a building or a site (a keep, a ship, a
  // dungeon). The country is not crossed from one; the way out is.
  static enclosed(campaign: Campaign, place: string): boolean {
    const byId = this.byId(campaign), space = byId.get(place)?.space;
    return !!space && (['indoors', 'underground'].includes(space.shelter ?? '') || (space.depth ?? 0) > 0
      || Spatial.ancestry(byId, place).some(e => e.id !== place && ['building', 'site'].includes(e.space?.kind ?? '')));
  }
  // A house of a town on the ground (a shop, the customs-house), not under it nor deep in a site.
  static house(campaign: Campaign, place: string): boolean {
    const byId = this.byId(campaign), space = byId.get(place)?.space;
    return !!space && space.shelter !== 'underground' && !(space.depth ?? 0)
      && Spatial.ancestry(byId, place).some(e => e.space?.kind === 'settlement')
      && !Spatial.ancestry(byId, place).some(e => e.id !== place && e.space?.kind === 'site');
  }
  // Of the towns and march-stones the known roads go to, those the map draws (an area of it, a place within one, or a
  // mark on its land): the rest are no more known to the company than the map shows (OR-741: a fresh life had been
  // offered every town of the country, and the map named them all). With no map of the country, all of them.
  // The journeys the map sets out for: where the company could set out for, and of the towns and march-stones its
  // roads go to, those the map draws (see onMap). Never a town the map does not show (OR-880: the way out of a
  // building toward an aim had led toward any town the country's roads reach).
  static drawnJourneys(campaign: Campaign, region: RegionChart | undefined): Itinerary[] {
    const leads = this.destinations(campaign);
    return [...leads, ...this.onMap(this.roads(campaign, leads), region)];
  }
  private static onMap(roads: Itinerary[], region: RegionChart | undefined): Itinerary[] {
    if (!region) { return roads; }
    const known = new Set([...region.areas.map(a => a.id), ...Object.keys(region.within),
      ...region.land?.marks.map(m => m.id) ?? []]);
    return roads.filter(d => known.has(d.id));
  }
  // Every other place the map draws that the company knows a way to, in whatever country it is in: each area and
  // mark on its land not set out for already, a single way off too, so that a place chosen on the map is set out for
  // itself and come to (over the march, the map had said "You know no way there yet" of everything on it but the
  // towns: the owner, OWN-43).
  static mapped(campaign: Campaign, region: RegionChart | undefined, listed: Set<string>): Itinerary[] {
    const ids = new Set([...region?.areas.map(a => a.id) ?? [], ...region?.land?.marks.map(m => m.id) ?? []]);
    return [...ids].filter(id => !listed.has(id))
      .flatMap(id => { const p = this.plan(campaign, id); return p?.legs.length ? [p] : []; });
  }
  // The other places of the town the company is in that are further than a step: each a walk by the town's own ways
  // (from a shop to the inn, by the square), so that going about a town is not going back to its square every time
  // (the owner's interim report: the same few places walked between, over and over).
  static around(campaign: Campaign): Itinerary[] {
    const here = campaign.world.one('at', campaign.playerActor!);
    const byId = this.byId(campaign);
    const town = here && Spatial.ancestry(byId, here).find(e => e.space?.kind === 'settlement');
    // Not underground, nor to anywhere underground: a cellar under the corn-store had offered the inn's taproom,
    // thirty minutes off, and the town's walks had offered the ossuary (OWN-57's play).
    if (!town || byId.get(here)?.space?.shelter === 'underground') { return []; }
    const rooms = this.rooms(byId, town.id);
    return EntityIndex.of(campaign.module.entities).typed('place').filter(e => rooms.has(e.id) && e.id !== here
      && e.space!.shelter !== 'underground' && this.entrance(campaign, byId, e.id))
      // By the town's own ways, the open country not searched for them: a walk about a town had searched every way of
      // the country across its open land (roams, the town's rooms having been), most of an ordinary turn's routes.
      .flatMap(r => { const p = this.route(campaign, r.id, true, false); return p && p.legs.length > 1 ? [p] : []; })
      .sort((a, b) => a.minutes - b.minutes);
  }
  // A town's rooms, found once for the module's places (again where they grow): every room of the world had been
  // walked up through its places for every page in a town, to find the town's (OR-863).
  private static rooms(byId: Map<string, Entity>, town: string): ReadonlySet<string> {
    const towns = this.towns.get(byId) ?? new Map<string, ReadonlySet<string>>();
    this.towns.set(byId, towns);
    let rooms = towns.get(town);
    if (!rooms) {
      rooms = new Set([...byId.values()].filter(e => e.type === 'place' && e.space?.kind === 'room'
        && Spatial.ancestry(byId, e.id).some(a => a.id === town)).map(e => e.id));
      towns.set(town, rooms);
    }
    return rooms;
  }
  private static readonly towns = new WeakMap<Map<string, Entity>, Map<string, ReadonlySet<string>>>();
  // Of a site standing in the town (the Hall), only the way into it: its inner rooms are gone to from within it (the
  // old tree on the hill had been listed among the town's walks).
  private static entrance(campaign: Campaign, byId: Map<string, Entity>, id: string): boolean {
    const site = this.area(byId, id);
    return site?.space?.kind !== 'site' || campaign.world.related('connects').some(c => (c.args[1] === id
      && this.area(byId, c.args[2]!) !== site) || (c.args[2] === id && this.area(byId, c.args[1]!) !== site));
  }
  // A place set out for, with how big it is where it is a site (see SiteScale).
  private static scaled(campaign: Campaign, d: Itinerary, names: Map<string, Entity>): NonNullable<Screen['destinations']>[number] {
    const scale = SiteScale.of(campaign.module.entities, d.id, campaign.world.related('connects'));
    return { ...this.named(d, names), ...scale ? { scale } : {} };
  }
  private static named(d: Itinerary, names: Map<string, Entity>): NonNullable<Screen['destinations']>[number] {
    return { id: d.id, name: names.get(d.id)?.name ?? d.name, minutes: d.minutes,
      ...d.toward ? { toward: d.toward } : {}, legs: this.told(d.legs, id => names.get(id)?.name ?? id),
      stops: d.legs.map(l => l.to) };
  }
  // The legs of a journey as the page tells them: by each way, to the place it comes to by its name, and one stretch
  // of wild country after another by the same way one leg, their times together (a plan across Beorquudu had said
  // "By the way across country to among the trees of Beorquudu" seven times over: the navigation review).
  static told(legs: Leg[], name: (id: string) => string): { way: string; to: string; minutes: number }[] {
    const out: { way: string; to: string; minutes: number }[] = [];
    for (const l of legs) {
      // Water not yet seen, reckoned open country (see Overland.unseen), is no place to be named.
      const said = name(l.to), to = said === l.to && Overland.reckoned(l.passage) ? Overland.unknown : said;
      const last = out.at(-1);
      if (last?.way === l.way && last.to === to) { last.minutes += l.minutes; }
      else { out.push({ way: l.way, to, minutes: l.minutes }); }
    }
    return out;
  }
  // The entities by id, read once for the world as it is (a route had read every entity of the world again for each
  // place it planned for).
  // What a journey is to the company, nearest first within each: toward the aim it follows, toward any it holds,
  // somewhere it has been told of and not been, and the rest (TP-06).
  private static rank(byId: Map<string, Entity>, toward: { followed: string[]; held: string[]; told: string[];
    visited: ReadonlySet<string> }, id: string): number {
    return toward.followed.some(p => this.within(byId, p, id)) ? 0 : toward.held.some(p => this.within(byId, p, id)) ? 1
      : toward.told.includes(id) && !toward.visited.has(id) ? 2 : 3;
  }
  // What the company knows of the country, through the knowledge door (see KnownCountry).
  private static country(campaign: Campaign): KnownCountry {
    return KnownCountry.of(campaign.world, campaign.playerActor!);
  }
  private static byId(campaign: Campaign): Map<string, Entity> { return EntityIndex.of(campaign.module.entities).byId; }
  private static area(byId: Map<string, Entity>, id: string): Entity | undefined {
    return Spatial.ancestry(byId, id).find(e => ['settlement', 'site'].includes(e.space?.kind ?? ''));
  }
  private static worth(e?: Entity): boolean {
    return !!e && (['settlement', 'site'].includes(e.space?.kind ?? '') || this.outward(e.id));
  }
}
