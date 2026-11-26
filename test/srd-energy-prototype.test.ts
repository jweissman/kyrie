import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { AbilityUse } from '../src/ability-use';
import { Expressions } from '../src/expressions';
import { Amounts } from '../src/rules/amounts';
import { ItemCatalog } from '../src/item-catalog';
import type { EffectContext } from '../src/effects';
import type { Fighter } from '../src/model';
import { SrdEnergyPrototype as Prototype, type EnergyRecipe } from './support/srd-energy-prototype';

const content = new Content('energy-prototype');
const fighter = (id: string, undead = false): Fighter => ({
  id, name: id, team: 'fighters', raceId: 'human', level: 40, strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10, speed: 10, hp: 500, maxHp: 1000, mana: 0, maxMana: 0,
  gold: 0, experience: 0, abilities: [], statuses: [], cooldowns: {}, traits: undead ? ['undead'] : [],
  equipment: { body: ItemCatalog.canon.bodyOf('human'), armorAc: 0, modifiers: {}, hooks: {}, weapon: {
    id: 'fist', name: 'fist', damage: '1d3', type: 'bludgeoning',
  } },
});
const field = (recipe: EnergyRecipe, targets: Fighter[], seed = 'energy'): EffectContext => {
  for (const target of targets) { target.equipment.body = ItemCatalog.canon.bodyOf(target.raceId); }
  const actor = { ...fighter('caster'), classId: 'cleric', wisdom: 16 };
  actor.ready = Array.from({ length: 8 }, (_, i) => i === recipe.level - 1 ? [recipe.id] : []);
  actor.slots = actor.ready.map(r => r.length);
  return { actor, fighters: [actor, ...targets], turn: 1, events: [], content, abilities: [],
    expressions: new Expressions(seed), retreat: false, location: null };
};
const recipe = (id: string): EnergyRecipe => {
  const found = Prototype.recipes().find(r => r.id === id);
  if (!found) { throw new Error(`Missing recipe ${id}`); }
  return found;
};
const points = { caster: { x: 0, y: 0 }, living: { x: 5, y: 0 }, undead: { x: 5, y: 0 } };

