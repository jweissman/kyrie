import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/index';
import type { Itinerary } from './itinerary';
import type { KnownCountry } from './known-country';

type Plan = (campaign: Campaign, place: string) => Itinerary | undefined;
// The way down a company has made sure, gone in one act (the cold-play review's Wave 2, "compress the secured descent":
// doc/design/cold-play-8-to-8-5-2026-11-27.md). Five expeditions on the reference seed spent most of their routine
// walking the same woods and the same rooms down to where they had been before. Once the company has made a place
// below sure (a rope left hanging in a shaft, a winding-gear set working: the world's secured(p), data/rules/
// passages.kyr), it may go down to it from above ground in one act, a journey (travel:) like any walk about the town:
// leg by leg, each the ordinary way (Travel.go), so that it takes the time, burns the light and eats the food that the
// legs do, and stops where anything on the way asks for the player (a band come in, a sign at a way's mouth, a way
// barred, a fight, a hurt, nightfall, the dark with no light burning). It is offered only where every room on the way
// is one the company has been in, so that going down never passes a room it has not seen; and only while the thing
// that made the place sure stands as the company left it. The telling of a journey names where it went by
// (Glance.came), so the place is kept. What the company knows of it is read through the knowledge door (KnownCountry).
export class Descents {
  // plan: the one planner (Itineraries.plan), which the walks about the town are laid by too.
  static of(campaign: Campaign, plan: Plan, country: KnownCountry): Itinerary[] {
    const here = country.here;
    if (!here || this.under(campaign, here)) { return []; }
    return country.secured().filter(p => p !== here).flatMap(p => this.way(campaign, p, plan, country))
      .sort((a, b) => a.minutes - b.minutes);
  }
  // Whether a way out sets out from a place below the company made sure, by rooms it has been in: the same way as the
  // way down, gone up (OR-1862). From deeper, the company walks back to it first.
  static up(plan: Pick<Itinerary, 'legs'>, country: KnownCountry): boolean {
    const here = country.here;
    return !!here && plan.legs.length > 1 && country.secured().includes(here)
      && plan.legs.every(l => country.been(l.to));
  }
  // The way down, by the ways the company knows and can take now, its every room one it has been in.
  private static way(campaign: Campaign, place: string, laid: Plan, country: KnownCountry): Itinerary[] {
    const plan = laid(campaign, place);
    return plan && plan.to === place && plan.legs.length > 1 && plan.legs.every(l => country.been(l.to)) ? [plan] : [];
  }
  private static under(campaign: Campaign, place: string): boolean {
    return EntityIndex.of(campaign.module.entities).byId.get(place)?.space?.shelter === 'underground';
  }
}
