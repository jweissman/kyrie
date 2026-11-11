import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { Patience } from '../src/ui/patience';

// One who warned the company off and has since fallen gives it no more minutes (round 5: a robbers' captain dead on
// the floor "will give you 7 minutes, no more").
describe('a warning', () => {
  it('is said while whoever gave it stands, and not once they have fallen', async () => {
    const j = await Journey.start('test/fixtures/probes/seized/probe.campaign.json', 'k');
    await j.play('To the black wall');
    const c = j.campaign;
    expect(Patience.of(c).warned?.id).toBe('p__weights');
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('able', 'p__weights') }]));
    expect(Patience.of(c).warned).toBeUndefined();
  }, 60000);
});
