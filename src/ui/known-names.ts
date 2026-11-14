import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/entity-index';
import { ObservationText } from '../lang/observation-text';

// What a screen's parts ask of the names they word their rows with: an id's name, or nothing for an id no entity has.
export interface Names { get(id: string): string | undefined }
// Every entity by the name the company knows it by, a member by their own name: each named as it is first asked for,
// and kept for the one screen. A screen asks after a few; naming every entity first had been a fifth of a step's
// screen in a world of 10,000 rooms elsewhere (performance-report.md §3), about 11,000 labels a screen in a1.
export class KnownNames implements Names {
  private readonly named = new Map<string, string>();
  private readonly creatures: Map<string, { name?: string }>;
  private readonly entities: Map<string, { creatureId?: string }>;
  constructor(private readonly campaign: Campaign) {
    this.creatures = new Map(campaign.readout.creatures.map(c => [c.id, c]));
    this.entities = EntityIndex.of(campaign.module.entities).byId;
  }
  get(id: string): string | undefined {
    const e = this.entities.get(id), had = this.named.get(id);
    if (!e || had !== undefined) { return had; }
    const own = e.creatureId && this.creatures.get(e.creatureId)?.name;
    const name = own || ObservationText.label(this.campaign.world, id);
    this.named.set(id, name);
    return name;
  }
}
