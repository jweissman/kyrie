export class FictionalTime {
  static readonly minutesPerTick = 10;
  static at(tick: number): string {
    const minutes = 8 * 60 + tick * this.minutesPerTick;
    const day = Math.floor(minutes / 1440) + 1, hour = Math.floor(minutes / 60) % 24;
    return `Day ${day}, ${hour % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hour < 12 ? 'a.m.' : 'p.m.'}`;
  }
  // Night, for the world: from nine in the evening until six in the morning.
  static dark(tick: number): boolean {
    const hour = Math.floor((8 * 60 + tick * this.minutesPerTick) / 60) % 24;
    return hour >= 21 || hour < 6;
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
