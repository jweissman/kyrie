import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSetting, Deem, Generator, Template, runGeneration } from 'deem';
import { Content } from '../src/content';
import { CreatureSchema, type Attribute } from '../src/creature';
import { Expressions } from '../src/expressions';
import { FantasyRules } from '../src/fantasy-rules';
import templates from '../data/default/templates/deem.templates.json';

class AttributesTest {
  static cli(options: Parameters<typeof runGeneration>[0]) {
    return runGeneration({ ...options, settingDir: import.meta.dir + '/..' }).output as Record<string, any>;
  }
}

describe('score-only attributes and derived statMod', () => {
  it('uses the Orsino rounding formula for known low, middle and high scores in both hosts', () => {
    const expected = [-2, -2, -2, -1, -1, -1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3];
    const expressions = new Expressions('modifiers');
    for (let score = 3; score <= 18; score++) {
      expect(FantasyRules.statMod(score)).toBe(expected[score - 3]!);
      expect(expressions.integer('statMod(#score)', { score })).toBe(expected[score - 3]!);
    }
    expect(expressions.condition('statMod(#score) < 0', { score: 3 })).toBe(true);
    expect(() => expressions.number('statMod(3)')).toThrow('nonnegative');
    for (const value of [0, -1, 1.5, NaN, Infinity, '10', null]) {
      expect(() => FantasyRules.statMod(value)).toThrow('ability score');
    }
    const setting = buildSetting({}, {
      probe: { __no_id: true, low: '=statMod(3)', high: '=statMod(18)' },
    });
    const runtime = Template.bootstrapDeem({ seed: 'registered' }, setting);
    Object.assign(runtime.stdlib, FantasyRules.functions);
    expect(Generator.gen('probe', { __setting: setting, __deemRuntime: runtime })).toEqual({ low: -2, high: 3 });
  });
  it('emits exactly six scores, omitting internal context and redundant score/modifier fields', () => {
    const context = { primary: 'wisdom', _intermediate: 99 };
    const first = new Content('attributes').generate('attributes', context);
    expect(Object.keys(first).sort()).toEqual([...CreatureSchema.attributes].sort());
    expect(first).toEqual(new Content('attributes').generate('attributes', context));
    expect(first).not.toEqual(new Content('different').generate('attributes', context));
    for (const value of Object.values(first)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value as number).toBeGreaterThanOrEqual(3);
      expect(value as number).toBeLessThanOrEqual(18);
    }
  });
  it('matches six 3d6 rolls without an implicit primary and preserves the actual score distribution', () => {
    const totals = Object.fromEntries(CreatureSchema.attributes.map(key => [key, 0])) as Record<Attribute, number>;
    const values: number[] = [];
    for (let i = 0; i < 256; i++) {
      const seed = `score-distribution:${i}`;
      const out = new Content(seed).generate('attributes');
      const dice = new Deem({ seed: Expressions.seed(seed) });
      for (const key of CreatureSchema.attributes) {
        const score = out[key] as number;
        expect(score).toBe(dice.evaluate('3d6') as number);
        totals[key] += score; values.push(score);
      }
    }
    for (const total of Object.values(totals)) {
      expect(total / 256).toBeGreaterThan(10);
      expect(total / 256).toBeLessThan(11);
    }
    expect(Math.min(...values)).toBe(3);
    expect(Math.max(...values)).toBe(18);
    expect(values.filter(value => value < 10).length / values.length).toBeGreaterThan(0.3);
    expect(values.filter(value => value >= 15).length / values.length).toBeGreaterThan(0.07);
  });
  it('bonuses only the selected primary, caps rolled scores at 18 and respects exact overrides', () => {
    for (const primary of CreatureSchema.attributes) {
      for (let i = 0; i < 12; i++) {
        const seed = `primary:${i}`;
        const plain = new Content(seed).generate('attributes');
        const favored = new Content(seed).generate('attributes', { primary });
        for (const key of CreatureSchema.attributes) {
          expect(favored[key]).toBe(key === primary ? Math.min(18, (plain[key] as number) + 2) : plain[key]);
        }
      }
    }
    const chosen = { strength: 3, dexterity: 6, intelligence: 9, wisdom: 12, constitution: 15, charisma: 18 };
    expect(new Content('overrides').generate('attributes', { ...chosen, primary: 'strength' })).toEqual(chosen);
    const creature = new Content('overrides').createCreature('hero', { ...chosen, classId: 'fighter' });
    for (const key of CreatureSchema.attributes) { expect(creature.base[key]).toBe(chosen[key]); }
    expect(creature.base).not.toHaveProperty('scores');
    expect(creature.base.maxHp).toBeGreaterThan(0);
    expect(() => CreatureSchema.validate({ ...creature, base: { ...creature.base, scores: chosen } } as never))
      .toThrow('requires migration');
    expect(() => new Content('legacy').createCreature('hero', { strengthScore: 18 } as never)).toThrow('context');
    for (const invalid of [0, -1, 1.5, Infinity]) {
      expect(() => new Content('invalid').createCreature('hero', { strength: invalid })).toThrow('context');
    }
    expect(() => new Content('invalid').createCreature('hero', { primary: 'bogus' as never })).toThrow('context');
  });
  it('inherits class/context primary and scores through nested generation and additive overlays', () => {
    const seed = 'inheritance';
    for (const classId of ['fighter', 'cleric', 'magic_user', 'thief', 'commoner'] as const) {
      const context = { raceId: 'human' as const, classId, name: 'Fixed' };
      const fixed = new Content(seed).generate('creature', context);
      const selected = new Content(seed).generate('creature', { ...context, primary: Content.classes[classId]!.primary });
      expect(fixed).toEqual(selected);
      expect(fixed).not.toHaveProperty('_primary');
    }
    const context = { raceId: 'human', classId: 'fighter', name: 'Fixed', primary: 'charisma', strength: 4 };
    const creature = new Content(seed).generate('creature', context);
    const alias = new Content(seed).generate('character', context);
    expect(alias).toEqual(creature);
    expect(creature.strength).toBe(4);
    const baseline = new Content(seed).generate('creature', { ...context, primary: 'strength' });
    expect(creature.charisma).toBe(Math.min(18, (baseline.charisma as number) + 2));
    for (const key of ['dexterity', 'intelligence', 'wisdom', 'constitution']) {
      expect(creature[key]).toBe(baseline[key]);
    }
    const setting = buildSetting({}, {
      attributes: templates.attributes,
      parent: { __no_id: true, _primary: 'wisdom', strength: 3,
        '*attributes': '=gen(attributes)', after: '=statMod(#wisdom)' },
    });
    const runtime = Template.bootstrapDeem({ seed }, setting);
    Object.assign(runtime.stdlib, FantasyRules.functions);
    const nested = Generator.gen('parent', { __setting: setting, __deemRuntime: runtime }) as Record<string, number>;
    // Numeric overlays add to existing values; they do not replace them.
    expect(nested.strength).toBe(6);
    expect(nested.after).toBe(FantasyRules.statMod(nested.wisdom));
    expect(nested).not.toHaveProperty('_primary');
  });
  it('checks the CLI generation entrypoint, including a nested contextual caller', () => {
    const args = { type: 'attributes', seed: 'attribute-review' };
    const output = AttributesTest.cli(args);
    expect(output).toEqual({ strength: 12, dexterity: 9, intelligence: 9, wisdom: 9, constitution: 10, charisma: 15 });
    expect(AttributesTest.cli(args)).toEqual(output);
    const dir = mkdtempSync(join(tmpdir(), 'kyr-attributes-'));
    try {
      writeFileSync(join(dir, 'templates.json'), JSON.stringify({
        attributes: templates.attributes,
        caller: { __no_id: true, _primary: 'wisdom', strength: 3, charisma: 18, child: '=gen(attributes)' },
      }));
      const nested = AttributesTest.cli({ type: 'caller', seed: 'attribute-review',
        templatesPath: join(dir, 'templates.json') });
      expect(nested.child.strength).toBe(3);
      expect(nested.child.charisma).toBe(18);
      expect(Object.keys(nested.child).sort()).toEqual([...CreatureSchema.attributes].sort());
      expect(nested).not.toHaveProperty('_primary');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
