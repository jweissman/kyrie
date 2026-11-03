import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';

// A quest's own number, and a query given one (test/fixtures/probes/scalar): a measure of nothing at all, not hung on
// an office (Quittance's bg 15, QTC-A12), and a query that compares against its own parameter, not the comparison
// written out at every use (Gosse's Company's second pass, GOS-12).
describe('numbers of a quest, and a query given one', () => {
  it('keeps a measure of nothing, and asks a query of a figure', async () => {
    const j = await Journey.start('test/fixtures/probes/scalar/probe.campaign.json', 's');
    expect(j.measure('ruling')).toBe(1);
    expect(j.offers('Thank the bench')).toBe(false);
    expect(await j.play('Plead before')).toMatch(/2 in your favour/);
    expect(j.holds('ruled', '2')).toBe(true);
    expect(j.holds('ruled', '3')).toBe(false);
    expect(await j.play('Thank the bench')).toMatch(/The bench nods/);
    expect(await j.play('Plead before')).toMatch(/The ruling stands/);
    expect(j.offers('Thank the bench')).toBe(false);
  }, 30000);

  it('is written back as it was written, and refuses a name that is no number it is given', () => {
    const query = ModuleParser.parse('Module m "m" { Measure beat(). Query at(n: number) means beat() == n. }')
      .queries[0]!;
    expect(ModuleWriter.predicate(query.body)).toBe('beat() == n');
    const loose = ModuleParser.parse('Module m "m" { Kind group. Measure beat(). Query q(a: group) means beat() == a. }');
    expect(() => new ModuleCompiler().validate(loose)).toThrow(/a is no number its query is given/);
  });
});
