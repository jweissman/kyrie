import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// What the session does is whatever the rules offer, by its id (the architecture review's H2): the page shows one
// "Take a candle" for two alike candles, and the other candle's taking could not be done by its own id.
describe('an action the rules offer', () => {
  it('can be done by its id, though the page folds it into another alike', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'cand/site.kyr': `Module cand "Candles" { Place field "Field" is wilderness.
        Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.
        Item candle_a "a candle" is candle at room. Item candle_b "a candle" is candle at room. }`,
      'cand/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'cand.campaign.json': JSON.stringify({ version: 1, name: 'cand', modules: [{ id: 'p', bundle: 'cand/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('cand.campaign.json'), 'cand', source);
    const shown = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => id.startsWith('take_item'));
    const offered = s.campaign.offered().map(a => a.id).filter(id => id.startsWith('take_item'));
    const folded = offered.find(id => !shown.includes(id))!;
    expect(shown.length).toBe(1);
    expect(folded).toBeDefined();
    expect((await s.perform(folded)).result).toBe('success');
    await expect(s.perform('take_item(p__nothing,p__nobody)')).rejects.toThrow('Unavailable command');
  }, 60000);
});
