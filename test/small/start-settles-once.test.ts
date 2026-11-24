import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { CampaignTick } from '../../src/campaign/campaign-tick';

// A game being assembled settles once, when its last module is in, not once for each (CampaignTick.settle: the
// world's rules of the moment, and every rule asked once). A new life's start had asked every rule of its country 37
// times over, 34,000 asks and 0.6 s, for one settling's answer: the start's world, state and first page are the same
// either way (the lead's comparison on iscoed, a1, thorn and kite, 24 November).
describe('a game assembled', () => {
  it('settles once, when the last of its modules is in', async () => {
    const tick = CampaignTick as unknown as { settle: (...a: unknown[]) => unknown }, settle = tick.settle;
    let settled = 0;
    tick.settle = (...a: unknown[]) => { settled++; return settle.apply(CampaignTick, a); };
    try {
      await PlaySession.start('test/fixtures/fells/campaign.json', 'settles-once', NodeBundleSource.shared);
    } finally { tick.settle = settle; }
    expect(settled).toBe(2);
  }, 60000);
});
