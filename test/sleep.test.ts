import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import { Positions } from '../src/rules/positions';
import { Creation } from '../src/rules/creation';
import { HitDicePool } from '../src/rules/hit-dice-pool';
import type { CombatEvent, Fighter } from '../src/model';

// Sleep, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 14): first level, a burst falling on friend
// and foe, four Hit Dice of them, fewest first, none of five or more (HitDicePool), a Will save to negate at the SRD's
// difficulty and half the casting level; the undead are proof against it and take nothing from the four; a blow that
// wounds a sleeper wakes them. This spec is its play-identity test.
const c = new Content('sleep');
const sleep = Content.abilities.find(a => a.id === 'sleep')!;
const effect = sleep.effects[0]!;
const hardy = (f: Fighter, level: number): Fighter => ({ ...f, level, hp: 500, maxHp: 500 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters'), 5), intelligence: 16, abilities: ['sleep'],
  maxSlots: [1], slots: [1], prepared: [['sleep']], ready: [['sleep']] });
// The company's warrior and the mage; three foes in the press of the levels given (the third a zombie if asked).
const fight = (levels: { warrior: number; foes: number[]; zombie?: boolean }, seed = 'press') => {
  const foes = levels.foes.map((l, i) => hardy(levels.zombie && i === 1 ? c.creature('zombie', `g${i + 1}`, 'goblins')
    : c.character('warrior', `g${i + 1}`, 'goblins'), l));
  const b = new Battle({ id: 'sleep', combatants: [hardy(c.character('warrior', 'warrior', 'fighters'), levels.warrior),
    mage(), ...foes], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const cast = (b: Battle) => b.step(b.legalCommands().find(x => x.ability === 'sleep' && x.target === 'g1')!);
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [e] : []);
const asleep = (b: Battle) => b.state.combatants.filter(f => f.statuses.some(s => s.id === 'asleep')).map(f => f.id);
describe('Sleep, by the SRD\'s numbers', () => {
  it('is a first-level burst, saved against at the SRD\'s difficulty and half the casting level', () => {
    expect([sleep.spell!.level, Positions.area(sleep), effect.hitDice]).toEqual([1, 'burst', 4]);
    expect(Creation.spellbook('arcane', 1, 'enchantment')).toContain('sleep');
    const dc = (castingLevel: number, castingScore: number) => Amounts.mean(effect.save!.difficulty.kind === 'deem'
      ? effect.save!.difficulty.expression : '', { castingLevel, castingScore, bonusSpellDC: 0 });
    expect([dc(1, 16), dc(5, 16), dc(10, 10)]).toEqual([14, 16, 16]);
  });
  it('falls on four Hit Dice of those in the place, the fewest first, the company\'s own among them', () => {
    // The press: the warrior of the third level, foes of the first, first and second: the foes' four are held.
    const held = saves(cast(fight({ warrior: 3, foes: [1, 1, 2] }))).map(e => e.type === 'save' && [e.target, e.kind]);
    expect(held).toEqual([['g1', 'sleep'], ['g2', 'sleep'], ['g3', 'sleep']]);
    // A first-level warrior is held before the foe of the second, in the fight's order among equals.
    expect(saves(cast(fight({ warrior: 1, foes: [1, 1, 2] }))).map(e => e.type === 'save' && e.target))
      .toEqual(['warrior', 'g1', 'g2']);
  });
  it('touches none of five Hit Dice or more, and is not offered against them', () => {
    const b = fight({ warrior: 5, foes: [5, 6, 5] });
    expect(b.legalCommands().filter(x => x.ability === 'sleep')).toEqual([]);
  });
  it('takes nothing from the four for one proof against it: the zombie saves, immune, and the rest are held', () => {
    const events = cast(fight({ warrior: 3, foes: [1, 1, 2], zombie: true }));
    expect(saves(events).map(e => e.type === 'save' && [e.target, !!e.immune]))
      .toEqual([['g1', false], ['g2', true], ['g3', false]]);
  });
  it('lays whoever fails asleep and not whoever saves, and a blow that wounds a sleeper wakes them', () => {
    const seen = new Set<boolean>();
    let woken = false;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const b = fight({ warrior: 3, foes: [1, 1, 2] }, seed), events = cast(b), slept = asleep(b);
      for (const s of saves(events)) {
        expect(slept.includes(s.type === 'save' ? s.target : '')).toBe(!(s.type === 'save' && s.success));
        seen.add(s.type === 'save' && s.success);
      }
      for (let i = 0; i < 12 && !woken; i++) {
        const before = asleep(b), step = b.step(b.chosen());
        const hurt = step.flatMap(e => e.type === 'damage' && e.amount > 0 && before.includes(e.target) ? [e.target] : []);
        if (hurt.length) {
          const standing = hurt.filter(id => b.state.combatants.find(f => f.id === id)!.hp > 0);
          expect(standing.filter(id => asleep(b).includes(id))).toEqual([]);
          woken = standing.length > 0;
        }
      }
    }
    expect([[...seen].sort(), woken]).toEqual([[false, true], true]);
  });
  it('is aimed at a place, and its aim names only those it would hold (CombatModel reads the same pool)', () => {
    const b = fight({ warrior: 3, foes: [1, 1, 2] }), mage = b.state.combatants.find(f => f.id === 'mage')!;
    const caught = Positions.caught(mage, 'g1', 'burst', b.state.combatants);
    expect(caught.map(f => f.id)).toEqual(['warrior', 'g1', 'g2', 'g3']);
    expect(HitDicePool.held(effect, caught).map(f => f.id)).toEqual(['g1', 'g2', 'g3']);
  });
  it('counts fixed bodies by their own Hit Dice, not by the level the encounter assigns them', () => {
    const bodies = [c.creature('boar/wild', 'boar', 'goblins', 1),
      c.creature('dog/drove', 'dog', 'goblins', 7), c.creature('owlbear/fell', 'owlbear', 'goblins', 1),
      c.creature('rat/cellar', 'rat', 'goblins', 5)];
    expect(HitDicePool.held(effect, bodies).map(f => f.id)).toEqual(['dog', 'rat']);
    expect(HitDicePool.held(effect, [bodies[0]!]).map(f => f.id)).toEqual(['boar']);
    expect(HitDicePool.held(effect, [bodies[2]!])).toEqual([]);
  });
  it('offers and resolves Sleep on a high-level one-Hit-Die dog, not a low-level five-Hit-Die owlbear', () => {
    const dog = hardy(c.creature('dog/drove', 'dog', 'goblins', 7), 7);
    const owl = hardy(c.creature('owlbear/fell', 'owl', 'goblins', 1), 1);
    const b = new Battle({ id: 'fixed-hd', combatants: [mage(), dog, owl], abilities: Content.abilities }, 'fixed-hd', 200);
    for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
      b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
    }
    const choices = b.legalCommands().filter(x => x.ability === 'sleep');
    expect(choices.some(x => x.target === 'dog')).toBe(true);
    const events = b.step(choices.find(x => x.target === 'dog')!);
    expect(saves(events).map(e => e.type === 'save' && e.target)).toEqual(['dog']);
  });
});
