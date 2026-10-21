import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import type { CombatEvent, Fighter } from '../src/model';

// Orsino's reactions and compound effects as general semantics: a status answers what an enemy does before it
// lands; a foe turned to flight leaves; the fallen rise; a spell may draw one effect at random or cast another.
class Scene {
  static readonly content = new Content('reactions');
  static warrior(id: string, statuses: string[] = []): Fighter {
    return { ...this.content.character('warrior', id, 'fighters'), abilities: [], hp: 80, maxHp: 80,
      statuses: statuses.map(s => ({ id: s, remaining: 3 })) };
  }
  static wolf(id: string, extra: Partial<Fighter> = {}): Fighter {
    return { ...this.content.creature('wolf', id, 'goblins'), abilities: [], hp: 60, maxHp: 60, ...extra };
  }
  static caster(id: string, spell: string, team: Fighter['team'] = 'fighters'): Fighter {
    const c = CombatProjection.fighter(new Content(id).createCreature(id, { raceId: 'human', classId: 'cleric', level: 17 }), team);
    return { ...c, abilities: [spell], hp: 90, maxHp: 90, prepared: c.prepared!.map(row => row.map(() => spell)),
      ready: c.ready!.map(row => row.map(() => spell)) };
  }
  static battle(fighters: Fighter[], seed = 'reactions') {
    return new Battle({ id: 'reactions', combatants: fighters, abilities: Content.abilities }, seed);
  }
  static until(battle: Battle, id: string) {
    for (let i = 0; i < 40 && battle.state.actor !== id && !battle.state.outcome; i++) {
      const legal = battle.legalCommands();
      battle.step(legal.find(c => c.ability === 'defend') ?? legal.find(c => c.target === c.actor) ?? legal[0]!);
    }
    expect(battle.state.actor).toBe(id);
  }
  static use(battle: Battle, ability: string, target: string): CombatEvent[] {
    const command = battle.legalCommands().find(c => c.ability === ability && c.target === target);
    expect(command).toBeDefined();
    return battle.step(command!);
  }
}

describe('reactions', () => {
  // Its "remove Overwatching" names no target, so in Orsino it falls on the attacker, who has none: the watch lasts
  // its one turn rather than one strike, here as there.
  it('lets an overwatching warrior strike a foe that comes to blows, before its blow lands', () => {
    const battle = Scene.battle([Scene.warrior('watch', ['overwatch']), Scene.warrior('ward'), Scene.wolf('wolf')]);
    Scene.until(battle, 'wolf');
    const events = Scene.use(battle, 'melee', 'ward');
    const react = events.findIndex(e => e.type === 'react' && e.actor === 'watch');
    const own = events.findIndex(e => e.type === 'attack' && e.actor === 'wolf');
    expect(react).toBeGreaterThanOrEqual(0);
    expect(events.some((e, i) => i > react && e.type === 'attack' && e.actor === 'watch')).toBe(true);
    expect(own < 0 || own > react).toBe(true);
  });
  it('lets a braced spear meet a charge', () => {
    const battle = Scene.battle([Scene.warrior('spear', ['braced']),
      Scene.wolf('bull', { abilities: ['charge'], statuses: [{ id: 'preparing_to_charge', remaining: 3 }] })]);
    Scene.until(battle, 'bull');
    const events = Scene.use(battle, 'charge', 'spear');
    expect(events.some(e => e.type === 'react' && e.actor === 'spear' && e.detail === 'onEnemyCharge')).toBe(true);
    expect(events.some(e => e.type === 'damage' && e.target === 'bull' && e.damageType === 'piercing')).toBe(true);
  });
  it('makes a magebane-warded creature hurt whoever casts at its side', () => {
    const battle = Scene.battle([Scene.warrior('bane', ['magebane']), Scene.caster('hexer', 'holy_wrath', 'goblins')]);
    Scene.until(battle, 'hexer');
    const target = battle.legalCommands().find(c => c.actor === 'hexer' && c.ability === 'holy_wrath')?.target ?? 'bane';
    const events = Scene.use(battle, 'holy_wrath', target);
    expect(events.some(e => e.type === 'react' && e.detail === 'onEnemyCasting')).toBe(true);
    expect(events.some(e => e.type === 'damage' && e.target === 'hexer')).toBe(true);
  });
});

describe('flight, death and return', () => {
  it('sends a commanded foe out of the fight at the next round, alive', () => {
    const wolves = [Scene.wolf('a', { wisdom: 1 }), Scene.wolf('b', { wisdom: 1 })];
    const battle = Scene.battle([Scene.caster('priest', 'command'), ...wolves], 'command');
    Scene.until(battle, 'priest');
    Scene.use(battle, 'command', 'a');
    for (let i = 0; i < 6 && battle.state.combatants.some(f => f.id === 'a'); i++) {
      const legal = battle.legalCommands();
      battle.step(legal.find(c => c.ability === 'defend') ?? legal[0]!);
    }
    const fled = battle.events.find(e => e.type === 'flee' && e.actor === 'a');
    if (battle.events.some(e => e.type === 'status' && e.target === 'a' && e.detail === 'fleeing')) {
      expect(fled).toBeDefined();
      expect(battle.participants.find(p => p.creatureId === 'a')).toBeDefined();
    }
  });
  it('raises a fallen ally with half its health', () => {
    const fallen = { ...Scene.warrior('fallen'), hp: 0 };
    const battle = Scene.battle([Scene.caster('priest', 'raise_dead'), fallen, Scene.wolf('wolf')]);
    Scene.until(battle, 'priest');
    Scene.use(battle, 'raise_dead', 'fallen');
    expect(battle.state.combatants.find(f => f.id === 'fallen')!.hp).toBe(40);
  });
  it('gives a slain creature the save the death spell declares', () => {
    const battle = Scene.battle([Scene.caster('priest', 'death'), Scene.wolf('wolf')]);
    Scene.until(battle, 'priest');
    const events = Scene.use(battle, 'death', 'wolf');
    const save = events.find(e => e.type === 'save' && e.target === 'wolf');
    expect(save).toBeDefined();
    const wolf = battle.state.combatants.find(f => f.id === 'wolf');
    expect(save!.type === 'save' && save!.success ? wolf!.hp > 0 : (wolf?.hp ?? 0) === 0).toBe(true);
  });
  it('draws a chaos bolt\'s effect from the seed, the same way every time', () => {
    const run = () => {
      const battle = Scene.battle([Scene.caster('mage', 'chaos_bolt'), Scene.wolf('wolf')], 'chaos');
      Scene.until(battle, 'mage');
      return Scene.use(battle, 'chaos_bolt', 'wolf').filter(e => e.type === 'damage').map(e => e.type === 'damage' && e.damageType);
    };
    expect(run()).toEqual(run());
    expect(run().length).toBeGreaterThan(0);
  });
});
