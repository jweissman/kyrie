import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { StockOpenings } from '../src/world/stock-openings';
import { GoldenWalk } from './support/golden-walk';
import { HonestPlayer } from './support/honest-player';

// No lead goes round (OR-417, P0). The owner's playtest of main had bounced between two adjacent hexes endlessly; over
// fifteen seeds, seven walks by the page's own lead went round: the quarry pit and the green, Stonehold and its
// gate-passage, Mistrest's end and its entrance passage, a cycle of advance steps, the same questions to Honoria
// Bulstrode and an arm-wrestle again and again, "Give the post your number" over and over. A dozen seeds, each walked
// a hundred steps by a player who takes only what the page leads with (HonestPlayer), never meet the same lead at the
// same place a third time with nothing in the world changed between (LedAgain's mark): HonestPlayer throws there.
// Once round is allowed (fled up from the rats, the way down to face them is still the aim's: test/small/idle-aim).
// Where everything here has gone round and nothing is led, the walk stops: that is no lead going round.
const seeds = ['iscoed', 'a1', 'thorn', 'kite', 'wren', 'b2', 'c3', 'ash', 'pine', 'larch', 'kahitude', 'hawk'];
describe('a walk by the page\'s own lead', () => {
  for (const seed of seeds) {
    it(`is never led round, ${seed}`, async () => {
      const opening = seed === 'iscoed' ? GoldenWalk.opening : StockOpenings.none;
      const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', 'human/warrior/Wenna',
        '--opening', opening]));
      const s = journey.session, h = new HonestPlayer(s);
      let round = '';
      for (let i = 0; i < 100 && s.campaign.running; i++) {
        try { if (!await h.step()) { break; } } catch (e) { round = String(e); break; }
      }
      expect(round).toBe('');
    }, 300000);
  }
});
