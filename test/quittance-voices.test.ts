import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';
import { Ds } from './support/quittance-descent';

// The company's callings in Quittance (voices.kyr), the quarrel at Gasket Yard, the three ways through that only a
// ranger, a cleric or a warrior has, and the depth/links of depth.kyr (saucers, strokes, the Hen, the Fire's answers).
// The preset party is Elen the ranger, Bran the warrior, Dori the cleric.
const rel = (j: any, r: string) => City.has(j, r, 'party');
const said = (j: any) => City.said(j) + ' ' + City.pages(j);

describe('Quittance: the callings', () => {
  it('speaks once for each calling, in its own place, and not for a company that lacks the calling', async () => {
    const j = await Ds.start();
    Ds.at(j, 'candlewick');
    await j.step('Wait › A while');
    expect(rel(j, 'qv_hCourt')).toBe(true);
    expect(said(j)).toContain('Not spilled: laid');
    Ds.at(j, 'drill_yard');
    await j.step('Wait › A while');
    expect(rel(j, 'qv_hDrill')).toBe(true);
    Ds.at(j, 'queue_hall');
    await j.step('Wait › A while');
    expect(rel(j, 'qv_hQueue')).toBe(true);
    Ds.at(j, 'hearn_hearth');
    await j.step('Wait › A while');
    expect(rel(j, 'qv_hHearth')).toBe(true);
    expect(said(j)).toContain('how a guest behaves');

    const k = await Ds.start(['warrior', 'cleric', 'mage']);   // no ranger to read the gutter
    Ds.at(k, 'candlewick');
    await k.step('Wait › A while');
    expect(rel(k, 'qv_hCourt')).toBe(false);
  }, 240000);

  it('gives a ranger the Gasket Yard\'s dry well, and nobody else', async () => {
    const j = await Ds.start();
    Ds.at(j, 'gasket_yard');
    Ds.put(j, 'assert', 'knows', 'party', 'd_gasket_next');
    expect(j.offers('Read the ground round the dry well')).toBe(true);
    await j.play('Read the ground round the dry well');
    expect(rel(j, 'qv_cistern')).toBe(true);
    expect(rel(j, 'gasketSaved')).toBe(true);
    await j.play('=day 7 08:00');
    expect(City.has(j, 'burned', 'gasket_yard')).toBe(false);
    expect(j.measure(Q('casualties'), Q('city'))).toBe(19);          // Candlewick, which nobody warned; the Yard cost nothing

    const k = await Ds.start(['warrior', 'cleric', 'mage']);
    Ds.at(k, 'gasket_yard');
    Ds.put(k, 'assert', 'knows', 'party', 'd_gasket_next');
    expect(k.offers('Read the ground round the dry well')).toBe(false);
  }, 240000);

  it('puts the quarrel at the Yard, and each answer costs what the other buys', async () => {
    const w = await Ds.start();
    Ds.at(w, 'gasket_yard');
    Ds.put(w, 'assert', 'knows', 'party', 'd_gasket_next');
    Ds.num(w, 'regard', [ 'wardsfolk' ], 1);
    await w.step('Wait › A while');
    expect(rel(w, 'qv_quarrelled')).toBe(true);
    expect(said(w)).toContain('Both are waiting for you to say which of them is right');
    expect(w.offers('Tell Dori that Bran is right')).toBe(true);
    expect(w.offers('Tell Bran that Dori is right')).toBe(true);
    await w.play('Tell Dori that Bran is right');
    expect(rel(w, 'qv_sidedWarrior')).toBe(true);
    expect(rel(w, 'gasketSaved')).toBe(true);                       // the Yard stands ...
    expect(w.measure(Q('regard'), Q('wardsfolk'))).toBe(0);         // ... and the Wards think less of the company
    expect(w.offers('Tell Bran that Dori is right')).toBe(false);   // one answer closes the other

    const c = await Ds.start();
    Ds.at(c, 'gasket_yard');
    Ds.put(c, 'assert', 'knows', 'party', 'd_gasket_next');
    Ds.num(c, 'regard', [ 'wardsfolk' ], 1);
    await c.step('Wait › A while');
    await c.play('Tell Bran that Dori is right');
    expect(rel(c, 'qv_sidedCleric')).toBe(true);
    expect(c.measure(Q('regard'), Q('wardsfolk'))).toBe(2);         // the Wards remember who told them
    expect(rel(c, 'gasketSaved')).toBe(false);
    Ds.at(c, 'wards_gate');                                         // the company does not stand in the oil
    await c.play('=day 7 08:00');
    expect(City.has(c, 'burned', 'gasket_yard')).toBe(true);        // the Yard burns, empty
    expect(c.measure(Q('casualties'), Q('city'))).toBe(19);         // Candlewick's, and not one more
  }, 240000);

  it('lets a cleric say the Office over the Fire\'s hearth, and a company without one cannot', async () => {
    const j = await Ds.toFire();
    await Ds.speak(j);
    const before = Ds.accord(j);
    expect(j.offers('Let Dori say the Office')).toBe(true);
    await Ds.ask(j, 'Let Dori say the Office');
    expect(Ds.accord(j) - before).toBe(3);
    expect(rel(j, 'qv_office')).toBe(true);
    expect(j.offers('Let Dori say the Office')).toBe(false);

    const k = await Ds.toFire(['warrior', 'mage', 'thief']);
    await Ds.speak(k);
    expect(k.offers('say the Office')).toBe(false);
  }, 240000);

  it('lets a warrior count the Tithe men out of their cans', async () => {
    const j = await Ds.start();
    Ds.at(j, 'cinder_ward');
    Ds.put(j, 'assert', 'tithePrepared', 'city');
    Ds.put(j, 'assert', 'at', 'tithe_burners', 'cinder_ward');
    expect(j.offers('Let Bran walk the line')).toBe(true);
    await j.play('Let Bran walk the line');
    expect(rel(j, 'qv_lined')).toBe(true);
    expect(j.offers('Let Bran walk the line')).toBe(false);          // once, win or lose
    const k = await Ds.start(['cleric', 'ranger', 'mage']);
    Ds.at(k, 'cinder_ward');
    Ds.put(k, 'assert', 'tithePrepared', 'city');
    Ds.put(k, 'assert', 'at', 'tithe_burners', 'cinder_ward');
    expect(k.offers('walk the line')).toBe(false);
  }, 240000);
});

