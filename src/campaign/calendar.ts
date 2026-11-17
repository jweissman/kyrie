import reckoning from '../../data/imbar/calendar.json';
import { FictionalTime } from './fictional-time';

// When a campaign begins: a day of a month (1 to 30) of a year of the Sun and Moon.
export interface CalendarStart { year: number; month: number; day: number }

// The reckoning of days in Imbar, Orsino's world, whose annals count the Years of the Sun and Moon. A year is twelve
// months of thirty days, three to a season, beginning with the thaw. A campaign begins on a date; each day after is
// counted from it, turning at midnight. Its names are data (data/imbar/calendar.json).
export class Calendar {
  static readonly months: { name: string; season: string }[] = reckoning.months;
  static date(start: CalendarStart, tick: number): { year: number; month: number; day: number; name: string;
    season: string } {
    const days = Math.floor((8 * 60 + tick * FictionalTime.minutesPerTick) / 1440);
    const from = (start.month - 1) * 30 + (start.day - 1) + days;
    const year = start.year + Math.floor(from / 360), month = Math.floor((from % 360) / 30) + 1, day = (from % 30) + 1;
    return { year, month, day, ...this.months[month - 1]! };
  }
  // "20 Leaffall", for the line above the page.
  static short(start: CalendarStart, tick: number): string {
    const d = this.date(start, tick);
    return `${d.day} ${d.name}`;
  }
  // "Monday, the 20th of Leaffall, in the 1312th year of the Sun and Moon; autumn", for whoever looks closer.
  static long(start: CalendarStart, tick: number): string {
    const d = this.date(start, tick);
    return `${this.weekday(d)}, the ${this.ordinal(d.day)} of ${d.name}, in the ${this.ordinal(d.year)} ${reckoning.era}; `
      + d.season;
  }
  // Imbar keeps a week of seven days, the sennight, in the names the Common tongue gives them, running on across the
  // months (the Lull's friction 11, LUL-11: the Banns at Hessel named weekdays and the Lull kept a sennight, and the
  // calendar had none). The first day of the first year of the Sun and Moon was a Sunday.
  static readonly weekdays: string[] = reckoning.weekdays;
  static weekday(d: { year: number; month: number; day: number }): string {
    return this.weekdays[((d.year - 1) * 360 + (d.month - 1) * 30 + d.day - 1) % 7]!;
  }
  static ordinal(n: number): string {
    const tens = n % 100, ones = n % 10;
    return `${n}${tens > 10 && tens < 14 ? 'th' : ones === 1 ? 'st' : ones === 2 ? 'nd' : ones === 3 ? 'rd' : 'th'}`;
  }
}
