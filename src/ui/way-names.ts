// What a way is called after where it leads, in a row of the ways on: said only where it tells the reader something.
export class WayNames {
  // A way into an enclosure named for it ("the first flight of the Stair", into the Duelling Stair) is said without
  // the enclosure again: "Into the Duelling Stair by the first flight", where it had said the Stair twice (BOF-36).
  static unrepeated(way: string, scope?: string): string {
    const of = / of (?:the )?([^,]+)$/.exec(way);
    return of && scope && this.tail(of[1]!) === this.tail(scope) ? way.slice(0, of.index) : way;
  }
  // A way that already says where it goes ("the path up into the old woods", into the old woods above Oakhythe) adds
  // nothing said after it (the lead's play of the reference opening, 27 November).
  static named(way: string, destination: string): boolean {
    const head = destination.split(/ (?:above|below|beside|near|at|of|by|under|over|in|on) /)[0]!.toLowerCase();
    return head.split(' ').length > 1 && way.toLowerCase().includes(head);
  }
  private static tail(name: string): string { return name.split(' ').pop()!.toLowerCase(); }
}
