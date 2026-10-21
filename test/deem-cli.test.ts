import { describe, expect, it } from 'bun:test';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runGeneration, type DeemValue } from 'deem';
import { CreatureDefinition } from '../src/creature-definition';
import { CombatProjection } from '../src/combat-projection';
import { Battle } from '../src/battle';
import { Canon } from '../src/canon/canon';
import { Creation } from '../src/rules/creation';
import { Effects } from '../src/effects';
import additions from '../doc/generation/authoring-additions.json';
import { Content } from '../src/content';
import { GenerationSetting } from '../src/generation-setting';
const { tables, templates } = GenerationSetting;

class Cli {
  static run(args: string[]): Record<string, DeemValue> {
    const options: Parameters<typeof runGeneration>[0] = { seed: 'public-cli', settingDir: process.cwd() };
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i] === '--type' ? 'type' : args[i] === '--templates' ? 'templatesPath' : args[i] === '--seed' ? 'seed' : 'tablesPath';
      options[key] = args[i + 1];
    }
    return runGeneration(options).output as Record<string, DeemValue>;
  }
  static configured(parameters: Record<string, DeemValue>, seed = 'public-cli', type = 'creature') {
    const dir = mkdtempSync(join(tmpdir(), 'kyr-deem-cli-'));
    const path = join(dir, 'templates.json');
    writeFileSync(path, JSON.stringify({ ...templates, smoke: { __no_id: true, _parameters: parameters, '*result': `=gen(${type}, #_parameters)` } }));
    try { return Cli.run(['--templates', path, '--type', 'smoke', '--seed', seed]); }
    finally { rmSync(dir, { recursive: true, force: true }); }
  }
  static execute(raw: Record<string, DeemValue>, capability: string) {
    const actor = CombatProjection.fighter(CreatureDefinition.accept('generated', raw), 'fighters');
    const other = CombatProjection.fighter(new Content('target').createCreature('target',
      { raceId: 'human', classId: 'warrior', level: 20 }), 'goblins');
    const battle = new Battle({ id: 'cli', combatants: [actor, other], abilities: Content.abilities }, 'cli');
    while (battle.state.actor !== actor.id) { battle.step(battle.legalCommands().find(c => c.ability === 'defend')!); }
    const requested = capability === 'attack' ? actor.equipment.weapon.missile ? 'ranged' : 'melee' : capability;
    const command = battle.legalCommands().find(c => c.ability === requested);
    expect(command).toBeDefined();
    battle.step(command!);
    battle.close();
    return battle.events;
  }
}

