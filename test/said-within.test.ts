import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Tiny } from './support/tiny';

// What is said within an area waits for the company to be there: news of the city is told, and done, when the
// company comes up from under the sea, not while it is below (What Tessary Owes' W1: every news rule carried a
// query over twenty-six rooms; the Road the Star Came Down's F9).
describe('a rule said within a city', () => {
  it('waits below, and is told when the company comes up into the city', async () => {
    const kyr = readFileSync('test/fixtures/probes/within/site.kyr', 'utf8').replace('Module within ', 'Module p ');
    const s = (await Tiny.start(kyr, { seed: 'within', horizon: [] })).session;
    const voted = () => s.campaign.world.test(ModuleWriter.call('p__voted', 'p__board'));
    const below = await s.leg('wait_hour');
    expect((below.perceptions ?? []).map(p => p.text).join(' ')).not.toContain('Bells');
    expect(voted()).toBe(false);
    const up = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('go(p__sea_stair'))!;
    const event = await s.leg(up.choice.id);
    expect((event.perceptions ?? []).map(p => p.text)).toContain('Bells across the city: the Board has voted.');
    expect(voted()).toBe(true);
  }, 60000);
});
