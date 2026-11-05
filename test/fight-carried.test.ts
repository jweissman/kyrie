import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';
import { CombatModel } from '../src/ui/combat-model';
import { ChoiceList } from '../src/ui/choice-list';
import { ItemCatalog } from '../src/item-catalog';
import { ItemUses } from '../src/ui/item-uses';

// What the company carries to use up can be used in a fight (the play-structure investigation's PT-07: a fight offered
// no use of a carried thing, though the foe was vulnerable to fire and the pack held alchemist's fire): a flask of fire
// thrown at a foe, a draught drunk. Each is used up as it is used, and gone from the pack after; and what the fight
// chooses for anyone (a companion's turn, "auto") uses up nothing: that is the company's own call.
class Carried {
  static fight(seed: string) {
    const content = new Content(seed);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
    hero.state.inventory = [{ id: 'fire1', definition: 'alchemist_fire' }, { id: 'fire2', definition: 'alchemist_fire' },
      { id: 'draught', definition: 'healingdraught' }];
    const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'thief' });
    const store = new CreatureStore([hero, foe]);
    const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed });
    return { store, battle };
  }
  static toHero(battle: Battle, hero = 'hero') {
    while (!battle.state.outcome && battle.state.actor !== hero) { battle.step(battle.chosen()); }
  }
}

describe('what the company carries, in a fight', () => {
  it('is the catalog\'s own: alchemist\'s fire is thrown at a foe, and is no use on one of the company', () => {
    expect(ItemCatalog.get('alchemist_fire').use).toBe('Deal (1d6) fire damage to enemy.');
    expect(ItemCatalog.use('alchemist_fire')!.effects).toEqual([expect.objectContaining({ kind: 'damage',
      damageType: 'fire', target: 'enemy' })]);
  });
  it('is offered, used up as it is used, and gone from the pack after; never used unasked', () => {
    const { store, battle } = Carried.fight('flask');
    Carried.toHero(battle);
    expect(battle.legalCommands()).toEqual(expect.arrayContaining([
      { actor: 'hero', ability: 'item-alchemist_fire', target: 'foe' },
      { actor: 'hero', ability: 'item-healingdraught', target: 'hero' }]));
    const screen = CombatModel.build(battle);
    expect(screen.abilities.find(a => a.id === 'item-alchemist_fire')).toMatchObject({ name: 'Use alchemist\'s fire',
      carried: 2 });
    expect(ChoiceList.combat(screen).find(s => s.id === 'carried')?.title).toBe('What you carry');
    const thrown = battle.step({ actor: 'hero', ability: 'item-alchemist_fire', target: 'foe' });
    expect(thrown.some(e => e.type === 'damage' && e.target === 'foe' && e.damageType === 'fire')).toBe(true);
    Carried.toHero(battle);
    if (!battle.state.outcome) {
      expect(CombatModel.build(battle).abilities.find(a => a.id === 'item-alchemist_fire')?.carried).toBe(1);
    }
    while (!battle.state.outcome) { battle.step(battle.chosen()); }
    expect(store.get('hero').state.inventory!.map(i => i.id).sort()).toEqual(['draught', 'fire2']);
  });
});

// A scroll or a wand casts its spell, as its caster would and at no cost (Orsino's cast effect from an item, which
// Kyr had held as gear it could not use): a scroll of fireball read at the foes burns them, and is spent.
describe('a thing that casts a spell', () => {
  it('casts it in a fight, at no cost, and is spent', () => {
    expect(ItemCatalog.get('scroll_of_fireball').use).toBe('Cast fireball on enemy.');
    expect(ItemCatalog.use('wand_of_magic_missile')!.effects).toEqual([{ kind: 'cast', ability: 'magic_missile',
      target: 'enemy' }]);
    const content = new Content('scroll');
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
    hero.state.inventory = [{ id: 'scroll', definition: 'scroll_of_fireball' }];
    const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'thief' });
    const store = new CreatureStore([hero, foe]);
    const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed: 'scroll' });
    Carried.toHero(battle);
    expect(battle.legalCommands()).toContainEqual({ actor: 'hero', ability: 'item-scroll_of_fireball', target: 'foe' });
    const read = battle.step({ actor: 'hero', ability: 'item-scroll_of_fireball', target: 'foe' });
    expect(read.some(e => e.type === 'damage' && e.target === 'foe' && e.damageType === 'fire')).toBe(true);
    expect(store.get('hero').state.inventory).toEqual([]);
  });
  it('a wand is a charge spent at each use, and comes out of the fight with what it has left', () => {
    expect(ItemCatalog.get('wand_of_magic_missile').charges).toBe(20);
    const content = new Content('wand');
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
    hero.state.inventory = [{ id: 'wand', definition: 'wand_of_magic_missile', charges: 2 }];
    const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'thief' });
    const store = new CreatureStore([hero, foe]);
    const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed: 'wand' });
    Carried.toHero(battle);
    battle.step({ actor: 'hero', ability: 'item-wand_of_magic_missile', target: 'foe' });
    Carried.toHero(battle);
    if (!battle.state.outcome) {
      expect(CombatModel.build(battle).abilities.find(a => a.id === 'item-wand_of_magic_missile')?.carried).toBe(1);
    }
    while (!battle.state.outcome) { battle.step(battle.chosen()); }
    expect(store.get('hero').state.inventory).toEqual([{ id: 'wand', definition: 'wand_of_magic_missile', charges: 1 }]);
  });
});

// What a remedy is kept for, when its use is not offered now (PT-18: moss that "binds a wound better than linen" could
// not be used on anyone, and nothing said why): none of the company needs it.
describe('a thing whose use is not offered now', () => {
  it('says what it is kept for', () => {
    expect(ItemUses.kept('herbs', [])).toBe('for one who is hurt · none of you is now');
    expect(ItemUses.kept('yarrow_poultice', [])).toBe('for one who is bleeding or hurt · none of you is now');
    expect(ItemUses.kept('alchemist_fire', [])).toBe('for a fight · thrown at a foe');
    expect(ItemUses.kept('herbs', [{ key: 'use', label: 'Use herbs on Aud', command: 'use_item(herbs1,herbs,aud,aud)' }]))
      .toBeUndefined();
    expect(ItemUses.kept('rope', [])).toBeUndefined();
  });
});

// What a thing worn adds to a caster's spells (Orsino's bonusSpellDamage): a singing stone adds one to the harm of
// every spell its bearer casts.
describe('a thing that strengthens spells', () => {
  it('adds to the harm of a spell its bearer casts', () => {
    const content = new Content('stone');
    const mage = content.createCreature('mage', { raceId: 'human', classId: 'mage', level: 3 });
    mage.state.inventory = [...mage.state.inventory ?? [], { id: 'stone', definition: 'singing_stone', equipped: true }];
    const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'thief', level: 6 });
    const battle = Battle.encounter(new CreatureStore([mage, foe]), [{ creatureId: 'mage', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed: 'stone' });
    Carried.toHero(battle, 'mage');
    const spell = battle.legalCommands().find(c => Content.abilities.find(a => a.id === c.ability)?.spell
      && Content.abilities.find(a => a.id === c.ability)!.effects.some(e => e.kind === 'damage') && c.target === 'foe');
    expect(spell).toBeDefined();
    const cast = battle.step(spell!).filter(e => e.type === 'damage' && e.target === 'foe');
    expect(cast.length).toBeGreaterThan(0);
    expect(cast.every(e => e.type === 'damage' && e.modifiers?.bonus === 1)).toBe(true);
  });
});
