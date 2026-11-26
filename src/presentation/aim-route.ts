import type { Campaign } from '../campaign/campaign';
import type { ExitRow, Screen } from '../ui/screen-types';
import { Undertakings } from './undertakings';
import { Stakes } from '../ui/stakes';
import { Itineraries } from '../ui/itinerary';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../lang/spatial';
import { AimLeading } from './aim-lead';
import { CompanyRecall } from './company-recall';
import { VisitedPlaces } from './visited-places';

// The way an aim is gone to by, where its author says (Objective … toward … by …): part of what it names until the
// company is past it (see Glance's reading).
export class AimRoute {
  // Where its author says the aim is gone to by (toward the dead by the churchyard), that place too, until the company
  // is in it, at what the aim is toward, or on the way from the one to the other: the churchyard lit from the shrine,
  // and nothing lit back out of the crypt between it and the ossuary the dead are in.
  // Where what the aim waits on lies here to be found or learned, here is all it names (AimLeading.lies).
  static routed(campaign: Campaign, screen: Screen, aimed: Set<string>): Set<string> {
    if (AimLeading.lies(campaign, screen)) { return new Set([screen.place.id]); }
    // The way in shut for want of something, whoever sells it, where they are: the aim's, and nothing else it names.
    const lead = AimLeading.of(campaign, screen);
    if (lead?.source === 'means') {
      aimed = new Set(lead.next.flatMap(id => [id, CompanyRecall.whereabouts(campaign, screen, id) ?? id]));
    }
    const by = AimLeading.route(campaign, screen)?.next ?? [];
    // Out of an enclosed place toward what it names, or where its author says it is gone to by (the courier's town).
    const toward = by.length ? new Set([...aimed, ...by]) : aimed, out = this.outward(campaign, screen, toward);
    return out ? new Set([...toward, out]) : toward;
  }
  // From an enclosed place, where what the aim names lies outside it, the first place outside on the way there: no
  // journey is set out on from inside (CN-02), so the way out is the aim's (from the Lucky Phoenix's taproom, the
  // door to the landing, on the way to Ísencepan).
  private static outward(campaign: Campaign, screen: Screen, named: Set<string>): string | undefined {
    const here = screen.place.id;
    if (!named.size || !Itineraries.enclosed(campaign, here)) { return undefined; }
    // Not where a way or a walk from here goes to it itself (from the chandlery, the walk to the churchyard).
    const direct = [...screen.exits.map(e => e.destination.id), ...(screen.around ?? []).map(d => d.id)];
    if (direct.some(id => named.has(id))) { return undefined; }
    const been = VisitedPlaces.of(campaign, campaign.playerActor!);
    for (const id of named) {
      // Someone it names is gone to where the company last saw them (Glen, at his forge in Brightford): never to where
      // they truly stand unknown to it (the opportunity architecture's knowledge boundary, AR-21; OR-880).
      const to = CompanyRecall.whereabouts(campaign, screen, id);
      const legs = id === campaign.playerActor || !to || (to !== id && !been.has(to)) ? []
        : Itineraries.plan(campaign, to)?.legs ?? [];
      const out = legs.find(l => !Itineraries.enclosed(campaign, l.to));
      if (out) { return out.to; }
    }
    return this.holding(campaign, screen, named);
  }
  // Where no plan reaches what the aim names itself (a person's room not yet been to), the nearest town or site holding
  // it that the company knows a journey to, as the open country reads it (Glance.going), never its own: the plan's
  // first leg not enclosed is the way out. From the Stone Horn's taproom the fuel boat's aim had said nothing bore on
  // it, the landing a minute off leading with Reedbridge (AT-12). Only a journey already known to the company is
  // taken, so that no town is told of by the way out that it was not told of before; and one inside the company's own
  // town leads nowhere out (a shop beside the target).
  private static holding(campaign: Campaign, screen: Screen, named: Set<string>): string | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const mine = new Set([screen.place.id, ...Spatial.ancestry(byId, screen.place.id).map(e => e.id)]);
    // The journeys the company knows, as the map sets out for them (none are listed from inside: CN-02): not every
    // town the country's roads reach, which the map does not draw (OR-880).
    const known = new Set(Itineraries.drawnJourneys(campaign, screen.region).map(d => d.id));
    for (const id of named) {
      const to = CompanyRecall.whereabouts(campaign, screen, id);
      if (!to || id === campaign.playerActor) { continue; }
      for (const e of Spatial.ancestry(byId, to)) {
        if (!['settlement', 'site'].includes(e.space?.kind ?? '') || mine.has(e.id) || !known.has(e.id)) { continue; }
        const out = Itineraries.plan(campaign, e.id)?.legs.find(l => !Itineraries.enclosed(campaign, l.to));
        if (out) { return out.to; }
      }
    }
    return undefined;
  }
  // Deeper in than a step or two, the first step of the way out toward what the aim names outside (see outward): in
  // Ironkeep's lord's chamber, following the brothers' errand to Mistlake, the way out by the great hall had been led
  // only as "back out", three legs from the door, and nothing was gold (EX-01's navigational confusion).
  static door(campaign: Campaign, screen: Screen, named: Set<string>): string | undefined {
    const out = this.outward(campaign, screen, named);
    if (!out || screen.exits.some(e => e.destination.id === out)) { return undefined; }
    const first = Itineraries.plan(campaign, out)?.legs[0]?.to;
    return screen.exits.find(e => e.destination.id === first)?.id;
  }
  // The ways toward the aim, and where the company stands at the place it is gone to by, inside a site or where all
  // else led back where it came from, its ways on (see onward) beside them, in place of that way back. At the quarry
  // pit, toward a gallery no known way reached, the way had been the green it came from, and from the green the pit
  // again (the first quarter hour's census, 19 November). Nothing else here is put by (the hobs' ledge, its bell and
  // the boy, before the toll-hall).
  static join(campaign: Campaign, screen: Screen, toward: Map<string, string>, at: { open: boolean; within: boolean }) {
    const came = CompanyRecall.of(campaign).came, back = screen.exits.find(e => e.destination.id === came)?.id;
    const only = !!back && toward.size === 1 && toward.has(back);
    const on = at.open && (at.within || only) ? this.onward(campaign, screen) : [];
    if (on.length && back) { toward.delete(back); }
    for (const id of on) { toward.set(id, 'toward'); }
  }
  // At the place the aim is gone to by, the ways on from it not yet taken that go down or in: what its author meant by
  // it ("toward the dead by the churchyard": the churchyard gone to, and the crypt under it found from there). The
  // churchyard had led only back to the gate-yard, "another aim", and down to the crypt as one way among others.
  // Not into the houses round a place in a town the aim is about itself: a fevered child on Gothgiba's bailey has no
  // way on through a door, and every door off the green had been gold (M21's PL-12). A site's front is another thing:
  // an aim at a hold is gone into by it.
  static onward(campaign: Campaign, screen: Screen): string[] {
    const def = Undertakings.followed(campaign), t = def && Stakes.target(campaign, def);
    if (!t?.routeTo || t.routeTo !== screen.place.id) { return []; }
    const own = t.routeTo === t.actionAt && AimRoute.town(screen);
    return screen.exits.filter(e => !e.visited && (AimRoute.down(e) || (e.transition === 'enter' && !own)))
      .map(e => e.id);
  }
  // A way down, or under the ground.
  static down(e: ExitRow): boolean { return !!e.destination.underground || e.transition === 'descend'; }
  // Whether the company stands in a town, and not in a site.
  static town(screen: Screen): boolean {
    return screen.path.some(p => p.kind === 'settlement') && !screen.path.some(p => p.kind === 'site');
  }
}
