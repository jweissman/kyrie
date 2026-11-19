import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ActionParts } from '../src/lang/action-parts';
import { ModuleWriter } from '../src/lang/module-writer';

// A failure is told as it is with whoever is there (cold play 5, CL-39's 11): with Gesk hauling on the bars beside
// her, the sea-gate's failure still said "It wants more weight than yours", true of no one alone and no longer advice.
describe('the sea-gate that will not come round', () => {
  it('is one pair of arms failing alone, and every back on the bars with a company', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const c = journey.session.campaign, wind = c.module.actions.find(a => a.id === 'gate__wind_gate')!;
    expect(c.world.relatedTo('memberOf', 'party').length).toBe(1);
    expect(ActionParts.told(wind, false, c.world)).toContain('It wants more weight than yours');
    // A hand taken on (Gesk, in cold play 5) is one more of the company.
    const two = c.world.apply([{ kind: 'assert', call: ModuleWriter.call('memberOf', 'gesk', 'party') }]);
    const said = ActionParts.told(wind, false, two)!;
    expect(said).toContain('more weight than you have between you');
    expect(said).not.toContain('than yours');
  }, 120000);
});
