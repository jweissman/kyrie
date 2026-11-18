import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';

// A healer's price is said in the act that pays it (cold play 3, CL-24: "Ask Mother Ebba for healing" took 2 coin
// unsaid, where a bed and a lamp said theirs), and said once where the page tells it with its price beside.
const herbwife = `
  Place town "the town" is settlement.
  Place kitchen "the kitchen" is room within town at 0, 0 indoors.
  Company party "You" of 1 at kitchen.
  Initially Set quantity(party, gold) to 10.
  Person ruth "Ruth Coll" at kitchen {
    Role "herbwife". Ancestry human. Peaceable. Pronouns she.
    Offers healing "stitching and a poultice" for 2 coin.
  }
  Goal false.`;
describe('a healer\'s price', () => {
  it('is in the words of asking for it', async () => {
    const t = await Tiny.start(herbwife);
    const asked = PlayerView.choices(t.campaign).map(r => r.choice.name).filter(n => /stitching/.test(n));
    expect(asked).toEqual(['Ask Ruth Coll for stitching and a poultice, 2 coin']);
  });
});
