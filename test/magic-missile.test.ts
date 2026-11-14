import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Expressions } from '../src/expressions';
import { SpellLines } from '../src/presentation/spell-lines';
import type { CombatEvent, Fighter } from '../src/model';

// Magic Missile, the SRD's (doc/architecture/mission-21/rules/magic-missile.md): a missile at the first casting level
// and one more for every two past it, to five; each 1d4+1 force, dealt and told on its own; every one at the foe
// chosen, passing to the next standing as it falls; the slot spent once. This spec is its play-identity test.
const c = new Content('magic-missile');
const missile = Content.abilities.find(a => a.id === 'magic_missile')!;
const count = (level: number) => new Expressions('mm').number(missile.effects[0]!.count!.kind === 'deem'
  ? missile.effects[0]!.count!.expression : '0', { castingLevel: level });
const mage = (level: number): Fighter => ({ ...c.character('mage', 'mage', 'fighters'), level, hp: 99, maxHp: 99,
  abilities: ['magic_missile'], maxSlots: [1], slots: [1], prepared: [['magic_missile']], ready: [['magic_missile']] });
const foe = (id: string, hp: number): Fighter => ({ ...c.character('warrior', id, 'goblins'), hp, maxHp: hp });
const volley = (level: number, foes: Fighter[], seed = 'mm') => {
  const b = new Battle({ id: 'mm', combatants: [mage(level), ...foes], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  const before = b.state.combatants.find(f => f.id === 'mage')!.slots!.slice();
  const events = b.step(b.legalCommands().find(x => x.ability === 'magic_missile' && x.target === foes[0]!.id)!);
  return { events, before, after: b.state.combatants.find(f => f.id === 'mage')!.slots! };
};
const struck = (events: CombatEvent[]) => events.flatMap(e => e.type === 'damage' && e.damageType === 'force'
  ? [{ target: e.target, rolled: e.rolled }] : []);
describe('Magic Missile', () => {
  it('flies a missile at the first casting level and one more for every two past it, to five', () => {
    expect([1, 2, 3, 4, 5, 7, 8, 9, 10, 20].map(count)).toEqual([1, 1, 2, 2, 3, 4, 4, 5, 5, 5]);
  });
  it('strikes the one foe chosen with every missile, each its own 1d4+1, and spends the slot once', () => {
    const { events, before, after } = volley(5, [foe('g1', 90), foe('g2', 90)]);
    const hits = struck(events);
    expect(hits.map(h => h.target)).toEqual(['g1', 'g1', 'g1']);
    expect(hits.every(h => h.rolled >= 2 && h.rolled <= 5)).toBe(true);
    expect([before, after]).toEqual([[1], [0]]);
  });
  it('passes a missile still to come to the next foe standing when the chosen falls, alike on a replay', () => {
    const first = volley(9, [foe('g1', 1), foe('g2', 90), foe('g3', 90)]);
    expect(struck(first.events).map(h => h.target)).toEqual(['g1', 'g2', 'g2', 'g2', 'g2']);
    expect(volley(9, [foe('g1', 1), foe('g2', 90), foe('g3', 90)]).events).toEqual(first.events);
  });
  it('is said as it is rolled', () => {
    expect(SpellLines.of(missile)).toBe('1d4+1 force to one foe, once at the first level, five times by the ninth');
  });
});
