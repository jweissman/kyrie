import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Travel } from '../src/session/travel';
import { BoardField } from '../web/reader/board-field';
import { BoardModel } from '../web/reader/board/board-model';
import { Glanced } from './support/glanced';
import { Heard } from './support/heard';

// The map updated in place at a journey's end, not made again (OR-91's rest: a board made again whole held the page
// 1.3-1.6 s without a GPU). Each of a1's first journeys, the land the board is given before and after: the same
// country, so an update, whatever roads and places come to be known; and the board updated (each part changed drawn
// again, the land laid again where its roads or places change) draws what a new board would. Another country, or a
// land of another shape, takes a new board. The board's own drawing, read back after an update, is checked against
// the same in the browser (test/board-update-browser).
describe('the map at a journey\'s end', () => {
  it('is updated in place, and draws what a board made again would', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1']));
    // Told of the country's towns, to go to one after another: the map draws what the company knows (OR-810).
    Heard.towns(journey.campaign);
    const land = () => BoardField.land(Glanced.of(journey.session).frame().screen.region!);
    // The country's own towns, gone to one after another (a gate tells of the next country's towns at it: see below).
    const ways = BoardField.land(Glanced.of(journey.session).frame().screen.region!).marks
      .filter(m => m.town && m.cell !== land().here).slice(0, 3).map(m => ({ id: m.id }));
    expect(ways.length).toBeGreaterThan(1);
    let changed = 0, made = 0;
    for (const way of ways) {
      const before = land();
      await Travel.go({ campaign: journey.campaign, perform: (c: string) => journey.session.leg(c) },
        way.id);
      const after = land(), [a, b] = [BoardModel.of(before), BoardModel.of(after)], change = BoardModel.change(a, b);
      // The same country: never a new board, whatever roads and places come to be known.
      made += Number(change.rebuild);
      expect(change.rebuild).toBe(false);
      expect(BoardModel.applied(a, change, b)).toEqual(b);
      changed += Number(change.here || change.known || change.marks.length > 0);
    }
    // The journeys changed something the board draws: where you are, what is known, how a place is known.
    expect(changed).toBeGreaterThan(0);
    expect(made).toBe(0);
    // Another country, or the same of another size: a new board.
    const now = BoardModel.of(land());
    expect(BoardModel.change(now, BoardModel.of({ ...land(), key: 'elsewhere' })).rebuild).toBe(true);
    expect(BoardModel.change(now, BoardModel.of({ ...land(), width: land().width + 1 })).rebuild).toBe(true);
  }, 240000);
});
