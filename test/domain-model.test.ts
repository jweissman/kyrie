import { describe, expect, it } from 'bun:test';
import snapshot from '../data/orsino/registry.json';
import { AbilityUse } from '../src/ability-use';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Expressions } from '../src/expressions';
import { ItemCatalog } from '../src/item-catalog';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { Overlays } from '../src/overlays';
import { OrsinoMonsters } from '../src/registry/orsino-monsters';
import { OrsinoRegistry } from '../src/registry/orsino-registry';
import type { RegistrySnapshot } from '../src/registry/orsino-extract';
import type { CombatEvent } from '../src/model';

const registry = new OrsinoRegistry(snapshot as unknown as RegistrySnapshot, { records: [] });
const source = (id: string) => registry.entry(id).definition as Record<string, unknown>;

class Probe {
  static creature(id: string, context: Parameters<Content['createCreature']>[1]) {
    return new Content(id).createCreature(id, context);
  }
  static cast(caster: ReturnType<typeof Probe.creature>, ability: string, target = caster) {
    const actor = CombatProjection.fighter(caster, 'fighters');
    const recipient = target === caster ? actor : CombatProjection.fighter(target, 'fighters');
    const events: CombatEvent[] = [];
    const definition = Content.abilities.find(a => a.id === ability)!;
    AbilityUse.perform(definition, recipient.id, new Expressions(ability), {
      actor, fighters: [actor, ...recipient === actor ? [] : [recipient]], turn: 1, events,
      content: new Content(ability),
      abilities: Content.abilities.map(a => a.id), retreat: false, location: null });
    return { actor, recipient, events };
  }
  // A hostile mutation of the catalogs, undone afterwards: proves that validation rejects the category error.
  static rejects(mutate: () => () => void, message: RegExp) {
    const undo = mutate();
    try { expect(CanonValidation.problems().join('\n')).toMatch(message); } finally { undo(); }
    expect(CanonValidation.problems()).toEqual([]);
  }
}

describe('1-3: peoples, species, variants and aspects', () => {
  it('keeps a playable ancestry and a creature species in different, disjoint catalogs', () => {
    expect(Canon.isAncestry('human') && !Canon.isSpecies('human')).toBe(true);
    expect(Canon.isSpecies('wolf') && !Canon.isAncestry('wolf') && !Canon.classes.wolf).toBe(true);
    const human = Probe.creature('aldo', { raceId: 'human', classId: 'fighter' });
    const wolf = Probe.creature('grey', { raceId: 'wolf', classId: 'wolf' });
    expect(human.base.abilities).toContain('attack');
    expect(wolf.base.abilities).toEqual(['rending_bite', 'flee']);
    expect(() => ModuleParser.parse('Module m "m" { Person w "W" at x { Species wolf. Calling fighter. } Goal false. }'))
      .toThrow('a species has no ancestry or calling');
  });

  it('resolves a variant from its base species: frost wolf of wolf, red dragon of the Orsino dragon', () => {
    const frost = Canon.creature('frost_wolf'), wolf = Canon.creature('wolf');
    expect(frost.variantOf).toBe('wolf');
    expect(frost.type).toBe(wolf.type);
    expect(frost.habitats).toEqual(wolf.habitats);
    expect(frost.abilities).toContain('rime_bite');
    const red = Canon.creature('red_dragon'), dragon = Canon.creature('dragon');
    expect(red.statistics).toEqual(dragon.statistics);
    expect(red.abilities).toEqual(['fire_breath', 'bite']);
    expect(dragon.abilities).toEqual(['bite']);
  });

  it('composes a constructed guardian from Orsino tables: construct type, construct nature, iron substance', () => {
    const iron = OrsinoMonsters.compose(id => registry.entry(id), { monsterClass: 'construct', monsterType: 'Golem',
      aspect: 'wildtype', terrain: 'cave', rank: 'minor', level: 1, substance: 'iron' });
    const golem = Canon.creature('iron_golem');
    expect(golem.statistics!.attributes).toEqual({ strength: iron.scores.str, dexterity: iron.scores.dex,
      constitution: iron.scores.con, intelligence: iron.scores.int, wisdom: iron.scores.wis,
      charisma: iron.scores.cha });
    expect(golem.statistics!.hitPoints).toBe(iron.hitPoints);
    expect([golem.type, golem.traits]).toEqual(['construct', ['construct']]);
    const body = CombatProjection.fighter(Probe.creature('hulk', { raceId: 'iron_golem', classId: 'iron_golem' }), 'goblins');
    expect(Effects.immune(body, 'poison') && Effects.immune(body, 'sleep')).toBe(true);
    expect(Effects.resistance(body, 'slashing')).toBe(0.5);
    expect(Canon.creature('bronze_construct').type).toBe('construct');
    expect(Canon.creature('bronze_construct').traits ?? []).toEqual([]);
  });
});