describe('Deem public CLI entry point is the generator', () => {
  it('runs the checked-in default setting without a Kyr runtime', () => {
    const raw = Cli.run(['--type', 'creature']);
    expect(CreatureDefinition.accept('default', raw).base.maxHp).toBeGreaterThan(0);
    expect(Cli.execute(raw, 'attack').some(e => e.type === 'attack')).toBe(true);
  });
  it('passes lineage and maturity parameters through ordinary caller templates', () => {
    const blue = Cli.configured({ family: 'dragon', lineage: 'blue', maturity: 'young' });
    const red = Cli.configured({ family: 'dragon', lineage: 'red', maturity: 'ancient' });
    expect(blue).toMatchObject({ level: 3, maxHp: 36, abilities: ['breathe_lightning'] });
    expect(red).toMatchObject({ level: 12, maxHp: 180, abilities: ['breathe_fire'] });
    expect(Cli.execute(blue, 'breathe_lightning').some(e => e.type === 'damage' && e.damageType === 'lightning')).toBe(true);
  });
  it('composes one adaptation with a wolf, a ranger and the newly declared construct family', () => {
    for (const family of ['animal', 'humanoid', 'construct']) {
      const raw = Cli.configured({ family, adaptation: 'frost' });
      expect(raw.traits).toContain('frost_adapted');
      const c = CreatureDefinition.accept('adapted', raw);
      expect(c.generation?.trace).toContain('adaptation:frost');
      const events = Cli.execute(raw, 'attack');
      expect(events.some(e => e.type === 'attack')).toBe(true);
      if (family === 'construct') {
        expect(events.find(e => e.type === 'attack')).toMatchObject({ weapon: 'slam' });
        expect(Cli.execute(raw, 'smash').some(e => e.type === 'damage' && e.damageType === 'bludgeoning')).toBe(true);
      }
    }
  });
  it('honors compatible kinds and scoped category constraints and filters combined climate requests before choosing', () => {
    for (const seed of ['cold-one', 'cold-two', 'cold-three', 'cold-four']) {
      const raw = Cli.configured({ terrain: 'frost', adaptation: 'none' }, seed);
      expect(raw.adaptation).toBe('none');
      expect(raw.body).not.toBe('bear');
      expect(CreatureDefinition.accept(seed, raw).base.maxHp).toBeGreaterThan(0);
    }
    expect(Cli.configured({ family: 'animal', body: 'bear' }).raceId).toBe('bear');
    expect(Cli.configured({ family: 'humanoid', classId: 'warrior' }).family).toBe('humanoid');
    expect(Cli.configured({ family: 'dragon', lineage: 'blue', maturity: 'ancient' })).toMatchObject({
      family: 'dragon', lineage: 'blue', maturity: 'ancient', level: 12,
    });
  });
  it('adds a dragon-only dimension without changing creature dispatch or TypeScript generation', () => {
    const dir = mkdtempSync(join(tmpdir(), 'kyr-deem-extension-'));
    const t = structuredClone(tables) as Record<string, any>;
    t.dragonDemeanor = { discriminator: 'demeanor', groups: {
      watchful: [{ traits: ['perceptive'], trace: ['demeanor:watchful'] }],
    } };
    const extended = { ...templates, dragon: { ...templates.dragon, _body: '=gen(watchful_dragon_body)' },
      watchful_dragon_body: { __no_id: true, '*dragon': "=gen('_dragon_body')",
        '*demeanor': "=select(dragonDemeanor, defined('demeanor') ? #demeanor : default)" },
      smoke: { __no_id: true, _parameters: { family: 'dragon', demeanor: 'watchful' },
        '*creature': '=gen(creature, #_parameters)' } };
    writeFileSync(join(dir, 'tables.json'), JSON.stringify(t));
    writeFileSync(join(dir, 'templates.json'), JSON.stringify(extended));
    try {
      const raw = Cli.run(['--tables', join(dir, 'tables.json'), '--templates', join(dir, 'templates.json'), '--type', 'smoke']);
      expect(raw.traits).toContain('perceptive');
      expect(CreatureDefinition.accept('watchful', raw).generation?.trace).toContain('demeanor:watchful');
      expect(extended.creature).toEqual(templates.creature);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  it('runs each public category directly and scopes numeric parameters without additive caller corruption', () => {
    for (const type of ['dragon', 'animal', 'humanoid', 'construct']) {
      const raw = Cli.run(['--type', type]);
      expect(raw.family).toBe(type);
      expect(CreatureDefinition.accept(type, raw).base.maxHp).toBeGreaterThan(0);
    }
    const raw = Cli.configured({ classId: 'ranger', level: 4, name: 'Warden' }, 'scoped', 'humanoid');
    expect(raw.level).toBe(4);
    expect(raw.name).toBe('Warden');
    expect(CreatureDefinition.accept('warden', raw).base.maxMana).toBe(6);
  });

});

describe('checked-in generation facts stay executable', () => {
  it('matches canonical natural equipment and base statistics without runtime injection', () => {
    for (const rows of Object.values(tables.creatureBody.groups)) {
      for (const row of rows) {
        const body = Canon.creature(row.raceId).statistics!;
        expect(row.weapon).toBe(body.weapon);
        expect(row.armor).toBe(body.armor ?? '');
        expect(row.hitDie).toBe(body.hitDie);
        if ('fixedHp' in row) { expect(row.fixedHp).toBe(body.hitPoints!); }
      }
    }
    for (const [id, rows] of Object.entries(tables.creatureClass.groups)) {
      const c = Canon.classes[id]!;
      expect(rows[0]!.weapons).toEqual(c.weapons.filter(i => Creation.canEquip(id, i)));
      expect(rows[0]!.armors).toEqual(c.armor.filter(i => Creation.canEquip(id, i)));
      expect(rows[0]!.abilities).toEqual(c.abilities.filter(a => Creation.executable(a)));
    }
  });
  it('uses ordinary Deem arithmetic for the same HP and slot rules Kyr validates', () => {
    for (const level of [1, 4]) {
      const raw = Cli.configured({ family: 'humanoid', classId: 'ranger', level });
      expect(raw.maxHp).toBe(Creation.hitPoints(10, level, raw.constitution as number));
      expect(raw.maxMana).toBe(2 + level);
    }
  });
});

describe('species and variants are data, not construction patterns', () => {
  it('generates a bear, copper dragon, frost bear and stone guardian through existing patterns', () => {
    const bear = Cli.configured({ family: 'animal', body: 'bear', adaptation: 'none' });
    const frost = Cli.configured({ family: 'animal', body: 'bear', adaptation: 'frost' });
    const copper = Cli.configured({ family: 'dragon', lineage: 'copper', maturity: 'adult' });
    const stone = Cli.configured({ family: 'construct', body: 'golem', material: 'stone', role: 'guardian', adaptation: 'none' });
    const plainBody = CreatureDefinition.accept('bear', bear), frostBody = CreatureDefinition.accept('frost', frost);
    expect(plainBody.base).toEqual(frostBody.base);
    expect(bear).toMatchObject({ raceId: 'bear', weapon: 'claws', armor: 'fur' });
    expect(frost.traits).toContain('frost_adapted');
    expect(Effects.modifiers(CombatProjection.fighter(frostBody, 'fighters')).resistances?.cold).toBe(.5);
    expect(copper).toMatchObject({ raceId: 'dragon', abilities: ['breathe_acid'], maxHp: 99 });
    expect(stone).toMatchObject({ raceId: 'golem', name: 'Stone guardian', maxHp: 17, constitution: 19,
      traits: ['construct', 'formidable'] });
    expect(Cli.execute(bear, 'smash').some(e => e.type === 'damage')).toBe(true);
    expect(Cli.execute(copper, 'breathe_acid').some(e => e.type === 'damage' && e.damageType === 'acid')).toBe(true);
    expect(Cli.execute(stone, 'smash').some(e => e.type === 'damage' && e.modifiers?.bonus === 3)).toBe(true);
    for (const name of ['creature_bear', 'creature_copper', 'creature_frost_bear', 'creature_stone_guardian', 'creature_wolf']) {
      expect(templates).not.toHaveProperty(name);
    }
  });
  it('uses the documented additions verbatim and requires no frost-bear row', () => {
    for (const [table, groups] of Object.entries(additions.deemRows)) {
      for (const [group, row] of Object.entries(groups)) {
        if (table === 'creatureKinds') {
          for (const entry of row as unknown[]) {
            expect((tables as Record<string, any>)[table].groups[group]).toContainEqual(entry);
          }
        } else { expect((tables as Record<string, any>)[table].groups[group]).toEqual(row); }
      }
    }
    expect<unknown>(Canon.species.bear).toEqual(additions.kyrSpecies.bear);
    expect(tables.creatureFamilies.groups).not.toHaveProperty('bear');
    expect(tables.creatureBody.groups).not.toHaveProperty('frost_bear');
    expect(tables.creatureBody.groups).not.toHaveProperty('stone_guardian');
  });
});
