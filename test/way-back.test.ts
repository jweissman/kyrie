import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { GeneratedWorld } from './support/generated';
import { PlayerView } from '../src/presentation/player-view';

// Under the ground, or in a site, the way the company came is kept in sight beside Go… (PR-08: five cold players in
// three rounds could not find the way back or up, and walked out of a mine step by step through Go…).
describe('the way back', () => {
  it('is in sight down in the quarry\'s workings, and not on the town\'s own ground', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'debt', party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, id = (suf: string) => c.module.entities.find(e => e.id.endsWith(suf))!.id;
    const glance = () => Narrator.leaf(c, ScreenModel.build(c)).glance!;
    expect(glance().back).toBeUndefined();
    // Inside the adit with no key, its padlock is not offered: it hangs on the pit's side of the gate (R10-13: "the
    // adit's padlock offered from inside the adit").
    const start = c.world.one('at', 'party')!;
    GeneratedWorld.put(s, id('_u_adit').replace(/^region__/, ''));
    expect(PlayerView.choices(c).map(r => r.choice.name).filter(n => /padlock/i.test(n))).toEqual([]);
    GeneratedWorld.put(s, start.replace(/^region__/, ''));
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('keyholder', 'party', id('_u_adit_lock')) }]));
    await GeneratedWorld.travel(s, id('_u_adit'));
    await GeneratedWorld.travel(s, id('_u_gallery'));
    expect(c.world.one('at', 'party')).toBe(id('_u_gallery'));
    expect(glance().back).toBe(`exit:${id('_u_adit')}`);
  }, 120000);
});
