import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { RunnerFind } from '../../support/runner-find';

// Fun Friday (20 November; doc/design/fun-fridays.md): writing letters (#223). In a market town's scrivener's, the
// scrivener writes a letter home for a penny; a day later the answer waits under the stone on the counter, in a hand
// the company knows, and is read to it for nothing: the goat has kidded, a sister walks out with the miller's boy.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('a letter home', () => {
  it('is written for a penny, and its answer is under the stone a day later, read for nothing', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    let s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_scriv_door,region__s1_scriv)' })));
    const before = coin();
    s = await RunnerFind.act(r, s, /^Have the scrivener write a letter home/);
    expect(s.scene.lines.join(' ')).toContain('Answers come here, under the stone');
    expect(coin()).toBe(before - 1);
    // Not the same day: the answer is not there yet.
    const rows = (x: Said) => [...x.offer.primary, ...x.offer.rest, ...Object.values(x.offer.lenses ?? {}).flat()];
    expect(rows(s).some(o => /letter from home/.test(o.label))).toBe(false);
    for (let hour = 0; hour < 25; hour++) { s = said(await r.ask(JSON.stringify({ act: 'company/0:Wait an hour' }))); }
    s = said(await r.ask('{"look":true}'));
    expect(s.scene.lines.join(' ')).toContain('You know the hand');
    s = await RunnerFind.act(r, s, /^Have the scrivener read you the letter from home/);
    expect(s.scene.lines.join(' ')).toContain('The goat has kidded');
    expect(coin()).toBe(before - 1);
  }, 240000);
});
