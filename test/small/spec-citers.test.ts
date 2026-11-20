import { describe, expect, it } from 'bun:test';
import { RegisterTickets, type Row } from '../../scripts/register-tickets';
import { SpecCiters } from '../../scripts/spec-citers';

// The rows that cite a changed spec, listed for reopening (MT-19; closure-review-method.md, pattern 4): a spec by its
// own name, every row naming it as its own word in its what or status cell, and nothing for a file that is no spec.
describe('the rows that cite a changed spec', () => {
  const row = (id: string, status: string, state: Row['state'] = 'closed') =>
    ({ id, what: 'a defect', status, state } as Row);
  it('names a spec by its own name, whatever its folder', () => {
    expect(['test/talk-numbers.test.ts', 'test/small/own-hex.test.ts', 'test/features/a/b-c.pin.test.ts',
      'src/rules/talk-numbers.ts'].map(f => SpecCiters.name(f))).toEqual(['talk-numbers', 'own-hex', 'b-c', undefined]);
  });
  it('finds the rows that cite it, by path, by its form or by its name alone, and not a longer name', () => {
    const rows = [row('ZZ-01', 'fixed: test/talk-numbers.test.ts:12'), row('ZZ-02', 'held by talk-numbers', 'open'),
      row('ZZ-03', 'fixed: talk-numbers-old pins it'), row('ZZ-04', 'fixed: small/talk-numbers'),
      row('ZZ-05', 'fixed: test/quiet-talk-numbers')];
    expect(SpecCiters.citers(['test/talk-numbers.test.ts', 'web/reader/build.ts'], rows)).toEqual([{ spec:
      'test/talk-numbers.test.ts', name: 'talk-numbers', rows: [{ id: 'ZZ-01', state: 'closed' },
      { id: 'ZZ-02', state: 'open' }, { id: 'ZZ-04', state: 'closed' }] }]);
  });
  it('reads the register and its archive: a spec the closures lean on is cited by closed rows', () => {
    const [found] = SpecCiters.citers(['test/small/closure-lint.test.ts'], RegisterTickets.rows(RegisterTickets.text()));
    expect(found!.rows.map(r => r.id)).toContain('MT-17');
  });
});
