import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// What is said within an area waits for the company to be there: news of the city is told, and done, when the
// company comes up from under the sea, not while it is below (What Tessary Owes' W1: every news rule carried a
// query over twenty-six rooms; the Road the Star Came Down's F9).
describe('a rule said within a city', () => {
  it('waits below, and is told when the company comes up into the city', async () => {
    const s = await PlaySession.start('test/fixtures/probes/within/probe.campaign.json', 'within', NodeBundleSource.shared);
    const voted = () => s.campaign.world.test(ModuleWriter.call('p__voted', 'p__board'));
    const below = await s.perform('wait_hour');
    expect((below.perceptions ?? []).map(p => p.text).join(' ')).not.toContain('Bells');
    expect(voted()).toBe(false);
    const up = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('go(p__sea_stair'))!;
    const event = await s.perform(up.choice.id);
    expect((event.perceptions ?? []).map(p => p.text)).toContain('Bells across the city: the Board has voted.');
    expect(voted()).toBe(true);
  }, 60000);
});
