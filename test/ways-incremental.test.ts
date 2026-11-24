import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { KnownWays, type Tree } from '../src/ui/known-ways';
import type { Campaign } from '../src/campaign/campaign';
import { AsMeant } from './support/as-meant';
import { HonestPlayer } from './support/honest-player';
import { ContinuityCensus } from '../scripts/continuity-census';
import { GoldenWalk } from './support/golden-walk';

// The ways known kept from one world to the next (AX-05, the screen's cost): what the search of the known ways gives
// for a place and a kind of search, kept while nothing it read has been written and the company has been where it had
// been, equals the search made afresh, on every turn of the census's three walks (the warrior's golden walk, the cold
// mage's, eighty gold-follower steps): the same places in the same order, each by the same legs in the same time.
type Search = (c: Campaign, from: string, over: object) => Tree;
const K = KnownWays as unknown as { tree: Search; search: Search };
const kept = K.tree.bind(KnownWays), wrong: string[] = [];
let asked = 0;
K.tree = (c, from, over = {}) => {
  const tree = kept(c, from, over), fresh = K.search.call(KnownWays, c, from, over);
  asked++;
  const said = (t: Tree) => t.order.map(id => `${id}:${t.best.get(id)?.minutes}:${t.best.get(id)?.legs.map(l => l.passage).join('>')}`)
    .join(' ');
  if (said(tree) !== said(fresh)) { wrong.push(`${from} ${JSON.stringify(over)}`); }
  return tree;
};

describe('the ways known, kept from world to world, equal the search made afresh', () => {
  for (const w of ContinuityCensus.walks) {
    it(`${w.name}`, async () => {
      wrong.length = 0; asked = 0;
      const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args(w.as, w.lines ?? GoldenWalk.file)));
      const s = journey.session, r = new Runner(s), honest = new HonestPlayer(s);
      const turns = w.lines ? ContinuityCensus.lines(w.lines) : Array.from({ length: w.steps ?? 0 }, () => '');
      let played = 0;
      for (const line of turns) {
        if (w.lines) { await AsMeant.ask(r, line); } else if (!await honest.step()) { break; }
        played++;
      }
      expect(played).toBeGreaterThan(10);
      expect(wrong.slice(0, 5)).toEqual([]);
      expect(asked).toBeGreaterThan(10);
    }, 900000);
  }
});
