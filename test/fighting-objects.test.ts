import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Effects } from '../src/effects';
import { Canon } from '../src/canon/canon';

// Orsino's fighting objects (a turret, a ward, a phylactery) are construct species in Kyr that take their turn in a
// fight like anyone; and its planes are places' laws, held by everyone fighting there (Gehenna's spell DC is one
// lower).
describe('a fighting object', () => {
  it('takes its turn, and a plane\'s law holds everyone fighting there', () => {
    const content = new Content('objects');
    const store = new CreatureStore([content.createCreature('turret', { raceId: 'turret' }, 'turret'),
      content.createCreature('hero', { raceId: 'human', classId: 'mage', level: 1 }, 'hero')]);
    const battle = Battle.encounter(store, [{ creatureId: 'turret', team: 'goblins' },
      { creatureId: 'hero', team: 'fighters' }], { seed: 'objects', laws: ['plane_gehenna'], maxTurns: 12 });
    expect(battle.state.combatants.every(f => f.statuses.some(s => s.id === 'plane_gehenna'))).toBe(true);
    expect(Effects.modifiers(battle.state.combatants[0]!).bonusSpellDC).toBe(-1);
    // The hero only waits, so what happens is the turret's doing.
    for (let i = 0; i < 4 && !battle.state.outcome; i++) {
      const legal = battle.legalCommands();
      battle.step(battle.state.actor === 'hero' ? legal.find(c => c.ability === 'wait')! : battle.chosen());
    }
    expect(battle.events.some(e => e.type === 'action' && e.command.actor === 'turret' && e.command.ability === 'arrow_volley'))
      .toBe(true);
    expect(Object.keys(Canon.conditions).filter(id => id.startsWith('plane_')).length).toBe(10);
  });
});
