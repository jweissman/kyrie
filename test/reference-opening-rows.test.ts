import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The reference opening's rows as a company of one meets them (the lead's play of 27 November): what it gathers on the
// landing is for no one named ("Gather a handful of dandelion for Wenna").
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the reference opening, alone', () => {
  it('gathers on the landing for no one named', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    const landing = said(await r.ask(JSON.stringify({ act: 'exit:region__s1_green' })));
    const gathered = [...landing.offer.primary, ...landing.offer.rest].map(o => o.label).filter(l => /^Gather /.test(l));
    expect(gathered.length).toBeGreaterThan(0);
    expect(gathered.filter(l => / for Wenna$/.test(l))).toEqual([]);
  }, 30000);
});
