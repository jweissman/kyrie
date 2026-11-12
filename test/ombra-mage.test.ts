import { describe, expect, it } from 'bun:test';
import { Ombra } from './support/ombra';

// The Fit (data/adventures/book-of-faces/mage.kyr): the mage's research of Likeness, played by the labels a player
// sees. OMBRA_CAMPAIGN points the run at a campaign that carries stubs for the persons other authors own (pavane, dov);
// it defaults to the real one.
const campaign = process.env.OMBRA_CAMPAIGN ?? 'data/campaigns/the-book-of-faces.campaign.json';
const mage = (seed = 'a') => Ombra.start(campaign, seed, Ombra.one('mage', undefined, 'human', 'Ilse'));
const warrior = () => Ombra.start(campaign, 'a');

// A check that may go either way: tried again, an hour on, until the thing it is for holds.
async function press(g: Ombra, label: string, done: () => boolean, tries = 12) {
  for (let i = 0; i < tries && !done(); i++) {
    await g.play(`?${label}`);
    if (!done()) { await g.play('?Wait › An hour'); }
  }
  expect(done()).toBe(true);
}
// Into the Master's workroom with his ear: whichever way is open.
async function audience(g: Ombra) {
  await g.play('>ombra__collegium_study', 'Talk to Dr Aurelian Thole');
  await press(g, 'Write your question', () => g.holds('mg_audience', 'party'));
}
async function theory(g: Ombra) {
  await audience(g);
  await g.play('Ask him for the treatise', 'Ask him about the masks', 'Ask who else has tried', 'Ask whether anything in Ombra', 'Ask what he would give', 'Ask him to run the Fitting-frame');
}
// The three understandings, in the places they are got: the Wall, the Standard Pound, the drowned mask's maker.
async function sources(g: Ombra) {
  await theory(g);
  await intoWall(g);
  await press(g, 'Read the casts', () => g.knows('mg_form'));
  await g.play('>ombra__standard_room');
  await press(g, 'Stand before the Standard Pound', () => g.knows('mg_measure'));
  await costFromDov(g);
}
// The next time the clock shows hh:mm (8 to 23), today or tomorrow: the day begins at eight and has a hundred and
// forty-four watches; a clock already past it is taken on to the next day.
async function at(g: Ombra, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const mark = (h - 8) * 6 + m / 10, day = Math.floor(g.watch / 144) + 1;
  await g.play(`=day ${g.watch % 144 > mark ? day + 1 : day} ${hhmm}`);
}
// The Wall of Faces is Madame Pavane's and the cellar door is locked: a bare face is cast in her chair by day (six
// coin), and then she takes the company down.
async function intoWall(g: Ombra) {
  await at(g, '10:00');
  await g.play('>ombra__fitting_room', "Sit in the Fitter's chair", 'Ask Madame Pavane to take you down');
  expect(g.j.campaign.world.related('at', 'party')[0]!.args[1]).toBe('ombra__cast_cellar');
}
// The drowned mask's maker is on the Fitter's roof after the Ninth Bell, and tells what the mask cost only to a company
// he has let try it on; by day he is a broom in the fitting-room, and says nothing.
async function costFromDov(g: Ombra) {
  await at(g, '20:30');
  await g.play('>ombra__maskers_roof', 'Say you only came up for the air', 'Sit by Dov on the ridge', 'Ask Dov if you may try the mask on');
  await press(g, 'Ask Dov to put the drowned mask', () => g.knows('mg_cost'));
}
// The Row's own source of cost: the Warden of Locks at his night-table, once warmed by a clock he is right about.
async function costFromLacke(g: Ombra) {
  for (let n = Math.floor(g.watch / 144) + 1; n <= 8 && !g.knows('mg_cost'); n++) {
    await g.play(`=day ${n} 21:00`, '>ombra__ct_locks_parlour', '?Ask him about the clocks');
    await press(g, 'Name the maker of the long-case clock', () => g.holds('ct_lacke_warm', 'lacke'));
    await g.play('?Ask the Warden what the Key has cost him');
  }
  expect(g.knows('mg_cost')).toBe(true);
}
const drawing = (g: Ombra) => g.play('=day 9 19:00', '>ombra__urn_hall');

