import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import { Digest } from '../src/session/digest';
import { PlaySession } from '../src/session/play-session';

// A deed done stays done (Sprint 3, S3-5; CL-46, CL-09): the crown of the first king, brought up out of Holyking, is
// sold to the Guldríce agent on Porthalen's landing, and the agent does not bid for it again. Asked about the
// king-barrow after the sale, the agent had said once more "Bring me the crown of the first king and I will pay 380
// coin for it". Kept and taken up in a fresh session, the sale holds and the bid stays withdrawn.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
const take = async (r: Runner, label: RegExp) => {
  const o = offered(r.said()).find(x => label.test(x.label));
  if (!o) { throw new Error(`not offered: ${label} (${offered(r.said()).map(x => x.label).join(' | ')})`); }
  return said(await r.ask(JSON.stringify({ act: o.id })));
};
// Everything the agent is asked about, the talk opened if there is one to open.
const asks = async (r: Runner) => {
  const talk = offered(r.said()).find(o => /^Talk to the Guldríce agent/.test(o.label));
  const s = talk ? said(await r.ask(JSON.stringify({ act: talk.id }))) : r.said();
  return offered(s).map(o => o.label).filter(l => /Guldríce agent/.test(l));
};
describe('the crown of the first king, sold', () => {
  it('is not bid for again by the agent who bought it, kept and taken up again', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const c = journey.session.campaign, r = new Runner(journey.session);
    // Brought up out of the barrow: the crown at the company's feet on the landing, where the agent keeps his books.
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'region__w8_heart', 'region__s1_green') }]));
    await take(r, /^Collect the crown of the first king/);
    await take(r, /^Talk to the Guldríce agent/);
    const coin = (w: typeof c.world) => w.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const before = coin(c.world);
    // Sold under his Trade (the talk's question, OR-1451).
    await take(r, /^Trade$/);
    expect(said(await take(r, /^Sell the crown of the first king to the Guldríce agent/)).scene.lines.join(' '))
      .toContain('pays you 380 coin');
    expect(c.world.test(ModuleWriter.call('won', 'region__w8_rivals'))).toBe(true);
    // Back from his trade, and his leave taken (the place's acts are the place's: OR-1451), then a while waited.
    await take(r, /^Back$/);
    await take(r, /^Take your leave/);
    await take(r, /^Wait a while/);
    expect((await asks(r)).filter(l => /about the king-barrow/.test(l))).toEqual([]);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(journey.session.checkpoint())));
    expect(Digest.of(again.campaign)).toBe(Digest.of(c));
    expect(coin(again.campaign.world)).toBe(before + 380);
    expect(again.campaign.world.test(ModuleWriter.call('won', 'region__w8_rivals'))).toBe(true);
    expect((await asks(new Runner(again))).filter(l => /about the king-barrow/.test(l))).toEqual([]);
  }, 120000);
});
