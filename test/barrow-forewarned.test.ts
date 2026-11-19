import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';

// One preparation that changes the descent (Sprint 2, S2-4; mission-22/beat-map.md: the warrior's preparation changed
// nothing): asked in the taproom before setting out, the innkeeper's grandmother's saying names what the barrow's king
// cannot abide, which only the embalmers' words far down had said, so the company knows to look for the jar of day.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the king-barrow, asked about before setting out', () => {
  it('is told what its king cannot abide, and the company knows it', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const into = [...r.said().offer.primary, ...r.said().offer.rest].find(o => /^Into the Stone Horn/.test(o.label))!;
    said(await r.ask(JSON.stringify({ act: into.id })));
    const told = said(await r.ask(JSON.stringify({ act: 'region__w8_rumour' }))).scene.lines.join(' ');
    expect(told).toContain('cannot abide the light of day');
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__w8_bane'))).toBe(true);
  }, 240000);
});
