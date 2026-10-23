export class FictionalTime {
  static readonly minutesPerTick = 10;
  static at(tick: number): string {
    const minutes = 8 * 60 + tick * this.minutesPerTick;
    const day = Math.floor(minutes / 1440) + 1, hour = Math.floor(minutes / 60) % 24;
    return `Day ${day}, ${hour % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hour < 12 ? 'a.m.' : 'p.m.'}`;
  }
  // The hour of the day, 0 to 23, and the day since the company came (1, 2…).
  static hour(tick: number): number { return Math.floor((8 * 60 + tick * this.minutesPerTick) / 60) % 24; }
  static day(tick: number): number { return Math.floor((8 * 60 + tick * this.minutesPerTick) / 1440) + 1; }
  // Night, for the world: from nine in the evening until six in the morning.
  static dark(tick: number): boolean {
    const hour = Math.floor((8 * 60 + tick * this.minutesPerTick) / 60) % 24;
    return hour >= 21 || hour < 6;
  }
  // The part of the day, as people say it.
  static part(tick: number): string {
    const hour = Math.floor((8 * 60 + tick * this.minutesPerTick) / 60) % 24;
    return hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
  }
  // Watches from this one until six in the morning, while it is dark.
  static untilLight(tick: number): number {
    if (!this.dark(tick)) { return 0; }
    const minutes = (8 * 60 + tick * this.minutesPerTick) % 1440;
    return Math.ceil(((6 * 60 - minutes + 1440) % 1440) / this.minutesPerTick);
  }
  // Watches of a night's sleep from this one: until seven in the morning when that is six to eighteen hours off
  // (a bed taken in the afternoon or the small hours), otherwise eight hours.
  static untilMorning(tick: number): number {
    const minutes = (8 * 60 + tick * this.minutesPerTick) % 1440, wake = (7 * 60 - minutes + 1440) % 1440;
    return Math.ceil((wake >= 360 && wake <= 1080 ? wake : 480) / this.minutesPerTick);
  }
  // Watches from this one until nine in the evening, while it is light.
  static untilDark(tick: number): number {
    if (this.dark(tick)) { return 0; }
    const minutes = (8 * 60 + tick * this.minutesPerTick) % 1440;
    return Math.ceil((21 * 60 - minutes) / this.minutesPerTick);
  }
  // Watches until the day next turns: first light, midday, evening or dark (six, twelve, six and nine o'clock).
  static untilTurn(tick: number): number {
    const minutes = (8 * 60 + tick * this.minutesPerTick) % 1440;
    const next = [6, 12, 18, 21, 30].map(h => h * 60).find(m => m > minutes)!;
    return Math.ceil((next - minutes) / this.minutesPerTick);
  }
  static duration(ticks: number): string {
    const minutes = ticks * this.minutesPerTick;
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}` : `${minutes} min`;
  }
  // Time of day for prose: "11:20 a.m.", or "11:20 a.m. on day 2" after the first day.
  static clock(tick: number): string {
    const [day, time] = this.at(tick).split(', ');
    return day === 'Day 1' ? time! : `${time!} on ${day!.toLowerCase()}`;
  }
  static prose(text: string): string {
    return text.replace(/(?:at )?about watch (\d+)/gi, (_, n: string) => `about ${this.clock(Number(n))}`)
      .replace(/watch (\d+)/gi, (_, n: string) => this.at(Number(n)))
      .replace(/at the thirtieth watch/gi, `at ${this.at(30)}`).replace(/([ap]\.m\.)\./g, '$1');
  }
}
