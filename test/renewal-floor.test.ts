import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Renewal } from '../src/world/renewal';
import { GeneratedWorld } from './support/generated';

// A country goes on after its first troubles (the play-structure investigation's PT-29: a company that stayed a week
// at the first inn of six countries was offered one new thing in all). What its towns did not have going on at the
// start begins on the third morning, and another every other morning after, each talked of at the inns until it is
// heard; drawn again from the world's seed, so a game replays the same.
describe('a country going on', () => {
  it('begins something new on the third morning, and the inns talk of it', async () => {
    const s = await DrawnWorld.start('kite', { origin: 'wanderer',
      party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared), c = s.campaign;
    GeneratedWorld.put(s, 's1_taproom');
    const installed = c.installed.length;
    while (c.readout.elapsed < Renewal.first) { await s.perform('wait_hour'); }
    expect(c.installed.length).toBeGreaterThan(installed);
    expect(c.installed).toContain(Renewal.id(1));
    const talk = c.module.observations!.find(o => /_talk_/.test(o.id))!;
    GeneratedWorld.put(s, talk.place!.replace(/^region__/, ''));
    expect(PlayerView.observe(c).observations.map(o => o.text).join(' ')).toMatch(/The talk here is all of /);
  }, 240000);
  it('falls due on the third morning, then every other morning, three at most', () => {
    expect([0, 275, 276, 563, 564, 852, 5000].map(t => Renewal.due(t))).toEqual([0, 0, 1, 1, 2, 3, 3]);
  });
});
