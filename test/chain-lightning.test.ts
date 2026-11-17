import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import { Positions } from '../src/rules/positions';
import { CanonRuntime } from '../src/canon/canon-runtime';
import type { CombatEvent, Fighter } from '../src/model';

// Chain Lightning, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 15), and the chain it runs by:
// sixth level, 1d6 electricity a casting level to twenty on the foe it is aimed at, and a leap to one other foe a
// casting level, each struck once, never a friend, each leap half what the first was dealt (rounded down); a Reflex
// save for half by each. Orsino's had no effect Kyr could run. This spec is its play-identity test.
const c = new Content('chain');
const chain = Content.abilities.find(a => a.id === 'chain_lightning')!;
const effect = chain.effects[0]!;
const text = (e: typeof effect) => e.kind === 'damage' && e.amount.kind === 'deem' ? e.amount.expression : '';
const hardy = (f: Fighter, level = 12): Fighter => ({ ...f, level, hp: 900, maxHp: 900 });
const mage = (level: number): Fighter => {
  const slots = [0, 0, 0, 0, 0, 1];
  return { ...hardy(c.character('mage', 'mage', 'fighters'), level), intelligence: 16, abilities: ['chain_lightning'],
    maxSlots: slots, slots: [...slots], prepared: slots.map(n => n ? ['chain_lightning'] : []),
    ready: slots.map(n => n ? ['chain_lightning'] : []) };
};
// The company's warrior beside the mage, and as many foes as asked.
const cast = (level: number, foes: number, seed = 'storm') => {
  const b = new Battle({ id: 'chain', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), mage(level),
    ...Array.from({ length: foes }, (_, i) => hardy(c.character('warrior', `g${i + 1}`, 'goblins')))],
  abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return { b, events: b.step(b.legalCommands().find(x => x.ability === 'chain_lightning' && x.target === 'g2')!) };
};
const struck = (events: CombatEvent[]) =>
  events.flatMap(e => e.type === 'damage' && e.damageType === 'electric' ? [e] : []);
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [e] : []);
describe('Chain Lightning, by the SRD\'s numbers', () => {
  it('is a sixth-level chain that runs, 1d6 a casting level to twenty, a leap a casting level to twenty', () => {
    expect([chain.spell!.level, CanonRuntime.playable('chain_lightning'), Positions.area(chain)]).toEqual([6, true, undefined]);
    expect([1, 11, 20, 21].map(castingLevel => Amounts.mean(text(effect), { castingLevel })))
      .toEqual([3.5, 38.5, 70, 70]);
    const count = effect.chain!.count;
    expect([11, 20, 25].map(castingLevel => Amounts.mean(count.kind === 'deem' ? count.expression : '', { castingLevel })))
      .toEqual([11, 20, 20]);
  });
  it('strikes the one aimed at first, then leaps to every other foe once, and never to a friend', () => {
    const { events, b } = cast(12, 4);
    expect(struck(events).map(e => e.type === 'damage' && e.target)).toEqual(['g2', 'g1', 'g3', 'g4']);
    expect(saves(events).map(e => e.type === 'save' && [e.target, e.kind])).toEqual(
      [['g2', 'reflex'], ['g1', 'reflex'], ['g3', 'reflex'], ['g4', 'reflex']]);
    expect(b.state.combatants.find(f => f.id === 'mage')!.slots).toEqual([0, 0, 0, 0, 0, 0]);
  });
  it('leaps no more times than the casting level', () => {
    // A twelfth-level caster at fifteen foes: the first and twelve more.
    expect(struck(cast(12, 15).events).length).toBe(13);
  });
  it('gives each leap half what the first was dealt, rounded down, each saving for half on their own', () => {
    const seen = new Set<boolean>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const { events } = cast(12, 4, seed), hits = struck(events);
      const saved = new Map(saves(events).map(e => [e.type === 'save' && e.target, e.type === 'save' && e.success]));
      // What each was dealt before its own save and guard (the event's rolled).
      const first = hits[0]!, dealt = (e: CombatEvent) => e.type === 'damage' ? e.rolled ?? 0 : 0;
      const rolled = dealt(first);
      for (const hit of hits.slice(1)) {
        const id = hit.type === 'damage' ? hit.target : '';
        seen.add(!!saved.get(id));
        expect(hit.type === 'damage' && !!hit.modifiers?.halfSave).toBe(!!saved.get(id));
        expect(dealt(hit)).toBe(Math.floor(rolled / 2));
      }
      expect(cast(12, 4, seed).events).toEqual(events);
    }
    expect([...seen].sort()).toEqual([false, true]);
  });
});
