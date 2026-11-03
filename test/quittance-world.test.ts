import { describe, expect, it } from 'bun:test';
import { ProvincePlay } from './support/province-play';

// An ordinary player, beginning outside the region: a generated country, an innkeeper who tells of Quittance, the north
// road, the Declaration Road, and the Arch. Nothing in the player's path is Quittance's own until the road comes to the
// Arch.
describe('Quittance in a generated world', () => {
  it('is told of by whoever keeps travellers, walked to by the north road, and entered at the Arch', async () => {
    const p = await ProvincePlay.enter('wren', 'quittance', { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    expect(p.told).toContain('Up the north road there is Quittance');
    expect(p.told).toContain('insure your hat');
    expect(p.came).toContain('Declaration Arch');
    expect(p.c.world.one('at', 'party')).toBe(p.k('arch_road'));
    // The Arch is the same Arch: a lone warrior declares truthfully and is in the city.
    const choices = p.c.module.actions.filter(a => a.id.includes('declare_true'));
    expect(choices.length).toBeGreaterThan(0);
  }, 240000);
});
