import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { StockOpenings } from '../src/world/stock-openings';
import { HonestPlayer } from './support/honest-player';

// OR-326: a gold-follower from thorn's first town, given the bear's den in the old quarry, had gone between the quarry
// pit and every door of the town some thirty times. Down in the adit, dark, a torch to hand, the way back up was led
// over lighting it; and lit, nothing led on toward the den the aim's words put in the adit. The page's lead now lights
// the torch and goes on to the den.
describe('the gold goes on into the dark (OR-326)', () => {
  it('lights the torch in thorn\'s adit and goes on to the den, not back and forth to the pit', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'thorn', '--as', 'human/warrior/Wenna',
      '--opening', StockOpenings.none]));
    const s = journey.session, h = new HonestPlayer(s), been: string[] = [];
    for (let i = 0; i < 14 && await h.step(); i++) { been.push(s.campaign.world.one('at', 'party') ?? ''); }
    const pit = been.filter(p => p === 'region__s1_u_pit').length;
    expect(h.log.join('\n')).toContain('light a torch');
    expect(been).toContain('region__s1_u_brood');
    expect(pit).toBeLessThan(4);
  }, 120000);
});
