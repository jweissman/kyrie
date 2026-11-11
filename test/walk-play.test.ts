import { describe, expect, it } from 'bun:test';
import { Walking } from './support/walking';

// The Walk, played on foot by the page's own labels (a scholar: a mage), seed a1: a penance Walk with a soldier for its
// leader, a dowager for its patron, the bailiff bound by the book, and the Gathering at the fourth town. No place is
// stepped into but by a way the page offers ('>place' walks the roads a way at a time and spends the hours); the only
// things set by the spec are the waits for the clock.
describe('the Walk, played by a scholar', () => {
  it('is found on the first green, followed along the road, and licensed by the Office’s own grant laid before the bailiff', async () => {
    const { j } = await Walking.world('a1', 'mage');
    const said = async (...steps: string[]) => { let last = ''; for (const s of steps) { last = String(await j.play(s)); } return last; };
    const here = () => j.at('party');
    // Day 2: the first sign is on the green.
    const green = await said('=day 2 10:00');
    expect(green).toMatch(/barefoot strangers/);
    expect(Walking.knows(j, 'walk_heard')).toBe(true);
    await said('Keep a mile');
    expect(Walking.holds(j, 'kept', 'party')).toBe(true);
    await said('>walk__camp_a', 'Ask .* where the Walk is going', 'Ask .* what is on the roll', 'Say to .* that you have kept a mile',
      'Ask .* who she is walking for', 'Ask .* to let you copy the roll');
    expect(Walking.knows(j, 'hal_named')).toBe(true);
    expect(j.choices().some(c => /Annet|roll/i.test(c.full))).toBe(true);
    // The road: the second town's camp on the fourth day (the leader has gone ahead), the third on the sixth, the duel.
    await said('>walk__camp_b', '=day 4 12:00');
    expect(Walking.at(j, 'leader')).toBe('walk__camp_b');
    expect(Walking.measure(j, 'host', 'walk_b')).toBeGreaterThanOrEqual(1);
    await said('>region__s2_green', '=day 6 10:00');
    expect(Walking.holds(j, 'duel_called', 'walk')).toBe(true);
    await said('Propose that the corporal');
    expect(Walking.holds(j, 'duel_settled', 'walk')).toBe(true);
    expect(Walking.holds(j, 'lads_allied', 'walk')).toBe(true);
    // The fourth town: the Brethren hold the Station from the eighth day; the names are the way in.
    await said('>walk__camp_d', '=day 8 12:00');
    expect(Walking.at(j, 'gaunt')).toBe('walk__station_d');
    await said('>walk__station_d');
    await said('Say the names of the road at the Station arch');
    expect(Walking.holds(j, 'gaunt_parleyed', 'walk')).toBe(true);
    // The old stone: a scholar reads it (an hour a try).
    for (let i = 0; i < 5 && !Walking.knows(j, 'stone_true'); i++) { await said('?Read the milestone'); }
    expect(Walking.knows(j, 'stone_true')).toBe(true);
    // The Bench rides in on the ninth day; the grant is laid before it, and it holds its hand and gives its leave.
    await said('=day 9 06:00', '>region__s3_green');
    expect(Walking.at(j, 'dray')).toBe('region__s3_green');
    await said('Lay the milestone.s grant');
    expect(Walking.holds(j, 'licensed', 'walk')).toBe(true);
    expect(here()).toBe('region__s3_green');
    // The night passes without the raid; the Reckoning finds the host licensed.
    await said('=day 11 10:00');
    expect(Walking.drawn(j, 'ending')).toEqual(['e_licensed']);
    // On foot back to the first town: its green, its notice, its bailiff in his chair, and the innkeeper.
    await said('>region__s1_green');
    const notice = j.choices().find(c => /notice/i.test(c.full));
    expect(Walking.state(j, 'notice_a')).toBe('walk__end_licensed');
    expect(notice).toBeDefined();
    const read = String(await j.play(notice!.label));
    expect(read).toMatch(/BY LEAVE OF THE BENCH/);
    await said('>walk__moot_a');
    expect(Walking.at(j, 'dray')).toBe('walk__moot_a');
  }, 1500000);
});
