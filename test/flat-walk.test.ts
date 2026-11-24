import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { ChoiceList, type Choice } from '../src/ui/choice-list';
import { ChoiceWords } from '../src/ui/choice-words';
import { GoldenWalk } from './support/golden-walk';

// Only a fight, a store and creation unfold (the owner's ruling of 20 November, PB-29). At every turn of the warrior's
// walk, every group the scene, the company and the pack offer is a store's or the Book's (ChoiceWords.unfolds): "To the
// old corn-store — look at the corn-store padlock" had opened on "Push and pull at it" and "Listen at it", fragments
// of acts, and "Take", "Put in", "Give to" and "Risk the pit" had opened on whom or what. Each is a row of its own now,
// in whole words. The pack's things are subjects, as a person or a thing in the scene is: what is under them is
// checked, not the thing itself.
class Grouped {
  static of(cs: Choice[]): Choice[] {
    return cs.flatMap(c => c.children?.length ? [...this.kept(c) ? [] : [c], ...this.of(c.children)] : []);
  }
  private static kept(c: Choice): boolean {
    return this.leaves([c]).every(k => !!k.does && ChoiceWords.unfolds.has(k.does));
  }
  private static leaves(cs: Choice[]): Choice[] { return cs.flatMap(c => c.children ? this.leaves(c.children) : [c]); }
}
describe('the warrior\'s walk, outside its fights', () => {
  it('offers no group but a store\'s or the Book\'s, at every turn', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), found: string[] = [];
    let rows = 0;
    for (const [turn, line] of GoldenWalk.lines().entries()) {
      const screen = journey.screen();
      const scene = ChoiceList.explore(screen).flatMap(s => s.choices);
      const pack = ChoiceList.pack(screen).flatMap(s => s.choices).flatMap(c => c.children ?? []);
      rows += scene.length + pack.length;
      for (const c of Grouped.of([...scene, ...pack])) {
        found.push(`${turn}: ${c.label} › ${c.children!.map(k => k.label).join(' / ')}`);
      }
      await r.ask(line);
    }
    expect(found).toEqual([]);
    expect(rows).toBeGreaterThan(500);
  }, 240000);
});