describe('The Fit', () => {
  it('opens on a Master who is deaf: he is answered by the slate, or by the old recitative, and shows his failing frame', async () => {
    const g = await mage();
    await audience(g);
    await g.play('Ask him for the treatise');
    expect(g.knows('mg_theory')).toBe(true);
    expect(g.page).toMatch(/The Frame is warped/);
    await g.play('Ask him to run the Fitting-frame');
    expect(g.page).toMatch(/slides off/);
    expect(g.holds('arcBegun', 'party', 'hand_likeness')).toBe(true);
    // The pointers to the three sources are his, and each is a different place.
    await g.play('Ask who else has tried', 'Ask whether anything in Ombra', 'Ask what he would give');
    expect(['mg_clue_form', 'mg_clue_measure', 'mg_clue_cost'].every(f => g.knows(f))).toBe(true);
  }, 120000);

  it('answers a bare face by day, which no one else in Ombra does: the Collegium hangs its masks on pegs', async () => {
    const g = await warrior();
    await g.play('>ombra__collegium_study', 'Talk to Dr Aurelian Thole');
    expect(g.page).toMatch(/STATE UNITS/);
    // Nothing is told him until the units are put: the slate (learning) or the trumpet (a voice) is the way in.
    expect(g.j.matches('Ask him for the treatise').length).toBe(0);
    expect(g.j.matches('Write your question').length).toBe(1);
    expect(g.j.matches('Speak into the ear-trumpet').length).toBe(1);
    await g.play('Speak into the ear-trumpet');
    // Whichever way the dice fall, the answer is told in his own words.
    expect(g.page).toMatch(/Tollemache|PLEASE/);
  }, 120000);

  it('gives three different understandings, each a short scene with a check', async () => {
    const g = await mage();
    await sources(g);
    expect(g.knows('mg_form')).toBe(true);
    expect(g.knows('mg_measure')).toBe(true);
    expect(g.knows('mg_cost')).toBe(true);
    expect(g.holds('mg_sources_known', 'party')).toBe(true);
    expect(g.page).toMatch(/three witnesses to a crime/);
    // The three are not one thing: each has its own journal line.
    expect(g.page).toMatch(/habit of the person/);
    expect(g.page).toMatch(/promise that the Hall will keep/);
    expect(g.page).toMatch(/asks nothing|paid for/);
  }, 240000);

  it('asks for a lead, once: the other two become footnotes', async () => {
    const g = await mage();
    await sources(g);
    await g.play('>ombra__collegium_study');
    expect(g.j.matches('Follow Measure').length).toBe(1);
    await g.play('Follow Measure');
    expect(g.holds('mg_led_measure', 'party')).toBe(true);
    expect(g.j.matches('Follow Form').length).toBe(0);
    expect(g.j.matches('Follow Cost').length).toBe(0);
  }, 240000);

  it('Measure, by the Master being asked to explain a face to someone who has none: the lesson, the fee, the cast on the Offices', async () => {
    const g = await mage();
    await sources(g);
    await g.play('>ombra__collegium_study', 'Follow Measure', 'Talk to Dr Aurelian Thole');
    // A bare mage: the route that wants no skill at all.
    await g.play('Ask him to explain what a face is');
    expect(g.holds('mg_thole_agrees', 'party')).toBe(true);
    expect(g.knows('mg_held_by_whom')).toBe(true);
    expect(g.page).toMatch(/HELD BY WHOM/);
    // The lessons are Thole's to teach: a first-level one that is new to this mage is prepared at once; the
    // second-level one is learned and waits for slots the company will not have.
    const lessons = g.j.choices().filter(c => /Train/.test(c.label));
    expect(lessons.length).toBeGreaterThan(0);
    const before = g.gold();
    await g.play('Train.{1,3}Blur');
    expect(g.gold()).toBe(before - 3);
    expect(g.holds('mg_taught', 'party')).toBe(true);
    expect(g.holds('handReady', 'party', 'hand_likeness')).toBe(true);
    expect(g.j.choices().some(c => /prepare spells.*› Blur/i.test(c.full))).toBe(true);
    // The second-level lesson is real, but cannot be prepared by a first-level mage.
    await g.play('Train.{1,3}Mirror Image');
    expect(g.page).toMatch(/learn Mirror Image/);
    expect(g.j.choices().some(c => /prepare spells.*› Mirror Image/i.test(c.full))).toBe(false);
    // On the ninth night, at the Urn, it is cast on the Offices.
    await drawing(g);
    expect(g.j.matches('Cast the Likeness of Measure').length).toBe(1);
    expect(g.j.matches('Cast the Likeness of Form').length).toBe(0);
    await g.play('Cast the Likeness of Measure');
    expect(g.holds('handPlayed', 'party', 'hand_likeness')).toBe(true);
    expect(g.holds('mg_fit_false', 'party')).toBe(true);
    expect(g.holds('arcDone', 'party', 'hand_likeness')).toBe(true);
    expect(g.page).toMatch(/The mask will merely fall off/);
  }, 300000);

  it('Cost, by the Warden of Locks as the source and a lent mask as the way to the Master; the cast takes the caster\'s own face', async () => {
    const g = await mage();
    await theory(g);
    await intoWall(g);
    await press(g, 'Read the casts', () => g.knows('mg_form'));
    await g.play('>ombra__standard_room');
    await press(g, 'Stand before the Standard Pound', () => g.knows('mg_measure'));
    await costFromLacke(g);
    expect(g.page).toMatch(/costs you the one who was under it/);
    const day = Math.floor(g.watch / 144) + 2;
    await g.play(`=day ${day} 08:00`, '>ombra__annex_counter', 'Rent the Heron', 'Put on the Heron', '>ombra__collegium_study', 'Follow Cost', 'Talk to Dr Aurelian Thole');
    // Masked, the Master is asked to hold the mask for the length of a sentence.
    await press(g, 'Ask him to hold your mask', () => g.holds('mg_thole_agrees', 'party'));
    expect(g.page).toMatch(/It holds.*I am holding it/);
    await g.play('Train.{1,3}Hex');
    expect(g.holds('mg_taught', 'party')).toBe(true);
    await g.play('Ask him for a copy of the treatise');
    expect(g.carries('mg_treatise')).toBe(true);
    await g.play('Have Ilse read Thole');
    expect(g.holds('mg_studied', 'party')).toBe(true);
    expect(g.j.matches('Have Ilse read Thole').length).toBe(0);
    await drawing(g);
    await g.play('Cast the Likeness of Cost');
    expect(g.holds('mg_burden_shared', 'party')).toBe(true);
    expect(g.holds('masked', 'party')).toBe(false);
    // The news is told in the hour before the book closes, and it says what was paid.
    await g.play('=day 9 23:10');
    expect(g.page).toMatch(/Of Dr Thole: the Collegium found, on the tenth morning/);
  }, 300000);

  it('Form, from the Collegium\'s own dead Masters: the Urn shows its emptiness to the room', async () => {
    const g = await mage();
    await theory(g);
    await g.play('>ombra__collegium_hall');
    await press(g, 'Read the plaster Masters', () => g.knows('mg_form'), 20);
    expect(g.knows('mg_form_deep')).toBe(false);
    await g.play('>ombra__standard_room');
    await press(g, 'Stand before the Standard Pound', () => g.knows('mg_measure'));
    await costFromDov(g);
    await g.play('>ombra__collegium_study', 'Follow Form', 'Talk to Dr Aurelian Thole', 'Ask him to explain what a face is', 'Train');
    expect(g.holds('mg_taught', 'party')).toBe(true);
    await drawing(g);
    await g.play('Cast the Likeness of Form');
    expect(g.holds('mg_urn_shown', 'party')).toBe(true);
    expect(g.page).toMatch(/not holding anything/);
    // And the casting stays cast when the night is over.
    await g.play('=day 9 23:10');
    expect(g.page).toMatch(/Of Dr Thole: he was in the Urn Hall/);
    expect(g.holds('handPlayed', 'party', 'hand_likeness')).toBe(true);
  }, 300000);

  it('does not teach one who cannot be taught: a warrior reaches the Master, and the lessons are not offered', async () => {
    const g = await warrior();
    await audience(g);
    await g.play('Ask him for the treatise');
    expect(g.knows('mg_theory')).toBe(true);
    expect(g.j.choices().some(c => /Train/.test(c.label))).toBe(false);
    expect(g.j.matches('Follow ').length).toBe(0);
  }, 120000);

  it('keeps what was learned across a day and a rest: the lesson, the lead, and the offered second lesson', async () => {
    const g = await mage();
    await sources(g);
    await g.play('>ombra__collegium_study', 'Follow Measure', 'Talk to Dr Aurelian Thole', 'Ask him to explain what a face is', 'Train.{1,3}Blur');
    await g.play('=day 4 10:00');
    expect(g.holds('mg_taught', 'party')).toBe(true);
    expect(g.holds('mg_led_measure', 'party')).toBe(true);
    expect(g.j.holds('teaches', 'ombra__thole', 'mirror_image')).toBe(true);
    await g.play('>ombra__collegium_study');
    // He is still at his engine, by day or night, and the second lesson is still his to give.
    expect(g.at('thole')).toBe('ombra__collegium_study');
    expect(g.j.choices().some(c => /Train.{1,3}Mirror Image/.test(c.label))).toBe(true);
  }, 300000);
});

