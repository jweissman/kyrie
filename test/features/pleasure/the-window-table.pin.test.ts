import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { RunnerFind } from '../../support/runner-find';

// Fun Friday (20 November; doc/design/fun-fridays.md): playing cards (#40). Morwen Ashlock, an old boatwoman at the
// taproom's window table, deals the company into a hand of beggar-my-neighbour: the first is always hers; the second
// is a game, won by watching her hands (a fair chance, tried again) or by cheating back (a hard one; caught, never
// again); asked, she says where she learned to cheat; come back, and a hand lies dealt at the empty place.
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
    // Watched and played slow until it is won: each try is the win or another hand lost, never anything else.
    for (let tries = 0; tries < 12 && !s.scene.lines.join(' ').includes('you take her ace'); tries++) {
      s = await RunnerFind.act(r, s, /^Watch Morwen Ashlock's hands/);
      expect(s.scene.lines.join(' ')).toMatch(/you take her ace|is already dealing/);
    }
    expect(s.scene.lines.join(' ')).toContain('Then she deals the patience out again');
    said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_green)' })));
    s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    expect(s.scene.lines.join(' ')).toContain('A second hand lies dealt, face down');
    expect([coin(), r.said().aims?.length ?? 0]).toEqual([before, aims]);
  }, 180000);
  it('lets the company cheat back once: it wins and she laughs, or it is caught and may not again', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/thief/Wenna']));
    const r = new Runner(journey.session);
    let s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    s = await RunnerFind.act(r, s, /^Sit down across from Morwen Ashlock/);
    s = await RunnerFind.act(r, s, /^Play the hand out/);
    s = await RunnerFind.act(r, s, /^Cheat back, the way she does/);
    const told = s.scene.lines.join(' ');
    expect(told).toMatch(/Nobody on the boats ever had the face for it|At my table, I cheat/);
    const rows = [...s.offer.primary, ...s.offer.rest, ...Object.values(s.offer.lenses ?? {}).flat()].map(o => o.label);
    if (told.includes('At my table, I cheat')) { expect(rows.some(l => /^Cheat back/.test(l))).toBe(false); }
  }, 180000);
});
