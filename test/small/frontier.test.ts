import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { RunnerWalk } from '../../src/cli/runner-walk';
import { RunnerExperience } from '../../src/cli/runner-experience';

// Continuity of intention (the experience pins' family 3; EX-04): a walker that goes down into what its aim is about
// tells the ways not yet taken from the way back, each by its bearing (EX-02: frontier, retreat, return, typed for all
// clients), follows the investigation, meets what bars or answers it, and sees an aim through; never a retreat drawn as
// worth a look. Over the generated tier, inside the aim's site the unexplored ways had been one way among the way back
// out and a wait (EX-01's repeated rooms).
describe('the laboratory walked straight at its aim', () => {
  it('tells the frontier from the retreat underground, and sees an aim through', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/thief/Haze']));
    const walk = await RunnerWalk.run(new Runner(journey.session), 'straight', 30, 1);
    const ways = walk.turns.map(t => [...t.offer.primary, ...t.offer.rest].filter(o => o.bearing));
    expect(ways.some(w => w.some(o => o.bearing === 'frontier') && w.some(o => o.bearing === 'retreat'))).toBe(true);
    expect(ways.flat().filter(o => o.bearing === 'retreat' && o.aspects.includes('exploration'))).toEqual([]);
    expect(RunnerExperience.of(walk).resolved).toBeGreaterThanOrEqual(1);
  });
});
