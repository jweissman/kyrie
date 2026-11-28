import { describe, expect, it } from 'bun:test';
import { QuantityCaution } from '../../scripts/quantity/caution';

// The five expeditions' careful company (OR-1860, scripts/quantity/caution.ts): what it does with what the page says of
// a danger. The reference seeds had lost a company on every life by lingering where the page said it could die.
const f = (team: 'fighters' | 'goblins', hp: number, maxHp: number) => ({ team, hp, maxHp });
describe('the expeditions\' caution', () => {
  it('breaks off a fight going badly: anyone at a third, or at half with the foes still strong', () => {
    // s4's adit: Wenna at 6 of 14, two of three robbers unhurt, fell the next blow.
    expect(QuantityCaution.flees([f('fighters', 6, 14), f('fighters', 8, 12), f('goblins', 7, 7), f('goblins', 0, 6),
      f('goblins', 6, 6)])).toBe(true);
    expect(QuantityCaution.flees([f('fighters', 4, 14), f('goblins', 1, 7)])).toBe(true);
    // At half with the foes mostly down, or hurt but above half, fought on.
    expect(QuantityCaution.flees([f('fighters', 7, 14), f('goblins', 1, 7), f('goblins', 0, 6)])).toBe(false);
    expect(QuantityCaution.flees([f('fighters', 9, 14), f('goblins', 7, 7)])).toBe(false);
    // The fallen are not who it flees for.
    expect(QuantityCaution.flees([f('fighters', 0, 14), f('fighters', 12, 12), f('goblins', 7, 7)])).toBe(false);
  });
  it('draws out what is heard in a room before going in, once (s7: the long passage\'s dead)', () => {
    const ids = ['go(p,passage)', 'draw_out(passage)', 'go(q,robbers)'];
    expect(QuantityCaution.ahead(ids, new Set(), 'go(p,passage)')).toBe('draw_out(passage)');
    expect(QuantityCaution.ahead(ids, new Set(['draw_out(passage)']), 'go(p,passage)')).toBe('go(p,passage)');
    expect(QuantityCaution.ahead(ids, new Set(), 'go(q,robbers)')).toBe('go(q,robbers)');
    expect(QuantityCaution.ahead(ids, new Set(), 'search(here)')).toBe('search(here)');
    expect(QuantityCaution.ahead(ids, new Set(), undefined)).toBeUndefined();
  });
  it('draws out nothing unseen while hurt, nor goes in on it (OR-1890: s7\'s fifth, the embalmers\' mummy)', () => {
    const ids = ['go(p,passage)', 'draw_out(passage)', 'go(q,robbers)'];
    expect(QuantityCaution.ahead(ids, new Set(), 'go(p,passage)', false)).toBeUndefined();
    expect(QuantityCaution.ahead(ids, new Set(), 'go(q,robbers)', false)).toBe('go(q,robbers)');
  });
  it('takes the way out a fight offers once its blows barely bite and it costs the company (OR-1858)', () => {
    const fighters = [{ ...f('fighters', 9, 14), id: 'w' }, { ...f('goblins', 11, 11), id: 'b0' },
      { ...f('goblins', 11, 11), id: 'b1' }] as unknown as Parameters<typeof QuantityCaution.flees>[0];
    const blunted = (n: number) => ({ type: 'damage' as const, turn: n, actor: 'w', target: 'b0', rolled: 4, amount: 2,
      hp: 9, modifiers: { bonus: 0, resistance: 0.5, reduction: 0 } });
    const round = (n: number) => ({ type: 'initiative' as const, turn: n, order: [] });
    const events = [round(1), blunted(1), round(2), blunted(2), round(3)];
    expect(QuantityCaution.flees(fighters, events)).toBe(true);
    expect(QuantityCaution.flees(fighters, events.slice(0, 4))).toBe(false);
    expect(QuantityCaution.flees(fighters)).toBe(false);
  });
});
