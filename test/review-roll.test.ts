import { describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ReviewTool } from '../src/cli/review-tool';

// `kyrie review record … --roll pass|fail` (MT-13): a journey recorded behind a check comes out as the flag asks, each
// way, and its replay is held to the same forced die (the args kept in the review start it again so). Will's hearth
// is asked once, a hard persuasion: consented(will) on a pass, tried(party) on a fail (each as the review names it).
// And what the failed check shut is kept with the frame after it (the AT-09 analysis's withdrawn): begging Will, a
// way open until the asking failed, is withdrawn on a fail, and still offered on a pass.
const fixture = 'test/fixtures/probes/spoken-roll';
const beg = `  Relation begged(group).
  Action beg_will(actor: group, site: place) "Beg Will to see to the hearth" {
    Speaker will.
    Requires able(actor) and at(actor, site) and at(will, site) and not tried(actor) and not begged(actor).
    Time 2.
    On success { Assert begged(actor). }
    Result "Will Scaife says he will think on it.".
  }
  Observe house_scene`;
const record = async (dir: string, run: string[], lines: string[]) => {
  const file = join(dir, 'lines.txt');
  writeFileSync(file, lines.join('\n'));
  expect(await ReviewTool.main(['record', dir, file, ...run])).toBe(0);
  return ReviewTool.read(dir);
};
describe('a review recorded behind a check', () => {
  for (const outcome of ['pass', 'fail'] as const) {
    it(`comes out ${outcome} when --roll ${outcome} is given, and replays so`, async () => {
      const dir = mkdtempSync(join(tmpdir(), 'review-roll-'));
      try {
        const review = await record(dir, [`${fixture}/probe.campaign.json`, '--seed', 'r', '--roll', outcome],
          ['{"act":"talk_to(p__will)"}', '{"act":"p__ask_will"}']);
        const asked = review.steps[1]!;
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
    it(`keeps what a ${outcome} withdrew, untaken`, async () => {
      const dir = mkdtempSync(join(tmpdir(), 'review-withdrawn-')), site = join(dir, 'site.kyr');
      try {
        writeFileSync(site, readFileSync(`${fixture}/site.kyr`, 'utf8').replace('  Observe house_scene', beg));
        const review = await record(dir, [site, '--as', 'human/bard/Ama', '--roll', outcome],
          ['{"act":"talk_to(spokenroll__will)"}', '{"act":"spokenroll__ask_will"}']);
        const before = review.frames[review.steps[1]!.before]!, after = review.frames[review.steps[1]!.after!]!;
        expect(before.offer.map(o => o.id)).toContain('spokenroll__beg_will');
        expect(after.withdrawn).toEqual(outcome === 'fail'
          ? [{ id: 'spokenroll__beg_will', label: 'Beg Will to see to the hearth' }] : undefined);
        if (outcome === 'fail') {
          expect(readFileSync(join(dir, 'journey.md'), 'utf8')).toContain('Withdrawn: Beg Will to see to the hearth.');
        }
      } finally { rmSync(dir, { recursive: true, force: true }); }
    }, 60000);
  }
});
