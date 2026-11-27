import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Runner } from '../src/cli/runner';
import { WorldAssembler } from '../src/world/world-assembler';
import { RegionWriter } from '../src/world/region-writer';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// The second cold play of the golden route (Iscoed's drove road, a human warrior: mission-22/cold/cold-2-report.md),
// its findings in the world slice's ground, each held where it was met: the proof offered on coming back to the
// customs-house by the road (CL-03), the search of the rhyne led there (CL-04), the tally-stick taken only when it is
// taken (CL-05), Bran's thanks said as he is let out and the reeve told of the clerk (CL-03), and a rival company
// beaten to its prize heard of coming back (CL-09).
class Cold {
  static async begin(): Promise<Journey> {
    return Journey.of(await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
  }
  // The four the terminal leads with where the company stands, by their words.
  static four(j: Journey): string[] {
    return (new Runner(j.session).said().offer?.primary ?? []).map(o => o.label);
  }
}
describe('the drove road, after the second cold play', () => {
  it('takes the tally-stick only when it is taken, and leads with the search of the rhyne there', async () => {
    const j = await Cold.begin();
    await j.play('Read the notice on the well-post');
    expect(j.latest).not.toMatch(/tally-stick/);
    expect(j.screen().items.map(i => i.name).join(' ')).not.toMatch(/tally-stick/);
    await j.play('Ask Owain how many head came down', 'To the drove pens', 'To the Black Rhyne');
    expect(Cold.four(j)).toContain('Search here');
  }, 180000);
  it('offers the proof on coming back to the customs-house by the road, and Bran thanks the company as he is let out',
    async () => {
      const j = await Cold.begin();
      await j.play('Ask Owain how many head came down', 'To the drove pens', 'To the Black Rhyne', 'Search');
      // Back by the road the cold player took, the customs-house set out for from the rhyne in one go.
      await j.perform('travel:drove__customs');
      expect(j.screen().place.name).toBe('the customs-house');
      expect(Cold.four(j)).toContain('Tell Mardle where the four bullocks are');
      await j.play('Tell Mardle where the four bullocks are');
      expect(j.latest).toMatch(/Say Bran ap Ifor sent you/);
      await j.play('To the landing', 'Tell the reeve how Mardle counts the droves');
      expect(j.latest).toMatch(/I will have the book off him/);
    }, 180000);
  it('hears of a rival company beaten to its prize coming back with nothing', () => {
    const source = RegionWriter.source(WorldAssembler.region('a1', [0, 0]), null, {}, CanonVocabulary.context());
    expect(source).toMatch(/came back from .* with nothing: someone had been down to it before them/);
  });
});
