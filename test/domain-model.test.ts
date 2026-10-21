import { Spellcasting } from '../src/rules/spellcasting';
import { describe, expect, it } from 'bun:test';
import snapshot from '../data/sources/orsino/registry.json';
import { AbilityUse } from '../src/ability-use';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { ItemCatalog } from '../src/item-catalog';
import { Expressions } from '../src/expressions';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { Overlays } from '../src/overlays';
import { OrsinoMonsters } from '../src/registry/orsino-monsters';
import { OrsinoRegistry } from '../src/registry/orsino-registry';
import { SpellSelection } from '../src/rules/spell-selection';
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
  it('keeps a person (ancestry and class) and a creature species (no class) apart', () => {
    expect(Canon.isAncestry('human') && !Canon.isSpecies('human')).toBe(true);
    expect(Canon.isSpecies('wolf') && !Canon.isAncestry('wolf') && !Canon.classes.wolf).toBe(true);
    const human = Probe.creature('aldo', { raceId: 'human', classId: 'warrior', traits: ['brave'] });
    const wolf = Probe.creature('grey', { raceId: 'wolf' });
    expect([human.classId, wolf.classId]).toEqual(['warrior', undefined]);
    expect(human.base.abilities).toEqual(['defend', 'guard', 'taunt', 'vigor_up', 'cleave', 'prepare_charge', 'charge',
      'second_wind', 'sweep']);
    expect(wolf.base.abilities).toEqual(['rending_bite', 'flee']);
    expect(CombatProjection.fighter(wolf, 'goblins').equipment.weapon).toMatchObject({ id: 'bite', damage: '1d6' });
    expect(() => Probe.creature('pup', { raceId: 'wolf', classId: 'warrior' })).toThrow('species and takes no class');
    expect(() => Probe.creature('sage', { raceId: 'elf', classId: 'cleric' })).toThrow('an elf cannot be a cleric');
    expect(() => ModuleParser.parse('Module m "m" { Person w "W" at x { Species wolf. Calling warrior. } Goal false. }'))
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
    expect(red.abilities).toEqual(['breathe_fire']);
    expect(dragon.statistics!.weapon).toBe('bite');
  });

  it('composes a constructed guardian from Orsino tables: construct type, construct nature, iron substance', () => {
    const iron = OrsinoMonsters.compose(id => registry.entry(id), { monsterClass: 'construct', monsterType: 'Golem',
      aspect: 'wildtype', terrain: 'cave', rank: 'minor', level: 1, substance: 'iron' });
    const golem = Canon.creature('iron_golem');
    expect(golem.statistics!.attributes).toEqual({ strength: iron.scores.str, dexterity: iron.scores.dex,
      constitution: iron.scores.con, intelligence: iron.scores.int, wisdom: iron.scores.wis,
      charisma: iron.scores.cha });
    expect(golem.statistics!.hitPoints).toBe(iron.hitPoints);
    expect([golem.type, golem.traits, golem.statistics!.armor]).toEqual(['construct', ['construct'], 'plate']);
    const body = CombatProjection.fighter(Probe.creature('hulk', { raceId: 'iron_golem' }), 'goblins');
    expect(Effects.immune(body, 'poison') && Effects.immune(body, 'sleep')).toBe(true);
    expect(Effects.modifiers(body).resistances?.slashing).toBe(0.5);
    expect(body.equipment.armorAc).toBe(7);
    expect(Canon.creature('bronze_construct').type).toBe('construct');
  });
});

