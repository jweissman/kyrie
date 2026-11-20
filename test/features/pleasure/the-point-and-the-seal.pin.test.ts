import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { GeneratedWorld } from '../../support/generated';

// Fun Fridays (doc/design/fun-fridays.md): a walk and a quiet place, at Porthalen (data/goings-on/iscoed-shore), played
// through the runner by the rows' words. Out along the sea-wall to the point and back, the shore as the hour has it
// (the oystercatchers of a morning, the stars of a night); on the point, sitting still, a seal that comes up to look,
// and the next time comes nearer, knowing you. Nothing pays.
class Shore {
  static text(s: Said): string { return s.scene.lines.join(' '); }
  static async take(r: Runner, label: RegExp): Promise<Said> {
    const s = r.said(), id = [...s.offer.primary, ...s.offer.rest].find(o => label.test(o.label))?.id;
    if (!id) { throw new Error(`no row like ${label}`); }
    const out = await r.ask(JSON.stringify({ act: id }));
    if ('error' in out) { throw new Error(out.error); }
    return out;
  }
}
describe('the point beyond the sea-wall', () => {
  let r: Runner;
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    r = new Runner(journey.session);
    GeneratedWorld.put(journey.session, 's1_green');
  }, 180000);
  it('is a walk of a morning, its birds and its view', async () => {
    const walked = await Shore.take(r, /^Walk out along the sea-wall to the point/);
    expect(Shore.text(walked)).toContain('Oystercatchers go up off the mud');
  });
  it('has a seal come up to look at whoever sits still, and nearer the next time', async () => {
    expect(Shore.text(await Shore.take(r, /^Sit a while on the point/))).toContain('a round grey head comes up');
    expect(Shore.text(await Shore.take(r, /^Sit a while on the point/))).toMatch(/oh, it.s you/);
  });
  it('is the stars by night, and the point remembered from the green', async () => {
    await Shore.take(r, /^Wait until dark/);
    let night = '';
    for (let n = 0; n < 4 && !night; n++) {
      const s = Shore.text(await Shore.take(r, /^Walk out along the sea-wall to the point/));
      if (/more stars than you knew/.test(s)) { night = s; } else { await Shore.take(r, /^Wait an hour/); }
    }
    expect(night).toContain('the lights of Porthalen behind you look small and kind');
    expect(Shore.text(r.said('look'))).toContain('where the seal is');
    expect(Shore.text(r.said('look'))).not.toMatch(/gain[s]? \d+ experience/);
  });
});
