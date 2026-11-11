import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { ScenarioWord } from '../src/world/scenario-word';
import { Glanced } from './support/glanced';

// A site whose way in is hidden says, where that way starts, that the place would bear searching, and the page leads
// with searching it (the owner, 10 November: ruins led to stood closed, with no way in and nothing said of one).
describe('a hidden way in', () => {
  it('is told of where it starts, and found by the search the page leads with', async () => {
    const s = await DrawnWorld.start('kite', { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, was = c.world.one('at', 'party')!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', was) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w10') }]));
    const g = Glanced.of(s);
    expect(g.leaf.situation.join(' ')).toContain(ScenarioWord.sign);
    expect(g.glance.acts.map(a => [a.why, a.label])).toContainEqual(['sign', 'Search here']);
    await s.perform(PlayerView.choices(c).find(x => /^search\(/.test(x.choice.id))!.choice.id);
    expect(Glanced.of(s).screen.exits.map(e => e.destination.name)).toContain('the lip of the sink');
  }, 120000);
});
