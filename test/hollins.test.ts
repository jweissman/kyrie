import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Hollins, home, k } from './support/hollins';

// Behind the Wainscot (doc/adventures/behind-the-wainscot), played by the labels a player sees from the steps in
// test/fixtures/hollins. The company comes down the moor road into Bootscrape at eight on the first morning (watch 0);
// the Lady came home three days before and dies on the tenth night, whatever anyone does. Each journey is an ordinary
// protagonist (a human warrior, the campaign's default) unless it says otherwise.
describe('Behind the Wainscot', () => {
  it('lints clean', async () => {
    const findings = await KyrLint.campaign(home, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 120000);

  it('left alone, the house kills her: the boy in the trap, the colliers in the fire, the Jarl\'s poison in her sugar', async () => {
    const g = await Hollins.start();
    await g.play('To Bootscrape street', 'Into the Mat', 'Talk to Jory', 'Take a bed', '=day 7 08:00');
    expect(g.holds('watDead', 'wat')).toBe(true);
    expect(g.holds('collierDead', 'hollins')).toBe(true);
    expect(g.holds('haspPlots', 'hasp')).toBe(true);
    expect(g.holds('poisoned', 'lady')).toBe(true);
    expect(g.ending()).toEqual([k('tea')]);
    expect(g.page).toMatch(/what was in the sugar/);
  }, 300000);

  it('the Freehold: hired, the Hearth warned, the boy saved, the chart corrected and answered, the vault opened, the will made and lodged with the deed', async () => {
    const g = await Hollins.start();
    await g.fixture('freehold', 'hired', 'saltash', 'hearth');
    expect(g.holds('hiredBy', 'party', 'pye')).toBe(true);
    expect(g.holds('hearthWarned', 'hollins')).toBe(true);
    await g.fixture('freehold', 'readers');
    expect(g.state('lady_chart', 'corrected')).toBe(true);
    expect(g.raw('travelsWith', 'sorrel', 'party')).toBe(true);
    await g.fixture('freehold', 'trap');
    expect(g.holds('chartSeen', 'lady')).toBe(true);
    expect(g.holds('collierDead', 'hollins')).toBe(false);
    await g.fixture('freehold', 'answer');
    expect(g.holds('watDead', 'wat')).toBe(false);
    expect(g.holds('ladyKnows', 'lady')).toBe(true);
    expect(g.holds('belled', 'bishop')).toBe(true);
    await g.fixture('freehold', 'moot', 'vault');
    expect(g.holds('refugeesHoused', 'hollins')).toBe(true);
    expect(g.holds('underfolkEntered', 'annet')).toBe(true);
    expect(g.holds('deedLodged', 'party')).toBe(true);
    expect(g.knows('mother_letter')).toBe(true);
    await g.fixture('freehold', 'will');
    expect(g.holds('motherDelivered', 'lady')).toBe(true);
    expect(g.holds('willLodged', 'lady')).toBe(true);
    expect(g.holds('ladyForbids', 'lady')).toBe(true);
    expect(g.holds('sorrelStays', 'sorrel')).toBe(true);
    await g.fixture('freehold', 'end');
    expect(g.holds('smoked', 'hollins')).toBe(false);
    expect(g.ending()).toEqual([k('freehold')]);
    expect(g.page).toMatch(/SO YOU DO/);
    expect(g.page).toMatch(/first book in Hollins written by anyone who lived in its walls/);
  }, 600000);

  it('the Smoking: the poison forestalled by saving the boy and the colliers, but nothing done about the sulphur', async () => {
    const g = await Hollins.start();
    await g.fixture('smoking');
    expect(g.holds('haspPlots', 'hasp')).toBe(false);
    expect(g.holds('smoked', 'hollins')).toBe(true);
    expect(g.holds('choked', 'party')).toBe(true);
    expect(g.ending()).toEqual([k('smoking')]);
  }, 600000);

  it('Down the Ladder: the Moot told Bootscrape will take them in, and the Wainscot goes out before the smoke', async () => {
    const g = await Hollins.start();
    await g.fixture('ladder');
    expect(g.holds('evacPlanned', 'hollins')).toBe(true);
    expect(g.holds('refugeesHoused', 'hollins')).toBe(true);
    expect(g.holds('evacuated', 'hollins')).toBe(true);
    expect(g.ending()).toEqual([k('downladder')]);
  }, 600000);

  it('the Ratcatcher: the nest told to Mrs Pyecroft, the Smoking brought forward, and the account paid', async () => {
    const g = await Hollins.start();
    await g.fixture('ratcatcher');
    expect(g.holds('soldOut', 'party')).toBe(true);
    expect(g.holds('smoked', 'hollins')).toBe(true);
    expect(g.measure('smokeNight', 'hollins')).toBeLessThan(8);
    expect(g.ending()).toEqual([k('ratcatcher')]);
  }, 600000);

  it('the House Goes Cold: the sulphur bought up, the Wendle candles taken from the hatbox, and she never knew', async () => {
    const g = await Hollins.start();
    await g.fixture('cold');
    expect(g.measure('smokeNight', 'hollins')).toBe(9);
    expect(g.holds('candlesGone', 'pye')).toBe(true);
    expect(g.holds('smoked', 'hollins')).toBe(false);
    expect(g.ending()).toEqual([k('cold')]);
  }, 600000);

  it('Sold for Stone: the vault opened by the Under-folk\'s raft, the deed sold to Mr Overy, the sulphur forestalled', async () => {
    const g = await Hollins.start();
    await g.fixture('sold');
    expect(g.holds('underfolkEntered', 'annet')).toBe(true);
    expect(g.holds('deedSold', 'party')).toBe(true);
    expect(g.ending()).toEqual([k('sold')]);
  }, 600000);

  it('a bard: the Keys\' lost page paid out of the Post, the colliers on the bass, the First Air to the end, and the Lady down at the piano', async () => {
    const g = await Hollins.start('test/fixtures/hollins/bard.campaign.json');
    await g.fixture('concert');
    expect(g.holds('pageGiven', 'ludovic')).toBe(true);
    expect(g.holds('keysJumpers', 'party')).toBe(true);
    expect(g.holds('concertPlayed', 'party')).toBe(true);
    expect(g.holds('ladyAtPiano', 'lady')).toBe(true);
    expect(g.holds('ladyKnows', 'lady')).toBe(true);
  }, 600000);

  it('a thief: the letter delivered, the cat belled in its sleep, and Dame Honor Lacey brought before the Lady at tea', async () => {
    const g = await Hollins.start('test/fixtures/hollins/thief.campaign.json');
    await g.fixture('honor');
    expect(g.holds('letterRead', 'lady')).toBe(true);
    expect(g.holds('belled', 'bishop')).toBe(true);
    expect(g.holds('honorMet', 'honor')).toBe(true);
    expect(g.holds('ladyKnows', 'lady')).toBe(true);
    expect(g.holds('smallHouseLit', 'lady')).toBe(true);
    expect(g.page).toMatch(/We have mended everything/);
  }, 600000);

  it('a mage: the Wainscot paced out and drawn into the chart without Sorrel, in a hand learned from the Lady\'s own', async () => {
    const g = await Hollins.start('test/fixtures/hollins/mage.campaign.json');
    await g.fixture('mage');
    expect(g.raw('travelsWith', 'sorrel', 'party')).toBe(false);
    expect(g.holds('chartWritten', 'party')).toBe(true);
    expect(g.holds('ladyKnows', 'lady')).toBe(true);
  }, 600000);

  it('the back pantry ratted honestly: a real fight, real tails, the Jarl\'s pay and the dumbwaiter', async () => {
    const g = await Hollins.start();
    await g.fixture('rats');
    expect(g.holds('ratted', 'party')).toBe(true);
    expect(g.holds('ratsPaid', 'party')).toBe(true);
    expect(g.at('party')).toBe(k('landing'));
  }, 300000);

  it('the cat at night gives a moment\'s warning, and the Skirting is safe', async () => {
    const g = await Hollins.start();
    await g.play('To Bootscrape street', 'To the top of the doorstep', 'by the Slot', 'To the Letterdrift', 'To the Hall floor', '=20:55', '=+1');
    expect(g.page).toMatch(/You have a moment/);
    await g.play('To the Skirting', '=+6');
    expect(g.at('party')).toBe(k('skirting'));
    expect(g.j.campaign.world.test({ kind: 'call', name: 'able', args: ['party'] })).toBe(true);
  }, 300000);

  it('the Tin Regiment told whose traps they are: it marches on the hatbox; Fennick runs down unless wound', async () => {
    const g = await Hollins.start();
    await g.fixture('regiment');
    expect(g.holds('regimentMarched', 'regiment')).toBe(true);
    expect(g.holds('pyeStabbed', 'pye')).toBe(true);
    expect(g.holds('fennickStopped', 'fennick')).toBe(true);
  }, 300000);

  it('Mrs Pyecroft\'s ledger read and put to her: asked what she wants, she waits, and there is no Smoking', async () => {
    const g = await Hollins.start();
    await g.fixture('pyeturn');
    expect(g.knows('pye_ledger')).toBe(true);
    expect(g.holds('pyeWaits', 'pye')).toBe(true);
    expect(g.holds('smoked', 'hollins')).toBe(false);
  }, 600000);

  it('Sister Verity read the last page of the Child\'s diary, and the Clock is not stopped', async () => {
    const g = await Hollins.start();
    await g.fixture('verity');
    expect(g.holds('verityRelents', 'verity')).toBe(true);
    expect(g.state('long_clock', 'going')).toBe(true);
  }, 300000);

  it('the letter with the black seal delivered, answered, and carried to the stone on the moor', async () => {
    const g = await Hollins.start();
    await g.fixture('stone');
    expect(g.holds('replyLaid', 'party')).toBe(true);
    expect(g.holds('stoneTurned', 'party')).toBe(true);
    expect(g.page).toMatch(/single dried flower/);
  }, 300000);

  it('a ranger: in by the coal-hole, the strongbox levered with a giant\'s pin from Hob\'s yard, and the cat drawn off with catmint', async () => {
    const g = await Hollins.start('test/fixtures/hollins/ranger.campaign.json');
    await g.fixture('ranger');
    expect(g.holds('deedTaken', 'party')).toBe(true);
    expect(g.holds('catAway', 'bishop')).toBe(true);
    expect(g.page).toMatch(/rolling, kneading the air/);
  }, 300000);

  it('the Jarl\'s poison, learned of at the Nail and told to Mrs Pyecroft: the sugar goes on the fire', async () => {
    const g = await Hollins.start();
    await g.fixture('poison');
    expect(g.holds('haspPlots', 'hasp')).toBe(true);
    expect(g.holds('sugarSpilled', 'party')).toBe(true);
    expect(g.holds('poisoned', 'lady')).toBe(false);
  }, 600000);
});
