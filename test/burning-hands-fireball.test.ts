import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import { Positions } from '../src/rules/positions';
import { Creation } from '../src/rules/creation';
import { ItemCatalog } from '../src/item-catalog';
import type { CombatEvent, Fighter } from '../src/model';

// Burning Hands and Fireball, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 12), at the SRD's
// levels by the spell draw by rank (case 11): Burning Hands first level, 1d4 fire a casting level to five, a cone;
// Fireball third, 1d6 a casting level to ten, a burst; each a Reflex save for half at the SRD's difficulty and half the
// casting level. Lightning Bolt goes to the third level with them. This spec is their play-identity test.
const c = new Content('elementals');
const spell = (id: string) => Content.abilities.find(a => a.id === id)!;
const amount = (id: string) => { const e = spell(id).effects[0]!; return e.kind === 'damage' && e.amount.kind === 'deem' ? e.amount.expression : ''; };
const dc = (id: string, at: Record<string, number>) => {
  const s = spell(id).effects[0]!.save!; return Amounts.mean(s.difficulty.kind === 'deem' ? s.difficulty.expression : '', at);
};
const hardy = (f: Fighter, level = 7): Fighter => ({ ...f, level, hp: 500, maxHp: 500 });
const bow = (f: Fighter): Fighter => ({ ...f, equipment: { ...f.equipment, weapon: ItemCatalog.weapon('shortbow') } });
const caster = (id: string, tier: number): Fighter => {
  const slots = Array.from({ length: tier }, (_, i) => i === tier - 1 ? 1 : 0);
  return { ...hardy(c.character('mage', 'mage', 'fighters')), intelligence: 16, abilities: [id], maxSlots: slots,
    slots: [...slots], prepared: slots.map(n => n ? [id] : []), ready: slots.map(n => n ? [id] : []) };
};
const cast = (id: string, tier: number) => {
  const company = [hardy(c.character('warrior', 'warrior', 'fighters')), caster(id, tier),
    hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2', 'goblins')),
    bow(hardy(c.character('ranger', 'archer', 'goblins', 'goblin')))];
  const b = new Battle({ id: 'elementals', combatants: company, abilities: Content.abilities }, 'press', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  const events = b.step(b.legalCommands().find(x => x.ability === id && x.target === 'g1')!);
  return { events, slots: b.state.combatants.find(f => f.id === 'mage')!.slots };
};
const fire = (events: CombatEvent[]) => events.flatMap(e => e.type === 'damage' && e.damageType === 'fire' ? [e.target] : []);
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [[e.kind, e.difficulty]] : []);
describe('Burning Hands and Fireball, by the SRD\'s numbers', () => {
  it('stand at the SRD\'s levels, Lightning Bolt with Fireball, in the pools a mage draws from', () => {
    expect(['burning_hands', 'fireball', 'lightning_bolt'].map(id => spell(id).spell!.level)).toEqual([1, 3, 3]);
    expect(Creation.spellbook('arcane', 1, 'evocation')).toContain('burning_hands');
    expect(Creation.spellbook('arcane', 3, 'evocation')).toEqual(expect.arrayContaining(['fireball', 'lightning_bolt']));
  });
  it('throw a die a casting level to their caps, saved against at the SRD\'s difficulty and half the casting level', () => {
    expect([1, 4, 5, 6].map(level => Amounts.mean(amount('burning_hands'), { castingLevel: level }))).toEqual([2.5, 10, 12.5, 12.5]);
    expect([1, 9, 10, 11].map(level => Amounts.mean(amount('fireball'), { castingLevel: level }))).toEqual([3.5, 31.5, 35, 35]);
    expect([dc('burning_hands', { castingLevel: 1, castingScore: 16, bonusSpellDC: 0 }),
      dc('fireball', { castingLevel: 5, castingScore: 16, bonusSpellDC: 0 })]).toEqual([14, 18]);
  });
  it('Burning Hands is a cone and Fireball a burst: aimed into the press, both catch the company\'s own warrior', () => {
    expect([Positions.area(spell('burning_hands')), Positions.area(spell('fireball'))]).toEqual(['cone', 'burst']);
    for (const [id, tier] of [['burning_hands', 1], ['fireball', 3]] as const) {
      const { events, slots } = cast(id, tier);
      expect(fire(events).sort()).toEqual(['g1', 'g2', 'warrior']);
      expect(saves(events).every(([kind]) => kind === 'reflex')).toBe(true);
      expect(slots!.every(n => n === 0)).toBe(true);
    }
  });
});
