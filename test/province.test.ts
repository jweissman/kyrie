import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { Spatial } from '../src/spatial';

// An adventure installed as a province of the country it is placed in, not as a country of its own (Mission 18's
// Gate B): its own region is set within the host's, so its places lie in that country (the rules' `within` says so of
// whatever is in them), and a region within a region is a province, which the engine accepts.
class Province {
  static readonly files: Record<string, string> = {
    'pv/a/land.kyr': `Module a "A" { Place land "Land" is region. Place town "Town" is settlement within land.
      Place green "Green" is room within town at 0, 0. Company party "You" of 1 at green. Goal false. }`,
    'pv/a/module.json': JSON.stringify({ version: 1, source: 'land.kyr', rules: ['world'], globals: ['party'] }),
    'pv/b/vale.kyr': `Module b "B" { Place vale "The vale" is region. Place mill "The mill" is settlement within vale.
      Place yard "The mill yard" is room within mill at 0, 0. Thing sack "a sack of meal" at yard { }
      Goal false. }`,
    'pv/b/module.json': JSON.stringify({ version: 1, source: 'vale.kyr', rules: ['world'] }),
    'pv/a.campaign.json': JSON.stringify({ version: 1, name: 'a', modules: [{ id: 'a', bundle: 'a/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
  };
  static async campaign() {
    const overlay = new OverlayBundleSource(NodeBundleSource.shared, Province.files);
    const c = (await PlaySession.start(overlay.resolve('pv/a.campaign.json'), 'seed', overlay)).campaign;
    await c.install({ id: 'b', bundle: overlay.resolve('pv/b/module.json'), within: 'a__land' }, overlay);
    return c;
  }
}

describe('a province', () => {
  it('sets an adventure\'s own region within the country it is installed in', async () => {
    const c = await Province.campaign(), entities = new Map(c.module.entities.map(e => [e.id, e]));
    expect(Spatial.ancestry(entities, 'b__yard').map(e => e.id)).toEqual(['b__yard', 'b__mill', 'b__vale', 'a__land']);
    expect(c.world.test(ModuleWriter.call('within', 'b__sack', 'a__land'))).toBe(true);
    expect(c.world.test(ModuleWriter.call('within', 'b__sack', 'b__vale'))).toBe(true);
  });
});
