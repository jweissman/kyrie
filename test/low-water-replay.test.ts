import { describe, expect, it } from 'bun:test';

// Low Water's first day played twice from the terminal, each time in a fresh process: the same seed and the same
// choices give the same page, step for step, and the same Bowl at the end (doc/architecture/verification.md).
const play = () => Bun.spawnSync(['bin/kyrie', 'play', 'data/campaigns/low-water.campaign.json', '--seed', 'replay',
  '--steps', 'test/fixtures/low-water/first-day.steps.json', '--probe', 'knows party lowwater__question_heard',
  '--probe', '#lowwater__mere lowwater__bowl', '--probe', '#lowwater__count lowwater__reckoner'], { stderr: 'pipe' });
describe('Low Water replayed', () => {
  it('plays its first day the same in two fresh processes', () => {
    const [a, b] = [play(), play()];
    expect(a.exitCode).toBe(0);
    const told = a.stdout.toString();
    expect(told).toBe(b.stdout.toString());
    expect(told).toContain('knows party lowwater__question_heard: yes');
    expect(told).toContain('Four low notes come down the terraces');
  }, 120000);
  // A late act the same way: the Lector's bell, the Mere at night, Ammerlin in the water, the stair, and the Auditor.
  it('plays the descent to the Auditor the same in two fresh processes', () => {
    const stair = () => Bun.spawnSync(['bin/kyrie', 'play', 'data/campaigns/low-water.campaign.json', '--seed', 'replay',
      '--steps', 'test/fixtures/low-water/the-stair.steps.json', '--probe', 'knows party lowwater__auditor_heard',
      '--probe', 'knows party lowwater__ledger_of_water', '--probe', '#lowwater__approach lowwater__bowl'], { stderr: 'pipe' });
    const [a, b] = [stair(), stair()];
    expect(a.exitCode).toBe(0);
    const told = a.stdout.toString();
    expect(told).toBe(b.stdout.toString());
    expect(told).toContain('knows party lowwater__auditor_heard: yes');
    expect(told).toContain('What is the Ward worth?');
  }, 120000);
});
