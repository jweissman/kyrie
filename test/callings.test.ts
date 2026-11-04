import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// The Book of Faces' BOF-13 (hill 3, gate 6, counting 3): no rule could ask what calling a member follows, or what
// they have learned, so a warrior's arc asked capable(party, brawn), which a commoner who had learned brawn passed, and
// a mage taught a lesson was told by the fee in the mentor's purse. hasCalling and learned say them.
class Callings {
  static readonly source = new OverlayBundleSource(NodeBundleSource.shared, {
    'ca/site.kyr': `Module ca "Callings" { Place field "Field" is wilderness.
      Place yard "the yard" is room within field at 0, 0. Company party "You" of 2 at yard.
      Action sigil(actor: group, site: place) "Read the sigil" {
        Requires at(actor, site) and memberOf(?m, actor) and hasCalling(?m, calling_mage). Result "It reads.". }
      Action bout(actor: group, site: place) "Finish the bout" {
        Requires at(actor, site) and memberOf(?m, actor) and hasCalling(?m, calling_warrior). Result "Won.". }
      Action light(actor: group, site: place) "Show the light you know" {
        Requires at(actor, site) and memberOf(?m, actor) and learned(?m, conjure_light). Result "Light.". } }`,
    'ca/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party' } }) });
  static async offered(callings: string[]): Promise<string[]> {
    const name = `ca-${callings.join('-')}.campaign.json`;
    const source = new OverlayBundleSource(this.source, { [name]: JSON.stringify({ version: 1, name: 'ca',
      modules: [{ id: 'p', bundle: 'ca/module.json' }],
      party: callings.map((classId, i) => ({ name: `M${i}`, raceId: 'human', classId })) }) });
    const s = await PlaySession.start(source.resolve(name), 'ca', source);
    return PlayerView.choices(s.campaign).map(c => c.choice.name)
      .filter(n => ['Read the sigil', 'Finish the bout', 'Show the light you know'].includes(n));
  }
}

describe('a calling, and what a member has learned', () => {
  it('can be asked of the company\'s members', async () => {
    expect(await Callings.offered(['warrior', 'mage'])).toEqual(['Read the sigil', 'Finish the bout', 'Show the light you know']);
    expect(await Callings.offered(['thief', 'bard'])).toEqual([]);
  }, 60000);
});
