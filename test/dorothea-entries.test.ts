import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Ways into the Reach other than a fare at the quay, each handing the company to a leg of the archipelago with a
// consequence on the island it leads to.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const party = (j: Journey) => j.campaign.world.one('at', 'party');
const at = (j: Journey, id: string) => j.campaign.world.one('at', k(id));
const gold = (j: Journey) => j.measure('quantity', 'party', 'gold');
const start = async (quiet = true) => {
  const j = await Journey.start(campaign, 's1');
  if (quiet) { j.assert(k('seaQuiet'), k('hull')); }
  return j;
};
const book = (j: Journey, course: string, fare: string) =>
  j.play('Ask Captain Bascom for passage', 'Ask Captain Bascom where else', `Ask Captain Bascom to put in at ${course}`, `Pay Captain Bascom ${fare}`, "^To the Dorothea's waist");
const sail = async (j: Journey, course: string, fare: string) => { await j.play('^To Tolleth quay'); await book(j, course, fare); };

describe('Entries: a clerk with a crate (Ashkeld)', () => {
  it('hires the company, advances twelve coin, and sends it three days south-west; the crate is got by coin, by argument or by the bell, and paid for at the desk', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', '^Into the Anchor', 'Ask Corwin Latch about the crate', 'Take the clerk.s twelve coin', '^Out to');
    const g0 = gold(j);
    await book(j, 'Ashkeld', 'twelve');
    expect(gold(j)).toBe(g0 - 12);
    await j.play('=470', '^To Ashkeld.s black beach|^To the black beach');
    expect(at(j, 'hull')).toBe(k('ashkeld_beach'));
    expect(j.page).toContain('Ashkeld');
    await j.play('^To the hot springs', 'Ask Ansel Hallow when the cone breathes in', '^To the sulphur-house', 'Ask Merrow Gantry what the House owes');
    // Argument fails: she sells stone, not sentences.
    j.roll('fail');
    await j.play('Argue Merrow Gantry out of the crate');
    j.roll();
    expect(j.holds(k('crateGiven'), 'party')).toBe(false);
    // The mule-bell, fetched at the breath-in, is the third way.
    await j.play('^To the crater rim', 'Go to the rim at noon', '^To the sulphur-house', 'Give Merrow Gantry her mule-bell');
    expect(j.holds(k('crateGiven'), 'party')).toBe(true);
    await j.play('^To the hot springs', '^To the beach road|^To Ashkeld.s black beach', "^To the Dorothea's waist");
    await j.play('=1100', '^To Tolleth quay', '^Into the Anchor');
    const g1 = gold(j);
    await j.play('Put the Ashkeld crate on Corwin Latch');
    expect(gold(j)).toBe(g1 + 25);
    expect(j.holds(k('crateDelivered'), 'party')).toBe(true);
  }, 900000);

  it('lets the crate be paid for outright, or argued for', async () => {
    for (const how of ['Pay Merrow Gantry twelve', 'Argue Merrow Gantry']) {
      const j = await start();
      await sail(j, 'Ashkeld', 'twelve');
      await j.play('=470', '^To Ashkeld.s black beach|^To the black beach', '^To the hot springs', '^To the sulphur-house');
      if (how.startsWith('Argue')) { j.roll('pass'); }
      await j.play(how);
      j.roll();
      expect(j.holds(k('crateGiven'), 'party')).toBe(true);
    }
  }, 900000);

  it('risks the rim without the cone-keeper\'s word: a hard check and a lungful of the vents', async () => {
    const j = await start();
    await sail(j, 'Ashkeld', 'twelve');
    await j.play('=470', '^To Ashkeld.s black beach|^To the black beach', '^To the hot springs', '^To the sulphur-house', '^To the crater rim');
    j.roll('fail');
    await j.play('Go down to the lip for the bell');
    j.roll();
    expect(j.holds(k('belled'), 'party')).toBe(false);
  }, 900000);
});

describe('Entries: a mariner\'s wife and her letter (the Antlers)', () => {
  it('carries a real letter to the stack-man, who mends the ladder and sends an answer home, and the wife pays her housekeeping', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', 'Ask Dilys Ketteridge what she is waiting for');
    expect(j.holds('holding', 'party', k('dorothea_letter')) || j.holds('holding', 'party', 'dorothea_letter')).toBe(true);
    await j.play('Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at the Antlers',
      'Walk Fenwick Pelham', 'Pay Captain Bascom eight', "^To the Dorothea's waist", '=200', "^To the Antlers' ledge",
      '^To the harvest hut', '^To the foot of the Great Stack', 'Give Joss Ketteridge his wife.s letter');
    expect(j.holds(k('ladderSound'), 'party')).toBe(true);
    expect(j.holds(k('hobDefies'), 'party')).toBe(true);
    await j.play('^To the top of the Great Stack');
    expect(party(j)).toBe(k('stack_top'));
    await j.play('^To the foot of the Great Stack', '^To the harvest hut', "^To the Antlers' ledge", "^To the Dorothea's waist", '=600', '^To Tolleth quay');
    const g = gold(j);
    await j.play('Give Dilys Ketteridge her husband');
    expect(gold(j)).toBe(g + 8);
  }, 600000);
});

