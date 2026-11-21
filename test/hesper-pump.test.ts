import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import { RunnerFind } from './support/runner-find';

// Fun Friday (20 November; doc/design/fun-fridays.md): working on machines and repairing things (#38, #217). Hesper
// Lowe calls the company over to the seized pump on Porthalen's green: the tinker kit's resident (data/kits/tinker/
// resident), bound to her from the assembler's ledger as one who practises tinkering there (test/people-ledger).
// Taken apart, new leather cut and greased, put back and tried, it gives water; come back later and children are
// working it. Nothing is paid and nothing is an aim.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the old pump on the green, mended with Hesper Lowe', () => {
  it('is called over to, worked on in three steps with her, and gives the green water after', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const before = coin(), aims = r.said().aims?.length ?? 0;
    expect(said(await r.ask('{"look":true}')).scene.lines.join(' ')).toContain('Hold the rod while I find out what has died');
    let s = await RunnerFind.act(r, r.said(), /^Help Hesper Lowe take the old pump apart/);
    expect(s.scene.lines.join(' ')).toContain('as if introducing friends');
    s = await RunnerFind.act(r, s, /^Ask Hesper Lowe how a pump knows to lift water/);
    expect(s.scene.lines.join(' ')).toContain('It is only all of them together that is clever');
    s = await RunnerFind.act(r, s, /^Cut new leather for the pump/);
    s = await RunnerFind.act(r, s, /^Put the pump back together/);
    const mended = s.scene.lines.join(' ');
    expect(mended).toContain('It remembered');
    expect(mended).not.toContain('Two children');
    said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_green)' })));
    expect(s.scene.lines.join(' ')).toContain('Two children hang their whole weight');
    // A pleasure, not a job: no coin, no aim.
    expect([coin(), r.said().aims?.length ?? 0]).toEqual([before, aims]);
  }, 180000);
});
