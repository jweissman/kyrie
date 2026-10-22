// A binary heap of cells by priority, least first; ties go to the cell pushed first, so the order is fixed.
export class MinHeap {
  private items: { priority: number; cell: number; order: number }[] = [];
  private pushed = 0;
  get size(): number { return this.items.length; }
  push(cell: number, priority: number) {
    const items = this.items;
    items.push({ priority, cell, order: this.pushed++ });
    for (let i = items.length - 1; i > 0;) {
      const parent = (i - 1) >> 1;
      if (!this.less(i, parent)) { break; }
      [items[i], items[parent]] = [items[parent]!, items[i]!];
      i = parent;
    }
  }
  pop(): { cell: number; priority: number } | undefined {
    const items = this.items, top = items[0];
    if (!top) { return undefined; }
    const last = items.pop()!;
    if (items.length) {
      items[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1;
        let least = i;
        if (l < items.length && this.less(l, least)) { least = l; }
        if (r < items.length && this.less(r, least)) { least = r; }
        if (least === i) { break; }
        [items[i], items[least]] = [items[least]!, items[i]!];
        i = least;
      }
    }
    return { cell: top.cell, priority: top.priority };
  }
  private less(a: number, b: number): boolean {
    const x = this.items[a]!, y = this.items[b]!;
    return x.priority < y.priority || (x.priority === y.priority && x.order < y.order);
  }
}
