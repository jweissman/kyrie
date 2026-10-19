import { expect, it } from 'bun:test';
import { Battle, createArena } from '../src/arena';
import { Content } from '../src/content';
import { CombatChoices } from '../src/ui/combat-choices';

it('lists each action once, then exposes only its eligible targets', () => {
  const scenario = createArena('ui');
  scenario.combatants[0]!.speed = 100;
  const battle = new Battle(scenario, 'ui');
  const legal = battle.legalCommands();
  const choices = CombatChoices.actions(legal, Content.abilities);
  expect(choices.filter(choice => choice.ability.id === 'attack')).toHaveLength(1);
  const attack = choices.find(choice => choice.ability.id === 'attack')!;
  expect(attack.requiresTarget).toBe(true);
  expect(attack.commands.map(command => command.target)).toEqual(expect.arrayContaining(['goblins-1', 'goblins-2']));
  expect(() => CombatChoices.target(attack, 'fighters-2')).toThrow();
  const cleave = choices.find(choice => choice.ability.id === 'cleave')!;
  expect(cleave.requiresTarget).toBe(false);
  expect(cleave.scope).toBe('enemies');
  expect(battle.events).toHaveLength(0);
});
