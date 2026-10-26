import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { ChartModel } from './chart-model';
import type { WayInfo } from './passage-model';
import { VisitedPlaces } from '../presentation/visited-places';
import { Spatial } from '../spatial';

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
  private static readonly read = new WeakMap<object, { at: string; ways: WayInfo[] }>();
  static graph(campaign: Campaign, clear = false): Map<string, WayInfo[]> {
    const actor = campaign.playerActor!, world = campaign.world, at = `${actor}:${campaign.history.length}`;
    let kept = this.read.get(world);
    if (kept?.at !== at) {
      const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
      kept = { at, ways: new ChartModel(world, actor, entities).ways(VisitedPlaces.of(campaign, actor)) };
      this.read.set(world, kept);
    }
    const ways = kept.ways, graph = new Map<string, WayInfo[]>();
    for (const w of ways) {
      if (w.status === 'blocked' || (clear && w.status !== 'open')) { continue; }
      if (!(graph.get(w.from) ?? []).some(x => x.passage === w.passage && x.to === w.to)) {
        graph.set(w.from, [...graph.get(w.from) ?? [], w]);
      }
    }
    return graph;
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
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
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
    const graph = this.graph(campaign, clear), entities = new Map(campaign.module.entities.map(e => [e.id, e]));
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
  static within(entities: Map<string, Entity>, id: string, place: string): boolean {
    return id === place || Spatial.ancestry(entities, id).some(e => e.id === place);
  }
  static minutes(campaign: Campaign, passage: string): number {
    return Math.max(1, campaign.world.number(ModuleWriter.call('travelTime', passage))) * 10;
  }
  // The places worth setting out for that the company knows the way to and that are more than a step away: the
  // settlements and sites it has been to or been told of, and the edges of the country where a road goes on.
  static destinations(campaign: Campaign): Itinerary[] {
    const actor = campaign.playerActor!, world = campaign.world, entities = campaign.module.entities;
    const told = world.relates('leadsTo') ? world.related('leadsTo')
      .filter(r => world.test(ModuleWriter.call('knows', actor, r.args[0]!))).map(r => r.args[1]!) : [];
    const visited = VisitedPlaces.of(campaign, actor), byId = new Map(entities.map(e => [e.id, e]));
    const here = world.one('at', actor), area = here ? this.area(byId, here) : undefined;
    const known = new Set([...told, ...[...visited].map(v => this.area(byId, v)?.id ?? v)]);
    // A place someone has told of is somewhere to set out for, whatever it is (a pit in the ground, a lone tower);
    // somewhere been is, when it is a settlement, a site or the edge of the country.
    return [...known].filter(id => id !== area?.id && (told.includes(id) || this.worth(byId.get(id))))
      .flatMap(id => { const p = this.plan(campaign, id); return p && p.legs.length > 1 ? [p] : []; })
      .sort((a, b) => a.minutes - b.minutes);
  }
  private static area(byId: Map<string, Entity>, id: string): Entity | undefined {
    return Spatial.ancestry(byId, id).find(e => ['settlement', 'site'].includes(e.space?.kind ?? ''));
  }
  private static worth(e?: Entity): boolean {
    return !!e && (['settlement', 'site'].includes(e.space?.kind ?? '') || /^region__edge_/.test(e.id));
  }
}
