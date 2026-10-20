import { describe, expect, it } from 'bun:test';
import { Battle, createArena } from '../src/arena';
import { Content } from '../src/content';
import { parseAbility } from '../src/lang/parse';
import type { Fighter, Scenario } from '../src/model';

// Turn order is Orsino's initiative (d20 + DEX modifier + initiative bonus, rolled each round); the fixture fixes it
// with initiative bonuses large enough that the dice cannot reorder anyone.
class Fixture {
  static order(fighters: Fighter[], bonuses: number[]) {
    fighters.forEach((f, i) => { f.equipment = { ...f.equipment, modifiers: { initiative: bonuses[i] ?? 0 } }; });
  }
  static scenario(text: string, options: { cost?: number; cooldown?: number } = {}): Scenario {
    const scenario = createArena('effects');
    Fixture.order(scenario.combatants, [100, 50, 20, 10]);
    for (const f of scenario.combatants) {
      f.hp = f.maxHp = 30;
      f.mana = f.maxMana = 10;
      f.abilities = ['wait'];
      f.traits = [];
    }
    scenario.combatants[0]!.abilities.push('test');
    scenario.abilities = [...Content.abilities, { ...parseAbility('test', 'Test', text), ...options }];
    return scenario;
  }
  static battle(text: string, options: { cost?: number; cooldown?: number; seed?: string } = {}) {
    return new Battle(Fixture.scenario(text, options), options.seed ?? 'effects');
  }
  static use(battle: Battle, target = 'fighters-1') {
    return battle.step({ actor: 'fighters-1', ability: 'test', target });
  }
  static hp(battle: Battle, team: Fighter['team']) {
    return battle.state.combatants.filter(f => f.team === team).map(f => f.hp);
  }
  static nextHero(battle: Battle) {
    while (!battle.state.outcome && battle.state.actor !== 'fighters-1') {
      battle.step(battle.legalCommands().find(c => c.ability === 'wait')!);
    }
  }
}

describe('controlled English effect resolution', () => {
  it('handles group effects and independently resolves self in a mixed-target ability', () => {
    const battle = Fixture.battle('Deal 4 physical damage to enemies. Apply blessed to self for 3 turns.');
    Fixture.use(battle);
    expect(Fixture.hp(battle, 'goblins')).toEqual([26, 26]);
    expect(battle.state.combatants[0]!.statuses[0]!.id).toBe('blessed');
  });
  it('skips the turns of a creature without actions, and its turn-end effects with them', () => {
    const battle = Fixture.battle('Apply poisoned to enemies for 2 turns. Apply stun to enemies for 1 turns.');
    Fixture.use(battle);
    Fixture.nextHero(battle);
    // Stunned through the first round: no turn, so no turn-end poison (Orsino's turn returns before onTurnEnd).
    expect(battle.events.filter(e => e.type === 'skip')).toHaveLength(2);
    expect(Fixture.hp(battle, 'goblins')).toEqual([30, 30]);
    battle.step({ actor: 'fighters-1', ability: 'wait', target: 'fighters-1' });
    Fixture.nextHero(battle);
    expect(Fixture.hp(battle, 'goblins').every(hp => hp <= 28)).toBe(true);
    expect(battle.events.some(e => e.type === 'expire' && e.detail === 'stun')).toBe(true);
  });
  it('applies status modifiers and purifies a condition', () => {
    const battle = Fixture.battle('Apply poisoned to self for 3 turns. Remove poisoned from self.');
    Fixture.use(battle);
    expect(battle.state.combatants[0]!.statuses).toEqual([]);
    expect(battle.events.some(e => e.type === 'remove')).toBe(true);
    // Orsino's blessed: +1 to hit and +1 damage on every hit the holder deals.
    const damage = Fixture.battle('Apply blessed to self for 3 turns. Deal 4 physical damage to enemy.');
    Fixture.use(damage, 'goblins-1');
    expect(damage.state.combatants.find(f => f.id === 'goblins-1')!.hp).toBe(25);
  });
  it('drains only the actual HP lost and never overheals', () => {
    const battle = Fixture.battle('Deal 5 true damage to self. Drain 99 health from enemy.');
    Fixture.use(battle, 'goblins-1');
    expect(battle.state.combatants[0]!.hp).toBe(30);
    expect(battle.state.combatants.find(f => f.id === 'goblins-1')!.hp).toBe(0);
    const healing = battle.events.find(e => e.type === 'heal');
    expect(healing && 'amount' in healing ? healing.amount : undefined).toBe(5);
  });
  it('grants resources, learns abilities, summons a real actor, and uses travel as an encounter exit', () => {
    const battle = Fixture.battle('Grant 8 gold to self. Grant 20 experience to self. Teach firebolt to ally. Summon wisp for self.');
    Fixture.use(battle, 'fighters-2');
    expect(battle.state.combatants[0]!.gold).toBe(8);
    expect(battle.state.combatants[0]!.experience).toBe(20);
    expect(battle.state.combatants.find(f => f.id === 'fighters-2')!.abilities).toContain('firebolt');
    expect(battle.state.combatants.some(f => f.raceId === 'wisp' && f.team === 'fighters' && !f.classId)).toBe(true);
    const exit = Fixture.battle('Travel to village.');
    Fixture.use(exit);
    expect(exit.state.outcome).toBe('escaped');
    expect(exit.events.some(e => e.type === 'travel' && e.detail === 'village')).toBe(true);
  });
  it('revives only dead allies and validates cooldown and mana costs', () => {
    const scenario = Fixture.scenario('Revive dead ally with 3 health.', { cost: 2, cooldown: 2 });
    const [hero, ally] = scenario.combatants;
    hero!.mana = hero!.maxMana = 5;
    ally!.hp = 0;
    const battle = new Battle(scenario, 'revive');
    expect(battle.legalCommands().filter(c => c.ability === 'test').map(c => c.target)).toEqual([ally!.id]);
    Fixture.use(battle, ally!.id);
    expect(battle.state.combatants.find(f => f.id === ally!.id)!.hp).toBe(3);
    expect(battle.state.combatants.find(f => f.id === hero!.id)!.mana).toBe(3);
    Fixture.nextHero(battle);
    expect(battle.legalCommands().some(c => c.ability === 'test')).toBe(false);
  });
  it('makes saving throws per target and evaluates Deem conditions', () => {
    const save = Fixture.battle('Deal 6 physical damage to enemies unless wisdom save against 0.');
    Fixture.use(save);
    expect(Fixture.hp(save, 'goblins')).toEqual([30, 30]);
    expect(save.events.filter(e => e.type === 'save')).toHaveLength(2);
    const failed = Fixture.battle('Deal 6 physical damage to enemies unless wisdom save against 100.');
    Fixture.use(failed);
    expect(Fixture.hp(failed, 'goblins')).toEqual([24, 24]);
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
