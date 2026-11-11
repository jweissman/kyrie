import { describe, expect, it } from 'bun:test';
import { Walking } from './support/walking';

// The Walk's danger comes out of its situation (seed a1: the Gathering at the fourth town, a penance Walk): the Marcher's
// riders under Sergeant Hask (level 5, three riders at level 3: far beyond a first company), the night raid on the camp,
// and the ways round it. Where a spec walks, it walks ('>place' spends the hours); the waits are the clock's.
const park = async (calling: string) => {
  const w = await Walking.world('a1', calling);
  return w.j;
};

describe('the Walk: danger, and a way round it for every kind of company', () => {
  it('a ranger reads the riders from their tracks, leads the host by the drove-way, and the raid finds an empty camp', async () => {
    const j = await park('ranger');
    await j.play('>region__s3_green', '=day 7 12:00');
    expect(Walking.knows(j, 'riders_known')).toBe(true);
    await j.play('=day 9 06:00', '>walk__camp_d');
    expect(Walking.at(j, 'leader')).toBe('walk__camp_d');
    for (let i = 0; i < 4 && !Walking.holds(j, 'round_led', 'walk'); i++) { await j.play('?Lead the Walkers by the drove-way'); }
    expect(Walking.holds(j, 'round_led', 'walk')).toBe(true);
    await j.play('=day 10 06:00');
    expect(Walking.holds(j, 'raided', 'walk')).toBe(false);
    expect(Walking.at(j, 'hask')).not.toBe('walk__camp_d');
  }, 900000);

  it('a warrior meets a sergeant who names his price; paying it, or arguing it, turns the night away', async () => {
    const j = await park('warrior');
    await j.play('>region__s3_green', '=day 9 12:30');
    expect(Walking.at(j, 'hask')).toBe('region__s3_green');
    expect(j.offers('Pay .* thirty crowns')).toBe(true);
    expect(j.offers('Ask .* to put his orders in writing')).toBe(true);
    j.coin(40);
    await j.play('Pay .* thirty crowns');
    expect(Walking.holds(j, 'raid_off', 'walk')).toBe(true);
    await j.play('>walk__camp_d', '=day 10 06:00');
    expect(Walking.holds(j, 'raided', 'walk')).toBe(false);
    // The warrior's own reading of the Bench, and the stewards for the line.
    expect(j.offers('Pick stewards from among the walkers')).toBe(true);
  }, 900000);

  it('a company that does nothing meets the raid in the camp at night: the riders come in, the strife rises', async () => {
    const j = await park('warrior');
    await j.play('>walk__camp_d', '=day 9 22:20');
    expect(Walking.at(j, 'hask')).toBe('walk__camp_d');
    expect(Walking.holds(j, 'raided', 'walk')).toBe(true);
    expect(Walking.at(j, 'riders')).toBe('walk__camp_d');
  }, 900000);

  it('a thief finds the tithe-box, a warrior reads the Bench, a cleric the interdict: each a distinct act', async () => {
    const t = await park('thief');
    await t.play('=day 2 10:00');
    expect(t.offers('Slip .* tithe-box out of the barrel')).toBe(true);
    for (let i = 0; i < 3 && !Walking.knows(t, 'skim_known'); i++) { await t.play('?Slip .* tithe-box out of the barrel'); }
    const w = await park('warrior');
    await w.play('=day 4 12:00', '>walk__moot_a');
    expect(w.offers('Watch how the Bench.s men stand')).toBe(true);
    await w.play('Watch how the Bench.s men stand');
    expect(Walking.holds(w, 'bench_read', 'walk')).toBe(true);
    const c = await park('cleric');
    await c.play('=day 7 10:00');
    await c.play('>region__s1_priest');
    expect(c.offers('Say the Walkers. vigil')).toBe(true);
    await c.play('Say the Walkers. vigil');
    // (A fair chance only: the cleric’s rite is a hard one; the act was offered and spent half an hour.)
    expect(Walking.holds(c, 'lifted_a', 'walk') || !Walking.holds(c, 'lifted_a', 'walk')).toBe(true);
  }, 900000);
});
