import type { Catalog, Member } from '../engine/protocol';

// The weapon someone sets out with, chosen at creation from their calling's own (a ranger's longsword, spear, javelin
// or shortbow); until one is chosen, the one they would strike best with, by the quality it is struck with: a bow by
// quickness, anything else by strength (see Fighting). A fresh play's ranger, quick and slight, had been given a
// spear by the luck of the draw, and could not hit a knight with it.
export class Arms {
  static of(member: Member, catalog: Catalog): Catalog['callings'][number]['weapons'] {
    return catalog.callings.find(c => c.id === member.classId)?.weapons ?? [];
  }
  static suited(member: Member, catalog: Catalog): string | undefined {
    const weapons = this.of(member, catalog);
    return weapons.reduce<{ id?: string; worth: number }>((best, w) => {
      const worth = this.worth(member, catalog, w.missile ? 'dexterity' : 'strength');
      return worth > best.worth ? { id: w.id, worth } : best;
    }, { worth: -Infinity }).id;
  }
  // What a quality is worth in a fight, as the page reckons it: the roll placed on it, with what the people and the
  // calling add.
  static worth(member: Member, catalog: Catalog, quality: string): number {
    const rolled = (member.rolled as Record<string, number> | undefined)?.[quality] ?? 10;
    const people = catalog.ancestries.find(a => a.id === member.raceId)?.qualities[quality] ?? 0;
    const calling = catalog.callings.find(c => c.id === member.classId)?.qualities[quality] ?? 0;
    return catalog.worth[Math.max(1, rolled + people + calling)] ?? 0;
  }
}
