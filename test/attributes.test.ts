import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSetting, Deem, Generator, Template, runGeneration } from 'deem';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { CreatureSchema, type Attribute } from '../src/creature';
import { RandomStreams } from '../src/random-streams';
import { Expressions } from '../src/expressions';
import { FantasyRules } from '../src/fantasy-rules';
import templates from '../data/generation/templates/deem.templates.json';

class AttributesTest {
  static cli(options: Parameters<typeof runGeneration>[0]) {
    return runGeneration({ ...options, settingDir: import.meta.dir + '/..' }).output as Record<string, any>;
  }
}

describe('score-only attributes and derived statMod', () => {
  it('uses Orsino\'s statMod, round((score − 10) / 2), in both hosts', () => {
    const expected = [-3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
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
    expect(Generator.gen('probe', { __setting: setting, __deemRuntime: runtime })).toEqual({ low: -3, high: 4 });
  });
  it('emits exactly six scores, omitting internal context and redundant score/modifier fields', () => {
    const context = { _intermediate: 99 };
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
  it('rolls straight 3d6 and adds the ancestry\'s, class\'s and background\'s modifiers, as Orsino\'s overlays do', () => {
    for (const [raceId, classId, backgroundId] of [['human', 'warrior', 'locksmith'], ['elf', 'ranger', 'hunter'],
      ['dwarf', 'cleric', 'medic']] as const) {
      const seed = `overlays:${raceId}`;
      const raw = new Content(RandomStreams.key(seed, 'attributes', 'hero')).generate('attributes');
      const creature = new Content(seed).createCreature('hero', { raceId, classId, backgroundId,
        ...classId === 'warrior' ? { traits: ['brave'] } : classId === 'cleric' ? { traits: ['vitalist'] } : {} });
      for (const key of CreatureSchema.attributes) {
        const add = (Canon.ancestries[raceId]!.attributes[key] ?? 0) + (Canon.classes[classId]!.attributes[key] ?? 0)
          + (Canon.backgrounds[backgroundId]!.attributes[key] ?? 0);
        expect(creature.base[key]).toBe(Math.max(1, (raw[key] as number) + add));
      }
    }
    const chosen = { strength: 3, dexterity: 6, intelligence: 9, wisdom: 12, constitution: 15, charisma: 18 };
    expect(new Content('overrides').generate('attributes', chosen)).toEqual(chosen);
    const creature = new Content('overrides').createCreature('hero', { ...chosen, raceId: 'human', classId: 'warrior' });
    for (const key of CreatureSchema.attributes) { expect(creature.base[key]).toBe(chosen[key]); }
    expect(creature.base).not.toHaveProperty('scores');
    expect(creature.base.maxHp).toBe(12 + 3); // the warrior's hit die plus CON 15's modifier, round(2.5) = 3
    expect(() => CreatureSchema.validate({ ...creature, base: { ...creature.base, scores: chosen } } as never))
      .toThrow('requires migration');
    expect(() => new Content('legacy').createCreature('hero', { strengthScore: 18 } as never)).toThrow('context');
    for (const invalid of [0, -1, 1.5, Infinity]) {
      expect(() => new Content('invalid').createCreature('hero', { strength: invalid })).toThrow('context');
    }
  });
  it('keeps numeric overlays additive through nested generation', () => {
    const seed = 'inheritance';
    const setting = buildSetting({}, {
      attributes: templates.attributes,
      parent: { __no_id: true, strength: 3, '*attributes': '=gen(attributes)', after: '=statMod(#wisdom)' },
    });
    const runtime = Template.bootstrapDeem({ seed }, setting);
    Object.assign(runtime.stdlib, FantasyRules.functions);
    const nested = Generator.gen('parent', { __setting: setting, __deemRuntime: runtime }) as Record<string, number>;
    // Numeric overlays add to existing values; they do not replace them.
    expect(nested.strength).toBeGreaterThan(3);
    expect(nested.after).toBe(FantasyRules.statMod(nested.wisdom));
  });
  it('checks the CLI generation entrypoint, including a nested contextual caller', () => {
    const args = { type: 'attributes', seed: 'attribute-review' };
    const output = AttributesTest.cli(args);
    expect(output).toEqual({ strength: 11, dexterity: 10, intelligence: 8, wisdom: 13, constitution: 7, charisma: 8 });
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
