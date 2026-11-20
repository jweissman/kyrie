import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { RunnerFind } from '../../support/runner-find';

// Fun Friday (20 November; doc/design/fun-fridays.md): playing a musical instrument (#65). The fiddle over the
// taproom's settle, taken down, tuned, tried badly and tried again slower, gives a tune; the innkeeper says whose it
// was; leave, and on the green a boy whistles the tune with the company's wrong note in it. Nothing paid, no aim.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the fiddle over the settle', () => {
  it('is taken down, tuned, played badly then well, and its tune is whistled on the green after', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const before = coin(), aims = r.said().aims?.length ?? 0;
    let s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    s = await RunnerFind.act(r, s, /^Take the fiddle down from over the settle/);
    expect(s.scene.lines.join(' ')).toContain('slack as wet washing');
    s = await RunnerFind.act(r, s, /whose fiddle it was/);
    expect(s.scene.lines.join(' ')).toContain('better used than hung');
    s = await RunnerFind.act(r, s, /^Tune the fiddle/);
    s = await RunnerFind.act(r, s, /^Try a tune on the fiddle/);
    expect(s.scene.lines.join(' ')).toContain('as a goose would sing it');
    s = await RunnerFind.act(r, s, /^Try the tune again, slower/);
    expect(s.scene.lines.join(' ')).toContain('it starts to sound like yours');
    s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_green)' })));
    expect(s.scene.lines.join(' ')).toContain("with your wrong note in the same place");
    expect([coin(), r.said().aims?.length ?? 0]).toEqual([before, aims]);
  }, 180000);
});
