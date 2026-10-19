import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';

const content = new Content('lifecycle');
const store = new CreatureStore([
  content.createCreature('hero', { raceId: 'human', classId: 'fighter' }), content.createCreature('goblin', { raceId: 'goblin', classId: 'commoner' }),
]);
const participants = [
  { creatureId: 'hero', team: 'fighters' as const }, { creatureId: 'goblin', team: 'goblins' as const },
];
const before = store.get('goblin');
const first = Battle.encounter(store, participants, { seed: 'encounter' });
while (first.state.actor !== 'hero') {
  first.step(first.legalCommands().find(c => c.ability === 'defend')!);
}
first.step({ actor: 'hero', ability: 'wounding_blow', target: 'goblin' });
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
