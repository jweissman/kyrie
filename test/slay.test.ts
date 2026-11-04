import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';

// The Book of Faces' hill 8 (BOF-25): a Second killed by another in the night could not be said to be dead, `dead`
// being the engine's, so an offstage double and the fates said it instead. `Slay x.` makes whoever it names dead in
// the story and in the body, slain for good: dead(ullin) holds, and the page says so of them.
describe('slain by the story', () => {
  it('is dead, in the body and in what the world says', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'sl/site.kyr': `Module sl "Slain" { Place hill "the Hill" is settlement.
        Place yard "the Seconds' yard" is room within hill at 0, 0 outdoors. Company party "You" of 1 at yard.
        Person ullin "Ullin" at yard { Role "a Second". Ancestry human. Peaceable. }
        Rule in_the_night when hour(clock) >= 22 and not dead(ullin) says "Somewhere on the Stair a door bangs, once." {
          Slay ullin. } }`,
      'sl/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'sl.campaign.json': JSON.stringify({ version: 1, name: 'sl', modules: [{ id: 'p', bundle: 'sl/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const j = await Journey.start(source.resolve('sl.campaign.json'), 'sl', { source });
    expect(j.holds('dead', 'p__ullin')).toBe(false);
    expect(await j.play('=22:10')).toMatch(/a door bangs, once/);
    const body = j.campaign.actors.find(a => a.id === 'p__ullin')!.members[0];
    const ullin = j.campaign.readout.creatures.find(c => c.id === body)!;
    expect([j.holds('dead', 'p__ullin'), ullin.state.hp, ullin.state.conditions.map(c => c.id)])
      .toEqual([true, 0, ['slain']]);
    expect(j.holds('struckDead', 'p__ullin')).toBe(false);
    expect(ScreenModel.build(j.campaign).people.find(p => p.id === 'p__ullin')?.state).toBe('dead');
  }, 60000);
});
