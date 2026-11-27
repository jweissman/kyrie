import { DrawnWorld } from '../../src/client/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Journey } from '../../src/session/journey';
import { PlaySession } from '../../src/session/play-session';
import { Frontier } from '../../src/world/frontier';
import { Travel } from '../../src/session/travel';
import { MapCard } from './map-card';
import { Itineraries } from '../../src/ui/itinerary';

// A generated world played from its map: begun with one ranger from an origin, a set-out pressed on the map's card,
// and gone on with as the page's "Go on to" would.
export class MapPlay {
  static readonly drawn = (origin: string) => ({ party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }], origin });
  static async start(seed: string, origin: string): Promise<Journey> {
    return Journey.of(await DrawnWorld.start(seed, this.drawn(origin), NodeBundleSource.shared));
  }
  // The same game from here, apart: to try one way and then another from the same place.
  static fork(j: Journey, seed: string, origin: string): Journey {
    const drawn = this.drawn(origin);
    return Journey.of(PlaySession.resume(j.session.checkpoint()).drawnFor(drawn)
      .extend(new Frontier(seed, NodeBundleSource.shared, DrawnWorld.options(drawn))));
  }
  static go(j: Journey, destination: string) {
    return Travel.go({ campaign: j.campaign, perform: (c: string) => j.session.leg(c) }, destination);
  }
  // Gone on with, as the page's "Go on to" would, past whatever stopped it on the way (a toll, pikes across the road,
  // nightfall), as long as each going gets somewhere. a1's way to the Black Keep stops seven times since AR-17 moved
  // the wild (water three times, a danger, a shepherd, the arcology's chain, nightfall): a count, not a rule.
  static async reach(j: Journey, destination: string) {
    let done = await MapPlay.go(j, destination);
    for (let k = 0; k < 12 && !done.arrived && done.legs.length; k++) { done = await MapPlay.go(j, destination); }
    return done;
  }
  // What is chosen on the map set out for by its card's button, and gone on with to the end: where it set out for,
  // and whether it came there.
  static async press(j: Journey, chosen: string): Promise<{ to?: string; arrived: boolean }> {
    const to = /^travel:(.+)$/.exec(MapCard.of(MapPlay.charted(j), chosen).command ?? '')?.[1];
    return { ...to ? { to } : {}, arrived: !!to && (await MapPlay.reach(j, to)).arrived };
  }
  // The screen as the map is given it (Itineraries.charted): its journeys to every place it knows a way to, laid only
  // where the map is asked for (routes on demand, OR-632), as the page's map is drawn.
  static charted(j: Journey) { return Itineraries.charted(j.campaign, j.screen()); }
  static at(j: Journey): string { return j.campaign.world.one('at', 'party')!; }
}
