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

// Quittance's sd 6 and wk 8 (QTC-A32): a thing lying in a room is taken where it lies ("Take", under its name), and
// one of someone's lent in talk is taken in front of them; nobody's lantern needs no loan.
describe('a thing on the floor', () => {
  it('is taken where it lies, and one lent is taken in front of its owner', async () => {
    const j = await Journey.start('test/fixtures/probes/lent-ladder/probe.campaign.json');
    expect(await j.play('a lantern: Take')).toContain('takes a lantern.');
    await j.play('Ask the clerk for the loan');
    expect(await j.play("the Guild's ladder: Take", 'Wait › A while')).not.toContain('That is mine');
    expect(j.holds('objected', 'p__clerk', 'p__ladder')).toBe(false);
  }, 60000);
});

// Quittance's bg 9 (QTC-A09): a crew that let the company be, turned on it by a stealthy act gone wrong, by retracting
// its tolerance: it warns in its own words, and the act's Otherwise is told as well.
describe('a quiet crew turned', () => {
  it('warns in its own words, after what the act said', async () => {
    const j = await Journey.start('test/fixtures/probes/turned/probe.campaign.json');
    j.roll('fail');
    await j.play('Lift the bucket');
    const page = j.taken.at(-1)!.page;
    expect(page.indexOf('handle clanks')).toBeLessThan(page.indexOf('are on their feet'));
    expect(page.indexOf('handle clanks')).toBeGreaterThan(-1);
    expect([j.holds('warned', 'p__sons', 'party'), j.holds('tolerates', 'p__sons', 'party')]).toEqual([true, false]);
  }, 60000);
});

