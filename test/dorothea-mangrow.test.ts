import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Mangrow (the-dorothea/mangrow.kyr): the jungle call, five days south. A heat measure (swelter) climbs in the green, a
// river fever strikes at four and a collapse carries the company out at eight; the House's bark is shut in a strong-room
// the fig has grown through; three ways in (Osk's key, lockwork, fire) and a ranger's own bale; the notice-board lists it.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const at = (j: Journey) => j.campaign.world.one('at', 'party');
const hull = (j: Journey) => j.campaign.world.one('at', k('hull'));
const swelter = (j: Journey) => j.measure(k('swelter'), 'party');
// How many bales the pack says it holds ("A bale", "Two bales").
const bales = (j: Journey) => {
  const word = j.choices().map(c => /^Pack › (\w+) bales? of Mangrow bark › Set down here/.exec(c.label)?.[1]).find(Boolean);
  return word ? ['', 'A', 'Two', 'Three', 'Four'].indexOf(word) : 0;
};
const start = async () => {
  const j = await Journey.start(campaign, 's1');
  j.assert(k('seaQuiet'), k('hull'));
  return j;
};
// Booked for Mangrow, with the netting from Garrick's if asked, and landed on the rotting pier.
const landed = async (j: Journey, netting = false, quint = false) => {
  await j.play('^To Tolleth quay');
  if (netting) { await j.play('^Into Garrick', 'Buy › A length of tarred netting', '^Out to'); }
  await j.play('Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Mangrow', 'Pay Captain Bascom sixteen', "^To the Dorothea's waist");
  if (quint) { await j.play('Ask her to come with you'); }
  await j.play('=until at(dorothea__hull, dorothea__mangrow_pier)', '^To the rotting pier');
};

describe('Mangrow: the call, and the way there', () => {
  it('is on the notice-board and in Bascom\'s list, costs sixteen, and is five days of sea', async () => {
    const j = await start();
    await j.play('^To Tolleth quay');
    expect(j.page).toContain('MANGROW (BARK), FIVE DAYS SOUTH');
    expect(j.page).toContain('ASHKELD (STONE)');
    await j.play('Ask Captain Bascom for passage', 'Ask Captain Bascom where else');
    expect(j.page).toContain('Mangrow, sixteen, five days south');
    await j.play('Ask Captain Bascom to put in at Mangrow');
    expect(j.measure(k('bound'), k('hull'))).toBe(5);
    expect(j.matches('Pay Captain Bascom sixteen').length).toBe(1);
    expect(j.matches('Pay Captain Bascom six\\b').length).toBe(0);
    // Ashkeld can still be chosen from Mangrow, and Mangrow from Ashkeld.
    await j.play('Ask Captain Bascom to put in at Ashkeld');
    expect(j.measure(k('bound'), k('hull'))).toBe(4);
    await j.play('Ask Captain Bascom to put in at Mangrow', 'Pay Captain Bascom sixteen', "^To the Dorothea's waist", '=100');
    expect(hull(j)).toBe(k('open_sea'));
    await j.play('=350');
    expect(hull(j)).toBe(k('open_sea'));
    expect(j.page).toContain('The third day');
    await j.play('=520');
    expect(hull(j)).toBe(k('open_sea'));
    expect(j.page).toContain('The fourth day');
    await j.play('=until at(dorothea__hull, dorothea__mangrow_pier)');
    expect(j.watch()).toBeGreaterThan(144 * 4);
  }, 600000);

  it('draws the sea table on the long leg and answers a fever with the bark', async () => {
    const j = await start();
    j.give('dorothea_bark');
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Mangrow', 'Pay Captain Bascom sixteen', "^To the Dorothea's waist", '=40');
    j.assert(k('fever'), k('hull'));
    j.assert(k('troubled'), k('hull'));
    await j.play('=+1');
    expect(j.matches('Steep the Mangrow bark for the boy').length).toBe(1);
    await j.play('Steep the Mangrow bark for the boy');
    expect(j.holds(k('fever'), k('hull'))).toBe(false);
    expect(j.holds('holding', 'party', 'dorothea_bark')).toBe(false);
  }, 600000);
});

describe('Mangrow: the green', () => {
  it('lets a company who walks in with nothing take the river fever, then be carried out at eight', async () => {
    const j = await start();
    await landed(j);
    await j.play('^To the outstation yard');
    expect(j.holds(k('fevered'), 'party')).toBe(false);
    await j.play('=+14');
    expect(swelter(j)).toBeGreaterThanOrEqual(2);
    expect(j.page).toContain('damp opinion');
    await j.play('=+14');
    expect(swelter(j)).toBeGreaterThanOrEqual(4);
    expect(j.holds(k('fevered'), 'party')).toBe(true);
    expect(j.page).toContain('cold in the spine');
    await j.play('=until dorothea__swelter(party) >= 8 or at(party, dorothea__mangrow_pier)');
    await j.play('=+2');
    expect(at(j)).toBe(k('mangrow_pier'));
    expect(swelter(j)).toBeLessThan(8);
    expect(j.page).toContain('that she had told them');
  }, 600000);

  it('halves the stings under netting, and lets the pier\'s breeze ease them', async () => {
    const plain = await start();
    await landed(plain);
    await plain.play('^To the outstation yard', '=+30');
    const net = await start();
    await landed(net, true);
    await net.play('Put on the netting', '^To the outstation yard', '=+30');
    expect(net.holds(k('netted'), 'party')).toBe(true);
    expect(swelter(net)).toBeLessThan(swelter(plain));
    await net.play('^To the rotting pier', 'Sit out in the breeze');
    expect(swelter(net)).toBeLessThanOrEqual(swelter(plain));
  }, 900000);
});

