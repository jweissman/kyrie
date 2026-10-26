import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// A way stands for the company as the rules have it (barredFor, watchedAgainst), not as the page re-derived it with
// clauses missing (the architecture review's H5): a grate the company holds the key to, and a dog that lets it by,
// were told as barring ways the company could take.
describe('a way as the rules have it', () => {
  it('is open to the keyholder and to one its guard lets by, as the commands say', async () => {
    const s = await PlaySession.start('test/fixtures/probes/way-standing/probe.campaign.json', 'standing', NodeBundleSource.shared);
    const go = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => id.startsWith('go('));
    expect(go.sort()).toEqual(['go(p__byre_door,p__byre)', 'go(p__hatch,p__cellar)']);
    const exits = ScreenModel.build(s.campaign).exits;
    expect(exits.filter(e => e.blocked).map(e => `${e.destination.id}: ${e.blocked}`)).toEqual([]);
  }, 60000);
});
describe('who is there in the dark', () => {
  it('is heard, and nothing is shown of how hurt or how hardy they are', async () => {
    const { OverlayBundleSource } = await import('../src/campaign/overlay-bundle-source');
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'dark/site.kyr': `Module dark "In the dark" { Place hill "the hill" is site. Place cave "the cave" is room within hill at 0, 0.
        Company party "You" of 1 at cave. Initially Assert unlit(cave).
        Person goblins "the goblins" at cave { Role "goblins at their fire". Species goblin. Numbers 3. Peaceable. } }`,
      'dark/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'dark.campaign.json': JSON.stringify({ version: 1, name: 'dark', modules: [{ id: 'p', bundle: 'dark/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('dark.campaign.json'), 'dark', source);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.dark).toBe(true);
    expect(screen.people.filter(p => p.look).map(p => p.look)).toEqual([]);
  }, 60000);
});
