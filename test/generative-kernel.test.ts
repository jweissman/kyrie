import { describe, expect, it } from 'bun:test';
import { CreatureStore } from '../src/creature-store';
import { CreatureDefinition } from '../src/creature-definition';
import { Content } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import { Effects } from '../src/effects';
import { Waiting } from './support/waiting';
import { Battle } from '../src/battle';
import type { CombatEvent } from '../src/model';

describe('generative kernel: executable dimensions', () => {
  it('composes dragon lineages and maturities through one family, with real saved area damage', () => {
    for (const lineage of ['red', 'white', 'black'] as const) {
      for (const maturity of ['wyrmling', 'young', 'ancient'] as const) {
        const dragon = new Content('dragons').createCreature('dragon', { raceId: 'dragon', lineage, maturity });
        const f = CombatProjection.fighter(dragon, 'goblins');
        const targets = ['a', 'b'].map(id => CombatProjection.fighter(new Content('targets').createCreature(id,
          { raceId: 'human', classId: 'warrior', constitution: 18, level: 20 }), 'fighters'));
        const ability = Content.abilities.find(a => a.id === f.abilities.find(a => a.startsWith('breathe_')))!;
        const battle = new Battle({ id: 'breath', combatants: [f, ...targets], abilities: Content.abilities }, 'breath');
        while (battle.state.actor !== f.id && !battle.state.outcome) {
          battle.step(Waiting.turn(battle));
        }
        expect(battle.legalCommands().some(c => c.ability === ability.id)).toBe(true);
        battle.step(battle.legalCommands().find(c => c.ability === ability.id)!);
        expect(battle.events.filter(e => e.type === 'damage')).toHaveLength(2);
        expect(battle.events.filter(e => e.type === 'save' && e.actor === f.id).length).toBeGreaterThanOrEqual(2);
        expect(battle.events.some(e => e.type === 'damage' && e.damageType === { red: 'fire', white: 'cold', black: 'acid' }[lineage])).toBe(true);
      }
    }
  });
  it('shares frost adaptation between a natural beast and an equipped classed humanoid', () => {
    const wolf = new Content('frost').createCreature('wolf', { raceId: 'wolf', adaptation: 'frost' });
    const scout = new Content('frost').createCreature('scout', { raceId: 'human', classId: 'ranger', adaptation: 'frost', weapon: 'shortbow' });
    for (const c of [wolf, scout]) {
      const f = CombatProjection.fighter(c, 'goblins'), events: CombatEvent[] = [];
      expect(Effects.modifiers(f).resistances).toMatchObject({ cold: .5, fire: -.25 });
      Effects.damage(f, { amount: 8, type: 'cold' }, { actor: f, fighters: [f], events, turn: 1, content: new Content('damage'), abilities: [], retreat: false, location: null });
      expect(events[0]).toMatchObject({ type: 'damage', amount: 4 });
    }
    expect(CombatProjection.fighter(wolf, 'goblins').equipment.weapon.natural).toBe(true);
    expect(CombatProjection.fighter(scout, 'goblins').equipment.weapon.missile).toBe(true);
    expect(scout.classId).toBe('ranger');
    expect(scout.base.abilities.length).toBeGreaterThan(0);
  });
  it('isolates equipment and identity from spell and specialization draws', () => {
    const a = new Content('streams').createCreature('same', { raceId: 'human', classId: 'cleric', traits: ['vitalist'], prepared: true });
    const b = new Content('streams').createCreature('same', { raceId: 'human', classId: 'cleric', traits: ['vitalist'], spells: ['cure', 'bless', 'anoint', 'prayer', 'minor_restoration', 'cure_moderate'] });
    expect(a.state.inventory).toEqual(b.state.inventory);
    expect(a.name).toBe(b.name);
    expect(a.base.strength).toBe(b.base.strength);
    expect(() => new Content('bad').createCreature('bad', { family: 'dragon', lineage: 'missing' as never })).toThrow();
  });
});

