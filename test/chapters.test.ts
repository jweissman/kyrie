import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Liberty of the Ice's 26 and the Banns at Hessel's 22 (ICE-25, HSL-20): a day had no opening, and each was built
// by hand, a rule and a latch, told after the day's weather on the pass that turned the day, or run on after supper.
// A Chapter opens once, when it first holds: its title heads the page, and its words come first, before the weather.
describe('a chapter', () => {
  it('opens once, under its title, before what else the morning tells', async () => {
    const j = await Journey.start('test/fixtures/probes/chapters/probe.campaign.json');
    await j.play('=day 2 09:00');
    const opened = j.taken.filter(t => t.chapter);
    expect(opened.map(t => t.chapter)).toEqual(['The second day']);
    expect(opened[0]!.page).toMatch(/^Snow came in the night, and the booths are white to the eaves\. The sky/);
    expect(j.holds('chapterOpened', 'p__second_day')).toBe(true);
  }, 60000);
});
