import { describe, expect, it } from 'bun:test';
import { Journey as Driver } from '../src/session/journey';
import phases from './fixtures/patient/journeys.json';

// The revision pass on The Patient Star: a thief sees the door nobody numbered, a clerk is kept at his board, a man
// held forty years may be called back or left (a choice with a price), the cairn lamp, and Kerra's book. Played by
// the labels a player sees, from the cutter of Quell with a debt.
const toRing = (phases.quell_to_hour as string[]).slice(0, (phases.quell_to_hour as string[]).indexOf('To the Granary Ring') + 1);
const homeToEnnick = ['To the Granary Ring', 'Up to the Plate Hall', 'Mirror Road, south stretch', 'Mirror Road, north stretch', 'To the West Gate', 'To the West Gallery, at the Neck',
  'To the foot of the North Well', 'To the North Well head', 'To the Shift Market', 'To the Ramp head', "To Ennick's lower road"];
const toDoran = ['To the upper terraces', "To the holders' cord", 'To the edge of the glass', 'To three hundred paces', "Doran's brick"];

class K {
  static start() { return Driver.start('test/fixtures/patient/deep.campaign.json', 'p'); }
  static async twelfth() {
    const j = await this.start();
    await j.play(...toRing);
    return j;
  }
  static page(j: Driver) { return j.taken.map(t => `${t.page} ${t.told}`).join('\n'); }
  static knows(j: Driver, fact: string) { return j.holds('knows', 'party', `season__${fact}`); }
  static is(j: Driver, rel: string, ...args: string[]) { return j.holds(`season__${rel}`, ...args.map(a => a === 'party' ? a : `season__${a}`)); }
}

describe('The Patient Star, the revision pass', () => {
  it('a thief sees the second bolt, and the kept clerk says a twelfth word after the eleven', async () => {
    const j = await K.twelfth();
    expect(K.page(j)).toContain('the second bolt is up in the lintel');
    await j.play('To the twelfth vault', 'Lay a hand on the clerk');
    const said = K.page(j);
    expect(said).toContain("'Venn.'");
    expect(K.knows(j, 'twelfth_word')).toBe(true);
  }, 300000);

  it('says the twelfth word over Doran: he walks home, his family speak, and he is dead by the next dusk', async () => {
    const j = await K.twelfth();
    await j.play('To the twelfth vault', 'Lay a hand on the clerk', ...homeToEnnick, ...toDoran);
    await j.play('Say the twelfth word');
    expect(K.page(j)).toContain('Is the fire kept?');
    expect(K.is(j, 'twelfthSaid', 'ennick')).toBe(true);
    // The other answer is closed by this one.
    expect(j.choices().some(c => /Lay a hand on Doran's brick, and say nothing/.test(c.full ?? c.label))).toBe(false);
    await j.play('To three hundred paces', 'To the edge of the glass', "To the holders' cord", 'To the upper terraces', "To Ennick's lower road", "Into the holder's house");
    await j.play('Ask Doran what the forty years', 'Speak to Bren after his father', 'Speak to Ilis in the doorway');
    const page = K.page(j);
    expect(page).toContain('A long afternoon');
    expect(page).toContain('so that I need not find out if he could');
    expect(page).toContain('Tonight I am going to sit by him and not be sensible');
    expect(K.is(j, 'doranGone', 'ennick')).toBe(false);
    await j.play('=' + (j.measure('watch', 'clock') + 160));
    expect(K.is(j, 'doranGone', 'ennick')).toBe(true);
    expect(K.page(j)).toContain('twelve words');
  }, 300000);

  it('keeps the word instead: Doran stays held, and Ilis is told it on her own terms', async () => {
    const j = await K.twelfth();
    await j.play('To the twelfth vault', 'Lay a hand on the clerk', ...homeToEnnick, ...toDoran);
    await j.play('Lay a hand on Doran.s brick, and say nothing');
    expect(K.is(j, 'twelfthKept', 'ennick')).toBe(true);
    expect(j.choices().some(c => /Say the twelfth word/.test(c.full ?? c.label))).toBe(false);
    await j.play('To three hundred paces', 'To the edge of the glass', "To the holders' cord", 'To the upper terraces', "To Ennick's lower road", "Into Ilis's house", 'Talk to Ilis', 'Tell Ilis what the clerk said');
    expect(K.page(j)).toContain('So it had a last word');
    expect(K.is(j, 'doranGone', 'ennick')).toBe(false);
  }, 300000);

  it('the cairn lamp keeps the wolves off a company caught at the cord after dark', async () => {
    const j = await K.start();
    await j.play('Rusk.*Buy › An umber felt', 'Pack › An umber felt cloak › Equip', 'Rusk.*Buy › A horn lantern', 'To the Ramp head', "To Ennick's lower road", 'To the upper terraces', "To the holders' cord");
    for (let i = 0; i < 12 && !j.holds('dark'); i++) { await j.step('The company: Wait › Until'); }
    expect(j.holds('dark')).toBe(true);
    expect(j.choices().some(c => /Light the lantern in the cairn/.test(c.full ?? c.label))).toBe(false);
    await j.play('a candle: Light');
    expect(j.choices().some(c => /Light the lantern in the cairn/.test(c.full ?? c.label))).toBe(true);
    await j.play('Light the lantern in the cairn');
    expect(K.is(j, 'cairnLit', 'party')).toBe(true);
    expect(j.holds('tolerates', 'season__wolves', 'party')).toBe(true);
  }, 300000);

  it('Kerra Lowe\'s book has every guest down as a turnip merchant', async () => {
    const j = await K.start();
    await j.play('To the Ramp head', "To Ennick's lower road", "Into the Lower Inn", 'Talk to Kerra', "Office's book");
    expect(K.page(j)).toContain('turnip merchant');
    await j.play('why nobody from the upper terraces');
    expect(K.page(j)).toContain('The cat died in 190');
  }, 300000);
});
