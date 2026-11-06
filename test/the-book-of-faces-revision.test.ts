import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Pound's first page (doc/imbar/adventures/book-of-faces.md): the Collegium of Measures' Bursar, the assay stair
// and
// its Counterpoise, the case with a second lock, the company's quarrel, the voices. Played by the labels a player sees,
// with a company of four (Elen the ranger, Mirel the thief, Dori the cleric, Tam the warrior).
const campaign = 'test/fixtures/book-of-faces/company.campaign.json';
const k = (id: string) => `ombra__${id}`;
class Row {
  static start(seed = 'merrow') { return Journey.start(campaign, seed); }
  static at(j: Journey) { return j.campaign.world.one('at', 'party'); }
  static async toCellar(j: Journey, how: string) {
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does');
    if (how === 'fee') { await j.play('Pay the Bursar the three-coin fee'); }
    await j.play('>ombra__rv_landing');
  }
}

describe('The Book of Faces, the Collegium of Measures', () => {
  it('lets the Bursar be asked about the hooks, and about owed and kept, and sells a chit for the schedule', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', 'Ask why she says everything is owed');
    expect(j.page).toContain('A measure has no opinion');
    expect(j.holds('knows', 'party', k('rv_owed_kept'))).toBe(true);
    await j.play('Ask about the eleven hooks');
    expect(j.page).toContain('it comes out light by a grain');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Pay the Bursar the three-coin fee');
    expect(j.holds('carries', 'party', k('rv_chit'))).toBe(true);
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 3);
  }, 200000);
});

describe('The Book of Faces, the assay stair', () => {
  it('is guarded by a Counterpoise, and the chit is a way round it', async () => {
    const j = await Row.start();
    await Row.toCellar(j, 'fee');
    expect(Row.at(j)).toBe(k('rv_landing'));
    // Without a way round it, the stair is a fight or a slip: the page offers both.
    expect(j.matches('^Attack').length).toBe(1);
    await j.play('Show the Counterpoise the Bursar');
    expect(j.holds('tolerates', k('rv_counterpoise'), 'party')).toBe(true);
    await j.play('^To the assay cellar');
    expect(Row.at(j)).toBe(k('rv_assay'));
  }, 200000);
});

describe('The Book of Faces, the Pound\'s case', () => {
  const down = async (j: Journey) => {
    await Row.toCellar(j, 'fee');
    await j.play('Show the Counterpoise the Bursar', '^To the assay cellar');
  };
  it('hides the second lock from everyone but the thief, who finds it', async () => {
    const j = await Row.start();
    await down(j);
    await j.play('Look the Pound.s case over');
    expect(j.page).toContain('you have not the eye for it');
    expect(j.holds('carries', 'party', k('rv_page'))).toBe(false);
    await j.play('Have Mirel feel under the pan');
    expect(j.holds('carries', 'party', k('rv_page'))).toBe(true);
    expect(j.page).toContain('A second lock, felt from below');
    // The company disagrees, and each is right.
    expect(j.page).toContain('Neither is wrong');
  }, 300000);
  it('lets the cleric carry the day: the leaf goes back, the Bursar is told, and eight coin come of it', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', 'Ask about the eleven hooks', 'Pay the Bursar the three-coin fee', '>ombra__rv_landing', 'Show the Counterpoise the Bursar', '^To the assay cellar', 'Have Mirel feel under the pan');
    await j.play('Tell Mirel that Dori is right');
    expect(j.holds(k('rv_page_returned'), 'party')).toBe(true);
    expect(j.holds('carries', 'party', k('rv_page'))).toBe(false);
    await j.play('>ombra__collegium_hall');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Tell the Bursar where the leaf is');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 8);
  }, 300000);
  it('lets the thief carry the day: the leaf leaves the cellar, and the Bursar cannot be told', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', 'Ask about the eleven hooks', 'Pay the Bursar the three-coin fee', '>ombra__rv_landing', 'Show the Counterpoise the Bursar', '^To the assay cellar', 'Have Mirel feel under the pan');
    await j.play('Tell Dori that Mirel is right');
    expect(j.holds(k('rv_page_kept'), 'party')).toBe(true);
    expect(j.holds('carries', 'party', k('rv_page'))).toBe(true);
    await j.play('>ombra__collegium_hall');
    expect(j.matches('Tell the Bursar where the leaf is').length).toBe(0);
    // Dr Thole, who is shown it, does his arithmetic in a mask.
  }, 300000);
});

