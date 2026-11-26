import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleParser } from '../src/lang/module-parser';
import { Canon } from '../src/canon/canon';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// A campaign's own kinds of thing are its own: a second game begun in the same process does not take them from the
// first, a kind refused takes nothing of the catalog's with it, and two modules cannot give one kind two meanings.
// Found by Mission 15's independent audit (F1), whose cases these are.
const source = NodeBundleSource.shared;
describe('the kinds a campaign declares for itself', () => {
  it('stay the first game\'s when a second game is begun in the same process', async () => {
    const first = await PlaySession.start('test/fixtures/probes/local-kind/probe.campaign.json', 'first', source);
    const take = PlayerView.choices(first.campaign).find(c => c.choice.id.startsWith('take_item(p__ox'))!.choice.id;
    await PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json', 'second', source);
    // The first game's ox is still a kind of thing to it, and it can be taken up.
    first.campaign.world.test({ kind: 'boolean', value: true });
    expect(first.campaign.catalog.find('dreg_ox')).toBeDefined();
    const event = await first.perform(take);
    expect(event.result).toBe('success');
  });
  it('are the campaign\'s again when it is begun again after another, before its creatures are read', async () => {
    // A bear of one module's own species, in a campaign begun, then another, then the first again (Gosse's Company).
    const players = 'test/fixtures/gosse/warrior.campaign.json', city = 'test/fixtures/gosse/city.campaign.json';
    await PlaySession.start(players, 'again', source);
    await PlaySession.start(city, 'again', source);
    const again = await PlaySession.start(players, 'again', source);
    expect(again.campaign.catalog.isSpecies('players__dancing_bear')
      || again.campaign.catalog.isSpecies('dancing_bear')).toBe(true);
    expect(again.campaign.running).toBe(true);
  }, 60000);
  it('take nothing of the catalog\'s when one is refused', () => {
    expect(() => ModuleParser.parseWithin(CanonVocabulary.context(),
      'Module bad "Bad" { Kind dagger "a counterfeit" is treasure worth 9. }')).toThrow();
    expect(Canon.items.dagger).toBeDefined();
  });
  // Two modules of one campaign naming a kind each their own way keep both meanings apart: the later one's kind takes
  // its installation's name (ModuleNamespace.renamed, OR-540), never a meaning shared or one refused.
  it('keeps two meanings of one kind\'s name apart, the later module\'s under its own installation\'s name', async () => {
    const files: Record<string, string> = {};
    for (const [dir, value] of [['catalog-a', 2], ['catalog-b', 99]] as const) {
      files[`isolation/${dir}/site.kyr`] = `Module shared "Same module label" { Place field "Field" is wilderness.
        Place room "Room" is room within field at 0, 0. ${dir === 'catalog-a' ? 'Company party "You" of 1 at room.' : ''}
        Kind isolation_coin "Coin" is treasure worth ${value}. Item coin "Coin" is isolation_coin at room. }`;
      files[`isolation/${dir}/module.json`] = JSON.stringify({ version: 1, source: 'site.kyr', rules: 'world',
        ...dir === 'catalog-a' ? { globals: ['party'] } : {} });
    }
    files['isolation/two.campaign.json'] = JSON.stringify({ version: 1, name: 'Two', modules: [
      { id: 'a', bundle: 'catalog-a/module.json' }, { id: 'b', bundle: 'catalog-b/module.json' }],
    party: [{ name: 'A', raceId: 'human', classId: 'warrior' }] });
    const overlay = new OverlayBundleSource(source, files);
    const two = await PlaySession.start(overlay.resolve('isolation/two.campaign.json'), 'two', overlay);
    const worths = two.campaign.catalog.local.filter(id => id.endsWith('isolation_coin'))
      .map(id => two.campaign.catalog.get(id).value);
    expect(two.campaign.running).toBe(true);
    expect(worths.sort()).toEqual([2, 99]);
  });
});
