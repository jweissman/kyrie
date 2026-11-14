import { describe, expect, it, spyOn } from 'bun:test';
import { ScaleCosts } from '../scripts/scale-costs';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ObservationText } from '../src/lang/observation-text';
import { Operators } from '../src/campaign/operators';
import { PlayerView } from '../src/presentation/player-view';

// A screen names what it shows, not the world (performance-report.md §3): the cellar's screen asks after as many names
// with two thousand rooms elsewhere as with twenty. Naming every entity before building a screen had been a fifth of
// a step in a world of 10,000 rooms, and 11,000 labels a screen in a1. Counted, not timed, so a shared lane's load
// cannot move it. And the narrator's shelter reads one place's ancestry by the module's index, not a map of every
// entity made afresh: timed against itself, the better of three rounds. And what can be done here is grounded among
// the entities of each parameter's type: raise_quality's quality, left open by its condition, had been looked for
// among every entity in the world, each step.
describe('a screen in a large world', () => {
  it('names only what it shows, grounds among its kinds, and finds a shelter without every entity', async () => {
    const labels: number[] = [], shelter: number[] = [], tested: number[] = [];
    for (const rooms of [20, 2000]) {
      const s = await ScaleCosts.start(rooms), c = s.campaign;
      await s.leg(PlayerView.choices(c).find(r => /^Tap the barrel/.test(r.choice.name))!.choice.id);
      const fits = spyOn(Operators.prototype as unknown as { fits: () => boolean }, 'fits');
      PlayerView.choices(c);
      tested.push(fits.mock.calls.length);
      fits.mockRestore();
      ScreenModel.build(c);
      const spy = spyOn(ObservationText, 'label');
      ScreenModel.build(c);
      labels.push(spy.mock.calls.length);
      spy.mockRestore();
      const here = c.world.one('at', 'party') ?? '';
      shelter.push(Math.min(...[0, 1, 2].map(() => {
        const t = performance.now();
        for (let i = 0; i < 300; i++) { Narrator.shelter(c, here); }
        return performance.now() - t;
      })));
    }
    console.log(`  labels a screen: ${labels.join(' → ')}; bindings tested: ${tested.join(' → ')}; 300 shelters: ${
      shelter.map(ms => ms.toFixed(1)).join(' → ')} ms`);
    // Each of the 2,000 rooms brings three entities: naming them all had been some 6,000 more labels.
    expect(labels[1]!).toBeLessThan(labels[0]! + 100);
    expect(tested[1]!).toBeLessThan(tested[0]! + 100);
    expect(shelter[1]!).toBeLessThan(Math.max(shelter[0]!, 1) * 10);
  }, 60_000);
});
