import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleParser } from '../src/lang/module-parser';
import { LocalKinds } from '../src/canon/local-catalog';
import { Canon } from '../src/canon/canon';
import { ItemCatalog } from '../src/item-catalog';

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
    expect(ItemCatalog.definitions.dreg_ox).toBeDefined();
    const event = await first.perform(take);
    expect(event.result).toBe('success');
  });
  it('take nothing of the catalog\'s when one is refused', () => {
    LocalKinds.reset();
    expect(() => ModuleParser.parse('Module bad "Bad" { Kind dagger "a counterfeit" is treasure worth 9. }')).toThrow();
    LocalKinds.reset();
    expect(Canon.items.dagger).toBeDefined();
    expect(ItemCatalog.definitions.dagger).toBeDefined();
  });
  it('cannot be given two meanings by two modules, whatever they are called', async () => {
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
    await expect(PlaySession.start(overlay.resolve('isolation/two.campaign.json'), 'two', overlay)).rejects
      .toThrow(/isolation_coin is declared differently by two modules/);
    LocalKinds.reset();
  });
});
