import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ModuleWriter } from '../src/lang/module-writer';

// The first town's jobs played in an order their author did not walk (the cold review's REV-21): the rats killed by
// ratsbane, not a fight; told dead before their run is found and stopped, for half the pay; then the run stopped,
// for the rest. What is paid in all is what was promised: ten coin and the lantern, not the half and the whole.
describe('a first-town job done out of order', () => {
  it('pays half, then the rest, and no more than was promised', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/mage/Wat']));
    const gold = () => j.campaign.world.number(ModuleWriter.call('quantity', j.campaign.playerActor!, 'gold'));
    for (const step of ['To the landing at Lowmouth', 'To Ulf\'s chandlery', 'Buy › A twist of ratsbane',
      'To the landing at Lowmouth', 'To Mik\'s salt-house', 'Ask Mik about the rats', 'To the landing at Lowmouth',
      'To the old corn-store', 'Down to the corn-store cellar', 'a candle: Light', 'Lay ratsbane', 'Up to the old corn-store',
      'Wait › Until dark', 'Wait › An hour', 'Wait › An hour', 'Wait › An hour']) { await j.step(step); }
    const before = gold();
    for (const step of ['To the landing at Lowmouth', 'To Mik\'s salt-house', 'Talk to Mik', 'Tell Mik the rats',
      'Take your leave']) { await j.step(step); }
    expect(gold()).toBe(before + 6);
    for (const step of ['To the landing at Lowmouth', 'To the old corn-store', 'Down to the corn-store cellar',
      '?a candle: Light', 'To the rat-runs', 'Pack the rats', 'To the corn-store cellar', 'Up to the old corn-store',
      'To the landing at Lowmouth', 'To Mik\'s salt-house', 'Talk to Mik']) { await j.step(step); }
    expect(j.offers('Tell Mik the rats under the corn-store are dead, and their run')).toBe(true);
    await j.step('Tell Mik the rats under the corn-store are dead, and their run');
    expect(gold()).toBe(before + 10);
    expect(j.offers('Tell Mik the rats')).toBe(false);
  }, 180000);
});
