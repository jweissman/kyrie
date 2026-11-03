import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

// The House That Grows' ledger 6 (HTH-06): no count of what holds, so a tally was kept by hand at every change.
// count(…) is how many ways a condition holds as it is read (test/fixtures/probes/counted).
describe('a count of what holds', () => {
  it('counts the lamps lit, in a requirement, a rule and a query', async () => {
    const j = await Journey.start('test/fixtures/probes/counted/probe.campaign.json', 'c');
    await j.play('Light a lamp here');
    expect(j.measure('lamps')).toBe(1);
    expect(j.screen().observed.map(o => o.text).join(' ')).not.toMatch(/Two lamps/);
    await j.play('To the parlour', 'Light a lamp here', 'To the hall');
    expect(j.measure('lamps')).toBe(2);
    expect(j.holds('lamplit', '2')).toBe(true);
    expect(j.screen().observed.map(o => o.text).join(' ')).toMatch(/Two lamps burn/);
  }, 30000);

  it('is written back as it was written', () => {
    const q = ModuleParser.parse('Module m "m" { Query q(n: number) means count(lit(?p) and not out(?p)) >= n. }')
      .queries[0]!;
    expect(ModuleWriter.predicate(q.body)).toBe('count((lit(?p)) and (not (out(?p)))) >= n');
  });
});
