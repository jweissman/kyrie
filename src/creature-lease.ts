import type { Creature } from './creature';
import type { CreatureStore } from './creature-store';
import type { ItemCatalog } from './item-catalog';

export class CreatureLease {
  constructor(private owner: CreatureStore, readonly creatures: Creature[]) {}
  commit(creatures: Creature[], options: { advancement?: boolean; endowed?: number } = {}) {
    this.owner.commit(this, creatures, options);
  }
  release() { this.owner.release(this); }
  // The kinds of thing its creatures' things are of: their store's.
  get catalog(): ItemCatalog { return this.owner.catalog; }
}
