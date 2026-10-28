import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Three of What Tessary Owes' asks (AUT-16, AUT-17, AUT-18). W8: the Factor seeing her own letter had to be made
// hostile, which closed every word with her; one who `Resents` says so and stays civil. W15: a lockbox's state did not
// remember who opened it; changedBy(thing, who) does. W17: a band of creatures that stands over a way and parts when
// appeased had to be a blocking thing kept in step by rules; any creature `Guards` a way.
describe('owners, agents and guards', () => {
  it('a resentful owner says so in her own words, and is no enemy after', async () => {
    const j = await Journey.start('test/fixtures/probes/resents/probe.campaign.json');
    expect(await j.play('chart: Take')).toContain('and you will remember that she said nothing');
    expect(j.holds('objected', 'p__sault', 'p__chart')).toBe(true);
    expect(j.holds('hostile', 'p__sault', 'party')).toBe(false);
    expect(j.offers('Talk to Maud Sault')).toBe(true);
  }, 30000);
  it('a thing remembers who last changed it, and a rule can ask', async () => {
    const j = await Journey.start('test/fixtures/probes/changed-by/probe.campaign.json');
    await j.play('Open the lockbox');
    expect(j.holds('changedBy', 'p__lockbox', 'party')).toBe(true);
    expect(j.page).toContain('sees you at her lockbox');
  }, 30000);
  it('a band of creatures over a way bars it until it is appeased', async () => {
    const j = await Journey.start('test/fixtures/probes/guarded-way/probe.campaign.json');
    expect(j.offers('To the plunge drain')).toBe(false);
    await j.play('Throw the rats the bread');
    await j.play('To the plunge drain');
    expect(j.at('party')).toBe('p__drain');
  }, 30000);
});
