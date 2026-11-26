import { describe, expect, it } from 'bun:test';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { LocalKinds } from '../../src/canon/local-catalog';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Effects } from '../../src/effects';
import { Advancement } from '../../src/rules/advancement';
import { LevelDrain } from '../../src/rules/level-drain';
import { FieldUse } from '../../src/campaign/field-use';
import { Targeting } from '../../src/targeting';
import { KindDefenses } from '../../src/kind-defenses';
import { VoiceContext } from '../../src/narrative/voice-context';
import { Battle } from '../../src/battle';
import { CombatModel } from '../../src/ui/combat-model';
import { MechanicsText } from '../../src/presentation/mechanics-text';
import type { Effect } from '../../src/lang/parse';
import { Vocabularies, type Vocabulary } from '../../src/lang/vocabulary';
import { CatalogContexts } from '../../src/catalog-context';
import { Canon } from '../../src/canon/canon';
import { ModuleParser } from '../../src/lang/module-parser';
import { CombatProjection } from '../../src/combat-projection';

it('validates local species against the owning vocabulary', () => {
  const vocabulary = CanonVocabulary.scoped();
  expect(() => ModuleParser.parse('Module example "Example" { Species hall_hound "dog" like wolf living in nowhere. }',
    [], vocabulary)).toThrow('unknown habitat nowhere');
  expect(ModuleParser.parse('Module example "Example" { Species hall_hound "dog" like wolf living in wood. }',
    [], vocabulary).catalog?.species?.hall_hound).toMatchObject({ habitats: ['wood'] });
  expect(() => ModuleParser.parse('Module example "Example" { Species hall_engine "engine" like turret. }',
    [], vocabulary)).toThrow('which is no species');
  expect(() => LocalKinds.species('example', { id: 'hall_engine', name: 'engine', like: 'turret' }))
    .toThrow('which is no species');
});
it('rejects local IDs that collide with canonical families or aliases', () => {
  const vocabulary = CanonVocabulary.scoped(), before = vocabulary.fingerprint();
  for (const [id, message] of [['climbing', 'also a skill'], ['healingdraught', 'shadows a canonical alias']] as const) {
    const item = vocabulary.item('example', { id, name: 'rope', base: { category: 'gear' } }, new Set());
    expect(() => vocabulary.install({ items: { [id]: item } })).toThrow(message);
    expect(() => LocalKinds.install({ items: { [id]: item } })).toThrow(message);
  }
  for (const [id, message] of [['human', 'also an ancestry'], ['turret', 'also a device'],
    ['grey_wolf', 'shadows a canonical alias']] as const) {
    const species = vocabulary.species('example', { id, name: 'hound', like: 'wolf' });
    expect(() => vocabulary.install({ species: { [id]: species } })).toThrow(message);
    expect(() => LocalKinds.install({ species: { [id]: species } })).toThrow(message);
  }
  expect(vocabulary.fingerprint()).toBe(before);
  const kept = vocabulary.item('example', { id: 'kept_rope', name: 'kept rope',
    base: { category: 'gear' } }, new Set());
  const rejected = vocabulary.item('example', { id: 'climbing', name: 'rope',
    base: { category: 'gear' } }, new Set());
  expect(() => vocabulary.install({ items: { kept_rope: kept, climbing: rejected } })).toThrow('also a skill');
  expect(vocabulary.itemDefinition('kept_rope')).toBeUndefined();
  expect(() => LocalKinds.install({ items: { kept_rope: kept, climbing: rejected } })).toThrow('also a skill');
  expect(Canon.items.kept_rope).toBeUndefined();
  LocalKinds.activate({ items: { kept_rope: kept } });
  try {
    expect(() => LocalKinds.activate({ items: { climbing: rejected } })).toThrow('also a skill');
    expect(Canon.items.kept_rope?.name).toBe('kept rope');
    const dagger = vocabulary.item('example', { id: 'dagger', name: 'fake dagger', base: { category: 'gear' } }, new Set());
    expect(() => LocalKinds.activate({ items: { dagger } })).toThrow('already in the catalog');
    expect(Canon.items.kept_rope?.name).toBe('kept rope');
    const extra = vocabulary.item('example', { id: 'extra_rope', name: 'extra rope',
      base: { category: 'gear' } }, new Set());
    expect(() => LocalKinds.install({ items: { extra_rope: extra, dagger } })).toThrow('already in the catalog');
    expect(Canon.items.extra_rope).toBeUndefined();
  } finally { LocalKinds.reset(); }
});
it('runs a standalone battle with local species and carried items', () => {
  const vocabulary = CanonVocabulary.scoped();
  vocabulary.install({ species: { local_beast: vocabulary.species('context',
    { id: 'local_beast', name: 'amber wolf', like: 'wolf' }) },
  items: { local_tonic: vocabulary.item('context',
    { id: 'local_tonic', name: 'tonic', base: { like: 'healing_potion' } }, new Set()) } });
  const content = new Content('standalone-combat', undefined, vocabulary);
  const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', gear: ['local_tonic'] });
  const beast = content.createCreature('beast', { raceId: 'local_beast' });
  const combatants = [CombatProjection.fighter(hero, 'fighters', vocabulary),
    CombatProjection.fighter(beast, 'goblins', vocabulary)];
  LocalKinds.reset();
  const battle = new Battle({ id: 'standalone', combatants, abilities: Content.abilities, vocabulary }, 'standalone');
  try {
    expect(battle.vocabulary).toBe(vocabulary);
    expect(battle.original('beast')?.raceId).toBe('local_beast');
    expect(battle.state.combatants.find(f => f.id === 'hero')?.stock?.['item-local_tonic']).toBeDefined();
  } finally { battle.close(); }
});
it('uses a fighter body snapshot for its actions even without its original catalog', () => {
  const vocabulary = CanonVocabulary.scoped();
  vocabulary.install({ species: { local_drake: vocabulary.species('context',
    { id: 'local_drake', name: 'young drake', like: 'drake' }) } });
  const creature = new Content('actions-context', undefined, vocabulary).createCreature('drake', { raceId: 'local_drake' });
  const fighter = CombatProjection.fighter(creature, 'goblins', vocabulary);
  const foreign = CanonVocabulary.scoped();
  foreign.install({ species: { local_drake: foreign.species('other',
    { id: 'local_drake', name: 'wolf', like: 'wolf' }) } });
  expect(Battle.actionsOf(fighter)).toBe(3);
  expect(Battle.actionsOf(fighter, foreign)).toBe(3);
  expect(Battle.actionsOf({ ...fighter, body: null }, vocabulary)).toBe(1);
  const legacy = { ...fighter, raceId: 'drake' };
  delete legacy.body;
  expect(Battle.actionsOf(legacy)).toBe(3);
});
describe('scoped advancement', () => {
  it('validates canonical content independently of an active foreign catalog on a cold start', () => {
    const script = `
      import assert from 'node:assert/strict';
      import { Canon } from './src/canon/canon';
      import { CanonValidation } from './src/canon/canon-validation';
      import { CanonVocabulary } from './src/canon/canon-vocabulary';
      import { LocalKinds } from './src/canon/local-catalog';
      import { Content } from './src/content';
      const item = { ...LocalKinds.item('foreign', { id: 'foreign_inert', name: 'inert',
        base: { category: 'gear' } }), category: 'consumable' };
      const species = { ...Canon.creature('wolf'), statistics: { ...Canon.creature('wolf').statistics,
        riders: { bite: [{ kind: 'unknown' }] } } };
      LocalKinds.activate({ items: { foreign_inert: item }, species: { foreign_beast: species, dagger: species } });
      Content.abilities.push({ id: 'foreign_summon', effects: [{ kind: 'summon',
        creature: 'foreign_beast', target: 'self' }] });
      assert.throws(() => Content.validate(), /Unknown summoned creature/);
      Content.abilities.pop();
      assert.doesNotThrow(() => new Content('scope', undefined, CanonVocabulary.scoped()));
      const dagger = Canon.items.dagger;
      dagger.unexpected = true;
      assert(CanonValidation.problems(true).includes('item dagger: unknown field unexpected'));
      delete dagger.unexpected;
      delete Canon.items.dagger;
      try {
        assert(CanonValidation.problems(true).some(p => p.includes('dagger')));
      } finally { Canon.items.dagger = dagger; LocalKinds.reset(); }
    `;
    const result = Bun.spawnSync([process.execPath, '-e', script], { cwd: process.cwd(), stdout: 'pipe', stderr: 'pipe' });
    expect(result.stderr.toString()).toBe('');
    expect(result.exitCode).toBe(0);
  });
  it('creates campaign catalogs independently of the active language vocabulary', () => {
    const custom: Vocabulary = { id: 'custom', kind: () => undefined, item: () => ({ name: 'custom' }),
      species: () => ({ name: 'custom' }), install: () => { throw new Error('Unsupported'); },
      seen: () => '', ability: () => undefined };
    Vocabularies.use(custom);
    try {
      expect(CatalogContexts.scoped().itemDefinition('dagger')?.name).toBe(Canon.items.dagger?.name);
      expect(Vocabularies.id).toBe('custom');
    } finally { Vocabularies.use(new CanonVocabulary()); }
  });
  it('describes summoned species from the ability owner, including nested effects', () => {
    const make = (name: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ species: { local_beast: vocabulary.species('context',
        { id: 'local_beast', name, like: 'wolf' }) } });
      return vocabulary;
    };
    const a = make('amber wolf'), b = make('silver wolf');
    const summon: Effect = { kind: 'summon', creature: 'local_beast', target: 'self' };
    const nested: Effect = { kind: 'random', effects: [summon], target: 'self' };
    const ability = { ...Content.abilities[0]!, effects: [nested] };
    LocalKinds.activate({ species: { local_beast: b.speciesDefinition('local_beast')! } });
    try {
      expect(MechanicsText.full(ability, undefined, a)).toContain('an amber wolf');
      expect(MechanicsText.gist(ability, undefined, b)).toContain('a silver wolf');
      expect(MechanicsText.full(ability, undefined, a)).not.toContain('silver wolf');
    } finally { LocalKinds.reset(); }
  });
  it('names a local creature in combat from the battle catalog', () => {
    const make = (name: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ species: { local_beast: vocabulary.species('context',
        { id: 'local_beast', name, like: 'wolf' }) } });
      return vocabulary;
    };
    const a = make('amber wolf'), b = make('silver wolf');
    const creature = new Content('combat-context', undefined, a).createCreature('beast', { raceId: 'local_beast' });
    const battle = Battle.encounter(new CreatureStore([creature], a),
      [{ creatureId: creature.id, team: 'goblins' }], { seed: 'combat-context' });
    LocalKinds.activate({ species: { local_beast: b.speciesDefinition('local_beast')! } });
    try { expect(CombatModel.build(battle).foes[0]?.line).toBe('amber wolf'); }
    finally { battle.close(); LocalKinds.reset(); }
  });
  it('uses the scoped species body for targeting and defenses', () => {
    const make = (like: string) => {
      const vocabulary = CanonVocabulary.scoped();
      const beast = vocabulary.species('context', { id: 'local_beast', name: 'beast', like });
      vocabulary.install({ species: { local_beast: beast } });
      return new Content('body-context', undefined, vocabulary).creature('local_beast', 'beast', 'goblins');
    };
    const wolf = make('wolf'), mummy = make('mummy/royal');
    LocalKinds.reset();
    expect(Targeting.bears(wolf, 'animal')).toBe(true);
    expect(Targeting.bears(mummy, 'undead')).toBe(true);
    expect(Targeting.bears(wolf, 'undead')).toBe(false);
    expect(KindDefenses.of(mummy)).toContainEqual({ kind: 'reduction', amount: 5 });
    expect(KindDefenses.of(wolf)).not.toContainEqual({ kind: 'reduction', amount: 5 });
  });
  it('finds a local species domestic ancestry without an active catalog', () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_dog: vocabulary.species('context',
      { id: 'local_dog', name: 'hall dog', like: 'dog' }) } });
    LocalKinds.reset();
    expect(VoiceContext.base('local_dog', vocabulary)).toBe('dog');
  });
  it('keeps fixed combat statistics distinct for species with the same id', () => {
    const make = (attackBonus: number) => {
      const vocabulary = CanonVocabulary.scoped();
      const beast = vocabulary.species('context', { id: 'local_beast', name: 'beast', like: 'wolf' });
      const kind = { ...beast, statistics: { ...vocabulary.creature('wolf').statistics!,
        hitDice: '2d8', attackBonus, saves: { fortitude: attackBonus, reflex: 1, will: 2 } } };
      vocabulary.install({ species: { local_beast: kind } });
      return new Content('fixed-context', undefined, vocabulary).creature('local_beast', 'beast', 'goblins', 2);
    };
    const first = make(4), second = make(10);
    LocalKinds.reset();
    expect(Effects.combatant(first).fixedToHit).toBe(2);
    expect(Effects.combatant(second).fixedToHit).toBe(8);
    expect(Effects.saveModifier(second, 'poison') - Effects.saveModifier(first, 'poison')).toBe(6);
  });
  it('lowers a creature using the hit dice of its campaign species', () => {
    const make = (hitDice: string) => {
      const vocabulary = CanonVocabulary.scoped();
      const beast = vocabulary.species('context', { id: 'local_beast', name: 'beast', like: 'wolf' });
      const kind = { ...beast, statistics: { ...vocabulary.creature('wolf').statistics!, hitDice } };
      vocabulary.install({ species: { local_beast: kind } });
      return vocabulary;
    };
    const a = make('2d4'), b = make('2d12');
    const fighter = { raceId: 'local_beast', constitution: 10, level: 2, maxHp: 20, hp: 20 };
    LocalKinds.reset();
    const other = { ...fighter };
    LevelDrain.lower(fighter, 1, a);
    LevelDrain.lower(other, 1, b);
    expect([fighter.maxHp, other.maxHp]).toEqual([18, 14]);
    const content = new Content('drain-context', undefined, b);
    const target = content.creature('local_beast', 'beast', 'goblins', 2);
    expect(Effects.context({ ...target, level: 4 }).hitDice).toBe(2);
    const hp = target.maxHp;
    LevelDrain.take(target, 1, { turn: 1 });
    expect(target.maxHp).toBe(Math.max(1, hp - 6));
    const removed = target.statuses.filter(s => s.id === LevelDrain.id);
    LevelDrain.without(target, removed);
    expect(target.maxHp).toBe(Math.max(1, hp - 6) + 6);
  });
  it('uses the store catalog for experience and studying with local gear', () => {
    const vocabulary = CanonVocabulary.scoped();
    const beast = vocabulary.species('context', { id: 'local_beast', name: 'beast', like: 'wolf' });
    const valued = { ...beast, worth: { base: 300, perLevel: 20 } };
    vocabulary.install({ species: { local_beast: valued },
      items: { local_ladder: vocabulary.item('context',
        { id: 'local_ladder', name: 'ladder', base: { category: 'gear' }, grants: 'climbing' }, new Set()) } });
    const content = new Content('advancement-context', undefined, vocabulary);
    const creature = content.createCreature('beast', { raceId: 'local_beast' });
    const student = content.createCreature('student', { raceId: 'human', classId: 'warrior',
      outfit: 'own', gear: ['local_ladder'] });
    student.state.advances = { qualities: 1, spells: 0 };
    const store = new CreatureStore([student], vocabulary);
    LocalKinds.reset();
    expect(Advancement.worth(creature, vocabulary)).toBe(300 + 20 * creature.base.level);
    expect(() => FieldUse.study(store, 'school', ['student', 'climbing'])).toThrow('cannot take up');
    FieldUse.study(store, 'school', ['student', 'mending']);
    expect(store.get('student').state.skills).toContain('mending');
  });
});
