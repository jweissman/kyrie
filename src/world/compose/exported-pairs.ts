// Exported places by an index of their own, and two of them as one number: the hours between every two exported places
// are kept by these, not by a string per pair.
export class ExportedPairs {
  // More exported places than a region will ever hold, so that two indices make one key.
  private static readonly span = 1 << 20;
  private readonly list: string[] = [];
  private readonly index = new Map<string, number>();
  constructor(private readonly ref: Map<string, string>) {}
  of(place: string): number {
    const id = this.ref.get(place);
    if (!id) { return -1; }
    let i = this.index.get(id);
    if (i === undefined) { i = this.list.push(id) - 1; this.index.set(id, i); }
    return i;
  }
  key(a: string, b: string): number {
    const i = this.of(a), j = this.of(b);
    return i < 0 || j < 0 ? -1 : this.joined(i, j);
  }
  joined(i: number, j: number): number { return i * ExportedPairs.span + j; }
  ids(key: number): [string, string] {
    return [this.list[Math.floor(key / ExportedPairs.span)]!, this.list[key % ExportedPairs.span]!];
  }
}
