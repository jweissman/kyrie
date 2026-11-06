import { describe, expect, it } from 'bun:test';
import { Gaunt, build } from './support/gaunt';

// A Winter in Carth, revised against the series bible (doc/imbar/14-bible.md): what each calling makes of Carth and
// Gaunt
// (data/adventures/winter-in-carth/voices.kyr), the one thing only a cleric can read, and who she tells; the Bishop's
// Wood at dusk with two ways that are not a fight; and the seam kept open (seam.kyr). Each starts at the Penitent's
// Cross and puts the company where the story would have brought it.
const at = async (campaign: string | undefined, place: string, watch: number) => {
  const g = campaign ? await Gaunt.start(campaign, 'g1') : await Gaunt.start();
  g.j.put('party', place);
  await g.play(`=${watch}`);
  return g;
};
// What the page says on the way, and what the place itself shows now.
const seen = (g: Gaunt) => [g.page, ...(g.j.screen().prose as string[])].join(' ');
const learn = (g: Gaunt, fact: string) => g.j.assert('knows', 'party', `gaunt__${fact}`);

describe('A Winter in Carth: the calling voices', () => {
  it('a cleric at the byre sees a man who is being kept; a ranger at the deadfall a road no wolf was given; a thief in Heb\'s cellar the Fabric\'s smoke', async () => {
    const cleric = await at(build('cleric'), 'carth_byre', 1);
    expect(cleric.page).toMatch(/Somebody has been keeping him from going/);
    const ranger = await at(build('ranger'), 'deadfall', 12);
    expect(ranger.page).toMatch(/Five of them, and not one has put a foot down on its own/);
    const thief = await at(build('thief'), 'heb_cellar', 12);
    expect(thief.page).toMatch(/smoked, rubbed with ash and mutton fat/);
  }, 600000);

  it('a mage at the plinth reads that it was edited and not defaced; a bard at the Fat Lamb on Fastens\' Eve hears the gap in every tune; a warrior hears nothing', async () => {
    const mage = await at(build('mage'), 'minster_nave', 12);
    expect(mage.page).toMatch(/It was not defaced\. It was edited/);
    expect(mage.knows('plinth_lines')).toBe(true);
    const bard = await at(undefined, 'fat_lamb', 360);
    expect(bard.page).toMatch(/all four tunes stopped at the same place/);
    const warrior = await at(build('warrior'), 'minster_nave', 12);
    expect(warrior.page).not.toMatch(/edited/);
  }, 600000);
});

describe('A Winter in Carth: the first leaf of the Register', () => {
  it('only a cleric reads it; read, it is used once: to the woodmen, who stand down, or to the Lady, who counts her keys', async () => {
    const warrior = await at(build('warrior'), 'penitentiary', 20);
    expect(warrior.j.offers('read the first leaf of the Register')).toBe(false);

    const a = await at(build('cleric'), 'penitentiary', 20);
    expect(a.at('hawise')).toBe('penitentiary');
    await a.play('Have Sefa read the first leaf');
    expect(a.knows('first_leaf')).toBe(true);
    expect(a.page).toMatch(/Thirty-two named; thirty-one received/);
    expect(a.page).toMatch(/It does not say where he went/);
    // Used on the woodmen: the wood is the poor's by right, and the Lady is told nothing.
    a.j.put('party', 'wood_edge');
    await a.play('=24');
    expect(a.at('woodmen')).toBe('wood_edge');
    await a.play('Show the Wood-reeve\'s woodmen the Bishop\'s grant');
    expect(a.holds('grantShown', 'party')).toBe(true);
    expect(a.at('woodmen')).toBe('limbo');
    a.j.put('party', 'penitentiary');
    await a.play('=26');
    expect(a.j.offers('Lay the nine lines of the first leaf before Dame Hawise')).toBe(false);

    // Used on the Lady: she is moved a step, and the woodmen keep the wood.
    const b = await at(build('cleric'), 'penitentiary', 20);
    await b.play('Have Sefa read the first leaf');
    const before = b.measure('hawiseReasons', 'hawise');
    await b.play('Lay the nine lines of the first leaf before Dame Hawise');
    expect(b.page).toMatch(/Thirty-one,’ she says/);
    expect(b.measure('hawiseReasons', 'hawise')).toBe(before + 1);
    expect(b.holds('hawiseReadLeaf', 'hawise')).toBe(true);
    b.j.put('party', 'wood_edge');
    await b.play('=28');
    expect(b.j.offers('Show the Wood-reeve\'s woodmen')).toBe(false);
    expect(b.at('woodmen')).toBe('wood_edge');
  }, 900000);

  it('the Gate of Ash shows the empty thirty-second loop only to someone who has read the leaf; the rector\'s letter only where the Watch has taken him up', async () => {
    const looked = await at(build('cleric'), 'penitentiary', 20);
    learn(looked, 'first_leaf');
    looked.j.assert('verdictPutOut', 'consistory');
    looked.j.put('party', 'gate_of_ash');
    await looked.play('=482');
    expect(seen(looked)).toMatch(/a bare loop of iron/);
    const plain = await at(build('warrior'), 'gate_of_ash', 20);
    plain.j.assert('verdictPutOut', 'consistory');
    await plain.play('=482');
    expect(seen(plain)).not.toMatch(/a bare loop of iron/);

    const quiet = await at(build('warrior'), 'penitentiary', 20);
    expect(seen(quiet)).not.toMatch(/Rector of the House of Doors/);
    const loud = await Gaunt.start(build('warrior'), 'g1');
    loud.j.assert('befell', 'rector_taken');
    loud.j.put('party', 'penitentiary');
    await loud.play('=20');
    expect(seen(loud)).toMatch(/Rector of the House of Doors/);
  }, 900000);
});

