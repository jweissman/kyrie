import { describe, expect, it } from 'bun:test';
import { resolve } from 'node:path';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Attending } from '../src/ui/attention';
import { SceneModel } from '../src/ui/scene';

// A thing to be had is seen for what it is. Found by the follow-up independent review: a singer's token in the
// singing halls offered nothing but its name and Take, though its kind is described. The jar of the day is seen in
// its kind's own words when looked at; the little ox, whose kind's words are only its name, says nothing more.
describe('a thing to be had', () => {
  it('is seen in its kind\'s own words when it is looked at', async () => {
    const s = await PlaySession.start(resolve(import.meta.dir, 'fixtures/probes/local-kind/probe.campaign.json'),
      'described', NodeBundleSource.shared);
    const screen = ScreenModel.build(s.campaign), scene = SceneModel.build(screen);
    const jar = Attending.thing(scene, 'p__jar')!, ox = Attending.thing(scene, 'p__ox')!;
    expect(jar.subject.about).toBe('A jar with the day in it.');
    expect(ox.subject.about).toBeUndefined();
  }, 60000);
});
