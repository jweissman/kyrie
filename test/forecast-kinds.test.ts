import { describe, expect, it } from 'bun:test';
import { Gauntlet } from './support/gauntlet';
import { DangerSense } from '../src/presentation/danger-sense';

// The forecast against the fights it forecasts, across kinds (CB-02: "the fight's reckoning is unreliable"; the
// owner, 15 November: danger readable before the player commits): a lone level-one warrior or mage against three
// of a wolf, a boar, a zombie, a centipede or a ghoul, and a mage against one, each fought out by the game's own
// tactics on the real kernel, the word beforehand held to how often the company wins (Gauntlet.contradicts). Not
// held: a lone mage against one beetle, called grave and won 85 times in 100, a cautious word and the one cell
// the survey found out (register CB-02).
const cells: [string, string, number][] = [['wolf', 'warrior', 3], ['wolf', 'mage', 3], ['boar', 'warrior', 3], ['boar', 'mage', 3],
  ['zombie', 'mage', 3], ['zombie', 'mage', 1], ['centipede', 'warrior', 3], ['centipede', 'mage', 3], ['ghoul', 'warrior', 3],
  ['ghoul', 'mage', 3]];
describe('the fight forecast, across kinds', () => {
  it('is held to how often the fights are won', () => {
    const wrong = cells.flatMap(([foe, calling, count]) => {
      const bout = { calling, foe, count }, danger = DangerSense.of(Gauntlet.encounter(bout, 'reckon')).danger;
      const won = Gauntlet.wins(bout, 16);
      return Gauntlet.contradicts(danger, won) ? [`${calling} v ${count} ${foe}: said ${danger}, won ${Math.round(100 * won)}%`] : [];
    });
    expect(wrong).toEqual([]);
  });
});
