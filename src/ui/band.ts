import type { PlayerSnapshot } from '../presentation/player-view';

type Present = PlayerSnapshot['present'][number];

// A band is as many of it as still stand; fallen, all of it. Down to its last it is one, "the last of the cave
// spiders" (review A's "a cave spiders… is here": T24-17).
export class Band {
  static standing(p: Present): number {
    const all = p.members ?? [];
    return p.state ? all.length : all.filter(m => m.hp > 0).length;
  }
  static last(p: Present, name: string): string {
    if (p.state || (p.members?.length ?? 0) < 2 || this.standing(p) !== 1) { return name; }
    const [band, ...rest] = name.split(', ');
    return [`the last of the ${band!.replace(/^(the|a|an|some) /i, '')}`, ...rest].join(', ');
  }
}
