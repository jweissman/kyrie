import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// A condition may ask the company to hold a kind of the catalog's that the module names nowhere else (the Book of
// Faces' BOF-17: holding(actor, candle) had been refused, "no itemkind of that name", unless the module declared a
// candle of its own): the kind is the world's, as one given is, and the act is offered to whoever holds one.
describe('a condition on holding a kind of the catalog\'s', () => {
  it('is read, and offered to one who holds it', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'hd/site.kyr': `Module hd "Held" { Place field "Field" is wilderness.
        Place cellar "the cellar" is room within field at 0, 0. Company party "You" of 1 at cellar.
        Action read_wall(actor: group, site: place) "Read the writing on the wall by candlelight" {
          Requires at(actor, site) and holding(actor, candle). Result "It says nothing kind.". } }`,
      'hd/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'hd.campaign.json': JSON.stringify({ version: 1, name: 'hd', modules: [{ id: 'p', bundle: 'hd/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('hd.campaign.json'), 'hd', source);
    expect(PlayerView.choices(s.campaign).map(c => c.choice.name)).toContain('Read the writing on the wall by candlelight');
  }, 60000);
});
