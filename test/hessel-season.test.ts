import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Hessel, build } from './support/hessel';

// The Banns at Hessel: the layer added in the broad pass (doc/imbar/adventures/hessel.md): the Season's bill, the
// peal on
// the third morning, the King's Hesitation at the Ball, the Colonel on the end bed, and calling voices.
const phases = JSON.parse(readFileSync('test/fixtures/hessel/rooms.json', 'utf8')) as Record<string, string[]>;
const upTo = ['arrive', 'up', 'twiss', 'noon', 'dusk', 'sleep', 'day2', 'afternoon2', 'night2', 'day3'];
const asked = 'Ask Mr Twiss for one dance more';

// The standard Rooms route to the Ball (a bard's), stopped at the minute before Mrs Cherrett's last dance is asked for.
async function toTheLastDance(): Promise<Hessel> {
  const g = await Hessel.start();
  for (const k of upTo) { await g.play(...phases[k]!); }
  const day4 = phases.day4!;
  await g.play(...day4.slice(0, day4.indexOf(asked)));
  return g;
}

describe('The Banns at Hessel: voices, the peal, the bill and the Colonel', () => {
  it('speaks to a bard on Stall Street and in the Pump Room, and shows the Season\'s bill to anyone', async () => {
    const g = await Hessel.start();
    await g.play('Lim Bridge', 'Quay Lane', 'Stall Street');
    expect(g.page).toMatch(/They are calling the Parade/);
    await g.play('To the Abbey Yard', 'Into the Pump Room');
    expect(g.page).toMatch(/Four conversations, and every one of them has the same rhythm/);
    // The bill signposts the peal and the Ball before either is reached.
    expect(g.page).toMatch(/Saint Ebba.s rings the Season.s peal on the third morning/);
    expect(g.page).toMatch(/THE BAND TO STOP AT ELEVEN/);
  }, 120000);

  it('lets a bard hear the twelfth bar in the Sunday peal, and keeps it from a thief', async () => {
    const g = await Hessel.start();
    for (const k of upTo.slice(0, -1)) { await g.play(...phases[k]!); }
    await g.play('Out to Stall Street', 'To the Abbey Yard');
    expect(g.page).toMatch(/the sixth bell falls a half-beat behind/);
    expect(g.knows('fourth_change')).toBe(true);
    const thief = await Hessel.start(build('thief'));
    await thief.play('Lim Bridge', 'Quay Lane', 'Stall Street', 'To the Abbey Yard', '=282');
    expect(thief.page).toMatch(/the sixth bell falls a half-beat behind/);
    expect(thief.knows('fourth_change')).toBe(false);
  }, 240000);

  it('lets the bard hum the missing bar aloud: the Rule breaks, the old woman dances, and the Rooms stay up', async () => {
    const g = await toTheLastDance();
    expect(g.knows('fourth_change')).toBe(true);
    expect(g.j.offers('Hum the missing twelfth bar aloud')).toBe(true);
    await g.play('Hum the missing twelfth bar aloud');
    expect(g.holds('ruleBroken', 'party')).toBe(true);
    expect(g.holds('cherrettDanced', 'cherrett')).toBe(true);
    expect(g.page).toMatch(/I think we are going to have to dance/);
    await g.until();
    expect(g.ending()).toEqual(['last_dance']);
  }, 300000);

  it('lets the bard hum it to Mr Twiss alone instead, and the Rule stands', async () => {
    const g = await toTheLastDance();
    const before = g.measure('twissFavour', 'twiss');
    await g.play('Hum the missing twelfth bar to Mr Twiss');
    expect(g.holds('barPrivate', 'party')).toBe(true);
    expect(g.holds('ruleBroken', 'party')).toBe(false);
    expect(g.measure('twissFavour', 'twiss')).toBe(before + 2);
    expect(g.page).toMatch(/I was seven/);
  }, 300000);

  it('sits up with Colonel Ede through the night, and the sister lets the stranger sleep', async () => {
    const g = await Hessel.start();
    await g.play('Lim Bridge', 'Quay Lane', 'Stall Street', 'Into the Hospital');
    await g.play('Ask Colonel Ede about his regiment');
    expect(g.page).toMatch(/number of buttons on every/);
    for (let turn = 0; turn < 40 && !g.j.offers('Sit up with Colonel Ede'); turn++) { await g.play('Wait › An hour'); }
    await g.play('Sit up with Colonel Ede');
    expect(g.holds('satWithEde', 'party')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/let the stranger sleep another hour/);
  }, 300000);

  it('buries him in his boots if nobody sat with him', async () => {
    const g = await Hessel.start();
    await g.fixture('alone');
    await g.until();
    expect(g.page).toMatch(/was buried on the Tuesday in his boots/);
  }, 240000);

  it('lets Mrs Scrope hear of a stair under a college only in a world where it was found', async () => {
    const closed = await Hessel.start();
    await closed.play('Lim Bridge', 'Quay Lane', 'Stall Street', 'To the Abbey Yard', 'Into the Pump Room');
    expect(closed.page).not.toMatch(/black stair was found in a floor/);
    const opened = await Hessel.start();
    opened.j.assert('befell', 'slack_opened');
    await opened.play('Lim Bridge', 'Quay Lane', 'Stall Street', 'To the Abbey Yard', 'Into the Pump Room');
    expect(opened.page).toMatch(/black stair was found in a floor/);
  }, 120000);
});
