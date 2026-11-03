import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';

// Something of a kind that does not exist is refused with the few there are (Fair Weather's 10 and Behind the
// Wainscot's F12: `Manner gentle.` failed at load with no line, and the manners were seven to guess).
describe('an unknown one of a kind', () => {
  it('is refused with the kind\'s members named', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'mn/site.kyr': `Module mn "Manners" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Person nan "Nan" at yard { Peaceable. Manner gentle. } }`,
      'mn/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'mn.campaign.json': JSON.stringify({ version: 1, name: 'mn', modules: [{ id: 'p', bundle: 'mn/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    await expect(PlaySession.start(source.resolve('mn.campaign.json'), 'mn', source)).rejects
      .toThrow(/no manner of that name; the manners are proud, grim, cheerful/);
  }, 60000);
});
