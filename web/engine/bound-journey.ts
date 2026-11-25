import type { Campaign } from '../../src/campaign/campaign';
import type { Frame } from '../../src/creation/protocol';
import { Undertakings } from '../../src/presentation/undertakings';
import { Itineraries } from '../../src/ui/itinerary';
import { ObservationText, Spatial } from '../../src/lang';

// The journey held, as the page shows it (see EngineHost.bound): where to, the way on from here leg by leg and how
// long; or, come to it (by whatever way), none, and the journey let go.
export class BoundJourney {
  // What the page says of the journey held, or undefined where it is let go: the aim it was set out on for no longer
  // followed, the company come to it, or no way on from here (gone off the way by another), nothing to go on with.
  static of(campaign: Campaign, id: string, aimed?: string): Pick<Frame, 'bound'> | undefined {
    if (!this.held(campaign, id, aimed)) { return undefined; }
    const plan = Itineraries.plan(campaign, id);
    if (!plan) { return undefined; }
    // Each leg by where it comes, as the company knows the place (the card had said "to region__z1_heart": play 11),
    // as the page tells a journey's legs (see Itineraries.told).
    const legs = Itineraries.told(plan.legs, to => ObservationText.label(campaign.world, to));
    const toward = plan.toward ? { toward: plan.toward } : {};
    return { bound: { id, name: plan.name, minutes: plan.minutes, legs, ...toward } };
  }
  // Whether the journey is still held, before its way on is asked: the aim it was set out for still followed, and the
  // company not yet come to it.
  static held(campaign: Campaign, id: string, aimed?: string): boolean {
    if (aimed !== undefined && Undertakings.followed(campaign)?.id !== aimed) { return false; }
    const at = campaign.world.one('at', campaign.playerActor ?? 'party');
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    return !(at && Spatial.ancestry(entities, at).some(e => e.id === id));
  }
}
