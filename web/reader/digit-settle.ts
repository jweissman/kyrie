// A digit in a conversation is the reply drawn beside it now, and only once its rows have stood a moment (R11-01: the
// replies renumber after each answer, and a number pressed for what had been there did what took its place: once
// informing on Heian). The rows are seen as they are drawn (TalkStage, after each render) and again as a key goes
// down; a digit pressed within `ms` of their changing is refused, not taken for whatever moved under it.
export class DigitSettle {
  static readonly ms = 450;
  private static rows = '';
  private static since = Number.NEGATIVE_INFINITY;
  // The numbered rows as drawn, by their choices in their order.
  static drawn(): string {
    return [...document.querySelectorAll<HTMLElement>('.talk [data-number]')]
      .map(e => `${e.dataset.number}=${e.dataset.choice ?? ''}`).join('|');
  }
  static seen(rows: string, now: number = performance.now()): void {
    if (rows !== this.rows) { this.rows = rows; this.since = now; }
  }
  // Whether a digit may be taken on these rows now: they are the ones seen, and have stood since `ms` ago.
  static settled(rows: string, now: number = performance.now()): boolean {
    this.seen(rows, now);
    return now - this.since >= this.ms;
  }
  static reset(): void { this.rows = ''; this.since = Number.NEGATIVE_INFINITY; }
}
