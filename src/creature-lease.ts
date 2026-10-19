import type { Creature } from './creature';
import type { CreatureStore } from './creature-store';

export class CreatureLease {
  constructor(private owner: CreatureStore, readonly creatures: Creature[]) {}
  commit(creatures: Creature[]) { this.owner.commit(this, creatures); }
  release() { this.owner.release(this); }
}
