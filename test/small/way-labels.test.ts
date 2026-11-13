import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';

// A way named for where it goes is not told twice: "Take the road to the Lull to the way into the Lull" had stood on
// every way out of the first town (round 12, B: T24-19). Where the way's own name says where it goes and the place it
// comes to is called by that name too, the way's name is enough. A town, and two roads out of it.
const town = `
  Place reave "Reave" is settlement.
  Place square "the square" is room within reave at 0, 0 outdoors.
  Place lullway "the way into the Lull" is room at 1, 0 outdoors.
  Place mill "Swale mill" is room at 0, 1 outdoors.
  Passage lull_road "the road to the Lull" is road between square and lullway taking 1 hour.
  Passage mill_road "the mill road" is road between square and mill taking 1 hour.
  Company party "You" of 1 at square.
  Goal false.`;

describe('a way out, by its name', () => {
  it('is not told twice where its name says where it goes, and says where it goes where it does not', async () => {
    // As the terminal and every client name the act (the page's own short label is "To …").
    const t = await Tiny.start(town);
    const labels = PlayerView.choices(t.campaign).map(r => r.choice.name).filter(l => /road/.test(l));
    expect(labels).toContainEqual(expect.stringMatching(/the road to the Lull$/));
    expect(labels.join(' | ')).not.toMatch(/to the Lull to /);
    expect(labels).toContainEqual(expect.stringMatching(/the mill road to Swale mill/));
  });
});
