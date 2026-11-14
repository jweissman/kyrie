import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { RunnerWalk } from '../../src/cli/runner-walk';
import { RunnerExperience } from '../../src/cli/runner-experience';

// Character differentiation (the experience pins' family 5): a calling opens possibilities another does not, in the
// same place for the same reason. The experience baseline had shown six of b2's seven callings seeing the same 94
// opportunities: the matrix's lives had all been warriors (creation's default dwarf), an instrument's defect found
// first. In the laboratory, walked curious, each pair of these three sees twenty acts or more the other does not (25,
// 30 and 31 on 6da486ca). Opportunities are acts on their targets, by command, never labels; a walk that chooses
// differently goes differently too, so this is a floor under the callings' difference, not its measure.
describe('three callings in the laboratory', () => {
  it('each see acts the others do not', async () => {
    const seen = new Map<string, Set<string>>();
    for (const calling of ['warrior', 'thief', 'mage']) {
      const { journey } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', `human/${calling}/Wynn`]));
      seen.set(calling, new Set(RunnerExperience.of(await RunnerWalk.run(new Runner(journey.session), 'curious', 30, 4))
        .keys));
    }
    const apart = (a: string, b: string) => [...seen.get(a)!].filter(k => !seen.get(b)!.has(k)).length;
    for (const [a, b] of [['warrior', 'thief'], ['warrior', 'mage'], ['thief', 'mage']] as const) {
      expect(apart(a, b) + apart(b, a)).toBeGreaterThanOrEqual(20);
    }
  });
});