describe('4-6: classes, specializations, backgrounds, feats, spells and traits', () => {
  it('gives a cleric its domain cantrips and the spells it picks, gated by ⌈level / 2⌉, as Orsino does', () => {
    expect(Canon.classes.cleric!.specializations).toContain('vitalist');
    expect(Canon.classes.cleric!.specializations).toHaveLength(12);
    const picks = ['cure', 'bless', 'anoint', 'prayer', 'resist_fire', 'cure_moderate'];
    const novice = Probe.creature('novice', { classId: 'cleric', raceId: 'dwarf', traits: ['vitalist'], spells: picks });
    expect(novice.base.abilities).toEqual(['defend', 'cure_minor', 'sanctify', ...picks]);
    expect(Canon.abilities.resist_fire!.spell).toEqual({ tradition: 'divine', level: 2, domain: 'life' });
    expect(source('divineSpell:resist_fire').domain).toBe('life');
    const plan = SpellSelection.plan(Canon.traits.vitalist!);
    expect(plan.levels.map(l => l.count)).toEqual([3, 2, 1]);
    expect(() => Probe.creature('greedy', { classId: 'cleric', raceId: 'dwarf', traits: ['vitalist'],
      spells: ['cure', 'bless', 'anoint', 'remove_fear', 'prayer', 'resist_fire', 'cure_moderate'] }))
      .toThrow('choose 3 level-1 spells');
    expect(() => Probe.creature('wrong', { classId: 'thief', raceId: 'human', traits: ['vitalist'] }))
      .toThrow('cannot specialize as vitalist');
    const warder = Probe.creature('warder', { classId: 'mage', raceId: 'elf', traits: ['abjurer'] });
    expect(warder.base.abilities.some(a => Canon.abilities[a]?.spell?.school === 'abjuration')).toBe(true);
    expect(() => Probe.creature('dark', { classId: 'mage', raceId: 'elf', traits: ['necromancer'] }))
      .toThrow('an elf may not take necromancer');
  });

  it('distinguishes a background, a profession and a feat by what each contributes', () => {
    const hunter = Overlays.contributions({ backgroundId: 'hunter' });
    expect(hunter.filter(c => c.kind === 'skill').map(c => c.value)).toEqual(['woodcraft']);
    expect(Canon.backgrounds.hunter!.attributes).toEqual({ dexterity: 2, wisdom: 1, constitution: 1 });
    const keeper = Canon.backgrounds.innkeeper!;
    expect([keeper.use, keeper.offers?.[0]?.kind, keeper.routine]).toEqual(['profession', 'lodging', 'keeping the inn']);
    const knight = Probe.creature('dame', { classId: 'warrior', raceId: 'human', traits: ['knight', 'brave'], level: 3 });
    const fighter = CombatProjection.fighter(knight, 'fighters');
    expect(Effects.saveModifier(fighter, 'magic')).toBe(2);
    // Order of the Shield always; Heavy Handed's +5 to hit only with a heavy weapon in hand.
    const wielding = (id: string) => ({ ...fighter,
      equipment: { ...fighter.equipment!, weapon: ItemCatalog.weapon(id) } });
    expect([Effects.modifiers(wielding('dagger')).toHit, Effects.modifiers(wielding('greatsword')).toHit,
      Effects.modifiers(wielding('greatsword')).ac]).toEqual([undefined, 5, -2]);
    expect(() => Probe.creature('squire', { classId: 'warrior', raceId: 'human', traits: ['knight', 'brave'] }))
      .toThrow('level 3');
  });

  it('treats a spell and a passive trait as different things with the same modifier vocabulary', () => {
    const elder = Probe.creature('elder', { classId: 'cleric', raceId: 'dwarf', traits: ['vitalist'], level: 3,
      spells: ['cure', 'bless', 'anoint', 'prayer', 'resist_fire', 'cure_moderate'] });
    const ally = Probe.creature('ally', { classId: 'warrior', raceId: 'human', traits: ['brave'] });
    Spellcasting.prepare(elder.state, 1, 'prayer', 'resist_fire');
    const { recipient } = Probe.cast(elder, 'resist_fire', ally);
    expect(recipient.statuses.map(s => s.id)).toEqual(['fireproof']);
    expect(Effects.modifiers(recipient).resistances?.fire).toBe(0.5);
    expect(Canon.traits.fire_affinity!.category).toBe('affinity');
    const salamander = CombatProjection.fighter(Probe.creature('sal', { classId: 'warrior', raceId: 'human',
      traits: ['brave'] }), 'fighters');
    salamander.traits = ['fire_affinity'];
    const m = Effects.modifiers(salamander);
    expect([m.resistances?.fire, Effects.immune(salamander, 'breath'), salamander.statuses]).toEqual([0.5, true, []]);
  });
});

