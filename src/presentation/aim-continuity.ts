import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import type { Candidate, Situation } from '../ui/promotion';
import { Promotion } from '../ui/promotion';
import { PlayerView } from './player-view';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';
import { Itineraries } from '../ui/itinerary';
import { Undertakings } from './undertakings';
import { Stakes } from '../ui/stakes';
import { CompanyLight } from './company-light';
import { AimLeading, type AimLead } from './aim-lead';
import type { Promoted } from './glance-types';

// How the aim followed goes on from here (the owner's trust contracts, 18 November, B: "Gold must not vanish silently
// because the route planner and local opportunity projection interpret an objective differently"). Gold had been an
// act's reasons (what the aim names, as the route planner reads it) and the lead (AimLeading, the resolved
// objective-target) said the step apart; where they parted (inside a site the aim names whole, at a bar nothing here
// opens, where a search found nothing) the lead named a step and nothing was gold. Now the lead decides, and one of
// four is always so, said with the glance (Glance.continuance):
//   step:     an act of the four is the step, gold (Promotion.continued);
//   gilded:   none was, but one offered here acts on the lead's step: it is led with, gold;
//   led:      the step is here and grave (a fight, a trap, a one-way drop): led with, never gold (PB-16b), and said;
//   frontier: nothing offered acts on it: what stands is said (what bars the way, that the place has given what it
//             had), never a silent nothing.
export type Continuance = { kind: 'step' | 'gilded' | 'led'; witness: string; said?: string }
  | { kind: 'frontier'; said: string };

export class AimContinuity {
  static readonly grave = ['grave', 'fight', 'trap', 'one-way'];
  static readonly dark = 'Your aim\'s way goes into the dark, and you have nothing to see by.';
  static of(campaign: Campaign, screen: Screen, at: { acts: Promoted[]; cands: Candidate[]; s: Situation }):
    { acts: Promoted[]; continuance?: Continuance } {
    const { acts, cands } = at, lead = AimLeading.of(campaign, screen);
    if (!Undertakings.followed(campaign) || !lead) { return { acts }; }
    const step = acts.find(a => a.continues);
    if (step) { return { acts, continuance: { kind: 'step', witness: step.choice } }; }
    // Inside a site with nothing known to lie within (AimLeading.deeper): a frontier, named, its rooms exploration.
    if (lead.source === 'deeper') { return { acts, continuance: { kind: 'frontier', said: this.deeper(campaign, screen) } }; }
    // Never a way into the dark with nothing to see by (CompanyLight): said, the need beside it saying why.
    const unlit = CompanyLight.of(campaign, screen).dark;
    const ways = new Map(screen.exits.map(e => [e.id, e.destination.id]));
    const reached = this.acting(campaign, screen, lead, cands.filter(c => !c.barred && Promotion.eligible(c, at.s)));
    const acting = reached.filter(c => !c.exit || !unlit?.has(ways.get(c.exit) ?? ''));
    if (!acting.length && reached.length) {
      return { acts, continuance: { kind: 'frontier', said: this.dark } };
    }
    const safe = acting.find(c => !c.marks.some(m => this.grave.includes(m.kind)));
    if (safe) {
      const gilded = Promotion.gild(safe), rest = acts.filter(a => a.choice !== safe.choice);
      const kept = Promotion.continued([gilded, ...rest].slice(0, Promotion.all));
      return { acts: kept, continuance: { kind: 'gilded', witness: safe.choice } };
    }
    const grave = acting[0];
    if (grave) {
      return { acts, continuance: { kind: 'led', witness: grave.choice, said: `${grave.label}: your aim's way, at a risk.` } };
    }
    // Something can be done to the bar, but none of it is the step yet (the speaking door's words, a guess until its
    // letters are read): never "nothing here opens it".
    const tried = PlayerView.choices(campaign).some(r => Object.entries(r.action.bindings ?? {})
      .some(([k, v]) => k !== 'actor' && lead.next.includes(v)));
    return { acts, continuance: { kind: 'frontier', said: this.frontier(campaign, lead, tried) } };
  }
  // What stands, where nothing offered acts on the step.
  private static frontier(campaign: Campaign, lead: AimLead, tried: boolean): string {
    const bar = lead.next[0]!, name = EntityIndex.of(campaign.module.entities).byId.get(bar)?.name ?? bar;
    if (lead.source === 'barred') {
      return `${this.upper(name)} bars the way, and ${tried ? 'what opens it is still to be worked out' : 'nothing here opens it yet'}.`;
    }
    return 'Nothing here bears on your aim now: what it waits on is still to be found.';
  }
  private static deeper(campaign: Campaign, screen: Screen): string {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const site = [screen.place.id, ...screen.exits.map(e => e.destination.id)]
      .flatMap(id => Spatial.ancestry(byId, id)).find(e => e.space?.kind === 'site');
    return `Nothing here is known to hold what your aim waits on: ${site?.name ?? 'this place'} is still to be explored.`;
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // The offered acts that act on the lead's step: done to or with what it names, a way to where it is, a journey to
  // the town or site it lies in (as RunnerLed reads the four).
  static acting(campaign: Campaign, screen: Screen, lead: AimLead, cands: Candidate[]): Candidate[] {
    if (!lead.next.length) { return []; }
    const w = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    const def = Undertakings.followed(campaign);
    // At the place the aim names, what its words are about is the step too: the pawl the aim is to bring up out of the
    // gate-well, found there, is taken for it (cold play 5, CL-33: "Collect the sea-gate's pawl" unmarked, the
    // frontier saying nothing here bore on the aim).
    const about = lead.source === 'here' && def ? [...Stakes.read(campaign, def)].filter(id => !byId.get(id)?.space) : [];
    const step = new Set([...lead.next, ...about,
      ...lead.next.flatMap(id => byId.get(id)?.space ? [] : w.one('at', id) ?? [])]);
    // Where the step is what bars the way, an act whose site is the bar acts on it too (the speaking door's words).
    const skip = lead.source === 'barred' ? ['actor'] : ['actor', 'site'];
    const bound = new Map(PlayerView.choices(campaign).map(r => [r.choice.id, Object.entries(r.action.bindings ?? {})
      .filter(([k]) => !skip.includes(k)).map(([, v]) => v)]));
    const ways = new Map(screen.exits.map(e => [e.id, e.destination.id]));
    return cands.filter(c => {
      // A way by where it goes; an act at a way (a look at the door on it) by what it is done to.
      const id = c.command ?? c.choice, way = c.exit && c.kind === 'way' ? ways.get(c.exit) : undefined;
      const far = c.choice.startsWith('travel:') ? c.choice.slice('travel:'.length) : undefined;
      return (!way && !far && (bound.get(id) ?? []).some(x => step.has(x))) || (!!way && step.has(way))
        || (!!far && [...step].some(x => Itineraries.within(byId, x, far)));
    });
  }
}
