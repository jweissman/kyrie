import { expect, it, describe } from 'bun:test';
import Kyrie, { type Creature } from '../src/Kyrie';
import { Content } from '../src/content';

describe('Kyrie', () => {
  it('presents the canonical creature', () => {
    const creature: Creature = new Content('presenter').createCreature('hero', { raceId: 'human', classId: 'fighter' });
    const output = new Kyrie().presentCreature(creature);
    expect(output).toBe(`${creature.name} (${creature.state.hp}/${creature.base.maxHp})`);
  });
});
