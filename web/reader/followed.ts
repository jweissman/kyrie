import type { Screen } from '../../src/ui/screen-types';

// The aim the player follows (the owner, 3 November: "a clearer currently selected quest"): one of what the company
// means to do, said on every page and opened on by the map. The engine keeps it, by the aim's id, with the game
// (see Undertakings): it had been kept here in the browser by the aim's words, apart from what the page led toward.
export class Followed {
  static of(screen: Screen): string | undefined {
    return screen.aims?.find(a => a.followed)?.text;
  }
  // The aim followed, by its id.
  static held(screen: Screen): string | undefined {
    return screen.aims?.find(a => a.followed)?.id;
  }
}
