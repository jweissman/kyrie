// A page of what can be done in the room there is (the owner's ruling 2, 16 November: four acts in view, the rest
// paged, never unfolded): all of it when it fits, else one fewer than the room at a time and the row that turns the
// page in the last (it is no act, but it is a row: the owner, 17 November, never more than four in view), round to the
// first; no room (answers owed fill it), nothing. A conversation's rows and a fight's kinds. apart: the row that turns
// the page is drawn apart from these (a fight's, beside its hand, where Back is), so a room's worth are shown.
// lead: rows drawn above the first page only (a lens's kept rows, Lensed.kept), taking its places there and on no other
// page, so that what is paged keeps its pages.
export class Paging {
  static of<T>(items: readonly T[], room: number, page: number,
    how: boolean | { apart?: boolean; lead?: number } = false): { shown: T[]; at: number; pages: number } {
    const { apart = false, lead = 0 } = typeof how === 'boolean' ? { apart: how } : how;
    if (room <= 0) { return { shown: [], at: 0, pages: 1 }; }
    if (items.length + lead <= room) { return { shown: [...items], at: 0, pages: 1 }; }
    const per = apart ? room : Math.max(1, room - 1), first = Math.max(1, per - lead);
    const pages = 1 + Math.ceil(Math.max(0, items.length - first) / per);
    const at = ((page % pages) + pages) % pages, from = at ? first + (at - 1) * per : 0;
    return { shown: items.slice(from, from + (at ? per : first)), at, pages };
  }
}
