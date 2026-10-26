import { FictionalTime } from './fictional-time';

// When a campaign begins: a day of a month (1 to 30) of a year of the Sun and Moon.
export interface CalendarStart { year: number; month: number; day: number }

// The reckoning of days in Imbar, Orsino's world, whose annals count the Years of the Sun and Moon. A year is twelve
// months of thirty days, three to a season, beginning with the thaw. A campaign begins on a date; each day after is
// counted from it, turning at midnight.
export class Calendar {
  static readonly months: { name: string; season: string }[] = [
    { name: 'Thaw', season: 'spring' }, { name: 'Sowing', season: 'spring' }, { name: 'Blossom', season: 'spring' },
    { name: 'Greening', season: 'summer' }, { name: 'Midsummer', season: 'summer' }, { name: 'Haysel', season: 'summer' },
    { name: 'Harvest', season: 'autumn' }, { name: 'Leaffall', season: 'autumn' }, { name: 'Smoke', season: 'autumn' },
    { name: 'Frost', season: 'winter' }, { name: 'Deepwinter', season: 'winter' }, { name: 'Wolfmoon', season: 'winter' }];
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
  // "the 20th of Leaffall, in the 1312th year of the Sun and Moon; autumn", for whoever looks closer.
  static long(start: CalendarStart, tick: number): string {
    const d = this.date(start, tick);
    return `the ${this.ordinal(d.day)} of ${d.name}, in the ${this.ordinal(d.year)} year of the Sun and Moon; ${d.season}`;
  }
  static ordinal(n: number): string {
    const tens = n % 100, ones = n % 10;
    return `${n}${tens > 10 && tens < 14 ? 'th' : ones === 1 ? 'st' : ones === 2 ? 'nd' : ones === 3 ? 'rd' : 'th'}`;
  }
}
