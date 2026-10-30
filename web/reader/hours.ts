import { FictionalTime } from '../../src/campaign/fictional-time';

// The day's hours as the world keeps them (FictionalTime.night): the first morning begins at eight, and it is dark
// from nine in the evening to six (a journey had kept night from eight: the navigation review).
export class Hours {
  static night(minutes: number): boolean {
    const hour = (8 + Math.floor(minutes / 60)) % 24, { falls, lifts } = FictionalTime.night;
    return hour >= falls || hour < lifts;
  }
  // Whether a journey set out on now would end after dark, or go on through the night: said before it is begun (the
  // play-structure investigation's PT-31: a journey arrived at night, though the way had been told with "go in
  // daylight").
  static dark(elapsed: number, minutes: number): string {
    const start = elapsed * 10, end = start + minutes;
    return Hours.night(end) || Hours.dusks(start) !== Hours.dusks(end) ? 'after dark' : '';
  }
  // How many nightfalls since the first morning.
  private static dusks(minutes: number): number {
    return Math.floor((minutes / 60 + 8 - FictionalTime.night.falls) / 24);
  }
}