describe('4-6: classes, specializations, backgrounds, feats, spells and traits', () => {
  it('gives a life-domain cleric the domain spells it can cast at its level, as Orsino does', () => {
    expect(Canon.classes.cleric!.specializations).toEqual(['vitalist', 'lightbringer']);
    const novice = Probe.creature('novice', { classId: 'cleric', raceId: 'dwarf', traits: ['vitalist'] });
    const elder = Probe.creature('elder', { classId: 'cleric', raceId: 'dwarf', traits: ['vitalist'], level: 3 });
    expect(novice.base.abilities).toContain('cure_minor');
    expect(novice.base.abilities).not.toContain('resist_fire');
    expect(elder.base.abilities).toContain('resist_fire');
    expect(Canon.abilities.resist_fire!.spell).toEqual({ tradition: 'divine', level: 2, domain: 'life' });
    expect(source('divineSpell:resist_fire').domain).toBe('life');
    expect(() => Probe.creature('wrong', { classId: 'thief', raceId: 'human', traits: ['vitalist'] }))
      .toThrow('requires the cleric class');
    const abjurer = Probe.creature('warder', { classId: 'magic_user', raceId: 'elf', traits: ['abjurer'], level: 5 });
    expect(abjurer.base.abilities.filter(a => Canon.abilities[a]?.spell?.school === 'abjuration')).toEqual([]);
  });

  it('distinguishes a background, a profession and a feat by what each contributes', () => {
    const hunter = Overlays.contributions({ backgroundId: 'hunter' });
    expect(hunter.filter(c => c.kind === 'skill').map(c => c.value)).toEqual(['woodcraft']);
    expect(Canon.backgrounds.hunter!.attributes).toEqual({ dexterity: 2, wisdom: 1, constitution: 1 });
    const keeper = Canon.backgrounds.innkeeper!;
    expect([keeper.use, keeper.offers?.[0]?.kind, keeper.routine]).toEqual(['profession', 'lodging', 'keeping the inn']);
    const knight = Probe.creature('dame', { classId: 'fighter', raceId: 'human', traits: ['knight'], level: 3 });
    expect(Effects.saveModifier(CombatProjection.fighter(knight, 'fighters'), 'magic')).toBe(2);
    expect(Object.keys(Canon.traits.knight!.omits!)).toContain('ac');
    expect(() => Probe.creature('squire', { classId: 'fighter', raceId: 'human', traits: ['knight'] })).toThrow('level 3');
  });

  it('treats a spell and a passive trait as different things with the same modifier vocabulary', () => {
    const elder = Probe.creature('elder', { classId: 'cleric', raceId: 'dwarf', traits: ['vitalist'], level: 3 });
    const ally = Probe.creature('ally', { classId: 'fighter', raceId: 'human' });
    const { recipient } = Probe.cast(elder, 'resist_fire', ally);
    expect(recipient.statuses.map(s => s.id)).toEqual(['fireproof']);
    expect(Effects.resistance(recipient, 'fire')).toBe(0.5);
    expect(Canon.conditions.fireproof).toBeDefined();
    expect(Canon.traits.fire_affinity!.category).toBe('affinity');
    const salamander = CombatProjection.fighter(Probe.creature('sal', { classId: 'fighter', raceId: 'human',
      traits: [] }), 'fighters');
    salamander.traits = ['fire_affinity'];
    expect([Effects.resistance(salamander, 'fire'), Effects.immune(salamander, 'breath'), salamander.statuses])
      .toEqual([0.5, true, []]);
  });
});

