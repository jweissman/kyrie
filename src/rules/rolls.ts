// Six rolls of three dice, placed where a calling would want them: the highest on the quality it adds most to, and
// so on down, ties in the qualities' own order. A new character had come up "Warrior, Str 8 … Int 17", which read as
// random rather than as a start (the cold evaluation); every roll can still be changed over.
export class Rolls {
  static suited(rolled: Record<string, number>, wants: Record<string, number>): Record<string, number> {
    const qualities = Object.keys(rolled), values = Object.values(rolled).sort((a, b) => b - a);
    const order = [...qualities].sort((a, b) => (wants[b] ?? 0) - (wants[a] ?? 0)
      || qualities.indexOf(a) - qualities.indexOf(b));
    return Object.fromEntries(qualities.map(q => [q, values[order.indexOf(q)]!]));
  }
}
