import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The Ash's lesser forces in thirteen adventures with no seat of its board (data/adventures/<dir>/count.kyr): in each,
// a counting-coin behind an out-of-the-way search, and once the count begins a force on the way in that a company can
// fight, or turn aside with the coin, a local's help or the Ash's own oath. Skeel's case plays every way round it; the
// rest play the coin and the oath, which every one of them shares.
const cases: [campaign: string, module: string, prefix: string, coinRoom: string, coinAct: string, roadRoom: string][] = [
  ['skeel', 'skeel', 'skl', 'church', 'Lift the loose flagstone behind Lir Who Gives', 'coast_road'],
  ['skerrow', 'skerrow', 'skr', 'lamp_room', 'Lift the brass-edged tile under the lamp-room mat', 'shore_road'],
  ['tailrace', 'tailrace', 'trl', 'sill', 'Turn over the flat stone beside the loch road', 'road'],
  ['the-dorothea', 'dorothea', 'dor', 'pharos_lamp', 'Prise out the freshly puttied pane', 'road_end'],
  ['the-long-man', 'longman', 'lmn', 'rest', 'Lift the stone bowl in the keeper’s niche', 'road_end'],
  ['thrume', 'thrume', 'thm', 'lantern_back', 'Lift the board at the end of the salt seam', 'salt_road'],
  ['warmwall', 'warmwall', 'wwl', 'cold_wheel', 'Pull the old wedge from the cold wheelhouse door', 'road'],
  ['wetdrusilla', 'wetdrusilla', 'wdr', 'bilge', 'Lift the bright-nailed plank under the third rib', 'road'],
  ['what-tessary-owes', 'tessary', 'tso', 'cistern', 'Search the rush-filled hollow in the causeway stone', 'causeway_end'],
  ['windfall', 'windfall', 'wdf', 'sluice_house', 'Turn the stone beneath the sluice-house lintel', 'road'],
  ['a-winter-in-carth', 'gaunt', 'car', 'deadfall', 'Search the yew roots below the white thread', 'cross_road'],
  ['the-third-night', 'wrayford', 'wry', 'counting_room', 'Pry up the new nails in the Bridge Company’s counting-house', 'drove_road'],
  ['wrongboat', 'wrongboat', 'wbt', 'hold', 'Cut the red sailcloth from the onion sack in the Mary’s hold', 'road'],
];

describe('the Ash\'s lesser forces, on thirteen ways in', () => {
  for (const [campaign, mod, p, coinRoom, coinAct, road] of cases) {
    it(`${mod}: a coin, and a force a sworn company walks past`, async () => {
      const j = await Journey.start(`data/campaigns/${campaign}.campaign.json`, `reach-${mod}`);
      Placed.at(j, `${mod}__${coinRoom}`);
      await j.play('=+1', coinAct);
      expect(j.holds(`${mod}__${p}CoinFound`, 'party')).toBe(true);
      const sworn = await Journey.start(`data/campaigns/${campaign}.campaign.json`, `reach-${mod}-ash`);
      sworn.assert('befell', 'ash_count_begun');
      sworn.assert('befell', 'company_sworn_ash');
      Placed.at(sworn, `${mod}__${road}`);
      await sworn.play('=+1');
      expect(sworn.holds('at', `${p}_counting_party`, `${mod}__${road}`)).toBe(true);
      await sworn.play('Show the company’s place on the Ash board');
      expect(sworn.holds(`${mod}__${p}DangerSettled`, 'party')).toBe(true);
      expect(sworn.holds('at', `${p}_counting_party`, `${mod}__${road}`)).toBe(false);
    }, 9000);
  }

  it('skeel: Mother Jago\'s pie, for a company sworn to the Rì, gets the hounds off the coast road', async () => {
    const aid = await Journey.start('data/campaigns/skeel.campaign.json', 'reach-skeel-ri-aid');
    aid.assert('befell', 'ash_count_begun');
    aid.assert('befell', 'company_sworn_ri');
    Placed.at(aid, 'skeel__taproom');
    await aid.play('=+1', 'Ask Mother Jago for a meal for the Rì’s shore hands');
    expect(aid.holds('skeel__sklRiHelped', 'party')).toBe(true);
    Placed.at(aid, 'skeel__coast_road');
    await aid.play('=+1', 'Throw Jago’s pie to the Cawse hounds');
    expect(aid.holds('skeel__sklDangerSettled', 'party')).toBe(true);
  }, 9000);
});
