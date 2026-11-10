import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Renewal } from '../src/world/renewal';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';

// A country goes on after its first troubles (the play-structure investigation's PT-29: a company that stayed a week
// at the first inn of six countries was offered one new thing in all). What its towns did not have going on at the
// start begins on the third morning, and another every other morning after, each talked of at the inns until it is
// heard; drawn again from the world's seed, so a game replays the same. And each trouble seen through begins the next.
describe('a country going on', () => {
  it('begins something new on the third morning, and the inns talk of it', async () => {
    const s = await DrawnWorld.start('kite', { origin: 'wanderer',
      party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared), c = s.campaign;
    GeneratedWorld.put(s, 's1_taproom');
    const installed = c.installed.length;
    while (c.readout.elapsed < Renewal.first) { await s.leg('wait_hour'); }
    expect(c.installed.length).toBeGreaterThan(installed);
    expect(c.installed).toContain(Renewal.id(1));
    const talk = c.module.observations!.find(o => /_talk_/.test(o.id))!;
    GeneratedWorld.put(s, talk.place!.replace(/^region__/, ''));
    expect(PlayerView.observe(c).observations.map(o => o.text).join(' ')).toMatch(/The talk here is all of /);
  }, 240000);
  it('falls due on the third morning, then every other morning, three at most', () => {
    expect([0, 275, 276, 563, 564, 852, 5000].map(t => Renewal.due(t))).toEqual([0, 0, 1, 1, 2, 3, 3]);
  });
  // Or on the end of the one before (PT-29): each trouble seen through begins the next, whatever the hour.
  it('falls due as each trouble is seen through, if the day has not brought it first', () => {
    const at = [[0, 1], [100, 2], [600, 1], [600, 3], [100, 9]];
    expect(at.map(([t, n]) => Renewal.due(t!, n))).toEqual([1, 2, 2, 3, 3]);
  });
  it('begins something new on the first day, once the den is dealt with', async () => {
    const s = await DrawnWorld.start('kite', { origin: 'wanderer',
      party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared), c = s.campaign;
    await s.leg('wait');
    expect(c.installed).not.toContain(Renewal.id(1));
    const w = c as unknown as { world: { apply(x: unknown[]): unknown }; commit(w: unknown): void };
    w.commit(w.world.apply([{ kind: 'assert', call: ModuleWriter.call('den__driven', 'den__beasts') }]));
    await s.leg('wait');
    expect([Renewal.ended(c), c.readout.elapsed < Renewal.first]).toEqual([1, true]);
    expect(c.installed).toContain(Renewal.id(1));
  }, 240000);
});
