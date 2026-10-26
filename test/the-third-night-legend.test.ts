import { describe, expect, it } from 'bun:test';
import { Wrayford, build, home, steps, w } from './support/wrayford';

// The second revision of The Third Night (doc/adventures/the-third-night/11-second-reading.md): Saint Wade's legend
// told in pieces, the city's past, the days as chapters, the third night's weather, the Bargeman at Wade's Step, and
// Maudie's bread, which opens what coin cannot.
const bread = steps('bread', 'bread');

describe('The Third Night: the legend and the past', () => {
  it('the city tells its saint and its burning in pieces, and the captain is asked about her father', async () => {
    const g = await Wrayford.start();
    await g.fixture('legend', 'hill', 'bridge', 'wheels');
    expect(g.knows('michaelmas_burning')).toBe(true);
    expect(g.knows('wade_legend')).toBe(true);
    expect(g.knows('wade_hymn')).toBe(true);
    expect(g.knows('sefton_daughter')).toBe(true);
    // Two saints: the old one in the bridge chapel, bent under a grey child; the Company's, smiling in a blue stream.
    expect(g.page).toMatch(/CARRY ME OVER/);
    expect(g.page).toMatch(/rosy child/);
    expect(g.page).toMatch(/ten small stones in a row/);
    expect(g.page).toMatch(/He sang it for you/);
    await g.fixture('legend', 'supper');
    expect(g.measure('captainView', 'sefton')).toBe(1);
    expect(g.page).toMatch(/I held the horses/);
  }, 240000);

  it('each dawn turns a chapter, the storm comes with the captain, and on the third night something wades at the Step', async () => {
    const g = await Wrayford.start();
    await g.fixture('alone', 'in');
    await g.until(440);
    for (const chapter of ['THE SECOND DAY', 'THE THIRD DAY', 'THE THIRD NIGHT', 'THE FOURTH MORNING']) {
      expect(g.page).toContain(chapter);
    }
    expect(g.page).toMatch(/someone wading at Wade's Step/);
    expect(g.page).toMatch(/someone wades at Wade's Step, singing, with something heavy on her back/);
  }, 240000);
});

describe('The Third Night: the Bargeman at Wade\'s Step', () => {
  const wade = ['To Northgate', 'To the Market Cross', 'Shambles', 'Wharf', 'bank under', '=103', 'To Wade\'s Step'];

  it('wading the ford untaught, a lone warrior finds the way on lying in the water, and dies going at it', async () => {
    const g = await Wrayford.start(build('warrior'));
    await g.play(...wade);
    expect(g.at('party')).toBe(w('wades_step'));
    expect(g.j.offers('^To the tan-yards')).toBe(false);
    expect(g.j.offers('Throw bread into the deep water')).toBe(true);
    await g.until(104).catch(() => g);
    await g.play('Go at the Bargeman');
    expect(g.running).toBe(false);
  }, 240000);

  it('the same warrior, with Maudie\'s bread, throws a loaf on the water the way the old drovers did, and goes over', async () => {
    const g = await Wrayford.start(build('warrior'));
    await g.play(...bread, ...wade.slice(1), 'Throw bread into the deep water', 'To the tan-yards');
    expect(g.knows('bargeman_loaf')).toBe(true);
    expect(g.holds('tolerates', 'bargeman', 'party')).toBe(true);
    expect(g.at('party')).toBe(w('tanyards'));
  }, 240000);

  it('a seasoned company kills it, and the eel-men stand round it on the shingle with their caps off', async () => {
    const g = await Wrayford.start(build('seasoned'));
    await g.play(...wade, 'Go at the Bargeman', 'Wait › A while', 'Wait › A while', 'Wait › A while');
    expect(g.holds('able', 'bargeman')).toBe(false);
    await g.play('To the tan-yards');
    expect(g.page).toMatch(/My grandfather fed that fish/);
  }, 240000);

  it('if the river rises while you stand on the Step, it puts you back on the bank', async () => {
    const g = await Wrayford.start(build('warrior'));
    await g.play(...wade);
    await g.until(130);
    expect(g.at('party')).toBe(w('under_arches'));
    expect(g.page).toMatch(/takes your feet from under you/);
  }, 240000);
});

describe('The Third Night: Maudie\'s bread', () => {
  it('sent up to the riders at dusk, the widow\'s bread buys a night when nobody on the leads looks round', async () => {
    const g = await Wrayford.start();
    await g.fixture('bread', 'bread', 'rope', 'riders');
    expect(g.holds('riderPeaceBought', 'riders')).toBe(true);
    expect(g.holds('asleep', 'riders')).toBe(false);
    expect(g.holds('state', 'rail', 'cut')).toBe(true);
    expect(g.holds('seenAtRail', 'party')).toBe(false);
    expect(g.page).toMatch(/none of them looks round/);
  }, 240000);

  it('without the bread, the same climb at the same hour is seen', async () => {
    const g = await Wrayford.start();
    await g.play('To Northgate');
    await g.fixture('bread', 'rope');
    await g.play(...steps('bread', 'riders').filter(s => !/Send Maudie/.test(s)));
    expect(g.holds('seenAtRail', 'party')).toBe(true);
  }, 240000);

  it('Jennet refuses Pardoe bread from a stranger to her grief, and takes it, still warm, from someone who sat with her', async () => {
    const g = await Wrayford.start();
    await g.play(...bread, 'To the Market Cross', ...steps('mothers', 'ice').slice(1), 'Bridge End', 'To Bridge Street', 'brought a block of ice',
      'toll-keeper\'s house', 'Give Jennet Hobday a loaf');
    expect(g.holds('breadRefused', 'jennet')).toBe(true);
    await g.play('Sit with Jennet', 'say who sent it');
    expect(g.holds('jennetBread', 'jennet')).toBe(true);
    expect(g.measure('jennetTrust', 'jennet')).toBe(3);
  }, 240000);
});

describe('The Third Night: carrying, once the way is known', () => {
  it('the second and third men are carried over in one choice each, and still before the river rises', async () => {
    const g = await Wrayford.start(home);
    await g.fixture('night-quick', 'day1', 'night1');
    expect(g.holds('carriedOver', 'party')).toBe(true);
    expect(g.at('joss_dead')).toBe(w('wades_acre'));
    await g.fixture('night-quick', 'dawn');
    await g.until(440);
    expect(g.ending()).toEqual([w('earth')]);
  }, 240000);
});
