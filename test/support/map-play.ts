import { DrawnWorld } from '../../src/world/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Journey } from '../../src/session/journey';
import { PlaySession } from '../../src/session/play-session';
import { Frontier } from '../../src/world/frontier';
import { Travel } from '../../src/session/travel';
import { MapCard } from './map-card';

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
    return Travel.go({ campaign: j.campaign, perform: (c: string) => j.session.perform(c) }, destination);
  }
  // Gone on with, as the page's "Go on to" would, past whatever stopped it on the way (a toll, pikes across the road,
  // nightfall).
  static async reach(j: Journey, destination: string) {
    let done = await MapPlay.go(j, destination);
    for (let k = 0; k < 6 && !done.arrived && done.legs.length; k++) { done = await MapPlay.go(j, destination); }
    return done;
  }
  // What is chosen on the map set out for by its card's button, and gone on with to the end: where it set out for,
  // and whether it came there.
  static async press(j: Journey, chosen: string): Promise<{ to?: string; arrived: boolean }> {
    const to = /^travel:(.+)$/.exec(MapCard.of(j.screen(), chosen).command ?? '')?.[1];
    return { ...to ? { to } : {}, arrived: !!to && (await MapPlay.reach(j, to)).arrived };
  }
  static at(j: Journey): string { return j.campaign.world.one('at', 'party')!; }
}
