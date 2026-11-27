import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { Threshold } from './threshold';
import { VisitedPlaces } from './visited-places';

// A visited way that leads on to the unseen (OR-1502): where every way about the place goes somewhere been, the one row
// toward the nearest place of the hex the company knows of and has not been to, by the ways it knows and can take
// (KnownWays.unseen: its places, the first first). At the shrine with the woods' edge walked, "To the edge of the old
// woods" leads on to the ride; from the store, the way back to the green does, where the green is the way. Inferred
// from the ways and where the company has been, never declared by an author. In a site too, from a dead-end recess
// (Glance.inward's way back toward the rest of it, unmarked for being been along: PB-24); in the dark too, where the
// light to hand leads first and the way is known. Never out of what the aim is about (Threshold.leaving), nor the way
// up toward the light with none to hand (Affordances: retreat), each a retreat drawn plain (test/small/frontier).
// Keyed by the row's choice: an exit's id, or `travel:` and the place for a walk about the town; each with what it
// leads on to, in words.
export class LeadsOn {
  // ways: the way-finder's (KnownWays.unseen); named: what the aim names; inward: Glance.inward's, where a way into a
  // site not yet taken is worth a look already.
  static of(campaign: Campaign, screen: Screen, at: { ways: (c: Campaign, from: string) => string[];
    named: Set<string>; inward: Set<string> }): { on?: Map<string, string> } {
    if ([...at.inward].some(id => !/^[~^]/.test(id))) { return {}; }
    const been = VisitedPlaces.of(campaign, campaign.playerActor ?? 'party');
    // Any way open here but into the next hex: out of a town to the woods beside it too.
    const exits = screen.exits.filter(e => !e.crosses && !e.blocked), around = screen.around ?? [];
    // A way about the place not yet taken is worth a look already (Affordances: unvisited).
    if (exits.some(e => e.local && !been.has(e.destination.id)) || around.some(d => !been.has(d.id))) { return {}; }
    const on = at.ways(campaign, screen.place.id), unseen = on.at(-1);
    if (!unseen || on.length < 2) { return {}; }
    // By the name the company knows it by (the map's), else its own: a way to it is known, and named so.
    const name = screen.map.find(p => p.id === unseen)?.name
      ?? campaign.module.entities.find(e => e.id === unseen)?.name;
    const said = name ? `on toward ${name}` : 'on toward what is not yet seen';
    // The furthest along it that a row here goes to straight: a walk about the town, else the way's first leg.
    const walk = on.slice(0, -1).reverse().find(id => around.some(d => d.id === id));
    const out = Threshold.leaving(campaign, screen, at.named);
    const first = exits.find(e => e.destination.id === on[0] && !out?.has(e.id));
    const choice = walk ? `travel:${walk}` : first?.id;
    return choice ? { on: new Map([[choice, said]]) } : {};
  }
}
