import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/entity-index';
import { ObservationText } from '../lang/observation-text';
import { PassageModel } from '../ui/passage-model';
import type { Screen } from '../ui/screen-types';
import type { Glance, Lens, Lensed } from './glance-types';

// Who or what a lens's act is about, where that is no one the scene draws (a thing on a way, the way itself): its name
// as the company knows it, and what is seen of it (its state's words, the riddle cut across the speaking door), so
// that the page heads the group and says "at the speaking door" without guessing which way a thing is on (the
// aesthetic line's riddle-door probe, 14 November: the stone was in none of the page's lists).
export class LensSubjects {
  static with<T extends Pick<Glance, 'lenses'>>(campaign: Campaign, screen: Screen, glance: T): T {
    const drawn = new Set([...screen.people, ...screen.things].map(r => r.id));
    const lenses = Object.fromEntries(Object.entries(glance.lenses).map(([lens, l]) =>
      [lens, this.named(campaign, screen, l, drawn)])) as Record<Lens, Lensed>;
    return { ...glance, lenses };
  }
  private static named(campaign: Campaign, screen: Screen, l: Lensed, drawn: Set<string>): Lensed {
    const acts = [...l.promoted, ...l.rest, ...Object.values(l.leaves ?? {}).flat()];
    const ids = new Set(acts.flatMap(a => a.subject ?? []).filter(id => id !== 'yourself' && !drawn.has(id)));
    if (!ids.size) { return l; }
    const w = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    const passages = new PassageModel(w, campaign.playerActor ?? 'party', byId);
    const subjects = Object.fromEntries([...ids].map(id => {
      const exit = screen.exits.find(e => e.id === id);
      const seen = exit ? exit.blocked : passages.describe(id);
      return [id, { name: exit?.name ?? ObservationText.label(w, id), ...seen ? { seen: [seen] } : {} }];
    }));
    return { ...l, subjects };
  }
}
