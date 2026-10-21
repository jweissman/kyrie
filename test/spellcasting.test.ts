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
  static cast(store: CreatureStore, ability: string) {
    return FieldUse.perform(store, ['dori'], { ability, caster: 'dori', target: 'dori', seed: ability });
  }
}

describe('prepared spells', () => {
  it('a cleric has slots by spell level from its table, plus one for wisdom 14, each holding a prayer it knows', () => {
    const dori = Casters.cleric(3);
    expect(dori.base.maxSlots).toEqual([3, 1]);
    expect(dori.base.maxMana).toBe(0);
    // A first preparation takes each level's own prayers in turn.
    expect(dori.state.prepared).toEqual([['cure', 'bless', 'anoint'], ['prayer']]);
    expect(dori.state.ready).toEqual(dori.state.prepared);
    expect(new Content('slots').createCreature('bran', { raceId: 'human', classId: 'warrior' }).base.maxSlots).toBeUndefined();
  });
  it('casting spends a ready slot holding that spell; a cantrip spends none; what is not prepared cannot be cast', () => {
    const store = new CreatureStore([Casters.cleric(3)]);
    Casters.cast(store, 'cure_minor');
    expect(store.get('dori').state.slots).toEqual([3, 1]);
    Casters.cast(store, 'cure');
    expect(store.get('dori').state.ready).toEqual([['bless', 'anoint'], ['prayer']]);
    expect(() => Casters.cast(store, 'cure')).toThrow('No ready slot holds cure');
    // Resist Fire is known but not prepared: knowing a spell is not having it ready.
    expect(() => Casters.cast(store, 'resist_fire')).toThrow('No ready slot holds resist_fire');
  });
  it('preparing a spell in a ready slot readies it at once; in a spent slot, after the next rest', () => {
    const dori = Casters.cleric(3);
    expect(Spellcasting.prepare(dori.state, 0, 'bless', 'cure')).toBe(true);
    expect(dori.state.ready![0]).toEqual(['cure', 'cure', 'anoint']);
    Spellcasting.spend(dori.state, { id: 'anoint', spell: { level: 1 } });
    expect(Spellcasting.prepare(dori.state, 0, 'anoint', 'bless')).toBe(false);
    expect(dori.state.ready![0]).toEqual(['cure', 'cure']);
    expect(dori.state.prepared![0]).toEqual(['cure', 'cure', 'bless']);
    expect(Spellcasting.restore(dori.state, 9999)).toBe(1);
    expect(dori.state.ready![0]).toEqual(['cure', 'cure', 'bless']);
    expect(() => Spellcasting.prepare(dori.state, 0, 'cure', 'prayer')).toThrow();
  });
  it('rest returns slots: all of them under a roof, one in the open, lowest level first', () => {
    const dori = Casters.cleric(3);
    for (const id of ['cure', 'bless', 'prayer']) { Spellcasting.spend(dori.state, { id, spell: { level: Spellcasting.levelOf(id) } }); }
    expect(dori.state.slots).toEqual([1, 0]);
    expect(Spellcasting.restore(dori.state, 1)).toBe(1);
    expect(dori.state.slots).toEqual([2, 0]);
    expect(Spellcasting.restore(dori.state, 9999)).toBe(2);
    expect(dori.state.ready).toEqual(dori.state.prepared);
  });
  it('a creature saved before preparation existed prepares when it is loaded', () => {
    const old = Casters.cleric(3);
    delete old.base.maxSlots; delete old.state.slots; delete old.state.prepared; delete old.state.ready;
    expect(new CreatureStore([old]).get('dori').state.prepared).toEqual([['cure', 'bless', 'anoint'], ['prayer']]);
  });
});
