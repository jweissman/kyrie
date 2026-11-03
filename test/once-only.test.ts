import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';

// A question put `once` is offered again for the same answer; one put `once only` is not, whatever it did: the Third
// Night's "Ask Robin Tull again why he will not go home" needed a guard of its own to go when its subject had (its
// friction 6, TTN-06).
describe('a topic put once only', () => {
  it('is not offered again, where one put once is', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'oo/site.kyr': `Module oo "Once only" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Person robin "Robin Tull" at yard { Role "a drover". Ancestry human. Peaceable. Pronouns he. }
        Entity why: fact "why Robin will not go home". Entity road: fact "the road".
        Topic robin_why with robin "Ask Robin Tull why he will not go home" when true once only {
          Says "'Because,' he says.". On discuss { Assert knows(actor, why). } }
        Topic robin_road with robin "Ask Robin Tull about the road" when true once {
          Says "'Long,' he says.". On discuss { Assert knows(actor, road). } } }`,
      'oo/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'oo.campaign.json': JSON.stringify({ version: 1, name: 'oo', modules: [{ id: 'p', bundle: 'oo/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const j = Journey.of(await PlaySession.start(source.resolve('oo.campaign.json'), 'oo', source));
    await j.play('Talk to Robin Tull', 'why he will not go home', 'about the road');
    expect(j.offers('Ask Robin Tull again about the road')).toBe(true);
    expect(j.offers('again why he will not go home')).toBe(false);
    expect(j.offers('why he will not go home')).toBe(false);
  }, 60000);
});
