import { describe, expect, it } from 'bun:test';
import { DebtShapes } from '../../src/world/debt-shapes';

// A kind of thing is named once for the whole catalog, before any world's values are filled (OR-541): the debt's purse
// had read "a purse for {creditor}" wherever its kind was named. Its items keep their own words, filled per world.
const carry = () => (DebtShapes as unknown as { carry(): string }).carry();
describe('the kinds a debt carries', () => {
  it('are named without a hole for a world to fill', () => {
    const kinds = [...carry().matchAll(/^\s*Kind (\w+) "([^"]*)"/gm)].map(m => [m[1], m[2]]);
    expect(kinds.length).toBeGreaterThan(0);
    expect(kinds.filter(([, name]) => name!.includes('{'))).toEqual([]);
  });
});
