import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// How a journey's steps meet the page (the Banns at Hessel's friction 7, 15 and 16, the Liberty of the Ice's 19): an
// act that cannot be undone says what the page asked before it; a wait to a watch stops where the book closes; a
// choice waited for that is not a way is done once, not again and again; a thing is called by part of its name.
describe('a journey step', () => {
  it('says what the page asked before an act that cannot be undone', async () => {
    const j = await Journey.start('test/fixtures/probes/grave/probe.campaign.json', 'g');
    await j.step('Break the founder');
    expect(j.taken.at(-1)?.grave).toMatch(/broken, it stays broken/);
  }, 60000);
  it('stops waiting where the book closes, and does a choice waited for once when it is not a way', async () => {
    const j = await Journey.start('test/fixtures/probes/ending/probe.campaign.json', 'e');
    await j.step('~Haul the lever up');
    expect([j.taken.length, j.campaign.running]).toEqual([1, false]);
    expect(await j.step('=50')).toBe('');
  }, 60000);
  it('finds a thing by part of its name, then what is done with it', async () => {
    const j = await Journey.start('test/fixtures/probes/local-kind/probe.campaign.json', 'k');
    await j.step('jar: Take');
    expect(j.choices().some(c => /jar of the day › Set down/i.test(c.label))).toBe(true);
  }, 60000);
});
