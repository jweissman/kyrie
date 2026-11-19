import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Amounts } from '../src/rules/amounts';
import { Creation } from '../src/rules/creation';
import { Fighting } from '../src/rules/fighting';
import { SpellLines } from '../src/presentation/spell-lines';
import { CombatTelling } from '../src/ui/combat-telling';
import { CombatModel } from '../src/ui/combat-model';
import type { CombatEvent, Fighter } from '../src/model';

// The touch, and Shocking Grasp by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 35):
// first level, 1d6 electricity a casting level to 5d6, on one foe a melee touch attack lands on, worn armour, hide
// and an armour of force not counting. A miss does no harm; the slot is spent either way. Its play-identity test.
const c = new Content('grasp');
const grasp = Content.abilities.find(a => a.id === 'shocking_grasp')!;
const hardy = (f: Fighter): Fighter => ({ ...f, level: 1, hp: 300, maxHp: 300 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), abilities: ['shocking_grasp'],
  maxSlots: [1], slots: [1], prepared: [['shocking_grasp']], ready: [['shocking_grasp']] });
const plated = (f: Fighter): Fighter => ({ ...f, equipment: { ...f.equipment, armorAc: 8 } });
const battle = (seed: string) => {
  const b = new Battle({ id: 'grasp', combatants: [mage(), plated(hardy(c.character('warrior', 'g1', 'goblins'))),
    hardy(c.character('warrior', 'g2', 'goblins'))], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const touches = (events: CombatEvent[]) => events.flatMap(e => e.type === 'attack' && e.touch ? [e] : []);
const shocks = (events: CombatEvent[]) => events.filter(e => e.type === 'damage' && e.damageType === 'electric');
describe('the touch', () => {
  it('is struck at the one touched as though it wore nothing, what it dodges by still counting', () => {
    const at = Effects.combatant(mage()), bare = Effects.combatant(hardy(c.character('warrior', 'w', 'goblins')));
    const forced = { ...bare, modifiers: { ...bare.modifiers, force: 4 } };
    const dodging = { ...bare, modifiers: { ac: -2 } };
    const chance = (d: typeof bare) => Fighting.touchChance(at, d, false);
    expect(chance({ ...bare, armorAc: 8 })).toBe(chance(bare));
    expect(chance(forced)).toBe(chance(bare));
    expect(chance(dodging)).toBeLessThan(chance(bare));
    expect(Fighting.chance(at, { ...bare, armorAc: 8 })).toBeLessThan(chance({ ...bare, armorAc: 8 }));
    expect(Fighting.touch(at, bare, () => 20, false).critical).toBe(false);
  });
});
describe('Shocking Grasp, by the SRD\'s numbers', () => {
  it('is a first-level evocation, 1d6 a casting level to five, said as a touch', () => {
    expect(grasp.spell).toEqual({ tradition: 'arcane', level: 1, school: 'evocation' });
    expect(Creation.spellbook('arcane', 1, 'evocation')).toContain('shocking_grasp');
    const e = grasp.effects[0]!, expression = e.kind === 'damage' && e.amount.kind === 'deem' ? e.amount.expression : '';
    expect([1, 3, 5, 6, 20].map(castingLevel => Amounts.mean(expression, { castingLevel })))
      .toEqual([3.5, 10.5, 17.5, 17.5, 17.5]);
    expect(SpellLines.of(grasp)).toContain('if the touch lands');
  });
  it('touches before it harms: a miss does nothing, a hit its dice, the slot spent either way', () => {
    let hits = 0, misses = 0;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']) {
      const b = battle(seed), events = b.step(b.legalCommands().find(x => x.ability === 'shocking_grasp' && x.target === 'g1')!);
      const [touch] = touches(events);
      expect(touches(events).length).toBe(1);
      expect(touch).toMatchObject({ actor: 'mage', target: 'g1', touch: 'melee', weapon: '', critical: false });
      expect(shocks(events).length).toBe(touch!.success ? 1 : 0);
      // Kyr's electric, as Lightning Bolt's: Orsino's lightning may paralyse, the SRD's grasp does not.
      expect(events.some(e => e.type === 'status' && e.detail === 'paralyzed')).toBe(false);
      expect(b.state.combatants.find(f => f.id === 'mage')!.slots).toEqual([0]);
      const told = CombatTelling.exchanges(events, b.state).map(t => t.text).join(' ');
      expect(told).toContain(touch!.success ? 'uses Shocking Grasp on' : 'and misses');
      if (touch!.success) { hits++; } else { misses++; }
    }
    expect(hits).toBeGreaterThan(0);
    expect(misses).toBeGreaterThan(0);
  });
  it('shows its aim\'s odds as a touch\'s, the plate not counting', () => {
    const b = battle('odds'), screen = CombatModel.build(b);
    const aims = screen.abilities.find(a => a.id === 'shocking_grasp')?.targets ?? [];
    const odds = (id: string) => aims.find(t => t.id === id)?.odds;
    const who = (id: string) => Effects.combatant(b.state.combatants.find(f => f.id === id)!);
    expect(odds('g1')).toBe(Fighting.touchChance(who('mage'), { ...who('g1'), armorAc: 0 }, false));
    expect(odds('g1')).toBeGreaterThan(Fighting.chance(who('mage'), who('g1')));
  });
});
