import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';

// The third cold play of the golden route (mission-22/cold/cold-3-report.md), each finding held where it was met:
// the question the company came to ask leads where it is asked, though no aim is followed (CL-25: at Holgar's the
// four had asked him about the old kingdom, the rats in the rest).
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the drove road, after the third cold play', () => {
  it('weighs at the salt-house the rats the notice sent the company to ask about', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    said(await r.ask(JSON.stringify({ act: 'region__s1_u_notice_read(party,region__s1_green)' })));
    said(await r.ask(JSON.stringify({ act: 'go(region__s1_shop_door,region__s1_shop)' })));
    // The notice's jobs are leads, not aims (HP-01): the question it sent the company to ask weighs in the talk with
    // the one it names, for the aim asking it gives (TalkWeight.sought), and is offered there; no longer among the
    // four, which lead with aims held.
    expect(ScreenModel.build(journey.campaign).weighty).toContain('region__s1_u_rats_job_ask');
    const s = said(await r.ask(JSON.stringify({ act: 'talk:region__s1_merchant' })));
    expect([...s.offer.primary, ...s.offer.rest].map(o => o.label)).toContain('Holgar: the rats in the corn-store');
  }, 180000);
  // CL-25: at the customs-house, with Bran's line to read and Mardle to talk to, no way the company has not taken is
  // led with for being untaken: "To the taproom of the Stone Horn" had led from the third turn on for no reason.
  it('leads at the customs-house with the drove, not the taproom', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    // CL-26: the first turn says who the one who plays is, as the page's card does.
    // OR-1396: the SRD warrior's d10 replaces the d12.
    expect(r.said().you).toBe('Wenna, human warrior, 12 of 12');
    let s: Said | undefined;
    for (const act of ['drove__owain_count_t', 'go(drove__customs_door,drove__customs)', 'drove__bran_count_t',
      'drove__clerk_count_t']) { s = said(await r.ask(JSON.stringify({ act }))); }
    const primary = s!.offer.primary.map(o => RunnerOffer.act(o));
    expect(primary).toContain('drove__read_book(party,drove__customs)');
    // Asking Owain took up the aim and followed it on to the Black Rhyne behind the pens (one row, one act: OR-466), so
    // the way back to the pens is the aim's; nothing else is led with for being untaken.
    expect(primary.filter(id => id.startsWith('travel:') && id !== 'travel:drove__pens')).toEqual([]);
  }, 180000);
});
