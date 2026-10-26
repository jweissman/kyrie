import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { ChartModel } from './chart-model';
import type { WayInfo } from './passage-model';
import { VisitedPlaces } from '../presentation/visited-places';
import { Spatial } from '../spatial';

// One leg of a journey: by what way, from where to where, and how long it takes.
export interface Leg { passage: string; way: string; from: string; to: string; minutes: number }
// The way to a known place over ways the company knows: the place asked for, the room the way comes to, its legs in
// order, and the time they take together.
export interface Itinerary { id: string; to: string; name: string; legs: Leg[]; minutes: number }

// The way to somewhere known, over the ways the company knows: those it has walked from, been told of, the country's
// roads (which its folk know), and with wayfinding every road and path of the country (see ChartModel.ways).
export class Itineraries {
  // The known ways, from each place.
  static graph(campaign: Campaign): Map<string, WayInfo[]> {
    const actor = campaign.playerActor!, world = campaign.world;
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    const ways = new ChartModel(world, actor, entities).ways(VisitedPlaces.of(campaign, actor));
    const graph = new Map<string, WayInfo[]>();
    for (const w of ways) {
      if (w.status === 'blocked') { continue; }
      if (!(graph.get(w.from) ?? []).some(x => x.passage === w.passage && x.to === w.to)) {
        graph.set(w.from, [...graph.get(w.from) ?? [], w]);
      }
    }
    return graph;
  }
  // The quickest known way from where the company stands to a place, or to anywhere within an area.
  static plan(campaign: Campaign, destination: string): Itinerary | undefined {
    const world = campaign.world, here = world.one('at', campaign.playerActor!);
    if (!here || here === destination) { return undefined; }
    const graph = this.graph(campaign), entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    const best = new Map<string, { minutes: number; legs: Leg[] }>([[here, { minutes: 0, legs: [] }]]);
    const open = [here];
    while (open.length) {
      open.sort((a, b) => best.get(a)!.minutes - best.get(b)!.minutes);
      const at = open.shift()!, so = best.get(at)!;
      if (this.within(entities, at, destination)) {
        return { id: destination, to: at, name: entities.get(destination)?.name ?? destination, legs: so.legs,
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
    return [...known].filter(id => id !== area?.id && this.worth(byId.get(id)))
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
