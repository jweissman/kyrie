import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Narrator } from '../src/presentation/narrator';
import { Words } from '../web/reader/words';

// An activity broken off before it had run its course is told as begun, not done. The Bushweald play read "You wait
// until first light" at night: the storm had cut the wait short. The engine says so (cut), and the telling follows it.
describe('a wait broken off', () => {
  it('is marked so by the engine, and told as begun, with what broke it off', async () => {
    const s = await PlaySession.start('data/campaigns/the-long-man.campaign.json', 'merrow', NodeBundleSource.shared);
    while (s.campaign.state.elapsed < 300) { await s.perform('wait_hour'); }
    // Watching until something changes, the company is in the dale when the storm comes on the third day.
    const watched = await s.perform('wait_watch');
    expect([watched.cut, watched.response]).toEqual([true, expect.stringContaining('The wind goes round to the north')]);
    // Told in the action's own words, which have a verb where a heading's choice may not ("Until first light").
    const name = s.campaign.operator(watched.action)!.name;
    expect(Words.echo(Narrator.begun(name))).toBe(`You begin to ${name.charAt(0).toLowerCase()}${name.slice(1)}.`);
  }, 120000);
});
