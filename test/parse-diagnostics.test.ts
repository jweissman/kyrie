import { describe, expect, it } from 'bun:test';
import { Diagnostics } from '../src/lang/diagnostics';
import { ModuleParser } from '../src/lang/module-parser';

// A parse error says what was being written and what went wrong with it, not the thirty declarations that could have
// come next (Quittance's friction 20 and A05).
class Parsed {
  static error(line: string): string {
    try { ModuleParser.parse(`Module m "x" {\n  Place a "a" is settlement.\n  ${line}\n}`); } catch (e) {
      return Diagnostics.parse(e, 'data/adventures/x/a.kyr').message;
    }
    return '';
  }
}
describe('a parse error', () => {
  it('says a clause comes before the stop, a Rule wants its braces, and a finished declaration what may follow', () => {
    expect(Parsed.error('Observe o at a when true "text". teaches x.'))
      .toContain('The Observe ended at the stop before "teaches": "teaches" goes before its final "."');
    expect(Parsed.error('Rule r when at(a, b) says "hi".'))
      .toContain('Expected "{": a Rule ends with its changes in braces, "{ }" if it only says something');
    const finished = Parsed.error('Place b "b" is settlement. Bogus');
    expect(finished).toContain('The Place is finished; a new declaration (Place, Person, Rule, …) or "}" comes next');
    expect(finished).not.toContain('"Milestone"');
    expect(finished).toMatch(/^data\/adventures\/x\/a\.kyr:3:/);
  });
});
