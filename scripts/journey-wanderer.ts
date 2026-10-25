import type { PlayerView } from '../src/presentation/player-view';

export type Offered = ReturnType<typeof PlayerView.choices>[number];
// Where a wanderer goes next, by a fixed rule and a seeded draw: now and then a bed for the night where one is
// offered, or an hour's wait; else a road across a march, or a way to somewhere it has not been; else a way back
// somewhere it has been. Never into the wild sites, where it would fight.
export class Wanderer {
  private readonly been = new Set<string>();
  private n = 0;
  private state: number;
  constructor(seed: string) {
    this.state = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  }
  private next(count: number): number {
    this.state = (Math.imul(this.state, 1103515245) + 12345) | 0;
    return ((this.state >>> 8) % count + count) % count;
  }
  static destination(c: Offered): string | undefined { return /^go\([^,]+,([^)]+)\)$/.exec(c.choice.id)?.[1]; }
  private static by(offered: Offered[], re: RegExp): Offered | undefined {
    return offered.find(c => re.test(c.choice.id));
  }
  pick(offered: Offered[]): Offered | undefined {
    this.n++;
    const bed = Wanderer.by(offered, /^take_lodging\(/), hour = Wanderer.by(offered, /^wait_hour$/);
    if (this.n % 40 === 0 && bed) { return bed; }
    if (this.n % 15 === 0 && hour) { return hour; }
    const ways = offered.filter(c => Wanderer.destination(c) && !/__w\d+/.test(Wanderer.destination(c)!));
    const fresh = ways.filter(c => !this.been.has(Wanderer.destination(c)!));
    const across = fresh.find(c => /across the march/.test(c.choice.name));
    const chosen = across ?? (fresh.length ? fresh[this.next(fresh.length)] : ways.length ? ways[this.next(ways.length)]
      : hour ?? Wanderer.by(offered, /^wait$/));
    const to = chosen && Wanderer.destination(chosen);
    if (to) { this.been.add(to); }
    return chosen;
  }
}