describe('7-11: equipment, monsters, theology, ecology and local mechanisms', () => {
  it('describes a weapon by its dice, and its rider as a hook on hitting', () => {
    const sword = Canon.items.longsword_of_flames!;
    expect(sword.weapon).toEqual({ damage: '1d8', type: 'piercing' });
    expect(sword.hooks?.onAttackHit?.[0]).toMatchObject({ kind: 'damage', damageType: 'fire' });
    expect(source('equipment:longsword_of_flames')).toMatchObject({ damage: '1d8', type: 'piercing' });
    const knight = Probe.creature('rhys', { classId: 'warrior', raceId: 'human', traits: ['brave'],
      weapon: 'longsword_of_flames', armor: 'chainmail' });
    expect(knight.state.inventory).toEqual([
      { id: 'rhys__longsword_of_flames', definition: 'longsword_of_flames', equipped: true },
      { id: 'rhys__chainmail', definition: 'chainmail', equipped: true }]);
    const equipment = CombatProjection.fighter(knight, 'fighters').equipment;
    expect([equipment.weapon.id, equipment.armorAc, equipment.hooks.onAttackHit?.length]).toEqual(['longsword_of_flames', 5, 1]);
  });

  it('gives a monster its special abilities as natural abilities, not as a class', () => {
    expect(Canon.abilities.breathe_fire!.kind).toBe('natural');
    expect(Canon.creature('red_dragon').abilities).toEqual(['breathe_fire']);
    expect(Canon.classes.red_dragon).toBeUndefined();
  });

  it('models Orsino theology around domains: deities, blessings and the cleric specialization that opens them', () => {
    expect(Canon.deities.brigid).toMatchObject({ name: 'Brigid', domains: ['knowledge', 'life', 'love', 'order'], gender: 'female' });
    expect(Canon.domains.life!.blessing!.modifiers).toEqual({ bonusHealing: 3, resistances: { poison: 2 },
      immune: ['disease'], onTurnEnd: [{ kind: 'heal', amount: '1d2-1' }] });
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
  });

  it('declares a site mechanism inside its site, never in the global ability catalog', () => {
    const site = ModuleParser.parse('Module m "m" { Hazard rotten_rung "A rotten rung" means "Deal (1d6) physical damage to ally unless dexterity save against (12).". Goal false. }');
    expect(site.entities).toEqual([{ id: 'rotten_rung', type: 'hazard', name: 'A rotten rung',
      effect: 'Deal (1d6) physical damage to ally unless dexterity save against (12).' }]);
    expect(ModuleWriter.write(site)).toContain('Hazard rotten_rung "A rotten rung" means');
    for (const id of ['ladder_fall', 'heave_strain', 'foundry_steam', 'counterweight_drop']) {
      expect(Object.hasOwn(Canon.abilities, id)).toBe(false);
    }
  });
});

describe('preventive validation', () => {
  it('rejects category errors and broken references', () => {
    Probe.rejects(() => { Canon.classes.wolf = Canon.classes.warrior!; return () => { delete Canon.classes.wolf; }; },
      /wolf: is both a species and a class/);
    Probe.rejects(() => { const before = Canon.classes.warrior!.abilities; Canon.classes.warrior!.abilities = [...before, 'rending_bite'];
      return () => { Canon.classes.warrior!.abilities = before; }; },
    /rending_bite is a natural, not technique or spell/);
    Probe.rejects(() => { Canon.species.snow_wolf = { variantOf: 'yeti', name: 'Snow wolf', description: '', source: { kyr: true } };
      return () => { delete Canon.species.snow_wolf; }; }, /variant of unknown species yeti/);
    Probe.rejects(() => { Canon.classes.thief!.specializations = ['abjurer'];
      return () => { delete Canon.classes.thief!.specializations; }; },
    /abjurer is not a specialization of this class/);
    Probe.rejects(() => { Canon.aliases.abilities.rending_bite = 'smash'; return () => { delete Canon.aliases.abilities.rending_bite; }; },
      /alias rending_bite: shadows a canonical abilities identifier/);
    Probe.rejects(() => { Canon.items.rope!.weapon = { damage: '1d2', type: 'electric' };
      return () => { delete Canon.items.rope!.weapon; }; }, /unknown damage type electric/);
    Probe.rejects(() => { const spell = Canon.abilities.firebolt!.spell!; Canon.abilities.firebolt!.spell = { ...spell, school: 'pyromancy' };
      return () => { Canon.abilities.firebolt!.spell = spell; }; }, /unknown school pyromancy/);
    Probe.rejects(() => { const armor = Canon.items.leather!.armor!; Canon.items.leather!.armor = { ...armor, ac: 1.5 };
      return () => { Canon.items.leather!.armor = armor; }; }, /armour needs an integer ac/);
    Probe.rejects(() => { const s = Canon.skills.digging!.source; Canon.skills.digging!.source = {};
      return () => { Canon.skills.digging!.source = s; }; }, /skill digging: has no source/);
  });
});
