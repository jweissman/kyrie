import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The reference opening's rows as a company of one meets them (the lead's play of 27 November): the way into the woods
// is said once, and walking on from the wagoner says what it is. (A gather's "for Wenna", alone, is OR-1781.)
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the reference opening, alone', () => {
  it('says the way into the woods once', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    const landing = said(await r.ask(JSON.stringify({ act: 'exit:region__s1_green' })));
    const labels = [...landing.offer.primary, ...landing.offer.rest].map(o => o.label);
    // Into the old woods by a way whose name says so already is said once.
    const woods = labels.filter(l => /old woods/.test(l));
    expect(woods).toEqual(['Into the old woods above Oakhythe']);
  }, 30000);
  it('says what walking on from the wagoner is: leaving him to it, not only leaving', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    const talk = said(await r.ask(JSON.stringify({ act: 'origin__carter#talk' })));
    const labels = [...talk.offer.primary, ...talk.offer.rest].map(o => o.label);
    expect(labels).toContain('Leave him to it');
    expect(labels).not.toContain('Walk on');
  }, 30000);
});
