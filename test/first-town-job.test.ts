import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ModuleWriter } from '../src/lang/module-writer';

// Success judged by ordinary play (the owner's OWN-55, the independent review's first-town acceptance): a fresh
// warrior of a drawn country, come in by the causeway, reads the notice on the well-post, takes the corn-store job
// and its key from the merchant, goes down with a light, clears the rats and the old buck rat in their nest, and
// comes back to be paid in coin and in what the next job wants (a lantern, oil); the job is gone from what is asked
// of the company, and the merchant has nothing more to ask of it. Played by the page's own labels, as in a1 on 3
// November, where the rooms below had said nothing and the reckoning had called two rats more than a warrior could
// take.
describe('the first town\'s first job', () => {
  it('is found, done and paid for, by the page\'s own words', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Aud']));
    const gold = () => j.campaign.world.number(ModuleWriter.call('quantity', j.campaign.playerActor!, 'gold'));
    const before = gold();
    for (const step of ['To the landing at Lowmouth', 'Read the notice', 'To Mik\'s salt-house', 'Talk to Mik',
      'Ask Mik about the rats', 'Take your leave']) { await j.step(step); }
    expect(j.screen().objectives.join(' ')).toMatch(/Clear the rats out of the corn-store cellar, under the old corn-store/);
    for (const step of ['To the landing at Lowmouth', 'To the old corn-store', 'a torch: Light']) { await j.step(step); }
    expect(await j.step('Down to the corn-store cellar')).toMatch(/A low brick cellar under the corn-store/);
    expect(await j.step('To the rat-runs')).toMatch(/worn a path in the dirt/);
    await j.step('Attack');
    expect(j.campaign.world.test(ModuleWriter.call('able', 'region__s1_u_rats'))).toBe(false);
    // Their run goes down to the nest, where the old buck rat keeps it: the job's second fight (Mission 19).
    expect(j.screen().objectives.join(' ')).toMatch(/Clear the rats' nest/);
    await j.step('To the nest');
    await j.step('Attack');
    expect(j.campaign.world.test(ModuleWriter.call('able', 'region__s1_u_buck'))).toBe(false);
    for (const step of ['To the rat-runs', 'To the corn-store cellar', 'Up to the old corn-store', 'To the landing at Lowmouth',
      'To Mik\'s salt-house', 'Talk to Mik']) { await j.step(step); }
    expect(await j.step('Tell Mik the rats')).toMatch(/a lantern and two flasks of oil set on the counter/);
    const pack = j.campaign.readout.creatures.find(c => c.name === 'Aud')!.state.inventory?.map(i => i.definition) ?? [];
    expect([pack.filter(d => d === 'lantern').length, pack.filter(d => d === 'lamp_oil').length]).toEqual([1, 2]);
    expect(gold()).toBe(before + 10);
    expect(j.screen().objectives.join(' ')).not.toMatch(/rats/);
  }, 120000);
});
