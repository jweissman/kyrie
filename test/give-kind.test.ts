import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';

// A kind given is a new one of it, in the company's hands (Wapshott's Circus friction 13: a thing to be given had to be
// parked in some room, hidden until a fact; Half the Hive's 5, the Third Night's 16, a gift with no identity).
describe('giving a kind of thing', () => {
  it('puts a new one of it in the company\'s hands, each time', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'gk/site.kyr': `Module gk "Gift" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Kind keepsake_kind "a carved keepsake" is gear worth 1 weighing 0 described "A little carved bird.".
        Action thank(actor: group, site: place) "Be thanked" { Requires at(actor, site). On success { Give keepsake_kind to actor. } } }`,
      'gk/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'gk.campaign.json': JSON.stringify({ version: 1, name: 'gk', modules: [{ id: 'p', bundle: 'gk/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('gk.campaign.json'), 'gk', source);
    await s.perform('p__thank(party,p__yard)');
    await s.perform('p__thank(party,p__yard)');
    const kept = s.campaign.readout.creatures[0]!.state.inventory!.filter(i => /keepsake/.test(i.definition));
    expect(kept.length).toBe(2);
  }, 60000);
});
