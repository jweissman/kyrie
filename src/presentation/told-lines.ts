import type { ExchangeLine } from './narrator';

// What of an act's telling a client says, and when (the first blind playtest, 14 November: "1 on the die, needing 11"
// beside a success the prose had already made plain; BP-03). The outcome is told in prose; the dice behind it (a
// check's or a save's roll) are kept for a deliberate look, never said with the outcome. One rule for both clients.
export class ToldLines {
  static said(lines: readonly ExchangeLine[], looked = false): ExchangeLine[] {
    return lines.filter(l => looked || l.kind !== 'roll');
  }
}
