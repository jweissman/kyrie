import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { RunnerFind } from '../../support/runner-find';

// Fun Friday (20 November; doc/design/fun-fridays.md): playing cards (#40). Morwen Ashlock, an old boatwoman at the
// taproom's window table, deals the company into a hand of beggar-my-neighbour: the first is lost, the second taken;
// asked, she says where she learned to cheat at patience; come back, and a hand lies dealt at the empty place.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the cards on the window table', () => {
  it('deals the company in, loses it the first hand and gives it the second, and keeps it a place after', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const before = coin(), aims = r.said().aims?.length ?? 0;
    let s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    s = await RunnerFind.act(r, s, /^Sit down across from Morwen Ashlock/);
    expect(s.scene.lines.join(' ')).toContain('Beggar-my-neighbour');
    s = await RunnerFind.act(r, s, /^Play the hand out/);
    expect(s.scene.lines.join(' ')).toContain('she laughs like a gate');
    s = await RunnerFind.act(r, s, /where she learned to cheat at patience/);
    expect(s.scene.lines.join(' ')).toContain('Forty years of fog');
    s = await RunnerFind.act(r, s, /^Ask for another hand/);
    expect(s.scene.lines.join(' ')).toContain('Then she deals the patience out again');
    said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_green)' })));
    s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    expect(s.scene.lines.join(' ')).toContain('A second hand lies dealt, face down');
    expect([coin(), r.said().aims?.length ?? 0]).toEqual([before, aims]);
  }, 180000);
});
