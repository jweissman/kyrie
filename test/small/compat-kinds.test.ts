import { describe, expect, it } from 'bun:test';
import { CompatCompare } from '../../src/cli/compat-compare';
import type { JourneyShot, Snapshot, StepShot, WorldShot } from '../../src/cli/compat-snapshot';

// The compatibility harness's kinds (MT-06), on snapshots shaped as scripts/compat.ts takes them: a wording change
// (a voice line of data/voice/conditions.json) is presentation-only; faster roads (TR-03's RegionRoads.minutesPerHour
// 30 to 20) move the world and name the replay step that no longer goes; a save that will not open breaks saves.
// The runs on the pinned worlds themselves are in doc/architecture/mission-22/maturity-track.md, step 6.
const world: WorldShot = { name: 'iscoed/weir', places: ['region__s1', 'region__s4', 'region__r1'],
  passages: { region__r1_out_s1: 'region__s1 - region__r1, 90 min', region__r1_out_s4: 'region__r1 - region__s4, 80 min' },
  people: { gate__reeve: 'gate__green' }, placements: { 'region:gate#gate': 'gatehouse=region__w2' } };
const step: StepShot = { line: '{"act":"fight:defend:region__party_1"}', ok: true,
  rows: ['go(a,b) | To the green', 'talk:gate__reeve | Talk to the reeve'],
  lines: ['Ilse uses Defend. Ilse stands on guard.'], digest: '11.22.33.44.300.abc', at: 'gate__green' };
const travel: StepShot = { ...step, line: '{"act":"travel:region__s4"}', digest: '11.22.33.45.470.abd', at: 'region__s4' };
const ask: StepShot = { ...step, line: '{"act":"talk_to(region__s4_manor_cook)"}', digest: '11.22.33.46.475.abe' };
const journey: JourneyShot = { name: 'cold-5', world: 'iscoed/weir', steps: [step, travel, ask],
  save: { restores: true, digest: ask.digest, turn: ask.rows } };
function snap(label: string, w: WorldShot, j: JourneyShot): Snapshot {
  return { version: 1, label, quick: false, worlds: [w], journeys: [j] };
}
const base = snap('base', world, journey);
describe('the compatibility harness says what kind of change a revision made', () => {
  it('finds nothing in a tree compared with itself', () => {
    expect(CompatCompare.verdict(CompatCompare.compare(base, structuredClone(base)))).toBe('same');
  });
  it('calls a voice line changed presentation-only, at the step that says it', () => {
    const said = { ...step, lines: ['Ilse uses Defend. Ilse takes guard, blade up.'] };
    const fs = CompatCompare.compare(base, snap('wording', world, { ...journey, steps: [said, travel, ask] }));
    expect(CompatCompare.verdict(fs)).toBe('presentation-only');
    expect(fs.map(f => f.where)).toEqual(['cold-5 step 1 {"act":"fight:defend:region__party_1"}']);
  });
  it('calls faster roads world-moving, and names the replay step they break', () => {
    const roads = { ...world, passages: { region__r1_out_s1: 'region__s1 - region__r1, 60 min',
      region__r1_out_s4: 'region__r1 - region__s4, 50 min' } };
    const sooner = { ...travel, digest: '11.22.33.47.410.abf' };
    const refused = { ...ask, digest: '11.22.33.48.415.abg', ok: false, error: 'not offered: talk_to(region__s4_manor_cook) (they are not here)' };
    const fs = CompatCompare.compare(base, snap('roads', roads, { ...journey, steps: [step, sooner, refused] }));
    expect(CompatCompare.verdict(fs)).toBe('replay-breaking');
    expect(fs.filter(f => f.kind === 'world-moving').map(f => f.text)).toEqual([
      'passage region__r1_out_s1: region__s1 - region__r1, 90 min -> region__s1 - region__r1, 60 min',
      'passage region__r1_out_s4: region__r1 - region__s4, 80 min -> region__r1 - region__s4, 50 min',
      'play comes otherwise here: watch 470 -> 410', '1 later turns differ, after that']);
    expect(fs.find(f => f.kind === 'replay-breaking')?.where).toBe('cold-5 step 3 {"act":"talk_to(region__s4_manor_cook)"}');
  });
  it('calls a row offered, with nothing gone, additive', () => {
    const more = { ...step, rows: [...step.rows, 'search(gate__green) | Search the green'] };
    const fs = CompatCompare.compare(base, snap('more', world, { ...journey, steps: [more, travel, ask] }));
    expect(CompatCompare.verdict(fs)).toBe('additive');
  });
  it('calls a base save this build cannot open save-breaking', () => {
    const fs = CompatCompare.compare(base, base, { 'cold-5': { digest: '', turn: [], why: 'Unsupported campaign save' } });
    expect(CompatCompare.verdict(fs)).toBe('save-breaking');
  });
});
