import { describe, expect, it } from 'bun:test';
import { PromiseFidelity } from '../scripts/promise-fidelity';

// The golden route's promises kept (Sprint 3, S3-2; AP-01, PB-24): the curious walk of scripts/promise-fidelity.ts
// over Iscoed as the route's two characters, the warrior come down the drove road and the elf mage of the weir, every
// facet the glance draws on every turn done in a copy of the world and asked whether it brought what it promised. A
// pin of the walks' first turns, not the census (the script runs them longer); a promise on a roll not kept on this
// one is a chance, not broken. Something must be drawn, or a walk that drew nothing would keep every promise.
const walks = [['the warrior on the drove road', 'human/warrior/Wenna', 3],
  ['the mage of the weir', 'elf/mage/Ilse/scholar', 4]] as const;

describe('the golden route keeps its promises', () => {
  for (const [who, as, turns] of walks) {
    it(`for ${who}, its first ${turns} turns`, async () => {
      const { tally, broken } = await PromiseFidelity.walk('iscoed', turns, as);
      expect(Object.values(tally).reduce((n, t) => n + t.drawn, 0)).toBeGreaterThan(2);
      expect(broken).toEqual([]);
    }, 120000);
  }
});
