import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlayerView } from '../../src/presentation/player-view';
import { Costs } from '../../src/costs';
import { EngineHost } from '../../web/engine/engine-host';
import type { Frame, Message } from '../../web/engine/protocol';

// What an act costs the page is counted, not timed (OR-91, OR-114: a loaded machine had failed a budget of time): its
// screen built once, what the company perceives worked out once, and what has happened told from the log once for
// each state of the game; a fight, once where it begins and once where it ends (each frame of it had told the whole
// log again).
class Page {
  static async start() {
    const session = await PlaySession.start('test/fixtures/ford-road/campaign.json', 'screen-once',
      NodeBundleSource.shared, [{ name: 'Wenna', raceId: 'human', classId: 'warrior' },
        { name: 'Bran', raceId: 'human', classId: 'warrior' }]);
    const host: EngineHost = new EngineHost(Page.heard.bind(Page, () => host));
    // Bound to the game as a page begun on it is, its first screen drawn (a frame asked for with nothing done).
    Object.assign(host, { session, saving: Page.never });
    await host.handle({ kind: 'unbind' });
    return { session, host };
  }
  static never() { /* nothing kept */ }
  // A fight waiting on the company is fought by its tactics.
  static heard(host: () => EngineHost, m: Message) {
    if (m.kind === 'frame' && m.frame.combat?.ours) { setTimeout(Page.fight.bind(Page, host()), 0); }
  }
  static fight(host: EngineHost) { void host.handle({ kind: 'fight' }); }
  static async act(host: EngineHost, command: string) {
    const mark = Costs.mark(), frame = await host.handle({ kind: 'perform', command }) as Frame, spent = Costs.since(mark);
    return { frame, screens: spent.screen?.n ?? 0, perceived: spent.observe?.n ?? 0 };
  }
}
describe('an act on the page', () => {
  it('builds its screen once and works out what the company perceives once', async () => {
    const { session, host } = await Page.start(), c = session.campaign;
    const waited = await Page.act(host, 'wait');
    expect([waited.screens, waited.perceived]).toEqual([1, 1]);
    // Into the copse, where the dog comes on: the fight's first frame is drawn where the company has come, and the
    // page after it where the fight left it; once each, however many frames of the fight came between.
    const fought = await Page.act(host, 'go(world__lane,world__copse)');
    expect(fought.frame.combat).toBeDefined();
    expect([fought.screens, fought.perceived]).toEqual([2, 2]);
    // What has happened is told once for a state of the game, and afresh once anything has.
    const told = PlayerView.chronicle(c);
    expect(PlayerView.chronicle(c)).toBe(told);
    await Page.act(host, 'wait');
    expect(PlayerView.chronicle(c)).not.toBe(told);
    expect(PlayerView.chronicle(c).length).toBeGreaterThan(told.length);
  }, 60000);
});
