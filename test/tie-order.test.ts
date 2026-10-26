import { describe, expect, it } from 'bun:test';
import { Tactics } from '../src/tactics';

// A fight's ties are broken by the targets' ids as written, whatever the host's language (the architecture review's
// H6, from its probe det-locale: under an Estonian, Czech or Danish default, 20 of 20 seeded fights struck another).
describe('a tie between targets', () => {
  it('is broken by the ids as written, not as a language sorts them', () => {
    // Danish sorts "aa" after "z"; Estonian "z" after "s"; the ids as written do neither.
    expect(['zack', 'aage', 'sam', 'chuck', 'hank'].sort(Tactics.order)).toEqual(['aage', 'chuck', 'hank', 'sam', 'zack']);
    expect(Tactics.order('a', 'a')).toBe(0);
  });
});
