import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleParser } from '../src/lang/module-parser';
import { LocalKinds } from '../src/canon/local-catalog';

// What a campaign means does not turn on what else the process has done (the architecture review's H7, from its
// probes det-kind-cache, det-parse-cache and det-concurrent): two campaigns' tonics were one tonic to whichever was
// used first; a module read among another campaign's kinds was taken, read again, for one read without them; and two
// campaigns each declaring a token, loaded at once, failed.
class Two {
  static source(kinds: (dir: string) => string) {
    const files: Record<string, string> = {};
    for (const dir of ['a', 'b']) {
      files[`det/${dir}/site.kyr`] = `Module det${dir} "Det ${dir}" { Place field "Field" is wilderness.
        Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room. ${kinds(dir)} }`;
      files[`det/${dir}/module.json`] = JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } });
      files[`det/${dir}.campaign.json`] = JSON.stringify({ version: 1, name: dir, modules: [{ id: 'p', bundle: `${dir}/module.json` }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    }
    return new OverlayBundleSource(NodeBundleSource.shared, files);
  }
  static async uses(source: OverlayBundleSource, dir: string): Promise<string[]> {
    const s = await PlaySession.start(source.resolve(`det/${dir}.campaign.json`), 'seed', source);
    await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('take_item'))!.choice.id);
    return PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => id.startsWith('use_item'));
  }
}
describe('a campaign in a process that has run others', () => {
  it('uses its own kinds, whichever ran first', async () => {
    const tonic = Two.source(dir => `Kind tonic "a tonic" like ${dir === 'a' ? 'wine' : 'elixir_of_strength'}.
      Item flask "a flask of tonic" is tonic at room.`);
    const alone = await Two.uses(tonic, 'b');
    await Two.uses(tonic, 'a');
    expect(await Two.uses(tonic, 'b')).toEqual(alone);
  }, 120000);
  it('reads a module as it reads without another campaign\'s kinds, once they are gone', async () => {
    const text = 'Module later "Later" { Kind figurine "a figurine" like dreg_ox. }';
    LocalKinds.reset();
    expect(() => ModuleParser.parse(text)).toThrow();
    await PlaySession.start('test/fixtures/probes/local-kind/probe.campaign.json', 'w', NodeBundleSource.shared);
    try { ModuleParser.parse(text); } catch { /* read among the other campaign's kinds, it may stand */ }
    LocalKinds.reset();
    expect(() => ModuleParser.parse(text)).toThrow();
  }, 120000);
  it('loads beside another declaring the same kind its own way', async () => {
    const tokens = Two.source(dir => `Kind token "a token" is treasure worth ${dir === 'a' ? 2 : 99}.
      Item t "a token" is token at room.`);
    const [a, b] = await Promise.all(['a', 'b'].map(d => PlaySession.start(tokens.resolve(`det/${d}.campaign.json`),
      `seed-${d}`, tokens)));
    expect(a!.campaign.running && b!.campaign.running).toBe(true);
  }, 120000);
});
