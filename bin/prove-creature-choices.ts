import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import templates from '../data/generation/templates/deem.templates.json';
import tables from '../data/generation/tables/deem.tables.json';
import { CreatureDefinition } from '../src/creature-definition';
import { Canon } from '../src/canon/canon';
import { CombatProjection } from '../src/combat-projection';
import { Battle } from '../src/battle';
import { Content } from '../src/content';

// CLI fixtures and assertions only: selection and composition remain in the checked-in Deem grammar.
class ChoiceProof {
  static readonly contexts = {
    creature: {}, forest: { terrain: 'forest' }, dragons: { family: 'dragon' },
    blue_ancient: { family: 'dragon', lineage: 'blue', maturity: 'ancient' },
    animals: { family: 'animal' }, people: { family: 'humanoid' },
    constructs: { family: 'construct' }, frost: { terrain: 'frost' },
    dragon: {}, animal: {}, humanoid: {}, construct: {},
    bear_fixed: { body: 'bear', adaptation: 'frost' },
    ranger_fixed: { raceId: 'elf', classId: 'ranger', weapon: 'shortbow', terrain: 'forest' },
    guardian_fixed: { body: 'golem', material: 'stone', role: 'guardian', level: 4 },
  };
  static publicTypes = ['creature', 'dragon', 'animal', 'humanoid', 'construct'];
  static targets: Record<string, string> = { blue_ancient: 'dragon', bear_fixed: 'animal',
    ranger_fixed: 'humanoid', guardian_fixed: 'construct' };
  // Constraints given to the general generator without a family: each must reach a family that owns it.
  static routed = Object.fromEntries(Object.entries({ via_lineage: ['creature', { lineage: 'green' }],
    via_material: ['creature', { material: 'stone' }], via_class: ['creature', { classId: 'ranger' }],
    via_body: ['creature', { body: 'cave_spider' }], via_maturity: ['creature', { maturity: 'wyrmling', terrain: 'frost' }],
    foreign_class: ['animal', { classId: 'ranger' }], mixed: ['creature', { lineage: 'red', classId: 'ranger' }] } as const)
    .map(([id, [type, context]]) => [id, { __no_id: true, _parameters: context, '*creature': `=gen(${type}, #_parameters)` }]));
  static prepare(dir: string) {
    const callers = Object.fromEntries(Object.entries(this.contexts).filter(([id]) => !this.publicTypes.includes(id))
      .map(([id, context]) => [id, { __no_id: true, _parameters: context, '*creature': '=gen(' + (this.targets[id] ?? 'creature') + ', #_parameters)' }]));
    writeFileSync(join(dir, 'templates.json'), JSON.stringify({ ...templates, ...callers,
      impossible: { __no_id: true, _parameters: { lineage: 'blue', terrain: 'forest' }, '*creature': '=gen(dragon, #_parameters)' },
      ...this.routed }));
    const extended = structuredClone(tables);
    const variants = extended as Record<string, any>;
    const boar = Canon.creature('boar');
    variants.creatureBody.groups.boar = [{ raceId: 'boar', hitDie: boar.statistics!.hitDie,
      weapon: boar.statistics!.weapon, armor: boar.statistics!.armor, abilities: boar.abilities,
      traits: [], trace: ['body:boar'] }];
    variants.creatureKinds.groups.animal.push({ ...extended.creatureKinds.groups.animal[0], __weight: 1,
      body: 'boar', raceId: 'boar', _terrains: { any: true, marsh: true },
      _adaptationTerrains: { none: { any: true, marsh: true }, marsh: { any: true, marsh: true } } });
    variants.dragonLineage.groups.jade = [{ _key: 'jade', _terrains: { any: true, forest: true },
      abilities: ['breathe_acid'], traits: ['acid_lineage'], trace: ['lineage:jade'] }];
    writeFileSync(join(dir, 'extended-tables.json'), JSON.stringify(extended));
    writeFileSync(join(dir, 'extension-additions.json'), JSON.stringify({
      body: variants.creatureBody.groups.boar,
      eligibility: variants.creatureKinds.groups.animal.at(-1), lineage: variants.dragonLineage.groups.jade,
    }));
  }
  static require(condition: unknown, message: string): asserts condition {
    if (!condition) { throw new Error(message); }
  }
  static combat(raw: Record<string, any>) {
    const actor = CombatProjection.fighter(CreatureDefinition.accept('generated', raw), 'fighters');
    const target = CombatProjection.fighter(new Content('choice-proof').createCreature('target',
      { raceId: 'human', classId: 'warrior', level: 20 }), 'goblins');
    const battle = new Battle({ id: 'choices', combatants: [actor, target], abilities: Content.abilities }, 'choices');
    while (battle.state.actor !== actor.id && !battle.state.outcome) {
      battle.step(battle.legalCommands().find(c => c.ability === 'defend')!);
    }
    const action = raw.abilities.find((a: string) => a.startsWith('breathe_'))
      ?? (actor.equipment.weapon.missile ? 'ranged' : 'melee');
    const command = battle.legalCommands().find(c => c.ability === action);
    this.require(command, `Generated ${raw.name} cannot execute ${action}`);
    battle.step(command);
    battle.close();
    this.require(battle.events.some(e => e.type === 'attack' || e.type === 'damage'), 'Generated attack did not resolve');
    return { name: raw.name, action, events: battle.events };
  }
  static distinct(results: Record<string, any[]>, id: string, key: string) {
    return [...new Set(results[id]!.map(r => r[key]).filter(Boolean))].sort();
  }
  static verify(dir: string) {
    const results: Record<string, any[]> = {};
    for (const id of Object.keys(this.contexts)) {
      results[id] = Array.from({ length: 32 }, (_, seed) => {
        const raw = JSON.parse(readFileSync(join(dir, `${id}-${seed}.json`), 'utf8'));
        CreatureDefinition.accept(`${id}-${seed}`, raw);
        const kind = Object.values(tables.creatureKinds.groups).flat().find(k => k.family === raw.family
          && k.raceId === raw.raceId && (!('body' in k) || k.body === raw.body)) as Record<string, any>;
        this.require(kind, `Missing eligibility row for ${raw.name}`);
        this.require(kind._adaptations[raw.adaptation], 'Adaptation is incompatible with the body');
        if (raw.classId) { this.require(kind._classes[raw.classId], 'Class is outside the compatible pool'); }
        if (raw.role) { this.require(kind._roles[raw.role], 'Role is outside the compatible pool'); }
        const context = (this.contexts as Record<string, Record<string, string | number>>)[id]!;
        const terrain = context.terrain as string | undefined;
        if (terrain) {
          this.require(kind._terrains[terrain], `Wrong body for ${context.terrain}`);
          const adaptation = (tables.environmentAdaptation.groups as Record<string, any>)[raw.adaptation][0];
          this.require(adaptation._terrains[terrain], 'Wrong adaptation climate');
          this.require(kind._adaptationTerrains[raw.adaptation]?.[terrain], 'Adaptation cannot support this body here');
          if (raw.family === 'dragon') {
            const lineage = (tables.dragonLineage.groups as Record<string, any>)[raw.lineage][0];
            this.require(lineage._terrains[terrain], 'Wrong lineage habitat');
          }
        }
        for (const [key, value] of Object.entries(context)) { this.require(raw[key] === value, `Lost ${key} constraint`); }
        return { seed: `choice-${'x'.repeat(seed)}`, family: raw.family, body: raw.body, raceId: raw.raceId,
          lineage: raw.lineage, maturity: raw.maturity, classId: raw.classId,
          material: raw.material, role: raw.role, adaptation: raw.adaptation };
      });
    }
    this.require(this.distinct(results, 'creature', 'family').length >= 4, 'Unconstrained CLI did not cover all four families');
    this.require(this.distinct(results, 'animals', 'body').length >= 2, 'Animal body is still fixed');
    this.require(this.distinct(results, 'people', 'raceId').length >= 2 && this.distinct(results, 'people', 'classId').length >= 2, 'Ancestry/class is still fixed');
    this.require(this.distinct(results, 'dragons', 'lineage').length >= 5 && this.distinct(results, 'dragons', 'maturity').length >= 4, 'Dragon choices are still fixed');
    this.require(this.distinct(results, 'constructs', 'material').length >= 2 && this.distinct(results, 'constructs', 'role').length >= 2, 'Construct dimensions are still fixed');
    const extensions = Array.from({ length: 128 }, (_, seed) => {
      const raw = JSON.parse(readFileSync(join(dir, `extended-${seed}.json`), 'utf8'));
      CreatureDefinition.accept(`extended-${seed}`, raw);
      return raw;
    });
    const boar = extensions.find(r => r.body === 'boar'), jade = extensions.find(r => r.lineage === 'jade');
    this.require(boar && jade, 'New body/lineage did not enter unconstrained generation');
    return { command: 'bash test/smoke-deem-choices.sh', seeds: 32, extensionSeeds: 128, invocations: 608,
      diversity: Object.fromEntries(Object.keys(results).map(id => [id, Object.fromEntries(
        ['family', 'body', 'raceId', 'lineage', 'maturity', 'classId', 'material', 'role', 'adaptation']
          .map(key => [key, this.distinct(results, id, key)] as const).filter(([, values]) => values.length))])),
      results, extensionAdditions: JSON.parse(readFileSync(join(dir, 'extension-additions.json'), 'utf8')),
      extensionExamples: [boar, jade], combat: [this.combat(boar), this.combat(jade)],
      examples: ['creature', 'dragon', 'animal', 'humanoid', 'construct', 'forest', 'blue_ancient',
        'bear_fixed', 'ranger_fixed', 'guardian_fixed'].map(id => ({
        command: `deem run --type ${id} --seed choice-${this.publicTypes.includes(id) ? '' : ' --templates "$fixture/templates.json"'}`,
        output: JSON.parse(readFileSync(join(dir, `${id}-0.json`), 'utf8')),
      })) };
  }
}
const [phase, dir] = Bun.argv.slice(2);
if (!dir) { throw new Error('Use bash test/smoke-deem-choices.sh'); }
if (phase === 'prepare') { ChoiceProof.prepare(dir); }
else if (phase === 'verify') { console.log(JSON.stringify(ChoiceProof.verify(dir), null, 2)); }
else { throw new Error('Expected prepare or verify'); }
