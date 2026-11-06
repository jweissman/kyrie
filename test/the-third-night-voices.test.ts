import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Wrayford, build, home } from './support/wrayford';

// The Third Night, broad pass (doc/imbar/adventures/wrayford.md): the company's callings speak in the city, a lamp is kept
// for no one living, a tale comes up the drove road from the south, and the Bargeman is put at its ease in two ways.
const toStep = ["To Northgate", "To the Market Cross", "Shambles", "Wharf", "bank under", "=103", "To Wade's Step"];
const wheels = ["To Northgate", "Into the Nine Wheels"];
const canonFact = (g: Wrayford, name: string, ...args: string[]) => {
  type Staged = { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
  const c = g.j.campaign as unknown as Staged;
  c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call(name, ...args) }]));
};

describe('The Third Night: the company speaks', () => {
  it('a ranger reads the sky from the drove road on the first morning, and the swallows are there for anyone', async () => {
    const g = await Wrayford.start();
    await g.play('Wait › A while');
    expect(g.page).toMatch(/Swallows down on the river at eight in the morning/);
    expect(g.page).toMatch(/skimming it so low their wings wet/);
    expect(g.holds('heardSky', 'party')).toBe(true);
  }, 120000);

  it('a bard at the Nine Wheels hears the carters hum the hymn and has it by heart', async () => {
    const g = await Wrayford.start(build('bard'));
    expect(g.knows('wade_hymn')).toBe(false);
    await g.play(...wheels);
    expect(g.holds('heardSong', 'party')).toBe(true);
    expect(g.knows('wade_hymn')).toBe(true);
    expect(g.page).toMatch(/That is a thing a whole road says when it is frightened/);
  }, 120000);

  it('a cleric reads the ten stones for what they are, and a thief and a warrior read the gate', async () => {
    const g = await Wrayford.start(build('cleric'));
    await g.play('To Northgate', 'To the Market Cross', 'Bridge End', 'To Bridge Street', 'To Overbridge Street', "Into Saint Wade's", "Out to Wade's Acre");
    expect(g.holds('heardOffice', 'party')).toBe(true);
    expect(g.page).toMatch(/Laid with their feet to the river/);
    const t = await Wrayford.start(build('thief'));
    await t.play('To Northgate', 'To the Market Cross', 'Bridge End');
    expect(t.page).toMatch(/Company lock, new, on a door older than the Company/);
    const w = await Wrayford.start(build('warrior'));
    await w.play('To Northgate', 'To the Market Cross', 'Bridge End');
    expect(w.page).toMatch(/Four, and no relief/);
  }, 240000);
});

describe('The Third Night: a tale from the south', () => {
  it('is told at the Nine Wheels only once the black square has been opened somewhere in the world', async () => {
    const g = await Wrayford.start();
    await g.play(...wheels);
    expect(g.j.offers('what the carters are saying from the south')).toBe(false);
    canonFact(g, 'befell', 'slack_opened');
    await g.play('Wait › A while');
    expect(g.j.offers('what the carters are saying from the south')).toBe(true);
    await g.play('what the carters are saying from the south');
    expect(g.page).toMatch(/A ship out of a cellar/);
    expect(g.knows('south_tale')).toBe(true);
  }, 120000);
});

describe('The Third Night: the Bargeman, put at its ease', () => {
  it('a bard sings the hymn at the Step: the pike lies still, the Wharf hears it, and the city is a little warmer', async () => {
    const g = await Wrayford.start(build('bard'));
    await g.play(...wheels, ...toStep);
    expect(g.j.offers('the office of the dead over the deep water')).toBe(false);
    expect(g.j.offers('the carters\' hymn over the deep water')).toBe(true);
    const before = g.measure('temper', 'wray');
    await g.play('the carters\' hymn over the deep water');
    expect(g.holds('tolerates', 'bargeman', 'party')).toBe(true);
    expect(g.measure('temper', 'wray')).toBe(before + 1);
    await g.play('To the tan-yards');
  }, 240000);

  it('a cleric says the office instead: quiet, slow, and nothing is said on the Wharf', async () => {
    const g = await Wrayford.start(build('cleric'));
    await g.play(...toStep);
    expect(g.j.offers('the carters\' hymn over the deep water')).toBe(false);
    expect(g.j.offers('say the office of the dead over the deep water')).toBe(true);
    const before = g.measure('temper', 'wray');
    await g.play('say the office of the dead over the deep water');
    expect(g.holds('tolerates', 'bargeman', 'party')).toBe(true);
    expect(g.holds('officeAtStep', 'party')).toBe(true);
    expect(g.measure('temper', 'wray')).toBe(before);
    await g.play('To the tan-yards');
  }, 240000);
});

describe('The Third Night: a contrast', () => {
  it('the Ferry Inn goes on trying its gander, and the company may speak for him', async () => {
    const g = await Wrayford.start();
    await g.play('To Northgate', 'To the Market Cross', 'Bridge End', 'To Bridge Street', 'To Overbridge Street', 'Ferry Inn');
    expect(g.page).toMatch(/Goose Assize/);
    await g.play('Speak for the gander');
    expect(g.holds('gooseTried', 'party')).toBe(true);
    expect(g.page).toMatch(/Not guilty|till tender/);
    if (g.holds('gooseFreed', 'party')) { expect(g.j.holds('holding', 'party', 'candle')).toBe(true); }
    expect(g.j.offers('Speak for the gander')).toBe(false);
  }, 240000);
});

describe('The Third Night: the hard man', () => {
  it('Gault, fed the widow\'s bread, lets a cloak down over the biggest of the three when he thinks the town is asleep', async () => {
    const g = await Wrayford.start();
    await g.fixture('bread', 'bread');
    await g.play('To the Market Cross', 'Bridge End', '=60', "Send Maudie Pardoe's bread up to the riders", 'To the Market Cross');
    await g.until(92);
    expect(g.holds('breadSent', 'party')).toBe(true);
    expect(g.page).toMatch(/a cloak comes over the parapet/);
  }, 240000);
});

describe('The Third Night: a lamp for no one living', () => {
  it('under the first arch there is a hook, and the sexton knows what it is for', async () => {
    const g = await Wrayford.start();
    await g.play('To Northgate', 'To the Market Cross', 'Shambles', 'Wharf', 'bank under');
    expect(g.knows('hook_seen')).toBe(true);
    expect(g.page).toMatch(/black ring of old tallow/);
    expect(home).toContain('third-night');
  }, 120000);

  it('Corbin lights it for the ones never carried over, and the light is the last thing the carrier sees from the Step', async () => {
    const g = await Wrayford.start();
    await g.play('To Northgate', 'To the Market Cross', 'Shambles', 'Wharf', 'bank under');
    await g.play('Wharf', 'Shambles', 'To the Market Cross', 'Bridge End', 'To Bridge Street', 'To Overbridge Street', "Into Saint Wade's", "Out to Wade's Acre", 'Talk to Corbin', 'who lights the hook');
    expect(g.knows('hook_known')).toBe(true);
    expect(g.page).toMatch(/You ask whether there is tallow/);
  }, 240000);

  it('and a carrier who has asked sees it burning from the far bank, with the dead on the back', async () => {
    const g = await Wrayford.start();
    canonFact(g, 'knows', 'party', 'wrayford__hook_known');
    await g.fixture('night-ford', 'day1', 'night1');
    expect(g.holds('spread', 'hook_fact')).toBe(true);
    expect(g.page).toMatch(/small yellow light, steady, on its hook/);
  }, 240000);
});
