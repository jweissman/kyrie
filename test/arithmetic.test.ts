import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';
import type { Change } from '../src/lang/module';

// A product before a sum, and parentheses that group (Low Water's and Tessary's friction, LW-7 and TS-W7, the
// register's AUT-05): arithmetic ran left to right, so "watch(clock) * 10 - tallyWaitFrom(ossel)" worked only because
// the start was stored already multiplied. A dice roll in parentheses is still a Deem expression, rolled at install.
class Reckon {
  static world() {
    const m = ModuleParser.parse(`Module r "R" { Kind group. Measure n(group). Measure m(group). Entity a: group "A".
      Initially Set m(a) to 3. }`);
    return new World(m).apply(m.initial);
  }
  static value(expression: string) {
    const change = ModuleParser.parse(`Module c "C" { Kind group. Measure n(group). Measure m(group).
      Initially Set n(a) to ${expression}. }`).initial[0] as Change & { value: unknown };
    return this.world().apply([change]).number({ kind: 'call', name: 'n', args: ['a'] });
  }
}
describe('arithmetic', () => {
  it('takes a product before a sum, and parentheses group', () => {
    expect(Reckon.value('2 + m(a) * 4')).toBe(14);
    expect(Reckon.value('(2 + m(a)) * 4')).toBe(20);
    expect(Reckon.value('m(a) * 4 - 2')).toBe(10);
    expect(Reckon.value('10 - m(a) - 2')).toBe(5);
    expect(Reckon.value('2 * (m(a) - 1) * 3')).toBe(12);
  });
  it('still reads a roll in parentheses as Deem\'s', () => {
    const change = ModuleParser.parse('Module c "C" { Kind group. Measure n(group). Initially Set n(a) to (2d6). }')
      .initial[0] as Change & { value: { kind: string } };
    expect(change.value.kind).toBe('deem');
  });
});
