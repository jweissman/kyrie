import type { Creature } from './creature';
export type { Creature } from './creature';

export default class Kyrie {
  presentCreature(creature: Creature) {
    return `${creature.name} (${creature.state.hp}/${creature.base.maxHp})`;
  }
}
