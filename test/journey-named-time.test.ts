import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A step file waited by watch number, counted in ten-minute watches from eight on the first morning: nine at night on
// Shrove Monday is 222, and its author wrote 216, which is eight o'clock, and spent three runs finding out (A Winter
// in Carth's friction 20). A step can wait to a time named on the clock.
describe('a journey step that waits to a named time', () => {
  it('counts the watch from eight on the first morning', () => {
    expect(Journey.watchAt(0, [undefined, '21', '00'])).toBe(78);
    expect(Journey.watchAt(0, ['2', '21', '00'])).toBe(222);
    // The next such time: nine in the morning, asked at ten on the first day, is the second day's.
    expect(Journey.watchAt(12, [undefined, '09', '00'])).toBe(150);
  });
  it('waits there', async () => {
    const j = await Journey.start('test/fixtures/probes/pains/probe.campaign.json', 'k');
    await j.play('=21:00');
    expect(j.watch()).toBe(78);
    await j.play('=day 2 09:30');
    expect(j.watch()).toBe(153);
  }, 60000);
});
