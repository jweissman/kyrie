import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Quittance's ll 17 (QTC-A24): Hob was "an old man with a pole" to a company that had greeted him, because only one
// topic taught his name, and a greeting could not. Whoever the company has spoken with it is acquainted with, for good
// (test/fixtures/probes/acquainted).
describe('acquainted once spoken to', () => {
  it('calls him by his name from his greeting on', async () => {
    const j = await Journey.start('test/fixtures/probes/acquainted/probe.campaign.json', 'a');
    expect(j.screen().people.map(p => p.name)).toEqual(['an old man with a pole']);
    await j.play('Talk to');
    expect(j.holds('acquainted', 'hob', 'party')).toBe(true);
    await j.play('Take your leave');
    expect(j.screen().people.map(p => p.name)).toEqual(['Hob, the ferryman']);
  }, 30000);
});
