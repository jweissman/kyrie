import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('different kinds of supply cell', () => {
  for (const kind of ['lc_cult', 'lc_musicians'] as const) {
    it(`gives ${kind} its own uncertain nonviolent approach`, async () => {
      const outcomes = new Set<string>();
      const seeds = kind === 'lc_cult' ? [2, 4, 6, 8] : [0, 1, 5, 7];
      for (const seed of seeds) {
        const j = await Journey.start(campaign, `cell-approach-${seed}`);
        j.assert('lcRoadTold', 'party');
        j.assert('lcVanguardArrived', 'party');
        expect(j.holds('lc_cell_kind', kind)).toBe(true);
        j.assert('knows', 'party', 'lc_cell_route');
        await j.play('==+7');
        Placed.at(j, 'tallow__west_end');
        const before = j.measure('quantity', 'party', 'rations');
        const carried = j.measure('quantity', 'lc_cell', 'rations');
        const action = kind === 'lc_cult' ? 'Challenge the counting circle\'s account'
          : 'Offer the travelling players a song for their food';
        await j.play(action);
        const result = j.taken.at(-1)!.event.result;
        outcomes.add(result);
        expect(j.offers(action)).toBe(false);
        if (result === 'success') {
          expect(j.holds('lcCellLeft', 'party')).toBe(true);
          expect(j.holds('lcCellDelivered', 'party')).toBe(false);
          if (kind === 'lc_cult') {
            expect(j.holds('lcCellDiverted', 'party')).toBe(true);
            expect(j.measure('quantity', 'party', 'rations')).toBe(before);
          } else {
            expect(j.measure('quantity', 'party', 'rations')).toBe(before + carried);
            expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(0);
          }
        } else {
          expect(j.holds('lcCellLeft', 'party')).toBe(false);
          expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(carried);
        }
        j.put('lc_vanguard', 'tallow__calx_portal');
        await j.play('==+4');
        expect(j.holds('lcCellDelivered', 'party')).toBe(result === 'failure');
      }
      expect(outcomes).toEqual(new Set(['success', 'failure']));
    }, 10000);
  }
});
