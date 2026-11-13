import type { Campaign } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';
import { Itineraries } from '../ui/itinerary';
import type { Screen } from '../ui/screen-types';
import type { Glance, Route } from './glance-types';

// Where the company can go next, and how it leaves, inside an enclosed place (a building, a site, under the ground, a
// ship): the owner, 14 November (CN-02, CN-03). Inside a building the world map had opened, with a confusing Back and
// no way to the other places about; the compass answers from the known ways alone, never across the country.
// out: the route to the nearest place outside, as the ways in order, the time, and what bars it if anything;
// next: the nearest known place worth going inside, as the glance reads what is worth doing (its places lens), or none;
// exhausted: nothing known is left inside (no thing, person or way within that the glance leads with). What is not yet
// explored is not proven empty: a way not yet taken is a place worth going.
// A route is followed as the map's travel is (travel:<place>): leg by leg, through the world's own interruptions.
export class Compass {
  static of(campaign: Campaign, screen: Screen, glance: Pick<Glance, 'lenses'>): Pick<Glance, 'enclosed' | 'compass'> {
    const here = screen.place.id;
    if (!campaign.running || !Itineraries.enclosed(campaign, here)) { return {}; }
    const out = this.out(campaign, screen), next = this.next(campaign, screen, glance);
    const left = [...glance.lenses.things.promoted, ...glance.lenses.people.promoted].length > 0;
    return { enclosed: true, compass: { ...out ? { out } : {}, ...next ? { next } : {}, exhausted: !next && !left } };
  }
  // The nearest place not enclosed, by the known ways, and the route there.
  private static out(campaign: Campaign, screen: Screen): Route | undefined {
    const graph = Itineraries.graph(campaign), here = screen.place.id, seen = new Set([here]);
    const best = new Map<string, number>([[here, 0]]), open = [here];
    while (open.length) {
      open.sort((a, b) => best.get(a)! - best.get(b)!);
      const at = open.shift()!;
      if (at !== here && !Itineraries.enclosed(campaign, at)) { return this.route(campaign, at); }
      for (const w of graph.get(at) ?? []) {
        const minutes = best.get(at)! + Itineraries.minutes(campaign, w.passage);
        if (seen.has(w.to) && (best.get(w.to) ?? Infinity) <= minutes) { continue; }
        seen.add(w.to); best.set(w.to, minutes);
        if (!open.includes(w.to)) { open.push(w.to); }
      }
    }
    // No known way out: what bars the way the company knows of, where one does.
    const barred = screen.exits.find(e => e.blocked && !Itineraries.enclosed(campaign, e.destination.id));
    return barred ? { to: barred.destination.id, name: barred.destination.name, ways: [barred.name], minutes: 0,
      barred: barred.blocked! } : undefined;
  }
  private static route(campaign: Campaign, to: string): Route | undefined {
    const plan = Itineraries.plan(campaign, to);
    if (!plan) { return undefined; }
    const graph = Itineraries.graph(campaign);
    const hard = plan.legs.flatMap(l => (graph.get(l.from) ?? []).filter(w => w.passage === l.passage && w.to === l.to
      && w.status !== 'open')).find(w => w.reason);
    return { to, name: ObservationText.label(campaign.world, to), ways: plan.legs.map(l => l.way),
      minutes: plan.minutes, command: `travel:${to}`, ...hard ? { barred: hard.reason! } : {} };
  }
  private static readonly aimed = ['advance', 'named', 'toward', 'about', 'bound', 'kin'];
  // The first way the glance's places lens leads with that goes further in (not back out), and where it comes to.
  private static next(campaign: Campaign, screen: Screen, glance: Pick<Glance, 'lenses'>): Route | undefined {
    for (const a of glance.lenses.places.promoted) {
      if (['retreat', 'way'].includes(a.why)) { continue; }
      const exit = screen.exits.find(e => e.id === a.exit || e.id === a.choice);
      const to = exit?.destination.id;
      // A room been to is worth going back to only for the aim followed: from the cellar, "Up to the hall" had been
      // the next place with nothing left in the hall.
      if (!exit || !to || !Itineraries.enclosed(campaign, to)) { continue; }
      if (exit.visited && !this.aimed.includes(a.why)) { continue; }
      const minutes = exit.acts.find(x => x.command)?.minutes ?? 0;
      return { to, name: exit.destination.name, ways: [exit.name], minutes,
        ...a.command ? { command: a.command } : {} };
    }
    return undefined;
  }
}
