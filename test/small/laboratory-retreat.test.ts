import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { ModuleWriter } from '../../src/lang/module-writer';
import { ScreenModel } from '../../src/ui/screen-model';
import type { Battle } from '../../src/battle';

// Going back up is an act with a result (M21's FF-03, in the laboratory): a company that flees the old buck rat keeps
// what it learned (the aim says where the rat is, and how it can be dealt with), the rat stays in its nest, and a
// second descent, a firebomb bought from Mik on the way, ends it from the runs without the fight.
class Flee {
  static controller(this: void, battle: Battle) {
    const legal = battle.legalCommands();
    return Promise.resolve(legal.find(c => c.ability === 'flee') ?? legal[0]!);
  }
}
describe('a retreat from the old buck rat', () => {
  it('keeps the rat where it was and what was learned, and a better second descent ends it', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Brann']));
    const buck = () => j.campaign.world.test(ModuleWriter.call('able', 'lab__low_u_buck'));
    await j.play('wrench the padlock', 'old corn-store', 'corn-store cellar', ': light a', 'rat-runs', '^Attack', 'To the nest');
    await j.fight('^Attack', Flee.controller);
    expect([buck(), j.at('party') !== 'lab__low_u_nest']).toEqual([true, true]);
    expect(ScreenModel.build(j.campaign).objectives.join(' ')).toMatch(/old buck rat/);
    await j.play('?To the rat-runs', 'corn-store cellar', 'old corn-store', 'landing at Lowmouth', "Mik's salt-house",
      'oil firebomb', 'landing at Lowmouth', 'old corn-store', 'corn-store cellar', '?: light a', 'rat-runs',
      'Throw an oil firebomb');
    expect(buck()).toBe(false);
  }, 60000);
});
