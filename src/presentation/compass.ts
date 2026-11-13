import type { Campaign } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';
import { Itineraries } from '../ui/itinerary';
import type { Screen } from '../ui/screen-types';
import type { WayInfo } from '../ui/passage-model';
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
    // In the dark nothing is seen, and so nothing is known to be left or not: not exhausted.
    return { enclosed: true, compass: { ...out ? { out } : {}, ...next ? { next } : {},
      exhausted: !screen.dark && !next && !left } };
  }
  // The nearest place not enclosed, by the known ways, and the route there; where none is open, by the ways something
  // bars too, and what bars the first of them (the crypt's stone door, locked, between the ossuary and the churchyard).
  private static out(campaign: Campaign, screen: Screen): Route | undefined {
    const open = this.nearest(campaign, screen.place.id, Itineraries.graph(campaign));
    if (open) { return this.route(campaign, open.to); }
    const shut = this.nearest(campaign, screen.place.id, Itineraries.graph(campaign, false, false, true));
    const bar = shut?.ways.find(w => w.status === 'blocked');
    if (!shut || !bar) { return undefined; }
    return { to: shut.to, name: ObservationText.label(campaign.world, shut.to), ways: shut.ways.map(w => w.name),
      minutes: 0, barred: bar.reason ?? bar.name };
  }
  private static nearest(campaign: Campaign, here: string, graph: Map<string, WayInfo[]>):
    { to: string; ways: WayInfo[] } | undefined {
    const best = new Map<string, { minutes: number; ways: WayInfo[] }>([[here, { minutes: 0, ways: [] }]]);
    const open = [here];
    while (open.length) {
      open.sort((a, b) => best.get(a)!.minutes - best.get(b)!.minutes);
      const at = open.shift()!, so = best.get(at)!;
      if (at !== here && !Itineraries.enclosed(campaign, at)) { return { to: at, ways: so.ways }; }
      for (const w of graph.get(at) ?? []) {
        const minutes = so.minutes + Itineraries.minutes(campaign, w.passage);
        if ((best.get(w.to)?.minutes ?? Infinity) <= minutes) { continue; }
        best.set(w.to, { minutes, ways: [...so.ways, w] });
        if (!open.includes(w.to)) { open.push(w.to); }
      }
    }
    return undefined;
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
