import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';

// The place by salience: whoever the company has a stake in is met first, and the way its aim names is gone by
// first. In a gate-yard of a chandler, a herb-wife, a whaler and the protagonist's brother, the brother had been
// fourth of four alike; the bridge the father went out by, one of twelve ways (Mission 17).
describe('a stake', () => {
  it('puts family first among the people here, and marks the way the aim names', async () => {
    const j = await Journey.start('test/fixtures/probes/stakes/probe.campaign.json');
    const screen = ScreenModel.build(j.campaign), scene = SceneModel.build(screen);
    const people = scene.subjects.filter(s => s.kind === 'person');
    expect(people.map(p => [p.name, !!p.stake])).toEqual([['Tom', true], ['Ned', false], ['Ada', false]]);
    expect(screen.aimed).toContain('p__bridge');
    expect(screen.exits.filter(e => screen.aimed!.includes(e.destination.id)).map(e => e.destination.name))
      .toEqual(['the bridge over the Reed']);
  }, 30000);
});
