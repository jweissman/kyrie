import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';
import { MenuTree } from '../src/frame/menu-tree';
import type { Frame } from '../src/creation/protocol';
import { AsMeant } from './support/as-meant';
import { HonestPlayer } from './support/honest-player';
import { MenuCensus, type Counted } from './support/menu-census';
import { ContinuityCensus } from '../scripts/continuity-census';

// One page, one menu, strict four (the owner's playtest of 27 November, OR-1490): on every resting page of the census's
// walks (the warrior's golden walk, which is the first hour, the cold mage's, eighty steps of the gold-follower), on a
// life that has earned nothing, the page drawn whole (MenuCensus) holds exactly one menu, every row in it is the
// engine's (its four, or the place's question: its pages and Something else…), none of the page's own, and at most four
// of them promoted. And no rail where nothing is earned (OR-1491: the mage, a scholar, has the journal), and every
// act the lenses would have given within reach of the one menu (MenuCensus.unreached). The census is printed,
// for the commit to quote.
describe('every resting page of the census walks', () => {
  for (const w of ContinuityCensus.walks) {
    it(`${w.name}: one menu, the engine's rows, four promoted at most, no rail, the lenses' acts reached`, async () => {
      const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', w.as]));
      const s = journey.session, r = new Runner(s), honest = new HonestPlayer(s), wrong: string[] = [];
      const turns = w.lines ? ContinuityCensus.lines(w.lines) : Array.from({ length: w.steps ?? 0 }, () => '');
      const pages: Counted[] = [];
      for (const [turn, line] of turns.entries()) {
        if (w.lines) { await AsMeant.ask(r, line); } else if (!await honest.step()) { break; }
        if (!w.lines) { r.said(); }
        const leaf = r.leaf;
        if (!leaf?.glance || !s.campaign.running || s.focus.kind !== 'place') { continue; }
        const screen = Itineraries.charted(s.campaign, ScreenModel.build(s.campaign)), at = { screen, leaf };
        const framed = MenuTree.framed(at as unknown as Omit<Frame, 'menu'>);
        const frame = { ...framed, question: MenuTree.question(framed, s.focus, s.conversation) } as Frame;
        const c = MenuCensus.count(MenuCensus.html(frame));
        pages.push(c);
        const lost = MenuCensus.unreached(frame);
        const why = [c.menus !== 1 ? `${c.menus} menus (${c.holders.join(' ')})` : '',
          c.promoted > 4 ? `${c.promoted} promoted` : '', c.sources.opener ? `${c.sources.opener} rows of the page's own` : '',
          c.rail && !screen.surfaces?.length ? 'a rail, nothing earned' : '', lost.length ? `out of reach: ${lost.join('; ')}` : ''].filter(Boolean);
        if (why.length) { wrong.push(`t${turn} ${screen.place.id}: ${why.join(', ')}`); }
      }
      const sum = (f: (c: Counted) => number) => pages.reduce((n, c) => n + f(c), 0);
      console.log(`${w.name}: ${pages.length} pages; menus ${sum(c => c.menus)} (pages with more than one `
        + `${pages.filter(c => c.menus > 1).length}); rows offer ${sum(c => c.sources.offer ?? 0)}, question `
        + `${sum(c => c.sources.question ?? 0)}, the page's own ${sum(c => c.sources.opener ?? 0)}; most promoted `
        + `${Math.max(0, ...pages.map(c => c.promoted))}; rails ${pages.filter(c => c.rail).length}`);
      expect(pages.length).toBeGreaterThan(turns.length / 4);
      expect(wrong).toEqual([]);
    }, 900000);
  }
});
