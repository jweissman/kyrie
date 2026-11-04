import type { Screen } from '../../src/ui/screen-types';

// The place your aim names, among the places you know: by the ids of the places the engine says the aim is about (see
// Undertakings.places), the most particular first (the barrow before the country it stands in). It had been found by
// matching the aim's words against place names (the owner, 4 November: "if we're just matching by regex").
export class Aims {
  static named<T extends { id: string }>(screen: Screen, places: T[], aim: string | undefined): T | undefined {
    const ids = screen.aims?.find(a => a.text === aim)?.places ?? [];
    for (const id of ids) {
      const found = places.find(d => d.id === id);
      if (found) { return found; }
    }
    return undefined;
  }
}
