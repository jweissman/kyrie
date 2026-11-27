import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { FirstQuestions } from './support/first-questions';

// A question asked on grounds (OR-1680; the pin is test/features/choice/grounded-questions), in a whole fresh life: the
// reference game come into by the brothers' errand (the life creation begins with, its country's first origin), and
// everyone in its first town spoken with where they stand, nothing done. The woods unseen, the king-barrow never heard
// of and the walled stair under the stones never come to are none of them asked; the old dead under the woods, named in
// the brothers' letter, is asked of with that said; every other question is anyone's to ask (what the matter is,
// news, where someone is going, whether they would come along). About ten seconds: CI's suite, not the push lane.
describe('a fresh life\'s first town', () => {
  it('asks after nothing unheard of, and says how it knows what it asks', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'fresh1', '--origin', 'order',
      '--as', 'human/warrior/Wenna']));
    const grounds = FirstQuestions.census(journey.session).flatMap(a => a.grounds);
    expect(grounds.map(([label]) => label).join(' | ')).not.toMatch(/about the old woods|king-barrow|walled stair/);
    expect(grounds.filter(([label]) => /old folk say/.test(label))).toEqual([
      ['Ask what the old folk say of the old dead under the old woods', "from the brothers' letter"]]);
    const anyone = new RegExp(['what the matter is', 'news of', 'where (he|she|they) (is|are) going',
      'the country off the road', 'whether .* would come'].join('|'));
    expect(grounds.filter(([label, by]) => !by && !anyone.test(label) && !/brothers' letter/.test(label))).toEqual([]);
  }, 30000);
});
