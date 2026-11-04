import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Grand Tour's GTR-X03: a rule about what the company carries had seen a thing given in conversation only on the
// next command. Re-examined for the process audit (4 November): the rule sees it in the moment it is given
// (test/fixtures/probes/given-seen).
describe('a thing given in talk', () => {
  it('is seen by a rule about what the company carries in the same moment', async () => {
    const j = await Journey.start('test/fixtures/probes/given-seen/probe.campaign.json', 'g');
    const told = await j.play('Ask Joan for a light');
    expect(j.holds('noticed', 'party')).toBe(true);
    expect(told).toContain('The torch smokes in your hand.');
  }, 30000);
});
