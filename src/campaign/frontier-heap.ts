// The states a search has still to expand, cheapest first and, of those as cheap, the first found first: what sorting
// the whole list again before each was taken gave (a stable sort), at the cost of a heap's push and pop (the
// architecture review's L3: the planner re-sorted its frontier).
export class Frontier<T extends { cost: number }> {
  private readonly heap: { node: T; order: number }[] = [];
  private pushed = 0;
  get size(): number { return this.heap.length; }
  push(node: T) {
    const heap = this.heap;
    heap.push({ node, order: this.pushed++ });
    for (let i = heap.length - 1; i > 0;) {
      const parent = (i - 1) >> 1;
      if (!this.before(heap[i]!, heap[parent]!)) { break; }
      [heap[i], heap[parent]] = [heap[parent]!, heap[i]!]; i = parent;
    }
  }
  pop(): T | undefined {
    const heap = this.heap, top = heap[0], last = heap.pop();
    if (!top || !last) { return undefined; }
    if (heap.length) { heap[0] = last; this.sink(0); }
    return top.node;
  }
  private sink(at: number) {
    const heap = this.heap;
    for (let i = at; ;) {
      const left = 2 * i + 1, right = left + 1;
      let first = i;
      if (left < heap.length && this.before(heap[left]!, heap[first]!)) { first = left; }
      if (right < heap.length && this.before(heap[right]!, heap[first]!)) { first = right; }
      if (first === i) { return; }
      [heap[i], heap[first]] = [heap[first]!, heap[i]!]; i = first;
    }
  }
  private before(a: { node: T; order: number }, b: { node: T; order: number }): boolean {
    return a.node.cost < b.node.cost || (a.node.cost === b.node.cost && a.order < b.order);
  }
}
