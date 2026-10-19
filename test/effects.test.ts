import { describe, expect, it } from 'bun:test';
import { Battle, createArena } from '../src/arena';
import { Content } from '../src/content';
import { parseAbility } from '../src/lang/parse';

class Fixture {
  static battle(text: string, options: { cost?: number; cooldown?: number; seed?: string } = {}) {
    const scenario = createArena('effects');
    const [hero, ally, enemy, otherEnemy] = scenario.combatants;
    hero!.speed = 100; ally!.speed = 50; enemy!.speed = 20; otherEnemy!.speed = 10;
    for (const f of scenario.combatants) {
      f.hp = f.maxHp = 30;
      f.mana = f.maxMana = 10;
      f.abilities = ['defend'];
    }
    hero!.abilities.push('test');
    scenario.abilities = [...Content.abilities, { ...parseAbility('test', 'Test', text), ...options }];
    return new Battle(scenario, options.seed ?? 'effects');
  }
  static use(battle: Battle, target = 'fighters-1') {
    return battle.step({ actor: 'fighters-1', ability: 'test', target });
  }
  static nextHero(battle: Battle) {
    while (!battle.state.outcome && battle.state.actor !== 'fighters-1') {
      battle.step(battle.legalCommands().find(c => c.ability === 'defend')!);
    }
  }
}

describe('controlled English effect resolution', () => {
  it('handles group effects and independently resolves self in a mixed-target ability', () => {
    const battle = Fixture.battle('Deal 4 fire damage to enemies. Apply warded to self for 3 turns.');
    Fixture.use(battle);
    expect(battle.state.combatants.filter(f => f.team === 'goblins').map(f => f.hp)).toEqual([26, 26]);
    expect(battle.state.combatants[0]!.statuses[0]!.id).toBe('warded');
  });
  it('damages periodically, removes statuses, and skips stunned turns', () => {
    const battle = Fixture.battle('Apply poisoned to enemies for 2 turns. Apply stunned to enemies for 1 turns.');
    Fixture.use(battle);
    Fixture.nextHero(battle);
    expect(battle.events.filter(e => e.type === 'skip')).toHaveLength(2);
    expect(battle.state.combatants.filter(f => f.team === 'goblins').map(f => f.hp)).toEqual([28, 28]);
    battle.step({ actor: 'fighters-1', ability: 'defend', target: 'fighters-1' });
    Fixture.nextHero(battle);
    expect(battle.state.combatants.filter(f => f.team === 'goblins').map(f => f.hp)).toEqual([26, 26]);
    expect(battle.state.combatants.filter(f => f.team === 'goblins').every(f => !f.statuses.length)).toBe(true);
  });
  it('applies status modifiers and purifies a condition', () => {
    const battle = Fixture.battle('Apply poisoned to self for 3 turns. Remove poisoned from self.');
    Fixture.use(battle);
    expect(battle.state.combatants[0]!.statuses).toEqual([]);
    expect(battle.events.some(e => e.type === 'remove')).toBe(true);
    const damage = Fixture.battle('Apply blessed to self for 3 turns. Deal 4 physical damage to enemy.');
    Fixture.use(damage, 'goblins-1');
    expect(damage.state.combatants.find(f => f.id === 'goblins-1')!.hp).toBe(24);
  });
  it('drains only the actual HP lost and never overheals', () => {
    const battle = Fixture.battle('Deal 5 fire damage to self. Drain 99 health from enemy.');
    Fixture.use(battle, 'goblins-1');
    expect(battle.state.combatants[0]!.hp).toBe(30);
    expect(battle.state.combatants.find(f => f.id === 'goblins-1')!.hp).toBe(0);
    const healing = battle.events.find(e => e.type === 'heal');
    expect(healing && 'amount' in healing ? healing.amount : undefined).toBe(5);
  });
  it('grants resources, learns abilities, summons a real actor, and uses travel as an encounter exit', () => {
    const battle = Fixture.battle('Grant 8 gold to self. Grant 20 experience to self. Teach bolt to ally. Summon wisp for self.');
    Fixture.use(battle, 'fighters-2');
    expect(battle.state.combatants[0]!.gold).toBe(8);
    expect(battle.state.combatants[0]!.experience).toBe(20);
    expect(battle.state.combatants.find(f => f.id === 'fighters-2')!.abilities).toContain('bolt');
    expect(battle.state.combatants.some(f => f.raceId === 'wisp' && f.team === 'fighters')).toBe(true);
    const exit = Fixture.battle('Travel to village.');
    Fixture.use(exit);
    expect(exit.state.outcome).toBe('escaped');
    expect(exit.events.some(e => e.type === 'travel' && e.detail === 'village')).toBe(true);
  });
  it('revives only dead allies and validates cooldown and mana costs', () => {
    const scenario = createArena('revive');
    const hero = scenario.combatants[0]!;
    const ally = scenario.combatants[1]!;
    hero.speed = 100; hero.mana = hero.maxMana = 5; hero.abilities = ['test', 'defend'];
    ally.hp = 0;
    for (const f of scenario.combatants.slice(2)) { f.abilities = ['defend']; }
    scenario.abilities.push({ ...parseAbility('test', 'Revive', 'Revive dead ally with 3 health.'), cost: 2, cooldown: 2 });
    const battle = new Battle(scenario, 'revive');
    expect(battle.legalCommands().filter(c => c.ability === 'test').map(c => c.target)).toEqual([ally.id]);
    Fixture.use(battle, ally.id);
    expect(battle.state.combatants.find(f => f.id === ally.id)!.hp).toBe(3);
    expect(battle.state.combatants.find(f => f.id === hero.id)!.mana).toBe(3);
    Fixture.nextHero(battle);
    expect(battle.legalCommands().some(c => c.ability === 'test')).toBe(false);
  });
  it('makes saving throws per target and evaluates Deem conditions', () => {
    const save = Fixture.battle('Deal 6 fire damage to enemies unless wisdom save against 0.');
    Fixture.use(save);
    expect(save.state.combatants.filter(f => f.team === 'goblins').every(f => f.hp === 30)).toBe(true);
    expect(save.events.filter(e => e.type === 'save')).toHaveLength(2);
    const failed = Fixture.battle('Deal 6 fire damage to enemies unless wisdom save against 100.');
    Fixture.use(failed);
    expect(failed.state.combatants.filter(f => f.team === 'goblins').every(f => f.hp === 24)).toBe(true);
    const condition = Fixture.battle('If (#hp < #maxHp), Grant 5 gold to self.');
    Fixture.use(condition);
    expect(condition.state.combatants[0]!.gold).toBe(0);
  });
  it('kills, randomly selects enemies reproducibly, and rejects unknown status references', () => {
    const battle = Fixture.battle('Kill random enemy.');
    const replay = Fixture.battle('Kill random enemy.');
    Fixture.use(battle); Fixture.use(replay);
    expect(battle.events).toEqual(replay.events);
    expect(battle.state.combatants.filter(f => f.hp === 0)).toHaveLength(1);
    expect(() => Fixture.battle('Apply nonsense to self for 2 turns.')).toThrow();
    expect(() => Fixture.battle('Deal 3 nonsense damage to enemy.')).toThrow();
    expect(() => Fixture.battle('Grant 3 nonexistent_resource to self.')).toThrow();
  });
});
