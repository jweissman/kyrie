import type { Campaign } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';
import { Itineraries } from '../ui/itinerary';
import { KnownWays } from '../ui/known-ways';
import type { Screen } from '../ui/screen-types';
import type { WayInfo } from '../ui/passage-model';
import type { Glance, Route } from './glance-types';
import { Offers, type Offered } from './offer';
import { Typography } from './typography';
import { DoableJourneys } from './doable-journeys';

// Where the company can go next, and how it leaves, inside an enclosed place (a building, a site, under the ground, a
// ship): the owner, 14 November (CN-02, CN-03). Inside a building the world map had opened, with a confusing Back and
// no way to the other places about; the compass answers from the known ways alone, never across the country.
// out: the route to the nearest place outside, as the ways in order, the time, and what bars it if anything;
// next: the nearest known place worth going inside, as the glance reads what is worth doing (its places lens), or none;
// exhausted: nothing known is left inside (no thing, person or way within that the glance leads with). What is not yet
// explored is not proven empty: a way not yet taken is a place worth going.
// A route is followed as the map's travel is (travel:<place>): leg by leg, through the world's own interruptions.
// The way out is offered as any act is, a row of the engine's own offer (OR-188, the owner, 24 November: the page had
// drawn it as a row of its own making, an arrow where the indicator stands, beside the menu and not of it).
export class Compass {
  static of(campaign: Campaign, screen: Screen, glance: Pick<Glance, 'lenses' | 'offer'>):
    Pick<Glance, 'enclosed' | 'compass' | 'offer'> {
    const here = screen.place.id;
    if (!campaign.running || !Itineraries.enclosed(campaign, here)) { return {}; }
    const out = this.out(campaign, screen), next = this.next(campaign, screen, glance);
    // Something left is what the glance leads with for a reason, not a lens's own acts filling it (why 'present').
    const left = [...glance.lenses.things.promoted, ...glance.lenses.people.promoted].some(a => a.why !== 'present');
    // In the dark nothing is seen, and so nothing is known to be left or not: not exhausted.
    const offer = this.offered(glance.offer, out, !Itineraries.house(campaign, here));
    return { enclosed: true, compass: { ...out ? { out } : {}, ...next ? { next } : {},
      exhausted: !screen.dark && !next && !left }, ...offer ? { offer } : {} };
  }
  // The offer with the way out the last of the four, where it is open and not among them already: in a site or under
  // the ground the way out is always in sight (as the compass's own rows had made room for it beside the four), what
  // it takes the place of the first of the rest; in a house of a town (its way out its door) only where the four have
  // room, never put before an act led with for a reason (CL-25: a way led with for being untaken). Offered among the
  // rest already, it is moved up, not offered twice. A way out something bars offers nothing; what bars it is said.
  static offered(offer: Glance['offer'], out?: Route, displace = true): Glance['offer'] {
    const command = out?.command;
    if (!offer || !out || !command || out.barred) { return offer; }
    // A way among the four that goes there already is the way out (Up to the old drift's mouth): no journey there
    // beside it (Out to the old drift's mouth, which the page drew as a second of the four: OR-462's one act, one row).
    if (offer.primary.some(o => this.is(o, command) || this.reaches(o, command))) { return offer; }
    if (!displace && offer.primary.length >= Offers.four) { return offer; }
    const row: Offered = offer.rest.find(o => this.is(o, command)) ?? { choice: command, command, label: `Out to ${Typography.plain(out.name)}`,
      type: 'journey', aspects: [], marks: [], ...out.minutes ? { minutes: out.minutes } : {} };
    const kept = offer.primary.slice(0, Offers.four - 1), moved = offer.primary.slice(Offers.four - 1);
    return { primary: [...kept, row], rest: [...moved, ...offer.rest.filter(o => !this.is(o, command))] };
  }
  private static is(o: Offered, command: string): boolean { return o.choice === command || o.command === command; }
  private static reaches(o: Offered, command: string): boolean {
    return DoableJourneys.reached(o.command ?? '').includes(command);
  }
  // The nearest place not enclosed, by the known ways, and the route there; where none is open, by the ways something
  // bars too, and what bars the first of them (the crypt's stone door, locked, between the ossuary and the churchyard).
  private static out(campaign: Campaign, screen: Screen): Route | undefined {
    const open = this.nearest(campaign, screen.place.id, false);
    if (open) { return this.route(campaign, open.to); }
    const shut = this.nearest(campaign, screen.place.id, true);
    const bar = shut?.ways.find(w => w.status === 'blocked');
    if (!shut || !bar) { return undefined; }
    return { to: shut.to, name: ObservationText.label(campaign.world, shut.to), ways: shut.ways.map(w => w.name),
      minutes: 0, barred: bar.reason ?? bar.name };
  }
  // By the one way-finder (KnownWays), the ways as the graph searched has them (their status and what bars them).
  private static nearest(campaign: Campaign, here: string, barred: boolean):
    { to: string; ways: WayInfo[] } | undefined {
    const legs = KnownWays.way(campaign, here, id => !Itineraries.enclosed(campaign, id), { barred })?.legs;
    const graph = Itineraries.graph(campaign, false, false, barred);
    return legs?.length ? { to: legs.at(-1)!.to, ways: legs.map(l => (graph.get(l.from) ?? [])
      .find(w => w.passage === l.passage && w.to === l.to)!) } : undefined;
  }
  private static route(campaign: Campaign, to: string): Route | undefined {
    const plan = Itineraries.plan(campaign, to);
    if (!plan) { return undefined; }
    const graph = Itineraries.graph(campaign);
    const hard = plan.legs.flatMap(l => (graph.get(l.from) ?? []).filter(w => w.passage === l.passage && w.to === l.to
      && w.status !== 'open')).find(w => w.reason);
    return { to, name: ObservationText.label(campaign.world, to), ways: plan.legs.map(l => l.way),
      minutes: plan.minutes, command: `travel:${to}`, ...hard ? { barred: hard.reason! } : {},
      ...Itineraries.secured(campaign, plan) ? { secured: true as const } : {} };
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
