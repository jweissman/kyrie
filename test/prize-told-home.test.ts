import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ModuleWriter } from '../src/lang/module-writer';

// What a deep site's prize is, told at home, is told of it as the company has it (cold play 2, CL-09): "Tell Kynes what
// you brought up out of Holyking", and Kynes "looks a long while at the crown, and does not touch it", an hour after
// it was sold to the company's head and locked in his box. Sold, it is heard of, and the bed is had all the same.
describe('a prize told at home', () => {
  it('is looked at only while the company has it', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const s = journey.session, c = s.campaign;
    const sold = c.module.actions.find(a => a.id === 'region__w8_home_sold')!;
    const keeper = sold.speaker!, at = c.world.one('at', keeper)!;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('region__w8_raised') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', at) }]));
    expect(c.offered().some(a => a.id.startsWith('region__w8_home('))).toBe(false);
    const told = await s.leg(c.offered().find(a => a.id.startsWith('region__w8_home_sold('))!.id);
    expect(told.response).toContain('asks where it is now');
    expect(told.response).not.toContain('looks a long while at');
    expect(c.offered().some(a => /^region__w8_home/.test(a.id))).toBe(false);
  }, 120000);
});
