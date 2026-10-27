import { describe, expect, it } from 'bun:test';
import { Expressions } from '../src/expressions';

// A die and a weak creature's own modifier can come out below nothing (a bear mauling with its strength drained). That
// is no harm, as a weapon's blow adds only a positive modifier; it had thrown mid-fight, once a warrior in mail rather
// than plate was hit often enough for it to happen. Any other amount below nothing is still a mistake in what was
// written, and says so.
describe('harm', () => {
  it('stops at nothing', () => {
    const e = new Expressions('harm');
    expect(e.harm({ kind: 'deem', expression: '1d6 - 10' }, {})).toBe(0);
    expect(e.harm({ kind: 'literal', value: 4 }, {})).toBe(4);
    expect(() => e.amount({ kind: 'deem', expression: '1d6 - 10' }, {})).toThrow(/nonnegative/);
  });
});
