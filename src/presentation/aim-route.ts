import type { Campaign } from '../campaign/campaign';
import type { ExitRow, Screen } from '../ui/screen-types';
import { Undertakings } from './undertakings';
import { Stakes } from '../ui/stakes';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';

// The way an aim is gone to by, where its author says (Objective … toward … by …): part of what it names until the
// company is past it (see Glance's reading).
export class AimRoute {
  // Where its author says the aim is gone to by (toward the dead by the churchyard), that place too, until the company
  // is in it, at what the aim is toward, or on the way from the one to the other: the churchyard lit from the shrine,
  // and nothing lit back out of the crypt between it and the ossuary the dead are in.
  static routed(campaign: Campaign, screen: Screen, named: Set<string>): Set<string> {
    const def = Undertakings.followed(campaign), t = def && Stakes.target(campaign, def);
    if (!t?.routeTo || t.routeTo === t.actionAt) { return named; }
    const byId = EntityIndex.of(campaign.module.entities).byId, line = Spatial.ancestry(byId, screen.place.id);
    const at = t.actionAt ?? (t.subject ? campaign.world.one('at', t.subject) : undefined);
    const there = line.some(e => e.id === t.routeTo || e.id === at) || (!!at && this.between(campaign, t.routeTo, at)
      .has(screen.place.id));
    return there ? named : new Set([...named, t.routeTo]);
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
  // The places on the shortest way from one place to another, as the world joins them.
  private static between(campaign: Campaign, from: string, to: string): Set<string> {
    const links = campaign.world.related('connects'), came = new Map<string, string>([[from, '']]);
    for (const queue = [from]; queue.length && !came.has(to);) {
      const here = queue.shift()!;
      for (const l of links) {
        if (l.args[1] === here && !came.has(l.args[2]!)) { came.set(l.args[2]!, here); queue.push(l.args[2]!); }
      }
    }
    const on = new Set<string>();
    for (let at = came.has(to) ? to : ''; at; at = came.get(at)!) { on.add(at); }
    return on;
  }
}
