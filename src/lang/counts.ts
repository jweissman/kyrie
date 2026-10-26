type Count = { base: number; net: number };

// What one list of effects does to each count it changes, in all (the architecture review's A18). Increase and
// Decrease are summed over the list, and the sum stops at nothing: the same changes come to the same count in any
// order ([-5, +5] gave 5 where [+5, -5] gave 3), and a rule's dose that recovers eight at a time does not stop play
// (The Patient Star's P5, The Road the Star Came Down's B2). A quantity Set outright is what it is set to, less than
// nothing if it is so set (selm weighs less than nothing), and what follows in the list counts from it; a count that
// stood below nothing is taken no further below by a Decrease. An action whose effects would take a count past
// nothing is not offered (World.admits): what cannot be paid for is not bought.
export class Counts {
  private readonly held = new Map<string, Count>();
  // The count after this change; what it stood at before the list is read the first time the list changes it.
  next(key: string, kind: 'set' | 'increase' | 'decrease', amount: number, stood: () => number): number {
    if (kind === 'set') { this.held.set(key, { base: amount, net: 0 }); return amount; }
    const count = this.held.get(key) ?? { base: stood(), net: 0 };
    count.net += kind === 'increase' ? amount : -amount;
    this.held.set(key, count);
    return Counts.value(count);
  }
  // What the list has made of this count so far, if it has changed it.
  now(key: string): number | undefined {
    const count = this.held.get(key);
    return count && Counts.value(count);
  }
  // Whether the list takes any count past nothing, in all.
  past(): boolean {
    for (const count of this.held.values()) {
      if (count.base + count.net < Counts.floor(count)) { return true; }
    }
    return false;
  }
  private static value(count: Count): number { return Math.max(count.base + count.net, Counts.floor(count)); }
  private static floor(count: Count): number { return Math.min(count.base, 0); }
}
