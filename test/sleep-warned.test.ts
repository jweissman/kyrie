import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// A company a trap leaves asleep in the room of those who warn it off is not staying against the warning: they wait
// until it wakes, and then give it the time they gave (E102: a sleep in the barrow-dead's room had been certain death,
// with nothing to choose but "Lie as you are").
describe('asleep where the dead warn you off', () => {
  it('wakes with the warning\'s time still to answer it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'X', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, choose = (re: RegExp) => PlayerView.choices(c).find(x => re.test(x.choice.id))?.choice.id;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w2_passage') }]));
    await s.perform(choose(/^risk\(region__w2_snare/)!);
    expect(ScreenModel.build(c).warned?.by).toBe('the barrow-dead');
    expect(c.world.test(ModuleWriter.call('able', 'party'))).toBe(false);
    for (let watch = 0; watch < 60 && !c.world.test(ModuleWriter.call('able', 'party')); watch++) {
      await s.perform('lie_still(party)');
    }
    expect(c.world.test(ModuleWriter.call('dead', 'party'))).toBe(false);
    expect(c.world.test(ModuleWriter.call('able', 'party'))).toBe(true);
    expect(ScreenModel.build(c).warned?.left).toBeGreaterThan(0);
    expect(PlayerView.choices(c).some(x => /^go\(/.test(x.choice.id))).toBe(true);
  }, 120000);
});