describe('Mangrow: the strong-room, three ways', () => {
  it('opens to Osk\'s key, when Vail is asked about his moths and Osk is tended; two bales; Quint is the other way to Vail\'s tea', async () => {
    const j = await start();
    await landed(j, true);
    await j.play('Put on the netting', 'Pay Sula Weir three', '^To the creek mouth', "^To Vail's hide");
    expect(j.matches('Carry Vail.s pannikin').length).toBe(0);
    await j.play('Ask Ennis Vail what he is counting', 'Ask Ennis Vail for a pannikin', 'Carry Vail.s pannikin behind the cloth', 'Ask Perrin Osk for the strong-room key');
    expect(j.holds('holding', 'party', 'dorothea_strong_key')).toBe(true);
    expect(swelter(j)).toBe(0);
    await j.play('^To the creek mouth', '^To the outstation yard', 'Cut the roots from the lock', '^To the strong-room', 'Carry a bale out', 'Carry a second bale out');
    expect(j.holds(k('storeOpen'), 'party')).toBe(true);
    expect(bales(j)).toBe(2);
    expect(j.matches('Carry a second bale').length).toBe(0);
  }, 900000);

  it('has Quint, who knew Vail\'s note on the unequal wings, bring the tea without a coin', async () => {
    const j = await start();
    await landed(j, false, true);
    await j.play('Pay Sula Weir three', '^To the creek mouth', "^To Vail's hide");
    await j.play('Ask Odile Quint whether she knows Ennis Vail');
    expect(j.holds(k('vailTrusts'), 'party')).toBe(true);
    expect(j.holds(k('barked'), 'party')).toBe(true);
    expect(j.page).toContain('unequal wings');
  }, 900000);

  it('lets a coin buy Vail\'s trust, and a thief work the lock, or fail it and pay in stings', async () => {
    const j = await start();
    await landed(j);
    await j.play('^To the outstation yard');
    j.roll('fail');
    await j.play('Work the strong-room lock free');
    j.roll();
    expect(j.holds(k('storeOpen'), 'party')).toBe(false);
    expect(swelter(j)).toBeGreaterThanOrEqual(2);
    j.roll('pass');
    await j.play('Work the strong-room lock free');
    j.roll();
    expect(j.holds(k('storeOpen'), 'party')).toBe(true);
    await j.play('^To the strong-room', 'Carry a bale out', 'Carry a second bale out');
    expect(bales(j)).toBe(2);
    const v = await start();
    await landed(v);
    await v.play('Pay Sula Weir three', '^To the creek mouth', "^To Vail's hide", 'Pay Ennis Vail four');
    expect(v.holds(k('vailTrusts'), 'party')).toBe(true);
  }, 900000);

  it('burns through with a torch for one scorched bale, and a ranger cuts a bale of her own at the creek', async () => {
    const j = await start();
    await landed(j);
    await j.play('^To the outstation yard', 'Burn the fig off the strong-room door', '^To the strong-room');
    expect(j.matches('Carry a second bale').length).toBe(0);
    await j.play('Carry out the one bale the fire spared');
    expect(bales(j)).toBe(1);
    const r = await start();
    await landed(r);
    await r.play('Pay Sula Weir three', '^To the creek mouth');
    expect(r.page).toContain('White underleaf');
    r.roll('pass');
    await r.play('Find the white fig-leaf tree');
    r.roll();
    expect(r.holds(k('barkCut'), 'party')).toBe(true);
    expect(bales(r)).toBe(1);
  }, 900000);
});

describe('Mangrow: home, and left behind', () => {
  it('sells a bale to Garrick for ten coin, and drinks one to clear the fever', async () => {
    const j = await start();
    j.give('dorothea_bark');
    j.give('dorothea_bark');
    await j.play('^To Tolleth quay', '^Into Garrick');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Sell Wat Garrick a bale');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 10);
    j.assert(k('barked'), 'party');
    expect(bales(j)).toBe(1);
  }, 300000);

  it('leaves a company on the pier when the ketch goes, and the Hesper takes it home for nine', async () => {
    const j = await start();
    await landed(j);
    await j.play("=until at(dorothea__hull, dorothea__mangrow_roads)");
    expect(j.holds(k('homeward'), k('hull'))).toBe(true);
    await j.play('=+2');
    expect(j.holds(k('strandedMangrow'), 'party')).toBe(true);
    expect(j.page).toContain('Hesper');
    await j.play('Pay nine coin to go home on the bark-cutter');
    expect(at(j)).toBe(k('quay'));
  }, 900000);
});
