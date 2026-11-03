import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { World } from '../src/lang/world';

// A measure that cannot pass its most (Low Water's 7, the circus's 9 and its README: fondness, a tally, a larder kept
// under a ceiling by hand), and arithmetic with a quotient, the less and the greater of two (AUT-05).
describe('measures', () => {
  const m = ModuleParser.parse(`Module c "C" { Kind group. Measure fond(group) at most 10. Measure n(group). Entity a: group "A".
    Initially Set fond(a) to 8. Initially Increase fond(a) by 5. Initially Set n(a) to min(fond(a), 7) + 17 / 5 + max(2, 3). }`);
  it('stop at their most, and reckon a quotient, a least and a greatest', () => {
    const w = new World(m).apply(m.initial), n = (name: string) => w.number({ kind: 'call', name, args: ['a'] });
    expect(n('fond')).toBe(10);
    expect(n('n')).toBe(7 + 3 + 3);
  });
  it('are written as they were declared', () => {
    expect(ModuleWriter.write(m)).toContain('Measure fond(group) at most 10.');
    expect(ModuleWriter.write(m)).toContain('min(fond(a), 7)');
  });
});
