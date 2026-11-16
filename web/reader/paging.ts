// A page of what can be done in the room there is (the owner's ruling 2, 16 November: four acts in view, the rest
// paged, never unfolded): all of it when it fits, else a room's worth at a time and a row that turns the page (which is
// no act), round to the first; no room (answers owed fill it), nothing. A conversation's rows and a fight's kinds.
export class Paging {
  static of<T>(items: readonly T[], room: number, page: number): { shown: T[]; at: number; pages: number } {
    if (room <= 0) { return { shown: [], at: 0, pages: 1 }; }
    if (items.length <= room) { return { shown: [...items], at: 0, pages: 1 }; }
    const pages = Math.ceil(items.length / room), at = ((page % pages) + pages) % pages;
    return { shown: items.slice(at * room, at * room + room), at, pages };
  }
}
