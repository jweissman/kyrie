// What a way is called after where it leads, in a row of the ways on: said only where it tells the reader something.
export class WayNames {
  // A way into an enclosure named for it ("the first flight of the Stair", into the Duelling Stair) is said without
  // the enclosure again: "Into the Duelling Stair by the first flight", where it had said the Stair twice (BOF-36).
  static unrepeated(way: string, scope?: string): string {
    const of = / of (?:the )?([^,]+)$/.exec(way);
    return of && scope && this.tail(of[1]!) === this.tail(scope) ? way.slice(0, of.index) : way;
  }
  // A way whose name ends where the row says it goes adds nothing said after it: "the path up into the old woods", into
  // the old woods above Oakhythe (the lead's play of the reference opening, 27 November). One that says more ("the
  // ladder to the boiling-house loft", into the boiling-house) or names what it belongs to ("the steeple door") stays.
  static named(way: string, destination: string): boolean {
    const head = destination.split(/ (?:above|below|beside|near|at|of|by|under|over|in|on) /)[0]!.toLowerCase();
    return head.split(' ').length > 1 && new RegExp(`\\b(?:into|to|toward|towards) ${WayNames.escape(head)}$`)
      .test(way.toLowerCase());
  }
  private static escape(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  private static tail(name: string): string { return name.split(' ').pop()!.toLowerCase(); }
}
