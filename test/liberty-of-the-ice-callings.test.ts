import { describe, expect, it } from 'bun:test';
import { Pellam, home } from './support/pellam';

// The Liberty of the Ice, revised against the series bible (doc/imbar/14-bible.md): what each calling makes of the Fair
// (data/adventures/liberty-of-the-ice/callings.kyr), the two things only a particular calling can do, and the Fair's
// small foreshadowings paying off in the morning's news (deeper.kyr). Each starts at the North Road and plays only what
// it needs, putting the company where the story would have brought it.
const solo = (classId: string, backgroundId: string) => Pellam.start(home, 'lisk', Pellam.one(classId, backgroundId));
const knows = (g: Pellam, fact: string) => g.j.assert('knows', 'party', `pellam__${fact}`);

describe('The Liberty of the Ice: the calling voices', () => {
  it('a cleric at the Saint\'s scales, knowing of the candle, says what office it is; a plain labourer says nothing', async () => {
    const g = await solo('cleric', 'acolyte');
    knows(g, 'harker_candle');
    await g.play('go:evenhands');
    expect(g.page).toMatch(/Sam stands a while before the Saint's scales/);
    expect(g.page).toMatch(/It is called the Weight/);
    expect(g.knows('candle_office')).toBe(true);
    const plain = await solo('warrior', 'laborer');
    knows(plain, 'harker_candle');
    await plain.play('go:evenhands');
    expect(plain.page).not.toMatch(/the Weight/);
    expect(plain.knows('candle_office')).toBe(false);
  }, 300000);

  it('a mage under the Glove, a warrior at the Ring and a bard at the Lamb each remark once', async () => {
    const mage = await solo('mage', 'scholar');
    mage.j.put('party', 'freezeland');
    await mage.play('=1');
    expect(mage.page).toMatch(/the thing which keeps the law should be the hand you do not use/);
    const warrior = await solo('warrior', 'laborer');
    warrior.j.put('party', 'hiring_ring');
    await warrior.play('=12');
    expect(warrior.page).toMatch(/A sergeant filling a rank|sergeant filling a rank/);
    const bard = await Pellam.start();
    bard.j.put('party', 'lamb');
    await bard.play('=84');
    expect(bard.page).toMatch(/They are all after the stone in the plum/);
  }, 600000);

  it('a ranger on the second morning reads the wolves\' tracks as something that has been taught, and says no more', async () => {
    const g = await solo('ranger', 'hunter');
    await g.play('=140');
    g.j.put('party', 'reach_head');
    await g.play('=142');
    expect(g.page).toMatch(/Each one put its foot in the track of the one before/);
    expect(g.page).toMatch(/who has been teaching them the way/);
  }, 300000);

  it('the candle, told to Harker, weighs on him and does not make him wary', async () => {
    const g = await solo('cleric', 'acolyte');
    knows(g, 'candle_office');
    await g.play('=6', 'go:counting_house', 'Tell Master Harker that you know what a pound of wax');
    expect(g.holds('harkerWeighed', 'harker')).toBe(true);
    expect(g.holds('harkerWary', 'harker')).toBe(false);
  }, 300000);
});

describe('The Liberty of the Ice: the two doors to Widow Saffery\'s cellar', () => {
  it('a thief lifts the board unasked, and has the cellar, and a widow who will not speak', async () => {
    const g = await solo('thief', 'cutpurse');
    await g.play('=6', 'go:saffery_shop');
    expect(g.page).toMatch(/There is a hatch/);
    expect(g.knows('hatch_suspected')).toBe(true);
    await g.play('Lift the loose board');
    expect(g.knows('starling_known')).toBe(true);
    expect(g.holds('safferyAffronted', 'saffery')).toBe(true);
    expect(g.page).toMatch(/does not speak/);
    knows(g, 'saffery_lantern');
    expect(g.j.offers('Ask Widow Saffery why she walks the Reach')).toBe(false);
  }, 300000);

  it('a company without a thief is not offered the board', async () => {
    const g = await solo('warrior', 'laborer');
    await g.play('=6', 'go:saffery_shop');
    expect(g.j.offers('lift the loose board')).toBe(false);
  }, 300000);
});

describe('The Liberty of the Ice: the Lisk Wife\'s office', () => {
  const night = async (classId: string, bg: string) => {
    const g = await solo(classId, bg);
    knows(g, 'saffery_lantern'); knows(g, 'saffery_davy');
    await g.play('=84');
    g.j.put('party', 'black_reach');
    await g.play('=86');
    return g;
  };

  it('only a cleric can say it: the searchers stop at the rim of her lantern on the second night, and the morning returns a bone skate', async () => {
    const warrior = await night('warrior', 'laborer');
    expect(warrior.j.offers('say the office for the drowned')).toBe(false);

    const g = await night('cleric', 'acolyte');
    expect(g.at('saffery')).toBe('pellam__black_reach');
    await g.play('Say the office for the drowned');
    expect(g.page).toMatch(/a second light comes up beside the lantern/);
    expect(g.holds('officeRead', 'lisk')).toBe(true);
    await g.until(232);
    expect(g.holds('searchersDiverted', 'lisk')).toBe(true);
    await g.until(420);
    expect(g.page).toMatch(/lantern-hook in her window/);
  }, 600000);

  it('without the office, the same morning finds the skate and nobody comes for it', async () => {
    const g = await solo('warrior', 'laborer');
    await g.play('go:cheaping');
    await g.until(420);
    expect(g.page).toMatch(/Nobody claimed it/);
    expect(g.page).not.toMatch(/lantern-hook/);
  }, 600000);

  it('an affronted widow is not asked for the office', async () => {
    const g = await solo('cleric', 'acolyte');
    knows(g, 'saffery_lantern'); knows(g, 'saffery_davy');
    g.j.assert('safferyAffronted', 'saffery');
    await g.play('=84');
    g.j.put('party', 'black_reach');
    await g.play('=86');
    expect(g.j.offers('say the office for the drowned')).toBe(false);
  }, 400000);
});

describe('The Liberty of the Ice: what lies under the Fair', () => {
  it('Gaffer Tredgold shows the cut leaf and the left glove, and Nab the egg', async () => {
    const g = await solo('warrior', 'laborer');
    knows(g, 'book_of_frosts');
    await g.play('go:watermen_room', 'Ask Gaffer Tredgold about the stub', 'Ask Gaffer Tredgold why the Glove');
    expect(g.page).toMatch(/Why would you cut a leaf before you wrote on it/);
    expect(g.page).toMatch(/a canon from Veyra/);
    await g.play('go:calf_taproom', 'Ask Nab Pollard why a Bankside child');
    expect(g.page).toMatch(/Two hundred winters and it has not dropped/);
  }, 300000);

  it('the Exchange floor holds the Collegium of Measures\' ell and a board for the Founders\' Exchange', async () => {
    const g = await solo('warrior', 'laborer');
    await g.play('go:exchange_floor');
    expect(g.page).toMatch(/THE ELL OF PELLAM, SEALED/);
    expect(g.page).toMatch(/FOUNDERS' EXCHANGE/);
  }, 300000);

  it('the Calf hears of a stair under the House of Doors only in a world where the Slack was opened', async () => {
    const closed = await solo('warrior', 'laborer');
    await closed.play('go:calf_taproom');
    expect(closed.page).not.toMatch(/House of Doors/);
    const opened = await solo('warrior', 'laborer');
    opened.j.assert('befell', 'slack_opened');
    await opened.play('go:calf_taproom');
    expect(opened.page).toMatch(/House of Doors/);
  }, 300000);
});
