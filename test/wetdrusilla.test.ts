import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/wetdrusilla/journey.json';

// Wet Drusilla, played by the labels a player sees: a sand-ship, a song of nine verses, and a funeral at the bottom
// of a sea.
describe("Wet Drusilla", () => {
  const campaign = 'data/campaigns/wetdrusilla.campaign.json';
  const start = async () => Journey.start(campaign, "wetdrusilla");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'wetdrusilla__' + ending);
  const know = (j: Journey, fact: string) => j.holds('knows', 'party', 'wetdrusilla__' + fact);
  const voyage = [...steps.prep, ...steps.crew, '=day 1 19:30', ...steps.hulk];

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('gathers the verses of the port and the crew, and the wax from a cook told the truth', async () => {
    const j = await start();
    await j.play(...steps.prep);
    expect(j.measure('verses')).toBe(5);
    expect(j.holds('knows', 'party', 'wetdrusilla__verse_3')).toBe(true);
    expect(j.page).toContain('lump of yellow wax');
  }, 60000);

  it('sails without a company that stays on the quay', async () => {
    const j = await start();
    await j.play('To the old quay', '=day 1 15:00');
    expect(reached(j, 'left_quay')).toBe(true);
  }, 60000);

  it('leaves a company that lingers on the Magnanimous', async () => {
    const j = await start();
    await j.play(...steps.prep, '=day 1 19:30', 'Into the Magnanimous', '=day 2 08:30');
    expect(reached(j, 'marooned')).toBe(true);
  }, 60000);

  it('stops the sledge-folk with the chorus, and learns the fifth verse from them', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_open, 'Stand at the rail and sing the chorus',
      'Ask Jessamy what the dead woman');
    expect(know(j, 'verse_5')).toBe(true);
    expect(j.holds('tolerates', 'wetdrusilla__jessamy', 'party')).toBe(true);
  }, 60000);

  it('pays the sledge-folk water instead, and has no verse of theirs', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_open, 'Hand the sledge-folk two casks');
    expect(j.measure('casks')).toBe(3);
    expect(know(j, 'verse_5')).toBe(false);
  }, 60000);

  it('brings the Mary over the crust when the goat has shown the lane, and breaks her on a bad call', async () => {
    const good = await start();
    await good.play(...voyage, ...steps.chorus_open, 'Stand at the rail and sing the chorus', ...steps.chorus_afternoon);
    expect(good.holds('crustSafe', 'party')).toBe(true);
    const bad = await start();
    await bad.play(...voyage, ...steps.chorus_open, 'Stand at the rail and sing the chorus', '=day 2 14:10',
      'Call the left-hand lane');
    expect(bad.holds('crustBroken', 'party')).toBe(true);
  }, 60000);

  it('lets Sunniva walk in the night, so that a company with open ears learns her verse unasked', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_bare, '>wetdrusilla__crest');
    expect(know(j, 'verse_8')).toBe(true);
    await j.play('Take Sunniva');
    expect(j.at('wetdrusilla__sunniva')).toBe('wetdrusilla__deck');
  }, 90000);

  it('keeps the whole deck from walking if someone holds the low note', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_guard);
    expect(j.holds('nightPassed', 'party')).toBe(true);
    expect(j.holds('walkedBack', 'party')).toBe(false);
    expect(know(j, 'verse_8')).toBe(false);
    expect(j.at('wetdrusilla__sunniva')).toBe('wetdrusilla__deck');
  }, 90000);

  it('brings the tide in for a company with seven verses, three waters and Sunniva warmed', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_guard, ...steps.ritual);
    expect(reached(j, 'tide_in')).toBe(true);
  }, 120000);

  it('brings the tide in under the true ninth verse, and Paid is not written on the jar', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_guard, 'Pour Alfie', "Pour Drusilla's own cask", 'Pour Jessamy',
      'Sing Wet Drusilla', 'Sing a ninth verse: that she was wrong', 'Ask Sunniva to give her mother');
    expect(reached(j, 'tide_true')).toBe(true);
    expect(j.page).toContain('Come in');
  }, 120000);

  it('gives salt and wind to a company with one verse, no waters and a daughter half-won', async () => {
    const j = await start();
    await j.play(...steps.bare);
    expect(reached(j, 'salt')).toBe(true);
  }, 120000);

  it('sends the urn home when the song was not sung, or Sunniva was lost on the dune', async () => {
    const j = await start();
    await j.play(...steps.prep, '=day 1 19:30', ...steps.hulk, ...steps.chorus_bare, '=day 3 05:30',
      ...steps.ritual.slice(3));
    expect(reached(j, 'urn_home')).toBe(true);
  }, 120000);

  // A Hand's Depth: six verses and two waters, the sledge-folk paid and so no fifth verse; the sea comes to the ankle.
  it('brings a hand\'s depth of sea for a company short of the seventh verse', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_open, 'Hand the sledge-folk two casks', '=day 2 14:10', 'Send Mrs Bishop',
      'Call the right-hand lane', '=day 2 18:00', 'Hold the low note', '=day 3 05:30', 'Pour Alfie',
      "Pour Drusilla's own cask", 'Sing Wet Drusilla', 'Sing a ninth verse: that she came home',
      'Ask Sunniva to give her mother');
    expect(j.measure('verses')).toBe(6);
    expect(reached(j, 'hand_deep')).toBe(true);
  }, 120000);
});

