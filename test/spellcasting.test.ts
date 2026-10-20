import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { Spellcasting } from '../src/rules/spellcasting';

const spells = ['cure', 'bless', 'anoint', 'prayer', 'resist_fire', 'cure_moderate'];
class Casters {
  static cleric(level: number) {
    return new Content('slots').createCreature('dori', { raceId: 'dwarf', classId: 'cleric', traits: ['vitalist'], level,
      spells, wisdom: 14 });
  }
}

describe('spell slots by level', () => {
  it('a cleric has slots by spell level from its table, plus one for wisdom 14, and no general pool', () => {
    expect(Casters.cleric(1).base.maxSlots).toEqual([2]);
    expect(Casters.cleric(3).base.maxSlots).toEqual([3, 1]);
    expect(Casters.cleric(3).base.maxMana).toBe(0);
    expect(new Content('slots').createCreature('bran', { raceId: 'human', classId: 'warrior' }).base.maxSlots).toBeUndefined();
  });
  it('a spell spends the lowest free slot of its level or higher; a cantrip spends none; none left, no spell', () => {
    const store = new CreatureStore([Casters.cleric(3)]);
    const cast = (ability: string) => FieldUse.perform(store, ['dori'], { ability, caster: 'dori', target: 'dori', seed: ability });
    cast('cure_minor');
    expect(store.get('dori').state.slots).toEqual([3, 1]);
    cast('cure'); cast('cure'); cast('cure');
    expect(store.get('dori').state.slots).toEqual([0, 1]);
    cast('cure');
    expect(store.get('dori').state.slots).toEqual([0, 0]);
    expect(() => cast('cure')).toThrow('No spell slot');
  });
  it('rest returns slots: all of them under a roof, one in the open', () => {
    const dori = Casters.cleric(3);
    dori.state.slots = [0, 0];
    expect(Spellcasting.restore(dori.state as never as { maxSlots: number[]; slots: number[] }, 1)).toBe(0);
    const caster = { maxSlots: [3, 1], slots: [0, 0] };
    expect(Spellcasting.restore(caster, 1)).toBe(1);
    expect(caster.slots).toEqual([1, 0]);
    expect(Spellcasting.restore(caster, 9999)).toBe(3);
    expect(caster.slots).toEqual([3, 1]);
  });
  it('a creature saved before slots existed gets them when it is loaded', () => {
    const old = Casters.cleric(3);
    delete old.base.maxSlots; delete old.state.slots;
    expect(new CreatureStore([old]).get('dori').state.slots).toEqual([3, 1]);
  });
});
