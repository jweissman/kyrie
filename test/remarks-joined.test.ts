import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// A companion who has joined the company says what they say on coming somewhere that matters to them (The House That
// Grows' 4: the remark asked that their own group be able, and one who has joined is a member of the company's).
describe('a remark of one who has joined', () => {
  it('is said where it belongs', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'rj/site.kyr': `Module rj "Joined" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Place lane "the lane" is room within field at 1, 0.
        Passage gap "a gap" between yard and lane. Company party "You" of 1 at yard.
        Person ida "Ida" at yard { Ancestry human. Class warrior. Peaceable.
          Remarks at lane "'I was born in this lane,' says Ida.". }
        Initially Assert willing(ida, party). Initially Set hire(ida) to 0. }`,
      'rj/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'rj.campaign.json': JSON.stringify({ version: 1, name: 'rj', modules: [{ id: 'p', bundle: 'rj/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const j = Journey.of(await PlaySession.start(source.resolve('rj.campaign.json'), 'rj', source));
    await j.play('Ask Ida to join', '>p__lane');
    expect(j.taken.at(-1)!.page).toContain('I was born in this lane');
  }, 60000);
});
