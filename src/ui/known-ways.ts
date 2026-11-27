import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { ObservationText } from '../lang/observation-text';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../lang/spatial';
import { VisitedPlaces } from '../presentation/visited-places';
import { WorldMemo } from '../lang/world-memo';
import { KeptParts } from './kept-parts';
import { ChartModel } from './chart-model';
import { LandModel } from './land-model';
import { Overland } from './overland';
import { Passages } from './passages';
import type { WayInfo } from './passage-model';

// One leg of a journey: by what way, from where to where, and how long it takes.
export interface Leg { passage: string; way: string; from: string; to: string; minutes: number }
// The nearest way to a place: its minutes and its legs, and how many of them go onto or off a road.
export interface Way { minutes: number; legs: Leg[]; roads: number }
// What a search goes by: only ways open now (clear), across the open country besides (roam), the ways something
// bars besides (barred), never one that needs what the company has not got (able); within one area (area), so many
// legs at most (legs), and its first leg only to one of these (first).
export interface Over {
  clear?: boolean; roam?: boolean; barred?: boolean; able?: boolean; area?: string; legs?: number;
  first?: ReadonlySet<string>;
}
// Every place reached from one, in the order settled, with its nearest way.
export interface Tree { order: string[]; best: Map<string, Way>;
  // The first place settled within each place (see firstWithin).
  within?: { byId: Map<string, Entity>; first: Map<string, string> } }