// Integration's mends (26 November): what an act or a talk does is something later play reads.
describe("Wet Drusilla's mends", () => {
  const campaign = 'data/campaigns/wetdrusilla.campaign.json';
  const start = async () => Journey.start(campaign, "wetdrusilla");
  const know = (j: Journey, fact: string) => j.holds('knows', 'party', 'wetdrusilla__' + fact);
  const voyage = [...steps.prep, ...steps.crew, '=day 1 19:30', ...steps.hulk];

  // Bartle's question was put to every group in the world and offered nowhere; the company asks for his verse now.
  it('asks Bartle for his verse, and has his question to answer', async () => {
    const j = await start();
    await j.play('To the old quay', 'To the deck of the Contrary Mary', "To the Mary's galley", 'Talk to Bartle');
    expect(j.offers('Tell him he carries it beautifully')).toBe(false);
    await j.play('Ask Bartle whether he knows a verse');
    expect(j.offers('Tell him he carries it beautifully')).toBe(true);
  }, 60000);

  // What the goat showed was told on the page and kept nowhere; it is a note now, and the Captain reads it.
  it('keeps the lane the goat walked in the Notes', async () => {
    const j = await start();
    await j.play(...voyage, ...steps.chorus_open, 'Stand at the rail and sing the chorus', '=day 2 14:10',
      'Send Mrs Bishop');
    expect(know(j, 'lane_right')).toBe(true);
    expect(know(j, 'lane_left')).toBe(false);
    expect(j.page).toContain('‘Right-hand, is it,’');
  }, 90000);

  // Hands' pay, three coin at the Silver, was promised on the quay and never paid. Sunniva's warmth, which only the
  // endings read, is a quiet note as it crosses; Bartle's story of her grace can be said over the rail, and warms her.
  it('pays the hands at the Silver, notes Sunniva warming, and hears the grace said', async () => {
    const j = await start();
    await j.play(...voyage);
    expect(know(j, 'sunniva_warm')).toBe(true);
    const purse = j.measure('quantity', 'party', 'gold');
    await j.play(...steps.chorus_guard);
    expect(j.measure('quantity', 'party', 'gold')).toBe(purse + 3);
    expect(j.offers("Say Drusilla's grace")).toBe(false);
    await j.play("To the Mary's galley", 'Ask Bartle what she was like', 'To the deck of the Contrary Mary');
    const warmth = j.measure('warmth');
    await j.play("Say Drusilla's grace");
    expect(j.measure('warmth')).toBe(warmth + 1);
    expect(j.offers("Say Drusilla's grace")).toBe(false);
  }, 120000);
});
