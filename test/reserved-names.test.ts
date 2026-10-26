import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Endings } from '../src/lang/endings';

// The names the language writes for its constructs (the architecture review's A16, from its probe lang-compiler-gaps
// G15): a module's own `concluded` was merged with an Ending's, and the Ending could never be reached. It is refused;
// a module's own `reached` (a name of the shared rules) is its own, apart from the one its Ending writes.
class Reserved {
  static start(body: string) {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'rn/site.kyr': `Module rn "Reserved" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard. ${body} }`,
      'rn/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'rn.campaign.json': JSON.stringify({ version: 1, name: 'rn', modules: [{ id: 'p', bundle: 'rn/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('rn.campaign.json'), 'rn', source);
  }
}
describe('the names the language writes', () => {
  it('refuses a module\'s own concluded, and keeps its own reached apart from its Ending\'s', async () => {
    await expect(Reserved.start('Relation concluded(). Ending won "Won" when watch(clock) >= 1 "It is done.".'))
      .rejects.toThrow('concluded');
    const s = await Reserved.start('Relation reached(group). Ending won "Won" when watch(clock) >= 1 "It is done.".');
    await s.perform('wait');
    expect(Endings.reached(s.campaign.world, [])?.title).toBe('Won');
  }, 60000);
});
