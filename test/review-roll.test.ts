import { describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ReviewTool } from '../src/cli/review-tool';

// `kyrie review record … --roll pass|fail` (MT-13): a journey recorded behind a check comes out as the flag asks, each
// way, and its replay is held to the same forced die (the args kept in the review start it again so). Will's hearth
// is asked once, a hard persuasion: consented(will) on a pass, tried(party) on a fail (each as the review names it).
const campaign = 'test/fixtures/probes/spoken-roll/probe.campaign.json';
const lines = ['{"act":"talk_to(p__will)"}', '{"act":"p__ask_will"}'];
describe('a review recorded behind a check', () => {
  for (const outcome of ['pass', 'fail'] as const) {
    it(`comes out ${outcome} when --roll ${outcome} is given, and replays so`, async () => {
      const dir = mkdtempSync(join(tmpdir(), 'review-roll-')), file = join(dir, 'lines.txt');
      try {
        writeFileSync(file, lines.join('\n'));
        expect(await ReviewTool.main(['record', dir, file, campaign, '--seed', 'r', '--roll', outcome])).toBe(0);
        const review = ReviewTool.read(dir), asked = review.steps[1]!;
        expect(review.source.args).toContain('--roll');
        expect(asked.error).toBeUndefined();
        const wanted = outcome === 'pass' ? 'p__consented(p__will)' : 'p__own_tried(party)';
        expect(asked.delta.asserted).toContain(wanted);
        expect(readFileSync(join(dir, 'journey.md'), 'utf8').length).toBeGreaterThan(0);
        expect(await ReviewTool.main(['replay', dir])).toBe(0);
        const replay = ReviewTool.read(dir, 'replay.json');
        expect(replay.steps[1]!.delta.asserted).toContain(wanted);
        expect(replay.verdicts?.every(v => v.state === 'same')).toBe(true);
      } finally { rmSync(dir, { recursive: true, force: true }); }
    }, 60000);
  }
});
