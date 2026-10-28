import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// A requirement of one thing or another carried is met by either (AUT-06, The Hearing at Low Water's friction 8:
// `carries(a, x) or carries(a, y)` in a requirement was never offered).
class Either {
  static async start() {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'or/site.kyr': `Module or "Either" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Item coil "a coil of rope" is rope at yard. Item stick "a ten-foot pole" is pole at yard.
        Action climb(actor: group, site: place) "Get up the wall" {
          Requires at(actor, site) and (carries(actor, coil) or carries(actor, stick)). Result "Up you go.". } }`,
      'or/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'or.campaign.json': JSON.stringify({ version: 1, name: 'or', modules: [{ id: 'p', bundle: 'or/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('or.campaign.json'), 'or', source);
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static async take(s: PlaySession, what: RegExp) {
    await s.perform(PlayerView.choices(s.campaign).find(c => what.test(c.choice.name))!.choice.id);
  }
}

describe('one thing or another carried', () => {
  it('is met by either', async () => {
    const s = await Either.start();
    expect(Either.names(s)).not.toContain('Get up the wall');
    await Either.take(s, /^Collect a ten-foot pole/);
    expect(Either.names(s)).toContain('Get up the wall');
  }, 60000);
});
