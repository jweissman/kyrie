import { expect, it } from 'bun:test';
import { Battle, createArena } from '../src/arena';
import { Content } from '../src/content';
import { CombatChoices } from '../src/ui/combat-choices';

it('lists each action once, then exposes only its eligible targets', () => {
  const scenario = createArena('ui');
  // Orsino's initiative decides who acts first; a large bonus makes it the first fighter.
  scenario.combatants[0]!.equipment = { ...scenario.combatants[0]!.equipment, modifiers: { initiative: 100 } };
  const battle = new Battle(scenario, 'ui');
  const legal = battle.legalCommands();
  const choices = CombatChoices.actions(legal, Content.abilities);
  expect(choices.filter(choice => choice.ability.id === 'melee')).toHaveLength(1);
  const attack = choices.find(choice => choice.ability.id === 'melee')!;
  expect(attack.requiresTarget).toBe(true);
  expect(attack.commands.map(command => command.target)).toEqual(expect.arrayContaining(['goblins-1', 'goblins-2']));
  expect(() => CombatChoices.target(attack, 'fighters-2')).toThrow();
  const vigor = choices.find(choice => choice.ability.id === 'vigor_up')!;
  expect(vigor.requiresTarget).toBe(false);
  expect(vigor.scope).toBe('self');
  expect(battle.events.map(e => e.type)).toEqual(['initiative']);
});
