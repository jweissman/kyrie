import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// A question put once can be put again, for the same answer and nothing more: Mission 16's play found that a topic
// once asked was gone, and what had been said with it (NAR-03). The Long Man's people at the well, about the barrow.
describe('a question asked again', () => {
  it('is answered as it was, and does nothing it did again', async () => {
    const s = await PlaySession.start('data/campaigns/the-long-man.campaign.json', 'merrow', NodeBundleSource.shared);
    const c = s.campaign, named = (pattern: RegExp) => PlayerView.choices(c).find(x => pattern.test(x.choice.name));
    await s.perform('go(longman__south_road,longman__green)');
    expect(named(/^Ask the people at the well again about the Long Man/)).toBeUndefined();
    const first = await s.perform(named(/^Ask the people at the well about the Long Man/)!.choice.id);
    expect(named(/^Ask the people at the well about the Long Man/)).toBeUndefined();
    const again = named(/^Ask the people at the well again about the Long Man/)!;
    const before = c.world.key(), second = await s.perform(again.choice.id);
    expect(second.response).toBe(first.response);
    expect(second.response).toContain('The Mower walks');
    // Nothing is done again: no fact learned, nothing set, not even the time it takes (a topic takes none).
    expect(second.changes).toEqual([]);
    expect(c.world.key()).toBe(before);
  }, 60000);
});