describe('Deem is the compositional creature generator', () => {
  it('returns complete red adult and blue young definitions from the same entry point', () => {
    const red = new Content('single-invocation').generate('creature', { family: 'dragon', lineage: 'red', maturity: 'adult', adaptation: 'none' });
    const blue = new Content('single-invocation').generate('creature', { family: 'dragon', lineage: 'blue', maturity: 'young', adaptation: 'none' });
    expect(red).toMatchObject({ raceId: 'dragon', strength: 35, level: 6, maxHp: 99, weapon: 'bite', armor: 'scale', abilities: ['breathe_fire'] });
    expect(blue).toMatchObject({ raceId: 'dragon', strength: 23, level: 3, maxHp: 36, weapon: 'bite', armor: 'scale', abilities: ['breathe_lightning'] });
    expect(red.trace).toEqual(['family:dragon', 'lineage:red', 'maturity:adult', 'adaptation:none']);
    expect(blue.trace).toEqual(['family:dragon', 'lineage:blue', 'maturity:young', 'adaptation:none']);
    for (const d of [red, blue]) {
      expect(d).not.toHaveProperty('dragon');
      expect(d).not.toHaveProperty('lineageTrait');
      expect(Object.keys(d).some(k => /^[*_^!]/.test(k))).toBe(false);
      const c = CreatureDefinition.accept('accepted', d);
      const restored = CombatProjection.creature(CombatProjection.fighter(c, 'goblins'), c);
      expect(restored).toEqual(c);
    }
  });
  it('uses the same adaptation overlay within two complete Deem-generated families', () => {
    for (const family of ['animal', 'humanoid']) {
      const raw = new Content('two-families').generate('creature', { family, ...(family === 'animal' ? { body: 'wolf' } : {}), adaptation: 'frost', weapon: family === 'humanoid' ? 'shortbow' : 'bite' });
      const c = CreatureDefinition.accept(family, raw);
      expect(c.traits).toContain('frost_adapted');
      expect(c.generation?.trace).toContain('adaptation:frost');
      expect(Effects.modifiers(CombatProjection.fighter(c, 'goblins')).resistances?.cold).toBe(.5);
      expect(c.base.abilities.length).toBeGreaterThan(0);
    }
  });
  it('pins the actual Deem overlay algebra, including the shallow object limitation', () => {
    const setting = Content.settingWith({}, { merge_contract: { __no_id: true,
      strength: 10, abilities: ['defend'], label: 'base', nested: { hp: 10 },
      '*overlay': { strength: 2, abilities: ['flee'], label: 'specialized', nested: { hp: 20, mana: 3 } } } });
    expect(new Content('merge', setting).generate('merge_contract')).toEqual({ strength: 12,
      abilities: ['defend', 'flee'], label: 'specialized', nested: { hp: 10, mana: 3 } });
  });
  it('executes lightning breath from a directly generated blue young dragon', () => {
    const raw = new Content('blue-proof').generate('creature', { family: 'dragon', lineage: 'blue', maturity: 'young', adaptation: 'none' });
    const dragon = CombatProjection.fighter(CreatureDefinition.accept('blue', raw), 'goblins');
    const targets = ['left', 'right'].map(id => CombatProjection.fighter(new Content('targets').createCreature(id,
      { raceId: 'human', classId: 'warrior', level: 10 }), 'fighters'));
    const battle = new Battle({ id: 'blue-proof', combatants: [dragon, ...targets], abilities: Content.abilities }, 'blue-proof');
    while (battle.state.actor !== dragon.id && !battle.state.outcome) {
      battle.step(Waiting.turn(battle));
    }
    battle.step(battle.legalCommands().find(c => c.ability === 'breathe_lightning')!);
    expect(battle.events.filter(e => e.type === 'damage' && e.damageType === 'lightning')).toHaveLength(2);
    expect(battle.events.some(e => e.type === 'save' && e.kind === 'breath')).toBe(true);
    expect(battle.state.combatants.find(f => f.id === 'blue')?.cooldowns.breathe_lightning).toBeGreaterThan(0);
  });
});

describe('generated bodies retain distinct combat behavior', () => {
  it('executes both the adapted wolf attack and the adapted ranger bow attack', () => {
    for (const family of ['animal', 'humanoid']) {
      const raw = new Content('attacks').generate('creature', { family, adaptation: 'frost',
        ...family === 'humanoid' ? { weapon: 'shortbow' } : { body: 'wolf' } });
      const actor = CombatProjection.fighter(CreatureDefinition.accept('generated', raw), 'fighters');
      const target = CombatProjection.fighter(new Content('target').createCreature('target',
        { raceId: 'human', classId: 'warrior', level: 10 }), 'goblins');
      const battle = new Battle({ id: 'attacks', combatants: [actor, target], abilities: Content.abilities }, 'attacks');
      while (battle.state.actor !== actor.id) { battle.step(Waiting.turn(battle)); }
      const command = battle.legalCommands().find(c => c.ability === (family === 'animal' ? 'melee' : 'ranged'))!;
      expect(command).toBeDefined();
      battle.step(command);
      expect(battle.events.find(e => e.type === 'attack')).toMatchObject({ actor: actor.id,
        weapon: family === 'animal' ? 'bite' : 'shortbow' });
    }
  });
});


describe('generated definition persistence', () => {
  it('commits breath injuries while preserving both composed bodies and generation traces', () => {
    const raw = new Content('persistent').generate('creature', { family: 'dragon', lineage: 'blue', maturity: 'young', adaptation: 'none' });
    const dragon = CreatureDefinition.accept('blue', raw);
    const target = new Content('target').createCreature('target', { raceId: 'human', classId: 'warrior', level: 20 });
    const store = new CreatureStore([dragon, target]);
    const battle = Battle.encounter(store, [{ creatureId: 'blue', team: 'fighters' },
      { creatureId: 'target', team: 'goblins' }], { seed: 'persistent' });
    while (battle.state.actor !== 'blue') { battle.step(Waiting.turn(battle)); }
    battle.step(battle.legalCommands().find(c => c.ability === 'breathe_lightning')!);
    battle.close();
    expect(store.get('target').state.hp).toBeLessThan(target.state.hp);
    expect(store.get('blue').base).toEqual(dragon.base);
    expect(store.get('blue').generation).toEqual(dragon.generation);
    const restored = new CreatureStore(store.snapshot);
    expect(restored.get('blue')).toEqual(store.get('blue'));
    expect(restored.get('target').state.hp).toBe(store.get('target').state.hp);
  });
});
