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
  // CL-25: at the customs-house, with Bran's line to read and Mardle to talk to, no way the company has not taken is
  // led with for being untaken: "To the taproom of the Stone Horn" had led from the third turn on for no reason.
  it('leads at the customs-house with the drove, not the taproom', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    let s: Said | undefined;
    for (const act of ['drove__owain_count_t', 'go(drove__customs_door,drove__customs)', 'drove__bran_count_t',
      'drove__clerk_count_t']) { s = said(await r.ask(JSON.stringify({ act }))); }
    const primary = s!.offer.primary.map(o => o.id);
    expect(primary).toContain('drove__read_book(party,drove__customs)');
    expect(primary.filter(id => id.startsWith('travel:'))).toEqual([]);
  }, 180000);
});
