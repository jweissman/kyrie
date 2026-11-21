import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerOffer } from '../../../src/cli/runner-offer';
import { RunnerFind } from '../../support/runner-find';

// Fun Friday (20 November; doc/design/fun-fridays.md): watching wild animals (#90). Below the hill-path to the old
// stones above the first town, a fox's earth: at dusk or first light the company may sit still in the bracken and
// watch (stealth, a fair chance, tried again); the vixen and her three cubs come out, or a blackbird gives it away;
// after it the path keeps the cubs' run and their feather. Not offered in the middle of the day.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const rows = (s: Said) => [...s.offer.primary, ...s.offer.rest, ...Object.values(s.offer.lenses ?? {}).flat()];
const watching = (s: Said) => rows(s).some(o => /^Sit still in the bracken/.test(o.label));
describe('the fox\'s earth below the hill-path', () => {
  it('is watched at dusk, until the vixen and her cubs come out, and the path remembers', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/thief/Wenna']));
    const r = new Runner(journey.session);
    said(await r.ask(JSON.stringify({ act: 'go(region__s1_stones_way,region__s1_stones_top)' })));
    let s = said(await r.ask('{"look":true}'));
    expect(s.scene.lines.join(' ')).toContain('foxes come out at dusk and at first light');
    expect(watching(s)).toBe(false);
    for (let hour = 0; hour < 16 && !watching(s); hour++) {
      const wait = rows(s).find(o => RunnerOffer.act(o) === 'wait_hour') ?? rows(s).find(o => /^Wait an hour/.test(o.label));
      s = said(await r.ask(JSON.stringify({ act: wait!.id })));
    }
    expect(watching(s)).toBe(true);
    for (let tries = 0; tries < 6 && watching(s); tries++) {
      s = await RunnerFind.act(r, s, /^Sit still in the bracken/);
      expect(s.scene.lines.join(' ')).toMatch(/decides you are a stone|A blackbird finds you first/);
    }
    expect(watching(s)).toBe(false);
    // Told once, as the vixen goes in or on the look after: the path keeps the cubs' run and their feather.
    const seen = s.scene.lines.join(' ') + said(await r.ask('{"look":true}')).scene.lines.join(' ');
    expect(seen).toContain('A grey feather lies on the path');
  }, 240000);
});
