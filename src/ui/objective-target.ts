import type { Campaign } from '../campaign/campaign';
import type { Objective } from '../lang/module';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';

// What an aim is pursued toward, resolved once for everything that shows it (the quest-intent and travel-contract
// review, 9 November: the journal, the map, the ways lit, the likenesses and the topics had each worked out the aim's
// meaning anew, from its words and its condition, and did not agree):
//   subject  whom or what it concerns, drawn as the aim's where it is seen (the innkeeper to ask; Garret);
//   actionAt where what it asks is done (the cellar, not the corn-store over it);
//   routeTo  where a way or a journey toward it leads; actionAt unless said otherwise.
// Its author says it (Objective … toward keeper "…"); an aim that does not is read as it always was, from what its
// words name less what they name only as an address (see Stakes), once, here, and said to be a reading (legacy), and
// ambiguous where it names places neither of which holds the other. Where any of it is shown is the page's to decide
// by what the company knows (see Glance, Itineraries): a target is never itself knowledge.
export interface ResolvedTarget {
  subject?: string; actionAt?: string; routeTo?: string;
  source: 'authored' | 'legacy'; ambiguous?: true;
}
export class ObjectiveTarget {
  static of(campaign: Campaign, o: Objective, legacy: () => Set<string>): ResolvedTarget {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const ids = o.toward?.length ? o.toward : [...legacy()];
    const places = ids.filter(id => byId.get(id)?.space), others = ids.filter(id => !byId.get(id)?.space);
    // The most particular of the places: one that no other named place lies within.
    const inner = places.filter(p => !places.some(q => q !== p && Spatial.ancestry(byId, q).some(e => e.id === p)));
    const actionAt = inner[0], subject = others.find(id => id !== campaign.playerActor && id !== 'party');
    const routeTo = o.route ?? actionAt;
    return { ...subject ? { subject } : {}, ...actionAt ? { actionAt } : {}, ...routeTo ? { routeTo } : {},
      source: o.toward?.length ? 'authored' : 'legacy', ...!o.toward?.length && inner.length > 1 ? { ambiguous: true } : {} };
  }
}
