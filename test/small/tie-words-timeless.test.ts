import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// A line a place says at any hour names no hour (GR-06, S3-0's warrior step 52: at 10:27 p.m. Porthalen was "shuttered
// for the night" and "The merchant's stall is shuttered at midday" in one arrival). The ties' lost market is said on
// the green whatever the hour, so it says what holds by day as by night.
describe('the lost market\'s line on the green', () => {
  it('holds at any hour', () => {
    const text = readFileSync('data/generation/town/ties.kyrt', 'utf8');
    const line = text.split('\n').find(l => l.includes('_tie_lost_after at {t}_green'))!;
    expect(line).toContain('by day as by night');
    expect(line).not.toMatch(/\b(at midday|at noon|this morning|tonight)\b/);
  });
});
