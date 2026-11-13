import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { ChoiceList } from '../../src/ui/choice-list';
import { ScreenModel } from '../../src/ui/screen-model';

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
  // A way off a road, told by how far out of a town it leaves it, to fields named for the town too: the town once
  // ("Take the road, half an hour out of Rainhaven to open fields south of Rainhaven": M21's own play).
  it('names a town once where the way off a road and the stretch it comes to are both named for it', async () => {
    const t = await Tiny.start(`
      Place reave "Reave" is settlement.
      Place square "the square" is room within reave at 0, 0 outdoors.
      Place fields "open fields south of Reave" is room at 0, 1 outdoors.
      Place far "open fields south of Reave" is room at 0, 2 outdoors.
      Passage off "the road, half an hour out of Reave" is road between square and fields taking 30 minutes.
      Passage off2 "the road, two hours out of Reave" is road between square and far taking 2 hours.
      Company party "You" of 1 at square.
      Goal false.`);
    const said = PlayerView.choices(t.campaign).map(r => r.choice.name).filter(l => /fields/.test(l));
    expect(said).toContain('Take the road, half an hour out, to open fields south of Reave');
    const page = ChoiceList.ways(ScreenModel.build(t.campaign).exits).choices.map(c => c.label);
    expect(page).toContain('To open fields south of Reave by the road, half an hour out');
  });
});
