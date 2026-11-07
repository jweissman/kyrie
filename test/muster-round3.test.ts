import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import steps from './fixtures/muster/journey.json';

// Played from the Ford, no staging of position: only of the clock (the season turns on the seventh day).
const campaign = 'data/campaigns/muster.campaign.json';
const start = () => Journey.start(campaign, 'muster');
const ended = (j: Journey) => j.choices().filter(c => !/Give to|Set down|prepare spells|Pack/.test(c.label)).length === 0;
const toGate = async (j: Journey) => {
  await j.play(...steps.prepare_light, ...steps.hire, ...steps.stock, ...steps.first_days);
  await j.play('Ask Marra what she is looking for on the far side', 'Say that you would want to know, whatever it was');
  await j.play(...steps.viaduct, 'Ask Marra about the letters on the arch', 'Tell her to come on: it is her brother\'s road too');
  await j.play(...steps.to_pass, ...steps.giant, 'To the head of the descent', ...steps.deserters, ...steps.gate.slice(1));
};

describe('round three: the clock, the pack and the parapet', () => {
  it('does not strand a party that stepped on the parapet before the snow: the far end stays open, and the Cohort is where it ends', async () => {
    const j = await start();
    await j.play(...steps.prepare_light, ...steps.hire, ...steps.stock, ...steps.first_days);
    await j.play('To the north head of the Viaduct', 'Drive a piton into the parapet and rig a line over the gap with a coil of rope');
    await j.play('=day 6 23:00');
    await j.play('To the parapet of the fifth arch');
    expect(j.at('party')).toBe('muster__parapet');
    await j.play('=day 7 02:00');
    expect(ended(j)).toBe(false);
    await j.play('To the south abutment');
    expect(ended(j)).toBe(true);
    expect(j.page).toContain('passes shut behind you');
  }, 290000);

  it('is bitten by the pack when it walks the causeway with nothing to answer it', async () => {
    const j = await start();
    await j.play(...steps.prepare_light, ...steps.hire);
    await j.play('To the head of the Old Causeway');
    await j.play('To the long middle of the causeway');
    await j.play('To the end of the causeway');
    expect(j.page).toContain('they come in all at once');
  }, 290000);

  it('lets a party that lit its torches at the middle of the causeway walk on unbitten', async () => {
    const j = await start();
    await j.play(...steps.prepare_light, ...steps.hire);
    await j.play('To the head of the Old Causeway', 'To the long middle of the causeway');
    await j.play('a torch: Light');
    await j.play('Stand together with lit torches, and let the pack look at the flame');
    await j.play('To the end of the causeway');
    expect(j.page).not.toContain('they come in all at once');
  }, 290000);

  it('arrives at the gate with the snow near, and the valley costs the days that decide whether the company gets home', async () => {
    const j = await start();
    await toGate(j);
    await j.play('To the forum');
    const w0 = j.measure('watch', 'clock'); // ten-minute units: the seventh day opens at 864
    expect(w0).toBeLessThan(430);
    await j.play('To the apothecary', 'to the forum', 'To the Archive', 'to the forum', 'To the Cohort\'s schola', 'to the forum',
      'To the salt-market', 'to the forum', 'To the Praetorium', 'to the forum');
    // five errands and back is half a day of the margin the snow leaves
    expect(j.measure('watch', 'clock') - w0).toBeGreaterThanOrEqual(50);
    expect(j.holds('lateSeason')).toBe(false);
  }, 290000);
});
