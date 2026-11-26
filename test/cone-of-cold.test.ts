import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import { SpellLines } from '../src/presentation/spell-lines';
import { Positions } from '../src/rules/positions';
import { ItemCatalog } from '../src/item-catalog';
import type { CombatEvent, Fighter } from '../src/model';

// Cone of Cold, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 7): fifth level, 1d6 cold a casting
// level to fifteen, a cone that catches whoever stands from the caster out to where it is aimed, friend or foe, and a
// Reflex save for half against the SRD's difficulty and half the casting level. This spec is its play-identity test.
const c = new Content('cone-of-cold');
const cone = Content.abilities.find(a => a.id === 'cone_of_cold')!;
const effect = cone.effects[0]!;
const text = (a: typeof effect.save) => a!.difficulty.kind === 'deem' ? a!.difficulty.expression : '';
const mean = (level: number) => Amounts.mean(effect.kind === 'damage' && effect.amount.kind === 'deem'
  ? effect.amount.expression : '', { castingLevel: level });
const dc = (level: number, score: number, bonusSpellDC = 0) =>
  Amounts.mean(text(effect.save), { castingLevel: level, castingScore: score, bonusSpellDC });
const hardy = (f: Fighter, level = 9): Fighter => ({ ...f, level, hp: 500, maxHp: 500 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), intelligence: 16,
  abilities: ['cone_of_cold'], maxSlots: [0, 0, 0, 0, 1], slots: [0, 0, 0, 0, 1],
  prepared: [[], [], [], [], ['cone_of_cold']], ready: [[], [], [], [], ['cone_of_cold']] });
const bow = (f: Fighter): Fighter => ({ ...f, equipment: { ...f.equipment, weapon: ItemCatalog.canon.weapon('shortbow') } });
const company = (g2: Partial<Fighter> = {}, body?: Fighter) => [hardy(c.character('warrior', 'warrior', 'fighters')),
  mage(), hardy(c.character('warrior', 'g1', 'goblins')), body ?? { ...hardy(c.character('warrior', 'g2', 'goblins')), ...g2 },
  bow(hardy(c.character('ranger', 'archer', 'goblins', 'goblin')))];
// The fight stepped to the mage's turn, the cone aimed into the press, and what it did.
const cast = (seed: string, g2: Partial<Fighter> = {}, body?: Fighter) => {
  const b = new Battle({ id: 'coc', combatants: company(g2, body), abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  const aimed = b.legalCommands().find(x => x.ability === 'cone_of_cold' && x.target === 'g1')!;
  return { b, events: b.step(aimed), slots: b.state.combatants.find(f => f.id === 'mage')!.slots };
};
const colds = (events: CombatEvent[]) => events.flatMap(e => e.type === 'damage' && e.damageType === 'cold' ? [e] : []);
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [e] : []);
describe('Cone of Cold', () => {
  it('throws 1d6 a casting level, to fifteen', () => {
    expect([1, 5, 10, 14, 15, 16, 20].map(mean)).toEqual([3.5, 17.5, 35, 49, 52.5, 52.5, 52.5]);
  });
  it('is saved against at the SRD\'s difficulty and half the casting level, and a plane\'s law moves it', () => {
    expect([dc(9, 16), dc(1, 10), dc(20, 18), dc(9, 16, -1)]).toEqual([22, 15, 29, 21]);
  });
  it('catches the company\'s own warrior in the press with the foes there, each saving, the slot spent once', () => {
    const { events, slots } = cast('press');
    expect(colds(events).map(e => e.target).sort()).toEqual(['g1', 'g2', 'warrior']);
    expect(saves(events).map(e => e.type === 'save' && [e.target, e.kind, e.difficulty])).toEqual([
      ['warrior', 'reflex', 22], ['g1', 'reflex', 22], ['g2', 'reflex', 22]]);
    expect(slots).toEqual([0, 0, 0, 0, 0]);
  });
  it('halves for whoever saves and not for whoever fails, alike on a replay', () => {
    const seen = new Set<boolean>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const { events } = cast(seed), saved = new Map(saves(events).map(e => [e.target, e.type === 'save' && e.success]));
      for (const e of colds(events)) {
        expect(e.type === 'damage' && !!e.modifiers?.halfSave).toBe(saved.get(e.target)!);
        seen.add(saved.get(e.target)!);
      }
      expect(cast(seed).events).toEqual(events);
    }
    expect([...seen].sort()).toEqual([false, true]);
  });
  it('keeps a ward against the cold, and a body\'s own guard against it, through the ordinary pipeline', () => {
    const warded = colds(cast('a', { statuses: [{ id: 'waterproof', remaining: 10 }] }).events).find(e => e.target === 'g2')!;
    expect(warded.type === 'damage' && warded.modifiers?.resistance).toBe(0.5);
    const unicorn = colds(cast('a', {}, hardy(c.creature('unicorn', 'g2', 'goblins'))).events).find(e => e.target === 'g2')!;
    expect(unicorn.type === 'damage' && unicorn.modifiers?.guarded).toBeTruthy();
  });
  it('is said as it is rolled, and its aim names whom it would catch', () => {
    expect(SpellLines.of(cone)).toBe('1d6 per caster level, to 15d6 cold to every foe');
    expect(SpellLines.rules(cone)).toEqual(['A Dexterity save against 15 halves it.']);
    // What the aim's row names (CombatModel: the place and whom it would catch there) is whom it falls on.
    const { b, events } = cast('press'), mage = b.state.combatants.find(f => f.id === 'mage')!;
    expect(Positions.caught(mage, 'g1', Positions.area(cone)!, company()).map(f => f.id)).toEqual(['warrior', 'g1', 'g2']);
    expect(colds(events).map(e => e.target)).toEqual(['warrior', 'g1', 'g2']);
  });
});
