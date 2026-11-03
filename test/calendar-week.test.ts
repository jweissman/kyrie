import { describe, expect, it } from 'bun:test';
import { Calendar } from '../src/campaign/calendar';

// Imbar keeps a sennight of seven days, named as the Common tongue names them, running on across its thirty-day months
// (the Lull's friction 11: the Banns at Hessel named weekdays and the Lull kept a sennight, and the calendar had none).
describe('the calendar\'s week', () => {
  it('names the day of the week, seven to a sennight, across the months', () => {
    const start = { year: 1, month: 1, day: 1 };
    expect(Calendar.long(start, 0)).toBe('Sunday, the 1st of Thaw, in the 1st year of the Sun and Moon; spring');
    expect([2, 7, 8].map(day => Calendar.weekday({ year: 1, month: 1, day }))).toEqual(['Monday', 'Saturday', 'Sunday']);
    // The thirtieth of Thaw is a Monday, so the first of Sowing a Tuesday: the week runs on over the month's end.
    expect([Calendar.weekday({ year: 1, month: 1, day: 30 }), Calendar.weekday({ year: 1, month: 2, day: 1 })])
      .toEqual(['Monday', 'Tuesday']);
  });
});