describe('A Winter in Carth: the Bishop\'s Wood at dusk', () => {
  it('five wolves in the same prints; gone round downwind by someone who knows woodcraft, they do not come back that night, and are there again tomorrow', async () => {
    const g = await at(build('ranger'), 'deadfall', 48);
    expect(g.at('wolves')).toBe('deadfall');
    g.j.roll('pass');
    await g.play('Take the company and the sledge wide round the wolves');
    expect(g.holds('wolvesRounded', 'party')).toBe(true);
    expect(g.at('wolves')).toBe('limbo');
    await g.play('=60');
    expect(g.at('wolves')).toBe('limbo');
    // The next dusk they are back.
    await g.play('=192');
    expect(g.at('wolves')).toBe('deadfall');
  }, 600000);

  it('or sung at, with the Row\'s rhyme, by someone who has the end of it; and not offered to one who has not', async () => {
    const none = await at(undefined, 'deadfall', 48);
    expect(none.j.offers('Sing the Row\'s sliding rhyme')).toBe(false);
    const g = await at(undefined, 'deadfall', 48);
    learn(g, 'second_verse');
    g.j.roll('pass');
    await g.play('Sing the Row\'s sliding rhyme');
    expect(g.page).toMatch(/NOW WALK, said Oswy, into town the leader gets up/);
    expect(g.at('wolves')).toBe('limbo');
  }, 600000);
});

describe('A Winter in Carth: the seam, kept open, and the one scene of plain comedy', () => {
  it('an empty lantern-hook by day, and on Ash Day, once the course is set, a lantern on it that nobody takes down', async () => {
    const day = await at(undefined, 'tower_foot', 12);
    expect(seen(day)).toMatch(/a lantern-hook at its end/);
    const g = await at(undefined, 'tower_foot', 20);
    g.j.assert('courseSet', 'joby'); g.j.assert('pellowGone', 'pellow');
    await g.play('=487');
    expect(seen(g)).toMatch(/hung a horn lantern from the bracket/);
  }, 600000);

  it('a mage searching the lodge floor finds the older tower with a room at its head, and the lintel has a mark struck out', async () => {
    const g = await at(build('mage'), 'masons_lodge', 12);
    expect(seen(g)).toMatch(/chiselled out clean/);
    g.j.roll('pass');
    await g.play('Search here');
    expect(g.knows('lodge_under')).toBe(true);
  }, 600000);

  it('Hodge Peasegood sells hot chestnuts and an indulgence, a penny the pair, good in the Shambles; the Fat King is stuck in Bow Gate; Dent tells the Last Inch; the Doctor tells of the Veyran', async () => {
    const g = await at(undefined, 'shambles', 12);
    const gold = g.gold();
    await g.play('Ask Hodge Peasegood how an indulgence differs', 'Buy a paper of hot chestnuts and an indulgence');
    expect(g.page).toMatch(/It is the only honest article in the Commerce/);
    expect(g.gold()).toBe(gold - 1);
    expect(g.j.holds('carries', 'party', 'gaunt__chestnuts')).toBe(true);
    expect(g.j.holds('carries', 'party', 'gaunt__indulgence')).toBe(true);
    const eve = await at(undefined, 'shambles', 360);
    expect(seen(eve)).toMatch(/the Fat King has stuck/);
    const lamb = await at(undefined, 'fat_lamb', 12);
    await lamb.play('Ask Matthias Dent why every candle');
    expect(lamb.page).toMatch(/lawfullest thing in the Fat Lamb/);
    const schools = await at(undefined, 'schools', 12);
    await schools.play('Ask Doctor Ploughwright where the Faculty had');
    expect(schools.page).toMatch(/very thoughtful/);
  }, 900000);
});
