import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// Someone greets a company that comes back in their own words for it (What Tessary Owes' W18): with a Greets of their
// own and none for a return, they said nothing at all the second time, the tables' lines being kept from them.
class Again {
  static async start() {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ga/site.kyr': `Module ga "Again" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Person nan "Nan" at yard { Peaceable. Greets "'You'll be wanting the coat,' says Nan.".
          Greets again "'Back again,' says Nan, 'and the coat no drier.'". } }`,
      'ga/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ga.campaign.json': JSON.stringify({ version: 1, name: 'ga', modules: [{ id: 'p', bundle: 'ga/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('ga.campaign.json'), 'ga', source);
  }
  static async choose(s: PlaySession, name: RegExp) {
    const event = await s.perform(PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id);
    return (event.voiced ?? []).map(v => v.text).join(' ');
  }
}
describe('someone greeting the company again', () => {
  it('says their own words for it', async () => {
    const s = await Again.start();
    expect(await Again.choose(s, /^Talk to Nan/)).toContain("You'll be wanting the coat");
    await Again.choose(s, /^Take your leave/);
    expect(await Again.choose(s, /^Talk to Nan/)).toContain('Back again');
  }, 60000);
});
