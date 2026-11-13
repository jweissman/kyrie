import { describe, expect, it } from 'bun:test';
import { RegionStock } from '../src/world/region-stock';

// How many den in a work's room (PL-07, the lead's decision of 13 November): half a den's number, and never one alone
// where two are still within a first den's danger. A first-level warrior had beaten every denned single of a1 every
// time, in two to four rounds and unhurt (doc/architecture/mission-21/rules/placements.md); company by number, no new
// stats. One beyond the first den's budget (a challenge over one) stays alone.
describe('a work\'s den', () => {
  it.each([[1, 0.5, 2], [2, 0.5, 2], [1, 1, 2], [1, 1.5, 1], [1, 4, 1], [3, 0.5, 2], [5, 0.25, 3], [8, 0.5, 4]])(
    'of a den of %d, of challenge %d, holds %d', (den, challenge, held) => {
      expect(RegionStock.numbers(den, challenge)).toBe(held);
    });
});