describe('7-11: equipment, monsters, theology, ecology and local mechanisms', () => {
  it('describes a weapon by its dice and grants the strike that executes them', () => {
    const sword = Canon.items.longsword_of_flames!;
    expect(sword.damage).toEqual({ dice: '1d8', type: 'piercing' });
    expect(sword.rider).toEqual({ dice: '1d6', type: 'fire', on: 'hit' });
    expect(source('equipment:longsword_of_flames')).toMatchObject({ damage: '1d8', type: 'piercing' });
    const knight = Probe.creature('rhys', { classId: 'fighter', raceId: 'human', gear: ['longsword_of_flames'] });
    expect(knight.state.inventory).toEqual([{ id: 'rhys__longsword_of_flames', definition: 'longsword_of_flames', equipped: true }]);
    expect(CombatProjection.fighter(knight, 'fighters').abilities).toContain('flame_strike');
    expect(ItemCatalog.get('longsword_of_flames_typed')).toBe(ItemCatalog.get('longsword_of_flames'));
  });

  it('gives a monster its special abilities as natural abilities, not as a class', () => {
    expect(Canon.abilities.fire_breath!.kind).toBe('natural');
    expect(Content.classes.red_dragon!.abilities).toEqual(['fire_breath', 'bite']);
    expect(Canon.classes.red_dragon).toBeUndefined();
  });

  it('models Orsino theology around domains: deities, blessings and the cleric specialization that opens them', () => {
    expect(Canon.deities.brigid).toMatchObject({ name: 'Brigid', domains: ['knowledge', 'life', 'love', 'order'], gender: 'female' });
    expect(Canon.domains.life!.blessing!.modifiers).toEqual({ resistances: { poison: 1 }, immune: ['disease'] });
    expect(Object.keys(Canon.domains.life!.blessing!.omits!)).toEqual(['bonusHealing', 'onTurnEnd']);
    expect(Canon.traits.vitalist!.spellAccess).toEqual({ tradition: 'divine', domain: 'life' });
    expect(Canon.domains.order!.spellDomain).toBe('law');
    expect(Canon.deities.veyra!.blessing!.id).toBe('wayfarer_blessing');
    expect(Content.abilities.some(a => a.id === 'wayfarer_blessing')).toBe(true);
  });

  it('keeps organisms apart from creature definitions while linking each to what represents it in play', () => {
    const yarrow = Canon.organisms.yarrow!, wolf = Canon.organisms.grey_wolf!;
    expect([yarrow.kind, yarrow.yields, Canon.items[yarrow.yields!]!.category]).toEqual(['plant', 'yarrow_poultice', 'consumable']);
    expect([wolf.kind, wolf.species, Canon.creature(wolf.species!).type]).toEqual(['animal', 'wolf', 'beast']);
    expect(Canon.habitats.woodland!.terrain).toBe('forest');
    expect(Canon.resolve('organisms', 'greywolf')).toBe('grey_wolf');
  });

  it('declares a site mechanism inside its site, never in the global ability catalog', () => {
    const site = ModuleParser.parse('Module m "m" { Hazard rotten_rung "A rotten rung" means "Deal (1d6) physical damage to ally unless dexterity save against (12).". Goal false. }');
    expect(site.entities).toEqual([{ id: 'rotten_rung', type: 'hazard', name: 'A rotten rung',
      effect: 'Deal (1d6) physical damage to ally unless dexterity save against (12).' }]);
    expect(ModuleWriter.write(site)).toContain('Hazard rotten_rung "A rotten rung" means');
    for (const id of ['ladder_fall', 'heave_strain', 'foundry_steam', 'censer_counterweight']) {
      expect(Object.hasOwn(Canon.abilities, id)).toBe(false);
    }
  });
});

describe('preventive validation', () => {
  it('rejects category errors and broken references', () => {
    Probe.rejects(() => { Canon.classes.wolf = Canon.classes.fighter!; return () => { delete Canon.classes.wolf; }; },
      /wolf: is both a species and a class/);
    Probe.rejects(() => { const before = Canon.classes.fighter!.abilities; Canon.classes.fighter!.abilities = [...before, 'bite'];
      return () => { Canon.classes.fighter!.abilities = before; }; }, /bite is a natural, not technique or spell/);
    Probe.rejects(() => { Canon.species.snow_wolf = { variantOf: 'yeti', name: 'Snow wolf', description: '', source: { kyr: true } };
      return () => { delete Canon.species.snow_wolf; }; }, /variant of unknown species yeti/);
    Probe.rejects(() => { Canon.classes.thief!.specializations = ['vitalist'];
      return () => { delete Canon.classes.thief!.specializations; }; },
    /vitalist is not a specialization of this class/);
    Probe.rejects(() => { Canon.aliases.abilities.bite = 'smash'; return () => { delete Canon.aliases.abilities.bite; }; },
      /alias bite: shadows a canonical abilities identifier/);
    Probe.rejects(() => { Canon.items.rope!.damage = { dice: '1d2', type: 'electric' };
      return () => { delete Canon.items.rope!.damage; }; }, /unknown damage type electric/);
    Probe.rejects(() => { Canon.abilities.bolt!.spell = { tradition: 'arcane', level: 1, school: 'pyromancy' };
      return () => { Canon.abilities.bolt!.spell = { tradition: 'arcane', level: 1 }; }; }, /unknown school pyromancy/);
    Probe.rejects(() => { const sword = Canon.items.longsword_of_flames!; sword.damage = { dice: '2d6', type: 'piercing' };
      return () => { sword.damage = { dice: '1d8', type: 'piercing' }; }; }, /2d6 piercing is not what its granted strike deals/);
    Probe.rejects(() => { const s = Canon.skills.digging!.source; Canon.skills.digging!.source = {};
      return () => { Canon.skills.digging!.source = s; }; }, /skill digging: has no source/);
  });
});
