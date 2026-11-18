import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The third cold play of the golden route (mission-22/cold/cold-3-report.md), each finding held where it was met:
// the question the company came to ask leads where it is asked, though no aim is followed (CL-25: at Holgar's the
// four had asked him about the old kingdom, the rats in the rest).
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the drove road, after the third cold play', () => {
  it('leads at the salt-house with the rats the notice sent the company to ask about', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    said(await r.ask(JSON.stringify({ act: 'region__s1_u_notice_read(party,region__s1_green)' })));
    const s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_shop_door,region__s1_shop)' })));
    expect(s.offer.primary.map(o => o.label)).toContain('Ask Holgar about the rats in the corn-store');
  }, 180000);
});