// A walk through whatever is offered at the Collegium, the Hall and the Standard Room.
describe('The Collegium, walked at random', () => {
  it('keeps the research consistent through three hundred offered actions', async () => {
    const g = await mage('walk');
    let seed = 11;
    const rand = (n: number) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    await g.play('>ombra__collegium_hall');
    for (let i = 0; i < 300 && g.running; i++) {
      const offered = g.j.choices()
        .filter(c => !/^Pack|Set down|Light|Lift .* mask|Name .* aloud|prepare/.test(c.full))
        .filter(c => !/Take your leave/.test(c.label));
      if (!offered.length) { break; }
      const pick = offered[rand(offered.length)]!;
      try { await g.j.step(`@${pick.command}`); } catch { /* an act that cannot be done now is not offered next time */ }
      expect(g.j.campaign.world.related('at', 'ombra__thole').length).toBeLessThanOrEqual(1);
      // A lead needs all three understandings; a lesson needs a lead and a changed mind; a cast needs a lesson.
      if (g.holds('mg_led', 'party')) { expect(g.holds('mg_sources_known', 'party')).toBe(true); }
      if (g.holds('mg_thole_agrees', 'party')) { expect(g.holds('mg_led', 'party')).toBe(true); }
      if (g.holds('mg_taught', 'party')) { expect(g.holds('mg_thole_agrees', 'party')).toBe(true); }
      if (g.holds('handPlayed', 'party', 'hand_likeness')) { expect(g.holds('mg_taught', 'party')).toBe(true); }
      if (g.knows('mg_held_by_whom')) { expect(g.holds('mg_thole_agrees', 'party')).toBe(true); }
    }
  }, 300000);
});
