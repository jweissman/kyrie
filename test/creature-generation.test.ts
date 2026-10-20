import { describe, expect, it } from 'bun:test';
import { Content, type CreatureGenerationContext } from '../src/content';
import { Canon } from '../src/canon/canon';
import { Creation } from '../src/rules/creation';
import templates from '../data/generation/templates/deem.templates.json';

describe('compositional creature generation', () => {
  it('uses one constructor for explicit PCs, requested goblins and procedural monsters', () => {
    expect(templates).not.toHaveProperty('fighter_pc');
    expect(templates).not.toHaveProperty('goblin');
    const contexts: CreatureGenerationContext[] = [
      { raceId: 'human', classId: 'fighter', traits: ['brave'], level: 3 },
      { raceId: 'goblin' }, { population: 'monster' }, {},
    ];
    for (const context of contexts) {
      const first = new Content('general').createCreature('entity', context);
      expect(first).toEqual(new Content('general').createCreature('entity', context));
      expect(first.base.level).toBe(context.level ?? 1);
      if (context.raceId) { expect(first.raceId).toBe(context.raceId); }
      if (context.classId) { expect(first.classId).toBe(Creation.classId(context.classId)); }
      if (context.population === 'monster') { expect(['goblin', 'wisp']).toContain(first.raceId); }
    }
    expect(new Content('general').createCreature('entity', contexts[0]!).classId).toBe('warrior');
  });
  it('derives hit points, spell slots and spells from Orsino\'s chassis, honouring authored scores', () => {
    const spells = ['cure', 'bless', 'anoint', 'prayer', 'minor_restoration', 'cure_moderate'];
    const context = { raceId: 'dwarf', classId: 'cleric', traits: ['vitalist'], spells, strength: 18,
      constitution: 15, wisdom: 14, name: 'Chosen' } satisfies CreatureGenerationContext;
    const low = new Content('scaling').createCreature('low', { ...context, level: 1 });
    const high = new Content('scaling').createCreature('high', { ...context, level: 4 });
    expect([high.name, high.raceId, high.classId]).toEqual(['Chosen', 'dwarf', 'cleric']);
    for (const key of ['strength', 'constitution'] as const) { expect(high.base[key]).toBe(low.base[key]); }
    expect([high.base.strength, high.base.constitution]).toEqual([18, 15]);
    // A level-1 character: hit die 8 + CON modifier 3. Above level 1, Orsino's NPC formula: 8 + 3 × 8 / 2 + 3.
    expect([low.base.maxHp, high.base.maxHp]).toEqual([11, 23]);
    // Slots: a cleric's 2, plus 2 + level, plus the positive WIS modifier (2).
    expect([low.base.maxMana, high.base.maxMana]).toEqual([7, 10]);
    expect(high.base.abilities).toEqual(['defend', 'cure_minor', 'sanctify', ...spells]);
    expect(new Content('alias').generate('character', { kind: 'hero' }))
      .toEqual(new Content('alias').generate('creature', { kind: 'hero' }));
    expect(new Content('attributes').generate('attributes', { strength: 18 }).strength).toBe(18);
  });
  it('keeps kind and class independent of allegiance, and a species free of any class', () => {
    const generated = Array.from({ length: 12 }, (_, i) =>
      new Content(`monster:${i}`).createCreature(`monster:${i}`, { population: 'monster' }));
    expect(new Set(generated.map(c => c.raceId)).size).toBeGreaterThan(1);
    for (const c of generated) {
      if (Canon.isSpecies(c.raceId)) { expect(c.classId).toBeUndefined(); }
      else { expect(Canon.ancestries[c.raceId]!.classes).toContain(c.classId!); }
      expect(c).not.toHaveProperty('team');
    }
    const enemy = new Content('class').character('thief', 'enemy', 'goblins', 'goblin');
    expect(enemy.abilities).toContain('backstab');
    expect([enemy.classId, enemy.raceId]).toEqual(['thief', 'goblin']);
    expect(() => new Content('class').character('warrior', 'enemy', 'goblins', 'goblin')).toThrow('cannot be a warrior');
  });
  it('rejects invalid constraints and invalid generated attributes', () => {
    const content = new Content('invalid');
    for (const level of [0, -1, 1.5, Infinity]) {
      expect(() => content.createCreature('invalid', { level })).toThrow('context');
    }
    expect(() => content.createCreature('invalid', { strength: -1 })).toThrow();
    expect(() => content.createCreature('invalid', { raceId: 'missing' as never })).toThrow('context');
    expect(() => content.createCreature('invalid', { classId: 'missing' as never })).toThrow('context');
  });
});
