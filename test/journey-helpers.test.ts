import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// What a test may do without the steps that would do it (Quittance's friction 8, 9 and its A15, A16): ask of a
// relation by the name its module gives it, and be told when nothing is called that; make a fact so; put someone
// somewhere; give the company a thing; go to a place by its own id; and a step's words taken as written when they
// match nothing as a pattern (its 12: a dash, a bracket); and whether a way can be taken, not only looked at (A06).
describe('a journey, for a test', () => {
  it('names by the module, refuses what nothing is called, and asserts, puts, gives and goes', async () => {
    const j = await Journey.start('test/fixtures/probes/give/probe.campaign.json');
    expect(j.holds('at', 'nan', 'kitchen')).toBe(true);
    expect([j.takes('the lane'), j.takes('Ask Nan about')]).toEqual([true, false]);
    expect(j.find('Ask Nan about Davy’s coat (')?.label).toBeUndefined();
    expect(j.find('Ask Nan about Davy’s')?.label).toBe('Ask Nan about Davy\'s coat');
    expect(() => j.holds('nowhere_relation', 'nan')).toThrow('Nothing in the world is called nowhere_relation');
    j.assert('knows', 'party', 'coat_given');
    expect(j.holds('knows', 'party', 'coat_given')).toBe(true);
    j.put('nan', 'lane');
    expect(j.at('p__nan')).toBe('p__lane');
    j.give('weight_b');
    expect(j.holds('carries', 'party', 'weight_b')).toBe(true);
    await j.play('>lane');
    expect(j.at('party')).toBe('p__lane');
  }, 60000);
});
