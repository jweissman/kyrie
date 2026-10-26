import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';

// A way that opens while something holds is opened once the rules of the moment have run, wherever it and they are
// declared: a gate declared before the rule that lets the company through stood barred, the porter's words said,
// until the next thing done (Low Water's 1, the Assayers' gate; What Tessary Owes' W10, the black wall).
describe('a way that a rule opens', () => {
  it('is open as soon as the rule has opened it', async () => {
    const s = await PlaySession.start('test/fixtures/probes/admitted/probe.campaign.json', 'admitted', NodeBundleSource.shared);
    const ways = () => PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => id.startsWith('go('));
    expect(ways()).toEqual(['go(p__walk,p__porch)']);
    const event = await s.perform('go(p__walk,p__porch)');
    expect((event.perceptions ?? []).map(p => p.text)).toContain('The porter sees you on the porch and lifts the bar.');
    expect(ways()).toContain('go(p__inner,p__hall)');
  }, 60000);
});
