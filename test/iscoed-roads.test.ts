import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/index';

// Iscoed's reasons to travel (mission-22/world/slice.md, step 5), each carried by someone with a reason of their own:
// the reeve's quarter-tally north up the salt road to the Exchange in Dun Rìerdan's Tower of the Scales, and Bran's
// word west up the drove road to the drovers' hall at the pass, where the high pasture's dragon is spoken of. The two
// countries hold their own goings-on as the atlas says (StrategicAtlas.goings, placed when they are drawn).
class Road {
  static async begin(): Promise<Journey> {
    return Journey.of(await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
  }
  // Set out for the march-stone of a country and then for a town in it, again where the road is interrupted.
  static async reach(j: Journey, country: string, name: string) {
    const stone = `the march-stone of ${country}`;
    for (let i = 0; i < 8 && j.screen().place.name !== stone; i++) { await j.play(`map:${stone}`); }
    for (let i = 0; i < 8 && !j.screen().path.some(p => p.name === name); i++) { await j.play(`map:${name}`); }
    expect(j.screen().path.map(p => p.name)).toEqual(expect.arrayContaining([country, name]));
  }
}
describe('the roads out of Iscoed', () => {
  it('carries the reeve\'s tally north to the Exchange, which puts the company\'s name in its red ink', async () => {
    const j = await Road.begin();
    j.give('scrollcase');
    await Road.reach(j, 'Rìerdan', 'Dun Rìerdan');
    await j.play('To the counting-floor', 'Give Iolo the reeve\'s tally from Iscoed');
    expect(j.latest).toMatch(/Red is for people we will answer for/);
    // What every tally holds, and no chain the company did not make: this one let no clerk go (story-sheets.md).
    expect([/the fen dry/.test(j.latest), /a clerk turned out/.test(j.latest)]).toEqual([true, false]);
  }, 240000);
  it('takes Bran\'s word west to the drovers\' hall at the pass, where the high pasture is spoken of', async () => {
    const j = await Road.begin(), c = j.campaign;
    // Bran's word, as freeing him teaches it (the drove's road_west): only a company he sent can say so (ST-11).
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drove__road_west') }]));
    await Road.reach(j, 'Brynach', 'Caer Brynach');
    await j.play('To the drovers\' hall', 'Ask Marged what the flame marks on the beam are',
      'Tell Marged that Bran ap Ifor sent you');
    expect(j.latest).toMatch(/Wolves don.t burn the grass/);
    expect(j.latest).toMatch(/take you over the tops/);
  }, 240000);
});
