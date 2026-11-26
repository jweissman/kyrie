import type { Creature } from './creature';
import type { CreatureStore } from './creature-store';

export class CreatureLease {
  constructor(private owner: CreatureStore, readonly creatures: Creature[]) {}
  get vocabulary() { return this.owner.vocabulary; }
  commit(creatures: Creature[], options: { advancement?: boolean; endowed?: number } = {}) {
    this.owner.commit(this, creatures, options);
  }
  release() { this.owner.release(this); }
}
