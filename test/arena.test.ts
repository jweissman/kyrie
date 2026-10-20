import { describe, expect, it } from 'bun:test';
import { Battle, batch, createArena, simulate } from '../src/arena';
import { parseAbility } from '../src/lang/parse';
import { Expressions } from '../src/expressions';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';

describe('ability language', () => {
  it('preserves nested Deem expressions and parses multiple typed effects', () => {
    expect(parseAbility('a', 'A', 'Deal (max(1, #strength) + 1d6) physical damage to enemy. Deal 2 fire damage to enemy.').effects).toEqual([
      { kind: 'damage', amount: { kind: 'deem', expression: 'max(1, #strength) + 1d6' }, damageType: 'physical', target: 'enemy' },
      { kind: 'damage', amount: { kind: 'literal', value: 2 }, damageType: 'fire', target: 'enemy' },
    ]);
  });
  it('preserves parentheses inside quoted expressions', () => {
    const ability = parseAbility('a', 'A', 'Heal (if(")" == ")", 3, 1)) health to self.');
    expect(ability.effects[0]?.kind).toBe('heal');
  });
  it('rejects malformed authoring', () => {
    for (const source of ['Deal (1d6 physical damage to enemy.', 'Heal 2 health to anyone.', '']) {
      expect(() => parseAbility('bad', 'Bad', source)).toThrow();
    }
  });
  it('evaluates Deem with context and rejects nonnumeric magnitudes', () => {
    const expr = new Expressions('test');
    expect(expr.number('max(1, #strength) + 1', { strength: 3 })).toBe(4);
    expect(() => expr.number('"hi"')).toThrow();
    expect(() => expr.number('-1')).toThrow();
  });
});

describe('arena', () => {
  it('generates two fighters and two goblins reproducibly', () => {
    expect(createArena('test')).toEqual(createArena('test'));
    expect(createArena('test').combatants.map(f => f.team)).toEqual(['fighters', 'fighters', 'goblins', 'goblins']);
    expect(createArena('test')).not.toEqual(createArena('other'));
  });
  it('replays the exact command stream from the same initial state and seed', () => {
    const scenario = createArena('replay');
    const initial = structuredClone(scenario);
    const result = simulate(scenario, 'replay');
    const replay = new Battle(scenario, 'replay');
    for (const command of result.commands) {replay.step(command);}
    expect(replay.state).toEqual(result.state);
    expect(replay.events).toEqual(result.events);
    expect(scenario).toEqual(initial);
    expect(result.state.outcome).not.toBe('draw');
    expect(() => replay.step(result.commands[0]!)).toThrow();
  });
  it('rejects invalid targets and actors without changing state or consuming randomness', () => {
    const scenario = createArena('validation');
    const battle = new Battle(scenario, 'validation');
    const before = battle.state;
    const actor = before.combatants.find(f => f.id === before.actor)!;
    expect(() => battle.step({ actor: actor.id, ability: 'attack', target: actor.id })).toThrow();
    expect(() => battle.step({ actor: 'missing', ability: 'attack', target: actor.id })).toThrow();
    expect(battle.state).toEqual(before);
    expect(battle.events.map(e => e.type)).toEqual(['initiative']);
    const command = battle.legalCommands()[0]!;
    battle.step(command);
    const control = new Battle(scenario, 'validation');
    control.step(command);
    expect(battle.events).toEqual(control.events);
  });
  it('defends by lowering armour class until the next round, heals without exceeding max HP, and skips dead actors', () => {
    const scenario = createArena('rules');
    scenario.combatants = scenario.combatants.slice(0, 1).concat(scenario.combatants.slice(2, 3));
    const [fighter, goblin] = scenario.combatants;
    fighter!.equipment = { ...fighter!.equipment, modifiers: { initiative: 100 } };
    fighter!.hp = 10; fighter!.maxHp = 20;
    goblin!.hp = goblin!.maxHp = 6;
    fighter!.abilities = ['defend', 'mend', 'end'];
    goblin!.abilities = ['wait'];
    scenario.abilities = [...scenario.abilities.filter(a => ['defend', 'wait', 'melee'].includes(a.id)),
      parseAbility('mend', 'Mend', 'Heal 99 health to self.'), parseAbility('end', 'End', 'Kill enemy.')];
    const battle = new Battle(scenario, 'rules');
    const ac = () => Fighting.armorClass(Effects.combatant(battle.state.combatants[0]!));
    const open = ac();
    battle.step({ actor: fighter!.id, ability: 'defend', target: fighter!.id });
    expect(battle.state.combatants[0]!.statuses).toEqual([{ id: 'defending', remaining: 1, by: fighter!.id }]);
    expect(ac()).toBe(open - 2);
    battle.step({ actor: goblin!.id, ability: 'wait', target: goblin!.id });
    // A new round: defending ticks out before the fighter's next turn (Orsino's duration 1).
    expect(battle.state.combatants[0]!.statuses).toEqual([]);
    expect(ac()).toBe(open);
    battle.step({ actor: fighter!.id, ability: 'mend', target: fighter!.id });
    expect(battle.state.combatants[0]!.hp).toBe(20);
    battle.step({ actor: goblin!.id, ability: 'wait', target: goblin!.id });
    battle.step({ actor: fighter!.id, ability: 'end', target: goblin!.id });
    expect(battle.state.outcome).toBe('fighters');
    expect(battle.events.filter(e => e.type === 'death')).toHaveLength(1);
    expect(battle.legalCommands()).toEqual([]);
  });
  it('bounds stalemates and protects snapshots', () => {
    const scenario = createArena('draw');
    const result = simulate(scenario, 'draw', (_state, legal) => legal.find(c => c.ability === 'defend')
      ?? legal.find(c => c.ability !== 'melee' && c.ability !== 'ranged' && !c.ability.includes('charge'))!, 4);
    expect(result.state.outcome).toBe('draw');
    expect(result.commands).toHaveLength(4);
    const battle = new Battle(scenario, 'draw');
    battle.state.combatants[0]!.hp = 0;
    expect(battle.state.combatants[0]!.hp).toBeGreaterThan(0);
  });
  it('runs 1,000 seeded encounters with consistent aggregates', () => {
    const stats = batch(1000, 'acceptance');
    expect(stats.wins.fighters + stats.wins.goblins + stats.wins.draw).toBe(1000);
    expect(stats.wins.draw).toBe(0);
    expect(stats.meanTurns).toBeGreaterThan(0);
    expect(batch(5, 'small')).toEqual(batch(5, 'small'));
  }, 60000);
});
