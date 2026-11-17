// A page of what can be done in the room there is (the owner's ruling 2, 16 November: four acts in view, the rest
// paged, never unfolded): all of it when it fits, else one fewer than the room at a time and the row that turns the
// page in the last (it is no act, but it is a row: the owner, 17 November, never more than four in view), round to the
// first; no room (answers owed fill it), nothing. A conversation's rows and a fight's kinds. apart: the row that turns
// the page is drawn apart from these (a fight's, beside its hand, where Back is), so a room's worth are shown.
export class Paging {
  static of<T>(items: readonly T[], room: number, page: number, apart = false):
    { shown: T[]; at: number; pages: number } {
    if (room <= 0) { return { shown: [], at: 0, pages: 1 }; }
    if (items.length <= room) { return { shown: [...items], at: 0, pages: 1 }; }
    const per = apart ? room : Math.max(1, room - 1), pages = Math.ceil(items.length / per);
    const at = ((page % pages) + pages) % pages;
    return { shown: items.slice(at * per, at * per + per), at, pages };
  }
}
