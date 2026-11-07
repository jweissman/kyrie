import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Items } from '../src/campaign/items';
import { CombatProjection } from '../src/combat-projection';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';

// Two of the item audit's gaps (doc/architecture/mission-19/items.md): a ring of regeneration's mending had been summed
// with what its wearer wears and never run (G5); a wand used out of a fight had been used up whole, its fifteen
// charges with it, where in a fight it kept what it had left (G8).
class Kit {
  static store() {
    const c = new Content('item-gaps').createCreature('hero', { raceId: 'human', classId: 'warrior', level: 4 });
    c.state.hp = 3;
    return new CreatureStore([c]);
  }
}

describe('what the item audit found the runtime left undone', () => {
  it('mends the wearer of a ring of regeneration at the end of each of their turns', () => {
    const store = Kit.store();
    Items.take(store, 'hero', { id: 'ring-1', definition: 'ring_of_regeneration' });
    Items.equip(store, 'hero', 'ring-1');
    const hero = CombatProjection.fighter(store.get('hero'), 'fighters');
    const context = { actor: hero, fighters: [hero], turn: 0, events: [], content: new Content('regen'),
      expressions: new Expressions('regen'),
      abilities: Content.abilities.map(a => a.id), retreat: false, location: null } as unknown as EffectContext;
    for (let turn = 0; turn < 12; turn++) { Effects.turnEnd(hero, context); }
    expect(hero.hp).toBeGreaterThan(3);
    expect(context.events.some(e => e.type === 'heal' && e.target === 'hero')).toBe(true);
  });
  it('keeps a wand used out of a fight, with one charge fewer, until its last', () => {
    const store = Kit.store();
    Items.take(store, 'hero', { id: 'wand-1', definition: 'wand_of_cure_minor_wounds' });
    Items.consume(store, { owner: 'hero', target: 'hero', id: 'wand-1', seed: 'first' });
    expect(store.get('hero').state.hp).toBeGreaterThan(3);
    expect(store.get('hero').state.inventory!.find(i => i.id === 'wand-1')?.charges).toBe(14);
    // Down to its last charge, it is spent with it.
    const lease = store.acquire(['hero']);
    try {
      lease.creatures[0]!.state.inventory!.find(i => i.id === 'wand-1')!.charges = 1;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    Items.consume(store, { owner: 'hero', target: 'hero', id: 'wand-1', seed: 'last' });
    expect(store.get('hero').state.inventory!.some(i => i.id === 'wand-1')).toBe(false);
  });
});
