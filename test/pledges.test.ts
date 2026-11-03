import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A particular thing an action gives the company is not to be had of it while someone holds it already: the Third
// Night's pledges, picked up off the pawnbroker's floor and then paid for, threw "Item already owned" out of the
// paying (its friction 9, TTN-09).
describe('a thing to be had by an action', () => {
  it('is not offered while the company holds it already', async () => {
    const j = await Journey.start('test/fixtures/probes/pledges/probe.campaign.json', 'k');
    expect(j.offers('Pay Mrs Pratt for the pawned clock')).toBe(true);
    await j.play('the pawned clock: Take');
    expect(j.offers('Pay Mrs Pratt for the pawned clock')).toBe(false);
  }, 60000);
  it('is had by it when it lies where it was', async () => {
    const j = await Journey.start('test/fixtures/probes/pledges/probe.campaign.json', 'k');
    await j.play('Pay Mrs Pratt for the pawned clock');
    expect(j.screen().items.map(i => i.name)).toContain('the pawned clock');
  }, 60000);
});
