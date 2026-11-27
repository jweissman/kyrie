import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';
import { AsMeant } from './support/as-meant';
import { HonestPlayer } from './support/honest-player';
import { MenuOracle } from './support/menu-oracle';
import { ContinuityCensus } from '../scripts/continuity-census';

// The frame's menu equals the page's own, on every turn of the census's three walks (the warrior's golden walk, the
// cold mage's, eighty steps of the gold-follower: OR-1071, the menu and lens tree's first increment). At each turn the
// frame the host would send is made over the runner's leaf, and its resting menu, with each fold open and with all
// of them, and its marks, are held to what MenuModel and the page's folds made of the same frame (MenuOracle). The
// atlas's grid holds the same in test/small/menu-tree.
describe('the frame holds the resting menu on every turn of the census walks', () => {
  for (const w of ContinuityCensus.walks) {
    it(`${w.name}`, async () => {
      const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', w.as]));
      const s = journey.session, r = new Runner(s), honest = new HonestPlayer(s), wrong: string[] = [];
      const turns = w.lines ? ContinuityCensus.lines(w.lines) : Array.from({ length: w.steps ?? 0 }, () => '');
      let checked = 0;
      for (const [turn, line] of turns.entries()) {
        if (w.lines) { await AsMeant.ask(r, line); } else if (!await honest.step()) { break; }
        if (!w.lines) { r.said(); }
        const leaf = r.leaf;
        if (!leaf?.glance || !s.campaign.running) { continue; }
        const frame = MenuOracle.frame(Itineraries.charted(s.campaign, ScreenModel.build(s.campaign)), leaf);
        checked++;
        wrong.push(...MenuOracle.differences(frame).map(d => `t${turn} ${line}: ${d}`));
      }
      expect(wrong).toEqual([]);
      expect(checked).toBeGreaterThan(turns.length / 3);
    }, 900000);
  }
});
