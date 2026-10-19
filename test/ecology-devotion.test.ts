import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { CombatProjection } from '../src/combat-projection';
import { Items } from '../src/campaign/items';
import { FieldUse } from '../src/campaign/field-use';
import { Effects } from '../src/effects';
import { Expressions } from '../src/expressions';
import { ItemCatalog } from '../src/item-catalog';
import { Battle } from '../src/battle';
import { Tactics } from '../src/tactics';

function company() {
  const c = new Content('devotion-test').createCreature('pilgrim',
    { name: 'Sella', raceId: 'human', classId: 'orsino_life_cleric', level: 3 });
  c.state.hp = 1;
  return new CreatureStore([c]);
}
describe('shared Orsino effects, ecology preparations and shrine attachments', () => {
  it('preserves Orsino Luminous Touch and Cure Minor amounts and pays explicit Kyr mana costs', () => {
    for (const [ability, expression] of [['orsino_luminous_touch', '1d2 + 3'], ['orsino_cure_minor', '1d4']]) {
      const store = company(), before = store.get('pilgrim');
      const expected = new Expressions('healing').number(expression!);
      const events = FieldUse.perform(store, ['pilgrim'],
        { ability: ability!, caster: 'pilgrim', target: 'pilgrim', seed: 'healing' });
      const heal = events.find(e => e.type === 'heal');
      expect(heal?.type === 'heal' && heal.rolled).toBe(expected);
      expect(store.get('pilgrim').state.mana).toBe(before.state.mana - 1);
      expect(store.get('pilgrim').base).toEqual(before.base);
    }
  });
  it('gathers a real preparation and consumes it through the shared heal/remove effects', () => {
    const store = company(), c = store.get('pilgrim');
    c.state.conditions.push({ id: 'bleeding', remaining: 2, source: 'thorn' });
    const wounded = new CreatureStore([c]);
    Items.take(wounded, 'pilgrim', { id: 'yarrow-1', definition: 'yarrowbundle' });
    const events = Items.consume(wounded, { owner: 'pilgrim', target: 'pilgrim', id: 'yarrow-1', seed: 'herb' });
    expect(events.some(e => e.type === 'remove' && e.detail === 'bleeding')).toBe(true);
    expect(events.some(e => e.type === 'heal' && e.amount > 0)).toBe(true);
    expect(wounded.get('pilgrim').state.conditions).toEqual([]);
    expect(wounded.get('pilgrim').state.inventory).toEqual([]);
  });
  it('uses the Orsino fireproof resistance from consumable and ability through the same damage reducer', () => {
    const protectedStore = company(), bare = company();
    Items.take(protectedStore, 'pilgrim', { id: 'salve-1', definition: 'fireproofsalve' });
    Items.consume(protectedStore, { owner: 'pilgrim', target: 'pilgrim', id: 'salve-1', seed: 'salve' });
    expect(Effects.resistance(CombatProjection.fighter(protectedStore.get('pilgrim'), 'fighters'), 'fire')).toBe(0.5);
    const resin = [{ id: 'burning_resin', type: 'hazard', name: 'Burning resin',
      effect: 'Deal (1d6) fire damage to ally unless dexterity save against (11).' }];
    const a = Items.expose(protectedStore, { target: 'pilgrim', ability: 'burning_resin', source: 'stove', seed: 'fire', entities: resin });
    const b = Items.expose(bare, { target: 'pilgrim', ability: 'burning_resin', source: 'stove', seed: 'fire', entities: resin });
    const hitA = a.find(e => e.type === 'damage'), hitB = b.find(e => e.type === 'damage');
    expect(hitA?.type === 'damage' && hitA.modifiers?.resistance).toBe(0.5);
    expect(hitA?.type === 'damage' && hitA.rolled).toBe(hitB?.type === 'damage' && hitB.rolled);
    const mage = new Content('mage').createCreature('mage', { raceId: 'elf', classId: 'orsino_abjurer' });
    const mageStore = new CreatureStore([mage]);
    FieldUse.perform(mageStore, ['mage'], { ability: 'orsino_fireproof', caster: 'mage', target: 'mage', seed: 'ward' });
    expect(mageStore.get('mage').state.conditions[0]?.source).toBe('mage:orsino_fireproof');
    expect(mageStore.get('mage').state.mana).toBe(mage.state.mana - 2);
  });
  it('retains independently keyed shrine lifetimes without stacking identical save bonuses', () => {
    const store = company(), base = store.get('pilgrim').base;
    Items.bless(store, { target: 'pilgrim', source: 'village:altar', deity: 'veyra', seed: 'bless' });
    Items.bless(store, { target: 'pilgrim', source: 'road:altar', deity: 'veyra', seed: 'bless' });
    Items.bless(store, { target: 'pilgrim', source: 'village:altar', deity: 'veyra', seed: 'bless' });
    const c = store.get('pilgrim');
    expect(c.state.conditions.map(s => s.source).sort()).toEqual(['road:altar', 'village:altar']);
    expect(Effects.saveModifier(CombatProjection.fighter(c, 'fighters'))).toBe(2);
    expect(new CreatureStore(store.snapshot).snapshot).toEqual(store.snapshot);
    expect(c.base).toEqual(base);
    const before = store.snapshot;
    expect(() => Items.bless(store, { target: 'pilgrim', source: 'altar', deity: 'unknown', seed: 'bad' })).toThrow();
    expect(store.snapshot).toEqual(before);
  });
  it('decrements shrine attachments only at owner combat turn boundaries and preserves equipment provenance', () => {
    const store = company();
    Items.bless(store, { target: 'pilgrim', source: 'altar', deity: 'veyra', seed: 'bless' });
    Items.take(store, 'pilgrim', { id: 'charm-1', definition: 'protectivecharm' });
    Items.equip(store, 'pilgrim', 'charm-1');
    expect(ItemCatalog.attachments(store.get('pilgrim'))[0]?.source).toBe('charm-1');
    expect(Effects.saveModifier(CombatProjection.fighter(store.get('pilgrim'), 'fighters'))).toBe(5);
    const enemy = new Content('animal').createCreature('animal', { raceId: 'goblin', classId: 'commoner' });
    store.insert(enemy);
    const battle = Battle.encounter(store, [{ creatureId: 'pilgrim', team: 'fighters' }, { creatureId: 'animal', team: 'goblins' }], { seed: 'turns' });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
    expect(store.get('pilgrim').state.conditions.every(c => c.remaining < 3)).toBe(true);
  });
});
