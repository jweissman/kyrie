// What ends the present attention or leaves where the company stands (taking your leave, Back, putting away the map,
// going out of a building or a site) is the last of any rows it is among, for every client: the owner's playtest of
// 25 November, "'Take your leave' or 'exit-like' options always need to come at the bottom". One rule, the engine's:
// Doable's rows, the runner's offer and the page's menus are each ordered by it.
export interface Leavable { id: string; label: string; does?: string; command?: string }
// Where the company stands, as much of the screen as says which ways lead out (ExitRow's transition and destination).
interface Here {
  place: { indoors?: boolean };
  exits: { id: string; transition: string; destination: { indoors?: boolean; underground?: boolean } }[];
}
export class Leaving {
  // The ways out of here: out of a building or a site (a way's transition, the world's), or from under a roof to the
  // open (the shop's door onto the green).
  static ways(screen: Here): Set<string> {
    const roofed = !!screen.place.indoors;
    return new Set(screen.exits.filter(e => e.transition === 'leave'
      || (roofed && !e.destination.indoors && !e.destination.underground && e.transition === 'walk')).map(e => e.id));
  }
  static is(row: Leavable, ways: Set<string> = new Set()): boolean {
    const does = row.does ?? row.command ?? '';
    if (does === 'take_leave' || does.startsWith('take_leave(') || /#(leave|back)$/.test(row.id)
      || row.id === 'trade-back') { return true; }
    if (/^(Back|Put away the map|Take your leave)\b/.test(row.label) || /^Out (to|of|into|onto)\b/.test(row.label)) {
      return true;
    }
    return [...ways].some(w => row.id === w || row.id.startsWith(`${w}/`));
  }
  // The rows in their order, what leaves after the rest.
  static last<T>(rows: readonly T[], leaves: (row: T) => boolean): T[] {
    return [...rows.filter(r => !leaves(r)), ...rows.filter(r => leaves(r))];
  }
}
