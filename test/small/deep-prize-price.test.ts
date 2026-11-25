import { describe, expect, it } from 'bun:test';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import { DeepRivals } from '../../src/world/deep/deep-rivals';

// What a deep site's prize is bought for by those who want it (register SI-07): the Delvers' heart of the vein said no
// worth, and its rivals' head reckoned it at a default of 2000, paying 2500 against a dealer's 200, so one outing to
// the mine's last level was ten to thirteen times the first town's dearest ware (b2 and c3's day's coin, against the
// world gate's band of 0.5 to 3). Every prize is a first dungeon's, worth what its siblings are, and no head pays more
// than twice the first town's dearest ware (Canon's fine coats, 160 to 280) for it.
// Generator data only, no world.
const dearest = 280;
describe('a deep site\'s prize', () => {
  for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
    it(`is bought for what a first dungeon's prize is worth (${art})`, () => {
      expect(purpose.objective.worth).toBeDefined();
      for (const power of Object.values(DeepRivals.table)) {
        expect(DeepRivals.price(purpose, power)).toBeLessThanOrEqual(2 * dearest);
      }
    });
  }
});
