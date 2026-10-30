import type { Campaign } from '../campaign/campaign';
import type { Call, Entity } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { LandModel } from './land-model';
import { ChartModel } from './chart-model';
import type { WayInfo } from './passage-model';
import { VisitedPlaces } from '../presentation/visited-places';
import { Spatial } from '../spatial';
import type { RegionChart, Screen } from './screen-types';
import { SiteScale } from './site-scale';
import { RegionWriter } from '../world/region-writer';
import { Provinces } from '../world/provinces';
import { EntityIndex } from '../lang/entity-index';

// One leg of a journey: by what way, from where to where, and how long it takes.
export interface Leg { passage: string; way: string; from: string; to: string; minutes: number }
// The way to a known place over ways the company knows: the place asked for, the room the way comes to, its legs in
// order, and the time they take together; or, where the way there is not known, toward it, as far as the wild country
// it is said to lie in (`toward` names it).
export interface Itinerary { id: string; to: string; name: string; legs: Leg[]; minutes: number; toward?: string }

// The way to somewhere known, over the ways the company knows: those it has walked from, been told of, the country's
// roads (which its folk know), and with wayfinding every road and path of the country (see ChartModel.ways).
export class Itineraries {
  // The known ways, from each place; or only those open now, with nothing in the way and nothing to risk (a ford in
  // spate is risked, not taken). Read once for each state of the world and of where the company has been, for every
  // place it plans for (the page plans for each place it knows of).
  private static readonly read = new WeakMap<object, { at: string; ways: WayInfo[]; roam?: WayInfo[] }>();
  // roam: with every way across the open country besides, walked or not, for a journey toward a place seen (see
  // Itineraries.seen).
  static graph(campaign: Campaign, clear = false, roam = false): Map<string, WayInfo[]> {
    const actor = campaign.playerActor!, world = campaign.world, at = `${actor}:${campaign.history.length}`;
    let kept = this.read.get(world);
    if (kept?.at !== at) {
      kept = { at, ways: this.chart(campaign).ways(VisitedPlaces.of(campaign, actor)) };
      this.read.set(world, kept);
    }
    if (roam) { kept.roam ??= this.chart(campaign).ways(VisitedPlaces.of(campaign, actor), true); }
    const ways = roam ? kept.roam! : kept.ways, graph = new Map<string, WayInfo[]>();
    for (const w of ways) {
      if (w.status === 'blocked' || (clear && w.status !== 'open')) { continue; }
      // Not seen nor been to, a place is not struck out toward: a journey goes into no open country for it. But from
      // out on the open country it crosses what it knows of it, back to a way (over the march, from a hex beside the
      // march-stone, nothing on the map had a way to it: the owner, OWN-43).
      if (!roam && LandModel.tract.test(w.to) && !LandModel.tract.test(w.from)) { continue; }
      if (!(graph.get(w.from) ?? []).some(x => x.passage === w.passage && x.to === w.to)) {
        graph.set(w.from, [...graph.get(w.from) ?? [], w]);
      }
    }
    return graph;
  }
  // Each way by the name the company knows it by, as the page names it, so a leg is told the same wherever it is said
  // (the Bound card read "Next, by the track to {region__w9} to a lone tower": the navigation review).
  private static chart(campaign: Campaign): ChartModel {
    return new ChartModel(campaign.world, campaign.playerActor!, ObservationText.presented(campaign.world));
  }
  // Whether a place is one the company may strike out across the open country toward: a stretch of it chosen on the
  // map, something it has seen from high ground (RegionTracts), or somewhere it has been (the way home). Toward a
  // place only heard of, a journey goes by known ways to the edge of its wild country, and asks there (the
  // play-structure investigation's PT-16).
  static seen(campaign: Campaign, destination: string): boolean {
    if (LandModel.tract.test(destination)) { return true; }
    const been = VisitedPlaces.of(campaign, campaign.playerActor!);
    if (been.has(destination) || been.has(`${destination}_green`)) { return true; }
    return campaign.world.relates('knows')
      && campaign.world.test(ModuleWriter.call('knows', campaign.playerActor!, `${destination}_sighted`));
  }
  // The quickest known way from where the company stands to a place, or to anywhere within an area: by ways open
  // now if there are any (mere's march-stone by the bridge, while both fords are in spate), else by those that ask
  // something of the company on the way; failing that, toward it: to the edge of the wild country it is said to lie
  // in, whose ways on the company does not know.
  static plan(campaign: Campaign, destination: string): Itinerary | undefined {
    return this.route(campaign, destination, true) ?? this.route(campaign, destination)
      ?? this.toward(campaign, destination);
  }
  private static toward(campaign: Campaign, destination: string): Itinerary | undefined {
    const entities = this.byId(campaign);
    const here = campaign.world.one('at', campaign.playerActor!);
    for (const area of Spatial.ancestry(entities, destination).slice(1).filter(e => e.space?.kind === 'wilderness')) {
      if (!here || this.within(entities, here, area.id)) { return undefined; }
      const p = this.route(campaign, area.id, true) ?? this.route(campaign, area.id);
      const name = ObservationText.label(campaign.world, destination);
      if (p) { return { ...p, id: destination, name, toward: p.name }; }
    }
    return undefined;
  }
  private static route(campaign: Campaign, destination: string, clear = false): Itinerary | undefined {
    const world = campaign.world, here = world.one('at', campaign.playerActor!);
    if (!here || here === destination) { return undefined; }
    const graph = this.graph(campaign, clear, this.seen(campaign, destination));
    const entities = this.byId(campaign);
    const best = new Map<string, { minutes: number; legs: Leg[] }>([[here, { minutes: 0, legs: [] }]]);
    const open = [here];
    while (open.length) {
      open.sort((a, b) => best.get(a)!.minutes - best.get(b)!.minutes);
      const at = open.shift()!, so = best.get(at)!;
      if (this.within(entities, at, destination)) {
        return { id: destination, to: at, name: ObservationText.label(world, destination), legs: so.legs,
          minutes: so.minutes };
      }
      for (const w of graph.get(at) ?? []) {
        const minutes = so.minutes + this.minutes(campaign, w.passage);
        if ((best.get(w.to)?.minutes ?? Infinity) <= minutes) { continue; }
        best.set(w.to, { minutes, legs: [...so.legs, { passage: w.passage, way: w.name, from: at, to: w.to,
          minutes: this.minutes(campaign, w.passage) }] });
        if (!open.includes(w.to)) { open.push(w.to); }
      }
    }
    return undefined;
  }
  // Whether the company stands inside a place's site: the ruin behind its door, or a site gone into from it.
  private static inside(byId: Map<string, Entity>,
    at: { here?: string; id: string; ways: readonly Call[]; entities: readonly Entity[] }): boolean {
    const { here, id, ways, entities } = at;
    return !!here && [`${id}_site`, SiteScale.behind(entities, id, ways)].some(site => site && this.within(byId, here, site));
  }
  static within(entities: Map<string, Entity>, id: string, place: string): boolean {
    return id === place || Spatial.ancestry(entities, id).some(e => e.id === place);
  }
  static minutes(campaign: Campaign, passage: string): number {
    return Math.max(1, campaign.world.number(ModuleWriter.call('travelTime', passage))) * 10;
  }
  // The places worth setting out for that the company knows the way to and that are more than a step away: the
  // settlements and sites it has been to or been told of, and the edges of the country where a road goes on. These
  // are the leads a place offers to set out for; the towns the known roads go to besides are `roads`.
  static destinations(campaign: Campaign): Itinerary[] {
    const actor = campaign.playerActor!, world = campaign.world, entities = campaign.module.entities;
    const told = world.relates('leadsTo') ? world.related('leadsTo')
      .filter(r => world.test(ModuleWriter.call('knows', actor, r.args[0]!))).map(r => r.args[1]!) : [];
    const visited = VisitedPlaces.of(campaign, actor), byId = this.byId(campaign);
    const here = world.one('at', actor), area = here ? this.area(byId, here) : undefined;
    const known = new Set([...told, ...[...visited].map(v => this.area(byId, v)?.id ?? v)]);
    // A place someone has told of is somewhere to set out for, whatever it is (a pit in the ground, a lone tower);
    // somewhere been is, when it is a settlement, a site or the edge of the country. One a step away is a way about
    // here, not somewhere to set out for; but setting out toward a place in wild country is not the step into it (the
    // raiders' hold a widow looks toward, a path's walk into the wood it stands in).
    // Nor is the place the company is inside (Sanhtusrecs, offered from its own long passage: the cold evaluation).
    const ways = world.related('connects');
    const plans = [...known].filter(id => id !== area?.id && !this.inside(byId, { here, id, ways, entities })
      && (told.includes(id) || this.worth(byId.get(id))))
      .flatMap(id => { const p = this.plan(campaign, id); return p && (p.legs.length > 1 || p.toward) ? [p] : []; })
      .sort((a, b) => a.minutes - b.minutes);
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
  static roads(campaign: Campaign, leads: Itinerary[]): Itinerary[] {
    const byId = this.byId(campaign), here = campaign.world.one('at', campaign.playerActor!);
    const area = here ? this.area(byId, here)?.id : undefined, listed = new Set(leads.map(d => d.id));
    const ends = new Set([...this.graph(campaign).values()].flat()
      .map(w => this.outward(w.to) ? w.to : this.area(byId, w.to)?.id)
      .filter((id): id is string => !!id && id !== area && id !== here && !listed.has(id)
        && (this.outward(id) || byId.get(id)?.space?.kind === 'settlement')));
    return [...ends].flatMap(id => { const p = this.plan(campaign, id); return p?.legs.length ? [p] : []; })
      .sort((a, b) => a.minutes - b.minutes);
  }
  // A march-stone, where a road goes on into the country beyond, or the way into one of the country's provinces. No
  // fact says so of a place: the ids RegionBorders and Provinces give their rooms (x1y0__edge_east, region__gate_…)
  // are the only handle on them today, as Frontier reads them.
  static outward(id: string): boolean { return this.ends.some(r => r.test(id)); }
  private static readonly ends = [/__edge_(north|east|south|west)$/,
    new RegExp(`^${RegionWriter.id}__${Provinces.room('')}\\w+$`)];
  // Where the company could set out for, and the towns its roads go to besides, each leg named as the page names its
  // way and place (the Bushweald play read "By the track to {region__w13}"): what the page is given of them. And the
  // other places of the town it is in, further than a step.
  // And every other place the map draws (see mapped).
  static shown(campaign: Campaign, names: Map<string, Entity>,
    region?: RegionChart): Pick<Screen, 'destinations' | 'roads' | 'around' | 'mapped'> {
    if (!campaign.running) { return { destinations: [], roads: [], around: [], mapped: [] }; }
    const leads = this.destinations(campaign), roads = this.roads(campaign, leads), around = this.around(campaign);
    const listed = new Set([...leads, ...roads, ...around].map(d => d.id));
    return { destinations: leads.map(d => this.scaled(campaign, d, names)), roads: roads.map(d => this.named(d, names)),
      around: around.map(d => this.named(d, names)),
      mapped: this.mapped(campaign, region, listed).map(d => this.named(d, names)) };
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
    if (!town) { return []; }
    return campaign.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && e.id !== here
      && Spatial.ancestry(byId, e.id).some(a => a.id === town.id))
      .flatMap(r => { const p = this.route(campaign, r.id, true); return p && p.legs.length > 1 ? [p] : []; })
      .sort((a, b) => a.minutes - b.minutes);
  }
  // A place set out for, with how big it is where it is a site (see SiteScale).
  private static scaled(campaign: Campaign, d: Itinerary, names: Map<string, Entity>): NonNullable<Screen['destinations']>[number] {
    const scale = SiteScale.of(campaign.module.entities, d.id, campaign.world.related('connects'));
    return { ...this.named(d, names), ...scale ? { scale } : {} };
  }
  private static named(d: Itinerary, names: Map<string, Entity>): NonNullable<Screen['destinations']>[number] {
    return { id: d.id, name: names.get(d.id)?.name ?? d.name, minutes: d.minutes,
      ...d.toward ? { toward: d.toward } : {}, legs: this.told(d.legs, id => names.get(id)?.name ?? id) };
  }
  // The legs of a journey as the page tells them: by each way, to the place it comes to by its name, and one stretch
  // of wild country after another by the same way one leg, their times together (a plan across Beorquudu had said
  // "By the way across country to among the trees of Beorquudu" seven times over: the navigation review).
  static told(legs: Leg[], name: (id: string) => string): { way: string; to: string; minutes: number }[] {
    const out: { way: string; to: string; minutes: number }[] = [];
    for (const l of legs) {
      const to = name(l.to), last = out.at(-1);
      if (last?.way === l.way && last.to === to) { last.minutes += l.minutes; }
      else { out.push({ way: l.way, to, minutes: l.minutes }); }
    }
    return out;
  }
  // The entities by id, read once for the world as it is (a route had read every entity of the world again for each
  // place it planned for).
  private static byId(campaign: Campaign): Map<string, Entity> { return EntityIndex.of(campaign.module.entities).byId; }
  private static area(byId: Map<string, Entity>, id: string): Entity | undefined {
    return Spatial.ancestry(byId, id).find(e => ['settlement', 'site'].includes(e.space?.kind ?? ''));
  }
  private static worth(e?: Entity): boolean {
    return !!e && (['settlement', 'site'].includes(e.space?.kind ?? '') || this.outward(e.id));
  }
}
