import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Canon } from '../src/canon/canon';
import type { LocalCatalog } from '../src/canon/local-catalog';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { ItemCatalog } from '../src/item-catalog';
import { LootTables } from '../src/world/loot-tables';

describe('the SRD scroll of Protection from Evil', () => {
  it('keeps distinct caster levels for the same kind in separate catalog uses', () => {
    const use = 'Cast protection_from_evil on ally.';
    const make = (casterLevel: number) => {
      const kinds: LocalCatalog = { items: { scroll: {
        name: 'scroll', description: 'A scroll.', category: 'consumable', use, casterLevel, source: { kyr: true },
      } } };
      return ItemCatalog.of(kinds);
    };
    const first = make(1), second = make(5);
    for (const [catalog, level] of [[first, 1], [second, 5], [first, 1]] as const) {
      expect(catalog.use('scroll')?.effects[0]).toMatchObject({ kind: 'cast', castingLevel: level });
    }
    expect(() => ItemCatalog.using('invalid', { name: 'invalid', use: 'Heal 1 health to ally.', casterLevel: 1 }))
      .toThrow('sets a caster level but does not cast a spell');
  });
  it('is a first-level scroll in minor treasure and wards an ally when read in a fight', () => {
    expect(Canon.items.scroll_of_protection_from_evil).toMatchObject({
      value: 25, use: 'Cast protection_from_evil on ally.', casterLevel: 1,
      source: { srd35: 'item:scroll-of-protection-from-evil', fidelity: 'adapted' }
    });
    expect(Canon.abilities.protection_from_evil?.spell?.level).toBe(1);
    expect(ItemCatalog.canon.use('scroll_of_protection_from_evil')?.effects).toEqual([
      expect.objectContaining({ kind: 'cast', ability: 'protection_from_evil', target: 'ally', castingLevel: 1 })
    ]);
    expect(LootTables.tiers.minor).toContain('scroll_of_protection_from_evil');

    const content = new Content('protection-scroll');
    const hero = content.createCreature(ItemCatalog.canon, 'hero', { raceId: 'human', classId: 'warrior', level: 7 });
    hero.state.inventory = [{ id: 'scroll', definition: 'scroll_of_protection_from_evil' }];
    const ally = content.createCreature(ItemCatalog.canon, 'ally', { raceId: 'human', classId: 'warrior' });
    const foe = content.createCreature(ItemCatalog.canon, 'foe', { raceId: 'goblin', classId: 'thief' });
    const store = new CreatureStore(ItemCatalog.canon, [hero, ally, foe]);
    const battle = Battle.encounter(store, [
      { creatureId: 'hero', team: 'fighters' },
      { creatureId: 'ally', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }
    ], { seed: 'protection-scroll' });
    while (!battle.state.outcome && battle.state.actor !== 'hero') { battle.step(battle.chosen()); }

    expect(battle.legalCommands()).toContainEqual({
      actor: 'hero', ability: 'item-scroll_of_protection_from_evil', target: 'ally'
    });
    battle.step({ actor: 'hero', ability: 'item-scroll_of_protection_from_evil', target: 'ally' });
    expect(battle.state.combatants.find(f => f.id === 'ally')?.statuses)
      .toContainEqual(expect.objectContaining({ id: 'warded_from_evil', remaining: 10 }));
    expect(store.get('hero').state.inventory).toEqual([]);
  });
});