describe('Quittance: depth, persons and links', () => {
  it('sets the saucers on the Row, and the Fire answers them; the strokes on the stair are answered only if looked at', async () => {
    const j = await Ds.start();
    Ds.at(j, 'row_street');
    await j.step('Wait › A while');
    expect(Ds.knows(j, 'qv_saucers')).toBe(true);
    Ds.at(j, 'cellar_foot');
    await j.step('Wait › A while');
    expect(Ds.knows(j, 'qv_strokes')).toBe(true);
    Ds.at(j, 'hearth_below');
    await Ds.speak(j);
    const a0 = Ds.accord(j);
    await Ds.ask(j, 'Ask the Fire what the saucers of salt');
    expect(Ds.accord(j) - a0).toBe(1);
    await Ds.ask(j, 'Ask the Fire about the eleven strokes');
    expect(Ds.knows(j, 'qv_twelfth_place')).toBe(true);
    // The twelfth place, filled by a Hearthkeeper who stays.
    Ds.put(j, 'assert', 'fireTermKeeper', 'party');
    await j.step('Wait › A while');
    expect(said(j)).toContain('one stroke more than there was');
    expect(said(j)).toContain('Twelve');

    const k = await Ds.toFire();
    await Ds.speak(k);
    expect(k.offers('about the eleven strokes')).toBe(false);        // nobody who did not look can ask
    expect(k.offers('saucers of salt')).toBe(false);
  }, 240000);

  it('plays the pigeon at the Hen: a claim adjusted, coin and a twist of guest-salt given, the salt laid before the Fire', async () => {
    const j = await Ds.start();
    Ds.at(j, 'hen_taproom');
    await j.play('Talk to Bertram Spode', 'Ask Mr Spode what the claim is', 'Take your leave');
    expect(j.offers('Adjust the Ambrose claim')).toBe(true);
    const g0 = Ds.gold(j);
    await j.play('Adjust the Ambrose claim');
    expect(Ds.gold(j) - g0).toBe(2);
    expect(rel(j, 'qv_pigeonSettled')).toBe(true);
    expect(j.holds('holding', 'party', 'qv_salt_kind')).toBe(true);
    expect(j.offers('Adjust the Ambrose claim')).toBe(false);
    Ds.at(j, 'hearth_below');
    await Ds.speak(j);
    const a0 = Ds.accord(j);
    await j.play('Lay the twist of guest-salt');
    expect(Ds.accord(j) - a0).toBe(2);
    expect(j.holds('holding', 'party', 'qv_salt_kind')).toBe(false);
  }, 240000);

  it('shows Skelter at his candle after a fire that took nineteen, and he hands over the book unforced', async () => {
    const j = await Ds.start();
    Ds.at(j, 'skelter_room');
    Ds.put(j, 'assert', 'burned', 'candlewick');
    await j.play('Talk to Mr Skelter', 'Ask Mr Skelter why the candle');
    expect(j.holds('holding', 'party', 'skelter_book')).toBe(true);
    expect(Ds.knows(j, 'd_skelter_book')).toBe(true);
  }, 240000);

  it('reads two things from outside: a Watch\'s tally the Fire calls kept and not owed, and a door opened under a college far away', async () => {
    const j = await Ds.toFire();
    j.give('watch_tally');
    await Ds.speak(j);
    expect(j.offers('Show the Fire a Watch')).toBe(true);
    const a0 = Ds.accord(j);
    await Ds.ask(j, 'Show the Fire a Watch');
    expect(Ds.accord(j) - a0).toBe(2);
    expect(said(j)).toContain('Kept');
    expect(j.offers('a door has been opened')).toBe(false);          // nothing has befallen elsewhere in this world
    j.assert('befell', 'slack_opened');
    expect(j.offers('a door has been opened')).toBe(true);
  }, 240000);
});
