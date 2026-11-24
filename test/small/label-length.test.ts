import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../../src/cli/runner';
import { FirstChoice } from '../../src/creation/first-choice';
import { AsMeant } from '../support/as-meant';
import { GoldenWalk } from '../support/golden-walk';

// Action labels concise and literal (OR-301, the owner's cold play of 24 November: "We come into the world as we are"
// far too long; literary language belongs to the presentation around a row, never its label). Every label the engine
// offers on the warrior's walk (the four, the rest, every lens and what each row opens), and the ways in: those over
// forty characters, counted by their distinct words (the chances said beside them apart), held at their honest
// baseline (24 November) and lowered as they are mended, never met by cutting words a row needs. 77 when first
// counted; 57 once a haggle was "Haggle with Mabel for a lantern" (data/rules/services.kyr). The rest, by family (a
// question about an aim, a way named twice, a talk and its question), is OR-293.
const longest = 40;
const rows = (s: Said): Offered[] => {
  const all = [...s.offer.primary, ...s.offer.rest, ...Object.values(s.offer.lenses ?? {}).flat()];
  return [...all, ...all.flatMap(o => o.opens ?? [])];
};
describe('an action label', () => {
  it('is short on the way in: every row of the title, of a paused game and of how a life begins', () => {
    const cards = [...FirstChoice.title({ seed: 'bakelo', where: 'The lane' }).cards, ...FirstChoice.step().cards,
      ...FirstChoice.paused().cards];
    expect(cards.filter(c => c.name.length > 24).map(c => c.name)).toEqual([]);
    expect(FirstChoice.step().cards.find(c => c.id === 'set-out-now')?.name).toBe('A new life, at once');
  });
  it('is no longer than forty characters on the warrior\'s walk, but for those held at the baseline', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), long = new Set<string>();
    for (const line of GoldenWalk.lines()) {
      for (const o of rows(r.said())) {
        const words = LabelLength.words(o.label);
        if (words.length > longest) { long.add(words); }
      }
      await AsMeant.ask(r, line);
    }
    // The census, for whoever lowers it: bun test test/small/label-length.test.ts prints the labels over the limit.
    if (long.size > LabelLength.held) { console.log([...long].sort().join('\n')); }
    expect(long.size).toBeLessThanOrEqual(LabelLength.held);
  }, 300000);
});
class LabelLength {
  static readonly held = 57;
  // A row's words, without what the runner says beside them of its chances (" · an even chance · one try").
  static words(label: string): string { return label.split(' · ')[0]!; }
}
