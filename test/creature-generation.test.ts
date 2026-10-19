import { describe, expect, it } from 'bun:test';
import { Content, type CreatureGenerationContext } from '../src/content';
import templates from '../data/default/templates/deem.templates.json';

describe('compositional creature generation', () => {
  it('uses one constructor for explicit PCs, requested goblins and procedural monsters', () => {
    expect(templates).not.toHaveProperty('fighter_pc');
    expect(templates).not.toHaveProperty('goblin');
    const contexts: CreatureGenerationContext[] = [
      { raceId: 'human', classId: 'fighter', level: 3 },
      { raceId: 'goblin' }, { population: 'monster' }, {},
    ];
    for (const context of contexts) {
      const first = new Content('general').createCreature('entity', context);
      expect(first).toEqual(new Content('general').createCreature('entity', context));
      expect(first.base.level).toBe(context.level ?? 1);
      if (context.raceId) { expect(first.raceId).toBe(context.raceId); }
      if (context.classId) { expect(first.classId).toBe(context.classId); }
      if (context.population === 'monster') { expect(['goblin', 'wisp']).toContain(first.raceId); }
    }
  });
  it('composes shared attributes, honors context overrides, and uses class progression data', () => {
    const context = { raceId: 'goblin', classId: 'cleric', strength: 18,
      constitution: 15, name: 'Chosen' } satisfies CreatureGenerationContext;
    const low = new Content('scaling').createCreature('low', { ...context, level: 1 });
    const high = new Content('scaling').createCreature('high', { ...context, level: 4 });
    expect(high.name).toBe('Chosen');
    expect(high.raceId).toBe('goblin');
    expect(high.classId).toBe('cleric');
    for (const key of ['strength', 'constitution'] as const) { expect(high.base[key]).toBe(low.base[key]); }
    expect(high.base.strength).toBe(18);
    expect(high.base.constitution).toBe(15);
    expect(high.base.maxHp - low.base.maxHp).toBe(3 * Content.classes.cleric!.hpPerLevel);
    expect(high.base.maxMana).toBe(Content.classes.cleric!.mana);
    expect(high.base.abilities).toEqual(Content.classes.cleric!.abilities);
    expect(new Content('alias').generate('character', context))
      .toEqual(new Content('alias').generate('creature', context));
    expect(new Content('attributes').generate('attributes', { strength: 18 }).strength).toBe(18);
  });
  it('keeps race and class independent of allegiance and produces varied unconstrained content', () => {
    const generated = Array.from({ length: 12 }, (_, i) =>
      new Content(`monster:${i}`).createCreature(`monster:${i}`, { population: 'monster' }));
    expect(new Set(generated.map(c => c.raceId)).size).toBeGreaterThan(1);
    for (const c of generated) {
      expect(Content.races[c.raceId]!.classes).toContain(c.classId);
      expect(c).not.toHaveProperty('team');
    }
    const enemy = new Content('class').character('fighter', 'enemy', 'goblins', 'goblin');
    expect(enemy.abilities).toContain('wounding_blow');
    expect(enemy.classId).toBe('fighter');
    expect(enemy.raceId).toBe('goblin');
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
