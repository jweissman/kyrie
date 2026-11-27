import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the west-road band', () => {
  it('can be turned away, but a failed reckoning becomes a fight', async () => {
    const outcomes = new Set<boolean>();
    for (const seed of [3, 10, 16, 18]) {
      const j = await Journey.start(campaign, `cell-approach-${seed}`);
      expect(j.holds('lc_cell_kind', 'lc_marauders')).toBe(true);
      j.assert('lcRoadTold', 'party');
      j.assert('lcVanguardArrived', 'party');
      j.assert('knows', 'party', 'lc_cell_route');
      await j.play('==+7');
      Placed.at(j, 'tallow__west_end');
      await j.fight('Call the west-road band to account for their robberies');
      const diverted = j.holds('lcCellDiverted', 'party');
      outcomes.add(diverted);
      expect(j.holds('lcCellDelivered', 'party')).toBe(false);
      if (diverted) {
        expect(j.holds('lcCellLeft', 'party')).toBe(true);
        expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(false);
      } else {
        expect(j.holds('lcCellDefied', 'party')).toBe(true);
        expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
      }
    }
    expect(outcomes).toEqual(new Set([true, false]));
  }, 10000);
});