describe('twenty staged energy spells', () => {
  it('dispatches every family member by recipient nature rather than team and spends one slot per cast', () => {
    const rows = Prototype.recipes();
    expect(rows).toHaveLength(18);
    for (const r of rows) {
      const living = fighter('living'), undead = fighter('undead', true);
      // No creature class: the high level guarantees its Will save, making harmful output predictable.
      const targets = r.mass ? [living, undead] : [r.positive ? living : undead];
      const ctx = field(r, targets);
      const before = ctx.actor!.slots!.reduce((sum, n) => sum + n, 0);
      Prototype.cast(r, ctx, targets.map(t => t.id), points);
      expect(ctx.events.filter(e => e.type === 'action')).toHaveLength(1);
      expect(ctx.actor!.slots!.reduce((sum, n) => sum + n, 0)).toBe(before - (r.level > 0 ? 1 : 0));
      const heals = ctx.events.flatMap(e => e.type === 'heal' ? [e] : []);
      expect(heals).toHaveLength(1);
      expect(heals[0]?.target).toBe(r.positive ? 'living' : 'undead');
      expect(ctx.events.some(e => e.type === 'save' && e.target === heals[0]?.target)).toBe(false);
      if (r.mass) {
        const harms = ctx.events.flatMap(e => e.type === 'damage' ? [e] : []);
        expect(harms).toHaveLength(1);
        expect(harms[0]?.target).toBe(r.positive ? 'undead' : 'living');
        expect(ctx.events.filter(e => e.type === 'save')).toHaveLength(1);
        expect(ctx.events.some(e => e.type === 'attack')).toBe(false);
      }
    }
  });
  it('checks healing dice and scaling at every family cap and one level beyond it', () => {
    for (const r of Prototype.recipes()) {
      const rank = ['minor', 'light', 'moderate', 'serious', 'critical'].findIndex(s => r.id.includes(`-${s}-`));
      const cap = r.mass ? 20 + 5 * rank : 5 * rank;
      for (const level of [1, Math.max(1, cap), cap + 1, 40]) {
        const expected = rank === 0 ? 1 : rank * 4.5 + Math.min(level, cap);
        expect(Amounts.mean(r.amount, { castingLevel: level })).toBe(expected);
      }
    }
  });
  it('uses hostile touch before the Will save, and has both misses and hits on either side of the family', () => {
    for (const r of Prototype.recipes().filter(r => !r.mass)) {
      let hits = 0, misses = 0;
      for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']) {
        const target = { ...fighter('undead', r.positive), level: 1 }, ctx = field(r, [target], seed);
        ctx.actor!.level = 1;
        const result = Prototype.cast(r, ctx, [target.id], points)[0];
        const attack = ctx.events.find(e => e.type === 'attack');
        expect(attack?.type).toBe('attack');
        if (attack?.type === 'attack' && attack.success) {
          hits++;
          expect(ctx.events.some(e => e.type === 'save')).toBe(true);
          expect(ctx.events.some(e => e.type === 'damage')).toBe(true);
          expect(result).not.toBe(false);
        } else {
          misses++;
          expect(ctx.events.some(e => e.type === 'save' || e.type === 'damage')).toBe(false);
          expect(result).toBe(false);
        }
      }
      expect(hits).toBeGreaterThan(0);
      expect(misses).toBeGreaterThan(0);
    }
  });
  it('rejects invalid explicit recipient sets and spatial limits before spending or changing any health', () => {
    const r = recipe('cure-light-wounds-mass'), ctx = field(r, [fighter('living'), fighter('undead', true)]);
    ctx.actor!.level = 1;
    for (const ids of [[], ['living', 'living'], ['living', 'undead'], ['absent']]) {
      expect(() => Prototype.cast(r, ctx, ids, points)).toThrow();
    }
    ctx.actor!.level = 10;
    expect(() => Prototype.cast(r, ctx, ['living'], {})).toThrow('Missing recipient position');
    expect(() => Prototype.cast(r, ctx, ['living', 'undead'], {
      ...points, undead: { x: 40, y: 0 },
    })).toThrow('out of range');
    expect(() => Prototype.cast(r, ctx, ['living'], {
      ...points, living: { x: 51, y: 0 },
    })).toThrow('out of range');
    expect(ctx.events).toEqual([]);
    expect(ctx.actor!.slots![4]).toBe(1);
    expect(ctx.fighters.map(f => f.hp)).toEqual([500, 500, 500]);
  });
  it('checks resistance per harmful recipient before the save without preventing a willing undead heal', () => {
    const r = recipe('inflict-light-wounds-mass');
    let passed = 0, resisted = 0;
    for (const seed of 'abcdefghijklmnopqrstuvwx') {
      const living = { ...fighter('living'), raceId: 'pixie' }, undead = { ...fighter('undead', true), raceId: 'pixie' };
      const ctx = field(r, [living, undead], seed);
      ctx.actor!.level = 2;
      Prototype.cast(r, ctx, ['living', 'undead'], points);
      const checks = ctx.events.flatMap(e => e.type === 'resist' ? [e] : []);
      expect(checks).toHaveLength(1);
      expect(checks[0]?.target).toBe('living');
      expect(checks[0]?.difficulty).toBe(15);
      expect(ctx.events.some(e => e.type === 'heal' && e.target === 'undead')).toBe(true);
      expect(ctx.events.some(e => e.type === 'damage' && e.target === 'living')).toBe(checks[0]!.success);
      expect(ctx.events.some(e => e.type === 'save' && e.target === 'living')).toBe(checks[0]!.success);
      if (checks[0]!.success) { passed++; } else { resisted++; }
    }
    expect(passed).toBeGreaterThan(0);
    expect(resisted).toBeGreaterThan(0);
  });
  it('accepts exact range and pair-separation boundaries, replays, and refuses a spent slot without effects', () => {
    const r = recipe('cure-light-wounds-mass');
    const run = () => {
      const ctx = field(r, [fighter('living'), fighter('undead', true)], 'boundary');
      ctx.actor!.level = 10;
      Prototype.cast(r, ctx, ['living', 'undead'], {
        caster: { x: 0, y: 0 }, living: { x: 50, y: 0 }, undead: { x: 20, y: 0 },
      });
      return ctx;
    };
    const ctx = run(), again = run();
    expect(ctx.events).toEqual(again.events);
    expect(ctx.fighters.map(f => f.hp)).toEqual(again.fighters.map(f => f.hp));
    const health = ctx.fighters.map(f => f.hp), events = [...ctx.events];
    expect(() => Prototype.cast(r, ctx, ['living'], points)).toThrow('No ready slot');
    expect(ctx.fighters.map(f => f.hp)).toEqual(health);
    expect(ctx.events).toEqual(events);
  });
  it('uses two additional source cantrip rays through ordinary ability resolution, without slots or save riders', () => {
    expect(Prototype.recipes().length + Prototype.rays().length).toBeGreaterThanOrEqual(20);
    for (const ray of Prototype.rays()) {
      let hits = 0, misses = 0;
      for (const seed of 'abcdefghijklmnopqrstuvwx') {
        const target = { ...fighter('living'), team: 'goblins' as const };
        const ctx = field(recipe('cure-minor-wounds'), [target], seed);
        ctx.actor!.level = 1;
        const before = [...ctx.actor!.slots!];
        AbilityUse.perform(ray, target.id, ctx.expressions!, ctx);
        const attack = ctx.events.find(e => e.type === 'attack');
        expect(attack?.type === 'attack' && attack.touch).toBe('ranged');
        const harms = ctx.events.flatMap(e => e.type === 'damage' ? [e] : []);
        if (attack?.type === 'attack' && attack.success) {
          hits++;
          expect(harms).toHaveLength(1);
          expect(harms[0]!.amount).toBeGreaterThanOrEqual(1);
          expect(harms[0]!.amount).toBeLessThanOrEqual(3);
        } else { misses++; expect(harms).toEqual([]); }
        expect(ctx.actor!.slots).toEqual(before);
        expect(ctx.events.some(e => e.type === 'save' || e.type === 'status')).toBe(false);
      }
      expect(hits).toBeGreaterThan(0);
      expect(misses).toBeGreaterThan(0);
    }
  });
});
