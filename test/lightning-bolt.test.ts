import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import { Positions } from '../src/rules/positions';
import { SpellLines } from '../src/presentation/spell-lines';
import { ItemCatalog } from '../src/item-catalog';
import type { CombatEvent, Fighter } from '../src/model';

// Lightning Bolt, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 9), and the line it runs along:
// 1d6 electricity a casting level to ten, a Reflex save for half, struck along a line from the caster through the one
// it is aimed at and on to the far end, catching that one and the first who stands in each other place it crosses,
// friend or foe. This spec is its play-identity test, and the line's.
const c = new Content('lightning-bolt');
const bolt = Content.abilities.find(a => a.id === 'lightning_bolt')!;
const effect = bolt.effects[0]!;
const said = (a: typeof effect.save) => a!.difficulty.kind === 'deem' ? a!.difficulty.expression : '';
const mean = (level: number) => Amounts.mean(effect.kind === 'damage' && effect.amount.kind === 'deem'
  ? effect.amount.expression : '', { castingLevel: level });
const hardy = (f: Fighter, level = 7): Fighter => ({ ...f, level, hp: 500, maxHp: 500 });
const bow = (f: Fighter): Fighter => ({ ...f, equipment: { ...f.equipment, weapon: ItemCatalog.canon.weapon('shortbow') } });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), intelligence: 16,
  abilities: ['lightning_bolt'], maxSlots: [0, 0, 0, 1], slots: [0, 0, 0, 1],
  prepared: [[], [], [], ['lightning_bolt']], ready: [[], [], [], ['lightning_bolt']] });
// The company's warrior in the press with two foes, its mage behind; the foes' archer behind them.
const company = () => [hardy(c.character('warrior', 'warrior', 'fighters')), mage(),
  hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2', 'goblins')),
  bow(hardy(c.character('ranger', 'archer', 'goblins', 'goblin')))];
const ready = (seed: string) => {
  const b = new Battle({ id: 'bolt', combatants: company(), abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const cast = (at: string, seed = 'bolt') => {
  const b = ready(seed), events = b.step(b.legalCommands().find(x => x.ability === 'lightning_bolt' && x.target === at)!);
  return { events, slots: b.state.combatants.find(f => f.id === 'mage')!.slots };
};
const struck = (events: CombatEvent[]) => events.flatMap(e => e.type === 'damage' && e.damageType === 'electric'
  ? [e.target] : []);
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against
  ? [[e.target, e.kind, e.difficulty, e.success] as [string, string, number, boolean]] : []);
describe('Lightning Bolt', () => {
  it('throws 1d6 a casting level, to ten, saved against at the SRD\'s difficulty and half the casting level', () => {
    expect([1, 5, 9, 10, 11, 20].map(mean)).toEqual([3.5, 17.5, 31.5, 35, 35, 35]);
    expect([5, 7].map(level => Amounts.mean(said(effect.save), { castingLevel: level, castingScore: 16,
      bonusSpellDC: 0 }))).toEqual([18, 19]);
  });
  it('is aimed at any foe, not at a place: where the line runs is whom it is aimed at', () => {
    expect(ready('bolt').legalCommands().filter(x => x.ability === 'lightning_bolt').map(x => x.target))
      .toEqual(['g1', 'g2', 'archer']);
  });
  it('aimed into the press strikes that foe and the first beyond it, sparing the company\'s own front and the rest', () => {
    const { events, slots } = cast('g1');
    expect(struck(events)).toEqual(['g1', 'archer']);
    expect(saves(events).map(s => s.slice(0, 3))).toEqual([['g1', 'reflex', 19], ['archer', 'reflex', 19]]);
    expect(slots).toEqual([0, 0, 0, 0]);
  });
  it('aimed over the press strikes the first who stands in it, though it is the company\'s own', () => {
    expect(struck(cast('archer').events)).toEqual(['warrior', 'archer']);
  });
  it('halves for whoever saves, alike on a replay', () => {
    const outcomes = new Set<boolean>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const { events } = cast('g1', seed), saved = new Map(saves(events).map(s => [s[0], s[3]]));
      for (const e of events) {
        if (e.type !== 'damage' || e.damageType !== 'electric') { continue; }
        expect(!!e.modifiers?.halfSave).toBe(saved.get(e.target)!);
        outcomes.add(saved.get(e.target)!);
      }
      expect(cast('g1', seed).events).toEqual(events);
    }
    expect([...outcomes].sort()).toEqual([false, true]);
  });
  it('is a line, not a cone: the cone aimed alike would take the whole press, the company\'s warrior with it', () => {
    const fighters = company(), from = fighters[1]!;
    expect(Positions.area(bolt)).toBe('line');
    expect(Positions.caught(from, 'g1', 'line', fighters).map(f => f.id)).toEqual(['g1', 'archer']);
    expect(Positions.caught(from, 'g1', 'cone', fighters).map(f => f.id)).toEqual(['warrior', 'g1', 'g2']);
  });
  it('is said as it is rolled', () => {
    expect(SpellLines.rules(bolt)).toEqual(['A Dexterity save against 13 halves it.']);
  });
});
