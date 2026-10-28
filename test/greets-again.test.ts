import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// Someone greets a company that comes back in their own words for it (What Tessary Owes' W18): with a Greets of their
// own and none for a return, they said nothing at all the second time, the tables' lines being kept from them.
class Again {
  static async start(along = '', words = '') {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ga/site.kyr': `Module ga "Again" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Person nan "Nan" at yard { Peaceable. Greets "'You'll be wanting the coat,' says Nan.".
          Greets again "'Back again,' says Nan, 'and the coat no drier.'". ${words} } ${along} }`,
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
  // One the company has walked with is not greeted as a stranger (A Winter in Carth's friction 7: Hern, who had
  // walked a day with the company, greeted it as a stranger).
  it('greets one it has walked with as one met again', async () => {
    const s = await Again.start(`Action along(actor: group, site: place) "Ask Nan to come along" {
      Requires at(actor, site) and at(nan, site) and not following(nan, actor).
      On success { Assert following(nan, actor). } Result "Nan puts on the coat.". }`);
    await Again.choose(s, /^Ask Nan to come along/);
    expect(await Again.choose(s, /^Talk to Nan/)).toContain('Back again');
  }, 60000);
  // Words said only while something holds: a door shutting on someone is no parting (A Winter in Carth's friction 8:
  // "Leaves" was said as a gaol door shut on Hern).
  it('says a parting only when it is one', async () => {
    const along = `Relation penned(group).
      Action along(actor: group, site: place) "Ask Nan to come along" {
        Requires at(actor, site) and at(nan, site) and not following(nan, actor).
        On success { Assert following(nan, actor). } Result "Nan puts on the coat.". }
      Action home(actor: group, site: place) "Send Nan home" { Requires at(actor, site) and following(nan, actor).
        On success { Retract following(nan, actor). } Result "Nan goes.". }
      Action pen(actor: group, site: place) "Shut Nan in the byre" { Requires at(actor, site) and following(nan, actor).
        On success { Retract following(nan, actor). Assert penned(nan). } Result "The byre door shuts.". }`;
    const words = `Leaves "'I'll be off home, then,' says Nan." when not penned(nan).`;
    const sent = await Again.start(along, words);
    await Again.choose(sent, /^Ask Nan to come along/);
    expect(await Again.choose(sent, /^Send Nan home/)).toContain("I'll be off home");
    const penned = await Again.start(along, words);
    await Again.choose(penned, /^Ask Nan to come along/);
    expect(await Again.choose(penned, /^Shut Nan in the byre/)).not.toContain("I'll be off home");
  }, 60000);
});
