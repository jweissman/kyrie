import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import type { AimLead } from '../presentation/aim-lead';
import { PlayerView } from '../presentation/player-view';
import { EntityIndex } from '../lang/entity-index';
import { Itineraries } from '../ui/itinerary';
import type { Offered } from './runner';

// Which of the four act on the aim followed's next step (US-07's AimLead): done to or with what the step names, or
// going where it is. A turn that leads with one is led, gold or not: the speaking door's words are a1's step at
// Mistlake, grave and never gold (the lead's ruling, 15 November), and a walk that stood before them had been counted
// lost. Said with the turn (Said.led), each by what it does; never a reason to gild anything (PB-16b).
export class RunnerLed {
  static of(campaign: Campaign, screen: Screen, lead: AimLead | undefined, primary: Offered[]): string[] {
    if (!lead?.next.length) { return []; }
    const w = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    // The step itself, and where it stands (someone or something at a place).
    const step = new Set([...lead.next, ...lead.next.flatMap(id => byId.get(id)?.space ? [] : w.one('at', id) ?? [])]);
    const bound = new Map(PlayerView.choices(campaign).map(r => [r.choice.id, Object.entries(r.action.bindings ?? {})
      .filter(([k]) => !['actor', 'site'].includes(k)).map(([, v]) => v)]));
    const ways = new Map(screen.exits.flatMap(e => e.acts.flatMap(a => a.command && a.moves
      ? [[a.command, e.destination.id] as const] : [])));
    return primary.filter(o => {
      // A way to where it is; a journey to the town or site it lies in.
      const act = o.does ?? o.id, way = ways.get(act);
      const far = act.startsWith('travel:') ? act.slice('travel:'.length) : undefined;
      // A way is led by where it goes, never by where it leaves: a door of the room the step is in binds that room
      // too, and following an aim already at its place had led out of it and back (the second cold play, CL-03).
      return (!way && (bound.get(act) ?? []).some(id => step.has(id))) || (!!way && step.has(way))
        || (!!far && [...step].some(id => Itineraries.within(byId, id, far)));
    }).map(o => o.does ?? o.id);
  }
}
