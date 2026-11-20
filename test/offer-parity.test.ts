import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OfferParity } from '../scripts/offer-parity';

// Every client the same (MT-18; the owner, 20 November): what the runner offers, turn by turn over the golden walks,
// read against the engine's one projection (Doable), and the page and serve at the same turns (scripts/client-parity).
// Today's divergences are the baseline: a new one fails here, and so does one gone that the baseline still lists, so
// that the count only falls, each time on purpose (`bun scripts/offer-parity.ts --write` after removing one, named in
// the commit).
describe('what the runner offers, against the engine', () => {
  it('diverges in nothing new, and keeps no divergence in the baseline that is gone', async () => {
    const kept = JSON.parse(readFileSync(join(OfferParity.root, OfferParity.baseline), 'utf8')) as
      { divergences: string[] };
    const now = await OfferParity.divergences();
    expect(now.filter(d => !kept.divergences.includes(d))).toEqual([]);
    expect(kept.divergences.filter(d => !now.includes(d))).toEqual([]);
  }, 600000);
});
