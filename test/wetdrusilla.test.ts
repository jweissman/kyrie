import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/wetdrusilla/journey.json';

// Wet Drusilla, played by the labels a player sees: a sand-ship, a song of nine verses, and a funeral at the bottom of a sea.
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
    await j.play(...voyage, ...steps.chorus_open, 'Stand at the rail and sing the chorus', 'Ask Jessamy what the dead woman');
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
    await bad.play(...voyage, ...steps.chorus_open, 'Stand at the rail and sing the chorus', '=day 2 14:10', 'Call the left-hand lane');
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
    await j.play(...voyage, ...steps.chorus_guard, 'Pour Alfie', "Pour Drusilla's own cask", 'Pour Jessamy', 'Sing Wet Drusilla', 'Sing a ninth verse: that she was wrong', 'Ask Sunniva to give her mother');
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
    await j.play(...steps.prep, '=day 1 19:30', ...steps.hulk, ...steps.chorus_bare, '=day 3 05:30', ...steps.ritual.slice(3));
    expect(reached(j, 'urn_home')).toBe(true);
  }, 120000);
});
