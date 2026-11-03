import type { Screen } from '../../src/ui/screen-types';

// The aim the player has chosen to follow (the owner, 3 November: "a clearer currently selected quest"): one of what
// the company means to do, picked in the Notes, said on every page as Your aim and opened on by the map, until it is
// done, or another is chosen. Kept for the game in this browser, by its country and its protagonist, so a game taken
// up again follows the same.
export class Followed {
  private static key(screen: Screen): string {
    return `kyrie:followed:${screen.party[0]?.name ?? ''}:${screen.path[0]?.name ?? ''}`;
  }
  // The aim followed, while it is still one of the company's aims.
  static of(screen: Screen, chosen?: string): string | undefined {
    const aim = chosen ?? this.kept(screen);
    return aim && screen.objectives.includes(aim) ? aim : undefined;
  }
  static keep(screen: Screen, aim: string | undefined) {
    try {
      if (aim) { localStorage.setItem(this.key(screen), aim); } else { localStorage.removeItem(this.key(screen)); }
    } catch { /* A browser that keeps nothing follows for this session only. */ }
  }
  private static kept(screen: Screen): string | undefined {
    try { return localStorage.getItem(this.key(screen)) ?? undefined; } catch { return undefined; }
  }
}
