import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Long Man, what the company is for (doc/imbar/adventures/the-long-man.md): the shipped party (ranger, warrior,
// cleric) played by the labels a player sees. Nothing here is given, put or asserted except where a test says so.
const home = 'data/campaigns/the-long-man.campaign.json';
const told = (j: Journey) => j.taken.map(x => `${x.page} ${x.told}`).join('\n');
// (the page curls its quotes; a pattern here steers clear of them)

describe('The Long Man, the ranger\'s drain', () => {
  it('lets the shipped ranger into the sluice chamber without the steward\'s key, the grate or the steward\'s ill will', async () => {
    const j = await Journey.start(home, 'drain');
    await j.play('>taproom', 'Buy › A torch', '>springs');
    expect(j.holds('knows', 'party', 'longman__drain_known')).toBe(false);
    expect(j.offers('Walk the ditch at the springs')).toBe(true);
    await j.play('Walk the ditch at the springs');
    expect(j.holds('knows', 'party', 'longman__drain_known')).toBe(true);
    expect(j.offers('Walk the ditch at the springs')).toBe(false);
    await j.play('>sluice', 'a torch: Light');
    expect(j.at('party')).toBe('longman__sluice');
    // The key is the Hall's, and was never asked for; the grate is as it was; the steward has no quarrel with them.
    expect(j.holds('state', 'grate', 'locked')).toBe(true);
    expect(j.holds('holding', 'party', 'cell_key')).toBe(false);
    expect(j.holds('hostile', 'venn', 'party')).toBe(false);
    expect(told(j)).toMatch(/Nobody at the Hall knows you are inside the hill/);
  }, 240000);
  it('is not a way for a company that has no ranger: the ground is read by a ranger or not at all', async () => {
    const j = await Journey.start(home, 'drain-without', {
      party: [{ name: 'Bran', raceId: 'human', classId: 'warrior' }, { name: 'Dori', raceId: 'dwarf', classId: 'cleric' },
        { name: 'Fenn', raceId: 'human', classId: 'thief' }] });
    await j.play('>springs');
    expect(j.offers('Walk the ditch at the springs')).toBe(false);
    expect(j.holds('knows', 'party', 'longman__drain_known')).toBe(false);
  }, 120000);
  it('leaves the ordinary way as it was: the steward lends his key to a company that asks', async () => {
    const j = await Journey.start(home, 'key');
    await j.play('>study', 'Ask Aldous Venn about the Mower', "Take the steward's iron key from the hook", '>springs', '>hollow_door');
    expect(j.holds('holding', 'party', 'cell_key')).toBe(true);
    await j.play('Unlock the grate');
    expect(j.holds('state', 'grate', 'open')).toBe(true);
  }, 240000);
});

describe('The Long Man, the quarrel is a choice', () => {
  const toQuarrel = async (seed: string) => {
    const j = await Journey.start(home, seed);
    // The notice is on the Ox's door; the notches are down the gauge shaft. Both are read, not handed over.
    await j.play('>taproom', 'Buy › A torch', '>green', '>study', 'Ask Aldous Venn about the Mower', '>crest', '>gauge_head',
      '>gallery', 'a torch: Light', '>shaft_foot', 'Read the notches');
    return j;
  };
  it('lets the warrior\'s way buy a foreman and shut out the chapel; the cleric\'s way wake the priest, and the other not both', async () => {
    const w = await toQuarrel('quarrel-w');
    await w.play('>green');
    expect(w.page).toMatch(/Forty crowns is forty crowns/);
    expect(w.holds('quarrelled', 'party')).toBe(true);
    await w.play('is right about the forty crowns');
    expect(w.holds('sidedWarrior', 'party')).toBe(true);
    expect(w.holds('promisedDoor', 'dunnet')).toBe(true);
    expect(w.holds('convinced', 'ysolt')).toBe(false);
    expect(w.offers('is right, and take the font to Mother Ysolt')).toBe(false);
    const c = await toQuarrel('quarrel-c');
    await c.play('>green', 'is right, and take the font to Mother Ysolt');
    expect(c.holds('sidedCleric', 'party')).toBe(true);
    expect(c.holds('convinced', 'ysolt')).toBe(true);
    expect(c.holds('promisedDoor', 'dunnet')).toBe(false);
    expect(c.offers('is right about the forty crowns')).toBe(false);
  }, 300000);
});

describe('The Long Man, the priest and the reeve', () => {
  it('has Mother Ysolt, told the notches, change her sermon, and the font show it', async () => {
    const j = await Journey.start(home, 'sermon');
    await j.play('>taproom', 'Buy › A torch', '>crest', '>gauge_head', '>gallery', 'a torch: Light', '>shaft_foot', 'Read the notches', '>nave');
    expect(j.offers('what she will preach on Sunday')).toBe(false);
    await j.play('Tell Mother Ysolt what the notches on the font are');
    expect(j.holds('convinced', 'ysolt')).toBe(true);
    await j.play('what she will preach on Sunday');
    expect(told(j)).toMatch(/A wall can only be mended/);
    expect(j.holds('sermonChanged', 'ysolt')).toBe(true);
    await j.play('=+1');
    expect(j.page).toMatch(/capitals, HERE/);
  }, 300000);
  it('has Gammer Coller give up the reeve\'s rod, once she has seen it fit the wheel and does not need to pretend', async () => {
    const j = await Journey.start(home, 'rod');
    expect(j.offers('Tell Gammer Coller the rod fits a wheel')).toBe(false);
    await j.play('>crest', '=until knows(party, mower_keeps)', '>reeve_room', 'about the rod', 'for the loan', '^Take',
      '>lakeshore', 'push the punt', '>water_house');
    expect(j.holds('knows', 'party', 'longman__rod_fits')).toBe(true);
    await j.play('>reeve_room', 'Tell Gammer Coller the rod fits a wheel');
    expect(told(j)).toMatch(/I knew they measured it and I did not want to be the one who knew/);
    expect(j.holds('rodGiven', 'nell')).toBe(true);
    expect(j.holds('holding', 'party', 'sluice_rod')).toBe(true);
    expect(j.offers('Tell Gammer Coller the rod fits a wheel')).toBe(false);
  }, 240000);
});

describe('The Long Man, off the road', () => {
  it('has a hum at the springs and a quarrel over the time at the Ox', async () => {
    const j = await Journey.start(home, 'hum');
    await j.play('>taproom', 'Ask Martin Pask about the two clocks');
    expect(told(j)).toMatch(/owed money by a dead man/);
    expect(j.offers('Ask Martin Pask about the two clocks')).toBe(false);
    await j.play('>springs', '=+1');
    expect(j.page).toMatch(/feel the Long Man in your back teeth/);
  }, 240000);
});
