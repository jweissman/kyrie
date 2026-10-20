import type { Creature } from './creature';
import type { CreatureStore } from './creature-store';

export class CreatureLease {
  constructor(private owner: CreatureStore, readonly creatures: Creature[]) {}
  commit(creatures: Creature[], options: { advancement?: boolean } = {}) {
    this.owner.commit(this, creatures, options);
  }
  release() { this.owner.release(this); }
}
