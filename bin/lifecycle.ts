import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';

const content = new Content('lifecycle');
const store = new CreatureStore([
  content.createCreature('hero', { raceId: 'human', classId: 'warrior' }),
  content.createCreature('goblin', { raceId: 'goblin', classId: 'commoner' }),
]);
const participants = [
  { creatureId: 'hero', team: 'fighters' as const }, { creatureId: 'goblin', team: 'goblins' as const },
];
const before = store.get('goblin');
const first = Battle.encounter(store, participants, { seed: 'encounter' });
// Swing until a blow lands (Orsino attacks can miss), then retreat with the goblin wounded.
for (let i = 0; i < 20 && store.get('goblin').state.hp === before.state.hp && !first.state.outcome; i++) {
  const legal = first.legalCommands();
  first.step(first.state.actor === 'hero' ? { actor: 'hero', ability: 'melee', target: 'goblin' }
    : legal.find(c => c.ability === 'defend') ?? legal.find(c => c.ability !== 'flee')!);
}
first.close();
const injured = store.get('goblin');
const restored = new CreatureStore(store.snapshot);
const second = Battle.encounter(restored, participants, { seed: 'second' });
console.table([before, injured, restored.get('goblin')].map((creature, i) => ({
  phase: ['generated', 'after retreat', 'next encounter'][i], id: creature.id, name: creature.name,
  hp: creature.state.hp, maxHp: creature.base.maxHp,
  conditions: creature.state.conditions.map(c => `${c.id}:${c.remaining}`).join(', '),
})));
second.close();
