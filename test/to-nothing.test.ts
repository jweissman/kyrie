import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

// An action that would take a count below nothing is not offered: what cannot be paid for is not bought. For a debt
// that is backwards: a company owing one pain could not kneel a night on the Steps "for six of your pains", and the
// action simply never appeared (A Winter in Carth's friction 2). A Decrease may say it stops at nothing.
describe('a count taken by so much, or to nothing', () => {
  it('is offered when there is less than so much, and leaves nothing', async () => {
    const j = await Journey.start('test/fixtures/probes/pains/probe.campaign.json', 'k');
    expect(j.offers('Kneel a night on the Steps')).toBe(true);
    expect(j.offers('Fast for six')).toBe(false);
    await j.play('Kneel a night on the Steps');
    expect(j.measure('p__pains', 'party')).toBe(0);
  }, 60000);
  it('is read and written as it is said', () => {
    const m = ModuleParser.parse(`Module t "T" { Kind group. Measure pains(group). Entity party: group "You". Goal false.
      Rule r when true { Decrease pains(party) by 6 or to nothing. } }`);
    expect(m.rules![0]!.effects[0]).toMatchObject({ kind: 'decrease', toNothing: true });
    expect(ModuleWriter.write(m)).toContain('Decrease pains(party) by 6 or to nothing.');
  });
});