// The one way-finder over the ways the company knows (AR-21): those it has walked from, been told of, the country's
// roads (which its folk know), and with wayfinding every road and path of the country (see ChartModel.ways). Every
// route the engine lays is laid by it: the journey's legs (Itineraries), the gold's step toward an aim (Glance), what
// an aim's lead reckons nearest (AimLeading), the way out of an enclosed place (AimRoute); and the map draws the
// journey's stops. So the way led, the way drawn and the way walked are one. Its measure is the minutes a way takes
// as the company reckons them (Overland), and a road counts only where it shortens the way: of two ways as quick, the
// one that goes onto no road (the owner, 19 November: routes "double back to touch a road then leave it", which is
// not a real speedup), then the one of fewer legs (OR-35). Never through a place the company does not know: a way
// leads only from somewhere it has been or has been told of.
export class KnownWays {
  // Read once a world (and what they read noted wherever they are asked again: see WorldMemo).
  private static readonly read = new WorldMemo<WayInfo[]>();
  // The known ways from each place (see Itineraries.graph).
  static graph(campaign: Campaign, clear = false, roam = false, barred = false): Map<string, WayInfo[]> {
    const actor = campaign.playerActor!, at = `${actor}:${campaign.history.length}:${roam}`;
    const ways = this.read.of(campaign.world, at, () => roam ? [...this.chart(campaign)
      .ways(VisitedPlaces.of(campaign, actor), true), ...Overland.unseen(campaign)]
      : this.chart(campaign).ways(VisitedPlaces.of(campaign, actor)));
    const graph = new Map<string, WayInfo[]>(), taken = new Set<string>();
    for (const w of ways) {
      if ((w.status === 'blocked' && !barred) || (clear && w.status !== 'open')) { continue; }
      // Not seen nor been to, a place is not struck out toward: a journey goes into no open country for it. But from
      // out on the open country it crosses what it knows of it, back to a way (over the march, from a hex beside the
      // march-stone, nothing on the map had a way to it: the owner, OWN-43).
      if (!roam && LandModel.tract.test(w.to) && !LandModel.tract.test(w.from)) { continue; }
      // Each way from a place once (by its passage and where it comes to), as first listed.
      const key = `${w.from}\u0000${w.passage}\u0000${w.to}`;
      if (taken.has(key)) { continue; }
      taken.add(key);
      const from = graph.get(w.from);
      if (from) { from.push(w); } else { graph.set(w.from, [w]); }
    }
    return graph;
  }
  // Each way by the name the company knows it by, as the page names it.
  private static chart(campaign: Campaign): ChartModel {
    return new ChartModel(campaign.world, campaign.playerActor!, ObservationText.presented(campaign.world));
  }
  // The nearest way from a place to the first place settled that satisfies `to` (not the place itself), or none.
  static way(campaign: Campaign, from: string, to: (id: string) => boolean, over: Over = {}): Way | undefined {
    const tree = this.tree(campaign, from, over), at = tree.order.find(id => id !== from && to(id));
    return at === undefined ? undefined : tree.best.get(at);
  }
  // The first place on that way.
  static first(campaign: Campaign, from: string, to: (id: string) => boolean, over: Over = {}): string | undefined {
    return this.way(campaign, from, to, over)?.legs[0]?.to;
  }
  // The places on the way to the nearest place of the hex the company knows of and has not been to, by the ways it can
  // take, the first first and that place last; none where the way leaves the hex, which is the map's (Passages.leaves;
  // the owner, 25 November). A tract of open country is no such place: what a way leads on to (see LeadsOn, OR-1502).
  // By its class, never this, so that it is handed on as it is (Glance hands it to LeadsOn).
  static unseen(campaign: Campaign, from: string): string[] {
    const been = VisitedPlaces.of(campaign, campaign.playerActor ?? 'party'), m = campaign.module;
    const on = KnownWays.way(campaign, from, id => !been.has(id) && !LandModel.tract.test(id)
      && !Passages.leaves(m, from, [id]), { able: true })?.legs.map(l => l.to) ?? [];
    return Passages.leaves(m, from, on) ? [] : on;
  }
  // The places on the way from one place to another, the first first (both ends), or none.
  static places(campaign: Campaign, from: string, to: string, over: Over = {}): string[] {
    if (from === to) { return [from]; }
    const legs = this.way(campaign, from, id => id === to, over)?.legs;
    return legs ? [from, ...legs.map(l => l.to)] : [];
  }
  // The nearest way from a place to every place it reaches, each settled in order of its minutes: searched once for
  // each kind of search, not once for every place asked of (the map's every area and mark had each run the whole
  // search, two thirds of a waited hour's time: Mission 21's validation profile).
  // Kept from one world to the next while nothing the search read has been written and the company has been where it
  // had been (KeptParts; what it reads of where it has been is its history's, not the world's): a screen after an act
  // that moved no one had searched the whole country's ways again (AX-05: a quarter of the screen's time).
  static tree(campaign: Campaign, from: string, over: Over = {}): Tree {
    const actor = campaign.playerActor ?? '', been = [...VisitedPlaces.of(campaign, actor)].sort().join('\u0000');
    return KeptParts.of(campaign.world, `ways:${actor}:${from}:${this.key(over)}`, been,
      () => this.search(campaign, from, over));
  }
  private static key(o: Over): string {
    return [o.clear, o.roam, o.barred, o.able].map(Number).join('') + `|${o.area ?? ''}|${o.legs ?? ''}|`
      + [...o.first ?? []].sort().join(',');
  }
  private static search(campaign: Campaign, from: string, over: Over): Tree {
    const graph = this.graph(campaign, over.clear, over.roam, over.barred), order: string[] = [];
    const best = new Map<string, Way>([[from, { minutes: 0, legs: [], roads: 0 }]]), done = new Set<string>();
    const roads = this.roads(campaign), byId = EntityIndex.of(campaign.module.entities).byId;
    for (const open = [from]; open.length;) {
      open.sort((a, b) => this.sooner(best.get(a)!, best.get(b)!));
      const at = open.shift()!, so = best.get(at)!;
      if (done.has(at)) { continue; }
      done.add(at); order.push(at);
      if (over.legs !== undefined && so.legs.length >= over.legs) { continue; }
      for (const w of graph.get(at) ?? []) {
        if (!this.takes(w, { over, at, from, byId })) { continue; }
        const leg = Overland.minutes(campaign, w), was = best.get(w.to);
        const next = { minutes: so.minutes + leg, roads: so.roads + (roads.has(w.to) ? 1 : 0),
          legs: [...so.legs, { passage: w.passage, way: w.name, from: at, to: w.to, minutes: leg }] };
        if (was && this.sooner(was, next) <= 0) { continue; }
        best.set(w.to, next);
        if (!open.includes(w.to)) { open.push(w.to); }
      }
    }
    return { order, best };
  }
  // Whether a search goes by a way: not one that needs what the company has not (able), out of the area it keeps to,
  // nor, as its first leg, to anywhere but where it may first go.
  private static takes(w: WayInfo, at: { over: Over; at: string; from: string; byId: Map<string, Entity> }): boolean {
    const { over } = at;
    return !(over.able && w.status === 'needs') && !(over.first && at.at === at.from && !over.first.has(w.to))
      && (!over.area || this.within(at.byId, w.to, over.area));
  }
  // Which of two ways is the quicker; of two as quick, the one onto fewer roads, then the one of fewer legs.
  static sooner(a: Way, b: Way): number {
    return a.minutes - b.minutes || a.roads - b.roads || a.legs.length - b.legs.length;
  }
  static within(byId: Map<string, Entity>, id: string, place: string): boolean {
    return id === place || Spatial.ancestry(byId, id).some(e => e.id === place);
  }
  // The first place a tree settled that is a place or within it (see within): each settled place's ancestry walked
  // once for the tree, not once for every place a journey is planned to (a screen plans to every lead, road, walk
  // about town and mark on the map, and each had walked the whole of the order: OR-91's profile).
  static firstWithin(tree: Tree, byId: Map<string, Entity>, place: string): string | undefined {
    if (tree.within?.byId !== byId) {
      const first = new Map<string, string>();
      for (const id of tree.order) {
        if (!first.has(id)) { first.set(id, id); }
        for (const e of Spatial.ancestry(byId, id)) { if (!first.has(e.id)) { first.set(e.id, id); } }
      }
      tree.within = { byId, first };
    }
    return tree.within.first.get(place);
  }
  // The roads of the country as places (a road is one place, its stretches each a way onto it): read once a module.
  private static readonly roadsOf = new WeakMap<object, Set<string>>();
  private static roads(campaign: Campaign): Set<string> {
    const m = campaign.module, kept = this.roadsOf.get(m);
    if (kept) { return kept; }
    const roads = new Set(Object.values(m.charts ?? {}).flatMap(c => Object.keys(c.roads ?? {})));
    this.roadsOf.set(m, roads);
    return roads;
  }
}
