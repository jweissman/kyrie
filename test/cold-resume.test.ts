import { describe, expect, it } from 'bun:test';
import { resolve } from 'node:path';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { LocalKinds } from '../src/canon/local-catalog';

// A game carrying a thing of its own kind is taken up again in a page that has played nothing yet. Found by the
// follow-up independent review: two saves from the singing halls would not load in a fresh browser ("Unknown item
// definition cantor_token"), where loading them into a page already playing had worked. A saved game puts its own
// kinds back before the company that carries them.
describe('a kept game with a thing of its own kind', () => {
  it('is taken up again with nothing of it known before', async () => {
    const s = await PlaySession.start(resolve(import.meta.dir, 'fixtures/probes/local-kind/probe.campaign.json'),
      'cold', NodeBundleSource.shared);
    const take = PlayerView.choices(s.campaign).find(c => /^Collect a little ox of dreg/.test(c.choice.name))!;
    await s.perform(take.choice.id);
    const kept = JSON.parse(JSON.stringify(s.checkpoint()));
    // A fresh page: no kinds but the catalog's.
    LocalKinds.reset();
    const again = PlaySession.resume(kept);
    expect(again.campaign.readout.creatures[0]!.state.inventory?.some(i => i.definition === 'dreg_ox')).toBe(true);
  }, 60000);
});
