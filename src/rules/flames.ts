import { Content } from '../content';
import type { ConditionInstance } from '../creature';

// A flame in hand is one: a lantern lit puts out the candle that burned, a torch the lantern (cold play 5, CL-38: a
// candle and a lantern burning at once). A flame is a condition that grants one (candlelit, torchlit, lamplit); a
// light conjured is not.
export class Flames {
  // Those a status put on would put out: every other flame, where it is one.
  static out(statuses: readonly ConditionInstance[], status: string): ConditionInstance[] {
    return this.is(status) ? statuses.filter(s => s.id !== status && this.is(s.id)) : [];
  }
  private static is(id: string): boolean { return !!Content.statuses[id]?.grants?.includes('flame'); }
}