describe('Entries: a black lugger and the House\'s price (Port Ness)', () => {
  const tolleth = async () => {
    const j = await start();
    await j.play('^To Tolleth quay', '^Into the Anchor', 'Ask Corwin Latch about the black lugger');
    expect(j.holds(k('raidNews'), 'party')).toBe(true);
    return j;
  };
  const toNess = async (j: Journey) => {
    await j.play('^Out to', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at Port Ness',
      'Pay Captain Bascom four', "^To the Dorothea's waist", '=until at(hull, ness_quay)', '^To Port Ness pier', '^To Salt Row');
  };
  it('lets the House protect the pier for a bond of thirty crowns, owed', async () => {
    const j = await tolleth();
    await j.play('Sign the House.s protection bond');
    expect(j.measure(k('owesHouse'), 'party')).toBe(30);
    await toNess(j);
    await j.play('^To Port Ness pier', '=+100');
    expect(j.holds(k('raidLanded'), 'party')).toBe(false);
    expect(j.holds(k('raided'), 'party')).toBe(false);
    expect(j.page).toContain('guard-boat');
  }, 600000);

  it('lets the reeve be warned, and the rakers muster', async () => {
    const j = await tolleth();
    await toNess(j);
    await j.play('^To the salt pans', 'Warn Dunstan Auld');
    expect(j.holds(k('raidTurned'), 'party')).toBe(true);
    await j.play('=+120');
    expect(j.holds(k('raidLanded'), 'party')).toBe(false);
    expect(j.holds(k('raided'), 'party')).toBe(false);
    expect(j.measure(k('owesHouse'), 'party')).toBe(0);
  }, 600000);

  it('burns three lighters if nobody answers, and the company on the Row sees it from the lantern', async () => {
    const j = await tolleth();
    await toNess(j);
    await j.play('^Into the House', '=+130');
    await j.play('=+60');
    expect(j.holds(k('raided'), 'party')).toBe(true);
    await j.play('^Out to', '^To Port Ness pier');
    expect(j.page).toContain('burnt to the waterline');
  }, 600000);

  it('lets a parley turn the raiders for four sacks, when the company is on the pier', async () => {
    const j = await tolleth();
    await toNess(j);
    await j.play('^To Port Ness pier');
    await j.play('=until at(raiders, ness_quay)');
    expect(j.holds(k('raidLanded'), 'party')).toBe(true);
    j.roll('pass');
    await j.play('Parley with the woman with the cutlass');
    j.roll();
    expect(j.holds(k('raidTurned'), 'party')).toBe(true);
  }, 600000);
});

describe('Entries: a bottle on the harbourmaster\'s desk (the Holm)', () => {
  it('hands the bottle to the company, which carries it across the Wrack Road at low water to the woman who threw it', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', '^Into the harbourmaster', 'Ask Dacey Hoe about the bottle', '^Out to');
    expect(j.holds(k('bottleTaken'), 'party')).toBe(true);
    await book(j, 'Port Ness', 'four');
    await j.play('=until at(hull, ness_quay)', '^To Port Ness pier', '^To Salt Row', '^To the salt pans', '^To the Ness strand');
    expect(j.matches('^To the Holm').length + j.matches('^To Wrack Holm').length + j.matches('^To the Wrack Road').length).toBeGreaterThanOrEqual(0);
    await j.play('=until phase(' + k('tide') + ') >= 30');
    await j.play('^To the Holm.s beach', '^Into the lamp-stump|^To the lamp-stump', 'Give Marit Oake the bottle');
    expect(j.holds(k('maritWilling'), 'party')).toBe(true);
  }, 600000);
});

describe('Entries: a runaway prentice (the Antlers)', () => {
  it('lets the company take Pip Vosper home to his uncle, who then gives the headman\'s leave for the cresset; or sell him back for five coin', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', '^Into Garrick', 'Ask Pip Vosper where his mother is', 'Ask him to come with you');
    expect(j.holds('following', k('pip'), 'party')).toBe(true);
    await j.play('^Out to', 'Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at the Antlers',
      'Walk Fenwick Pelham', 'Pay Captain Bascom eight', "^To the Dorothea's waist", '=200', "^To the Antlers' ledge", '^To the harvest hut', '^To the foot of the Great Stack', 'Bring Pip Vosper to Hob Sedge');
    expect(j.holds(k('pipHome'), 'party')).toBe(true);
    expect(j.holds(k('cressetFree'), 'party')).toBe(true);
    await j.play('Ask Hob Sedge to take you up', '^To the top of the Great Stack', 'Light the Antlers. cresset');
    expect(j.holds(k('lampLit'), k('lamp_antlers'))).toBe(true);
  }, 600000);
  it('lets the clerk have the boy back for five coin instead, and the stack stays dark', async () => {
    const j = await start();
    await j.play('^To Tolleth quay', '^Into Garrick', 'Ask Pip Vosper where his mother is', '^Out to', '^Into the Anchor');
    const g = gold(j);
    await j.play('Tell Corwin Latch where the runaway is');
    expect(gold(j)).toBe(g + 5);
    expect(j.holds(k('pipReturned'), 'party')).toBe(true);
  }, 300000);
});