describe('The Book of Faces, the Master\'s recitative and the leaf shown', () => {
  // Seed 'b': the slate is read at the first asking, so that Dr Thole can be spoken with.
  it('lets Dr Thole call down the stair in the old recitative, and does his arithmetic in a mask when shown the leaf', async () => {
    const j = await Row.start('b');
    await j.play('>ombra__collegium_study', 'Write your question on his slate');
    expect(j.holds('mg_audience', 'party')).toBe(true);
    await j.play('Ask what is down the stair', 'Ask Dr Thole to call down the stair', '>ombra__rv_landing');
    expect(j.holds('tolerates', k('rv_counterpoise'), 'party')).toBe(true);
    await j.play('^To the assay cellar', 'Have Mirel feel under the pan', 'Tell Dori that Mirel is right');
    expect(j.holds(k('rv_page_kept'), 'party')).toBe(true);
    await j.play('>ombra__collegium_study', 'Show Dr Thole the first leaf');
    expect(j.page).toContain('HELD BY WHOM');
    expect(j.page).toContain('KEPT');
    expect(j.holds(k('rv_thole_masked'), 'party')).toBe(true);
  }, 300000);
  it('has Orsolya Hart refuse the leaf, and say why', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', 'Ask about the eleven hooks', 'Pay the Bursar the three-coin fee', '>ombra__rv_landing', 'Show the Counterpoise the Bursar', '^To the assay cellar', 'Have Mirel feel under the pan', 'Tell Dori that Mirel is right');
    await j.play('>ombra__candid_room', 'Show Orsolya Hart the first leaf');
    expect(j.page).toContain('Do not give it to me');
    expect(j.holds('carries', 'party', k('rv_page'))).toBe(true);
  }, 300000);
});

describe('The Book of Faces, the Counterpoise fought', () => {
  it('offers the fight and takes it; the Weight is broken, the Bursar will not speak of the hook, and the vigil cannot be sat', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', '>ombra__rv_landing');
    for (let i = 0; i < 12 && !j.holds(k('rv_cp_broken'), 'party'); i++) { await j.play('Attack'); }
    expect(j.holds(k('rv_cp_broken'), 'party')).toBe(true);
    await j.play('^To the assay cellar', '=21:00');
    expect(j.matches('Sit the night watch').length).toBe(0);
    await j.play('>ombra__collegium_hall');
    expect(j.matches('Ask about the eleven hooks').length).toBe(0);
  }, 300000);
});

describe('The Book of Faces, the vigil and the hour before', () => {
  it('lets the company sit the night in the cellar, and the city to say so at the hour before the Drawing', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', 'Pay the Bursar the three-coin fee', '>ombra__rv_landing', 'Show the Counterpoise the Bursar', '^To the assay cellar', '=21:00');
    expect(j.matches('Sit the night watch').length).toBe(1);
    await j.play('Sit the night watch');
    expect(j.page).toContain('thanked');
    await j.play('=day 9 22:30');
    expect(j.page).toContain('it weighed the night');
  }, 600000);
});

describe('The Book of Faces, the company in the city', () => {
  it('lets each member say what they see by what they are: the cleric at the bier-room, the thief at the Warden\'s door, the warrior at the Stair and the ranger at the pilings', async () => {
    const j = await Row.start();
    await j.play('>ombra__nave');
    expect(j.page).toContain('A funeral without a name is a tally with the number scratched out');
    await j.play('>ombra__locks_office');
    expect(j.page).toContain('a wall with an opinion');
    await j.play('>ombra__hill_foot');
    expect(j.page).toContain('Worn on the left');
    await j.play('>ombra__drip_landing');
    expect(j.page).toContain('Flood of nine years ago');
  }, 300000);
  it('has no mage to hear the Frame warm, and says nothing of it, in a company without one', async () => {
    const j = await Row.start();
    await j.play('>ombra__collegium_study');
    expect(j.page).not.toContain('It is warm');
  }, 200000);
});

describe('The Book of Faces, a short loaf', () => {
  it('is weighed by the Counterpoise, which is pleased, and steps aside', async () => {
    const j = await Row.start();
    await j.play('>ombra__bread_market', 'Buy a penny-loaf of the Drip', '>ombra__rv_landing');
    expect(j.holds('tolerates', k('rv_counterpoise'), 'party')).toBe(false);
    await j.play('Set a penny-loaf of the Drip on the Counterpoise');
    expect(j.page).toContain('by the exact amount the Hall allows');
    expect(j.holds('tolerates', k('rv_counterpoise'), 'party')).toBe(true);
    await j.play('^To the assay cellar');
    expect(Row.at(j)).toBe(k('rv_assay'));
  }, 300000);
});
