import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import { Narrator } from '../src/presentation/narrator';

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
  // What an aim names is what it is about, not everything in it: the way to a site's mouth is led to by the way there,
  // not because its rooms were all "your aim" (the owner, 9 November: the corn-store above the cellar had been).
  it('leads to the mouth of a site an aim names by the way there', async () => {
    const j = await Journey.start('test/fixtures/probes/stakes/probe.campaign.json');
    await j.play('^To the lane');
    const screen = ScreenModel.build(j.campaign), glance = Narrator.leaf(j.campaign, screen).glance!;
    expect(screen.exits.filter(e => glance.aimed.includes(e.id)).map(e => e.destination.name))
      .toContain('a door of stone in a long mound');
    // The aim followed is said first wherever the company is (Mission 19: the page's aim is the one followed, see
    // Undertakings); inside, the aim the barrow names comes next, before the rest (play 13: the debt had been shown
    // in the king-barrow whose crown was the other).
    expect(screen.objectives[0]).toMatch(/father/);
    await j.play('^Into Lacrimerecs');
    expect(ScreenModel.build(j.campaign).objectives.slice(0, 2).join(' / ')).toMatch(/father.* \/ .*crown/);
  }, 30000);
});
