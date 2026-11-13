import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { ItemCatalog } from '../src/item-catalog';
import type { CombatEvent } from '../src/model';

// A wonder's blade is magic, and passes a guard only magic passes (the SRD adaptation briefing, §3: typed defenses
// with bypasses): against the unicorn's 10/magic a bolt-blade's blow comes through whole, and is told as magic passing
// its guard, where a longsword's loses ten. Every other blade of the catalog is as it was.
describe('a magic blade against a guard of 10/magic', () => {
  const content = new Content('magic-blades'), expressions = new Expressions('magic-blades');
  const hit = (weapon: string) => {
    const unicorn = content.creature('unicorn', 'u', 'goblins'), events: CombatEvent[] = [];
    const w = ItemCatalog.weapon(weapon), context = { fighters: [unicorn], turn: 1, events, content, abilities: [],
      retreat: false, location: null, expressions, source: { id: 'test', kind: 'trap' } } as EffectContext;
    Effects.damage(unicorn, { amount: 14, type: w.type, tags: [...w.tags ?? [], 'manufactured'] }, context);
    return events.find(e => e.type === 'damage');
  };
  it('tags every wonder\'s blade magic, and no ordinary one', () => {
    const blades = Object.entries(Canon.items).filter(([, i]) => i.weapon && !i.weapon.natural);
    for (const [id] of blades) {
      expect([id, ItemCatalog.weapon(id).tags?.includes('magic') ?? false]).toEqual([id, Canon.wonders.has(id)]);
    }
    expect(blades.filter(([id]) => Canon.wonders.has(id)).length).toBeGreaterThan(5);
  });
  it('lets the bolt-blade through whole, told as magic passing, and turns ten of a longsword\'s', () => {
    const magic = hit('bolt_blade'), steel = hit('longsword');
    expect(magic?.type === 'damage' && [magic.amount, magic.modifiers?.bypassed]).toEqual([14,
      [{ defense: 'reduction', amount: 10, by: 'magic' }]]);
    expect(steel?.type === 'damage' && [steel.amount, steel.modifiers?.reduction]).toEqual([4, 10]);
  });
});
