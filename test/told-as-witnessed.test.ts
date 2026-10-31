import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Grand Tour's friction 2 (GTR-02): whether the company heard what a rule says was judged only after the rule had
// done what it does. An event near Quance that carried her up to the Nexus was not told to the company beside her, nor
// one near Wren in the watch her routine took her out, nor one at the hall that dropped the company into the cellar,
// and each was spent unheard. It is heard as a witness would hear it: if the company perceived the rule's anchor as
// the watch began, or just before the rule's effects, or just after them.
const probe = 'test/fixtures/probes/witness/probe.campaign.json';

describe('what a rule says beside the company, as it goes', () => {
  it('is told though its own effects or an earlier routine carry its anchor off, and not to a company elsewhere',
    async () => {
      const j = await Journey.start(probe);
      const told = await j.play('=3');
      expect(told).toContain('Quance sets her hands to the rope and is drawn up to the Nexus.');
      expect(told).toContain('Petals fall about Wren');
      expect([j.at('p__quance'), j.at('p__wren')]).toEqual(['p__nexus', 'p__yard']);
      // Hob went up to the loft from the yard, out of the company's hearing before and after.
      expect(j.at('p__hob')).toBe('p__loft');
      expect(told).not.toContain('climbs to the loft');
    }, 30000);

  it('is told at the hall though it drops the company out of the hall', async () => {
    const j = await Journey.start(probe);
    const told = await j.play('=until at(party, cellar)');
    expect(told).toContain('The boards give under you, and you drop into the cellar.');
    expect(j.at('party')).toBe('p__cellar');
  }, 30000);
});
