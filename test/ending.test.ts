import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/endings';
import { Campaign } from '../src/campaign/campaign';

// An ending an author writes closes the book (Thrume F12, The Patient Star's 28, the Road's F19 and F23): reached
// once, its epilogue told as it happens, and play stops on its title.
describe('an ending', () => {
  it('is reached when its condition first holds, told, and the book closes on it', async () => {
    const j = await Journey.start('test/fixtures/probes/ending/probe.campaign.json', 'ending');
    expect([j.campaign.running, Endings.reached(j.campaign.world)]).toEqual([true, undefined]);
    expect(await j.play('Haul the lever')).toContain('Here the story ends.');
    expect(j.campaign.running).toBe(false);
    // The first of two endings that hold together is the one reached.
    expect(Endings.reached(j.campaign.world)).toEqual({ title: 'The Gate Opens',
      lines: ['The gate grinds open on the valley beyond, and the pass is yours. Here the story ends.'] });
    expect([j.holds('reached', 'p__opened'), j.holds('reached', 'p__pulled')]).toEqual([true, false]);
    const kept = Campaign.restore(JSON.parse(JSON.stringify(j.campaign.save())));
    expect([kept.running, Endings.reached(kept.world)?.title]).toEqual([false, 'The Gate Opens']);
  }, 60000);
});
// The Quiet in the Sky's 21 (QIS-05): a company killed by the cold after the watch's rules had run was never read for
// the module's own ending on dead(party), and the page closed on the shared words.
describe('an ending on the company dead', () => {
  it('is reached when the company falls, before the shared words', async () => {
    const j = await Journey.start('test/fixtures/probes/fallen/probe.campaign.json', 'fallen');
    await j.play('Lie down in the snow');
    expect([j.campaign.running, Endings.reached(j.campaign.world)?.title]).toEqual([false, 'The Hour']);
  }, 60000);
  it('is reached when the company is killed in a fight', async () => {
    const j = await Journey.start('test/fixtures/probes/fallen/probe.campaign.json', 'fallen');
    await j.play('>hollow', '?Attack');
    expect([j.campaign.running, Endings.reached(j.campaign.world)?.lines]).toEqual([false,
      ['And then you are walking in snow, and your breath does not steam.']]);
  }, 60000);
});
