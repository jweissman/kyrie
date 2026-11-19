import { Amounts } from './amounts';
import type { Amount } from '../lang/parse';
import type { Expressions } from '../expressions';

// How long what an effect lays lasts (srd-proving-cases.md case 44): a number of turns, or an expression its
// caster's values settle as it is laid, as temporary hit points and images are thrown (the SRD's "1 round/level" is
// #castingLevel, "1 minute/level" 10 * #castingLevel, Acid Arrow's "1 round per three levels"
// floor(#castingLevel / 3)). One that comes to no turns lays nothing: Acid Arrow's acid lingers from the third casting
// level. Elsewhere (a book's line, the census, what a creature reads of a condition it holds) it is read at a casting
// level said, or its nominal one: the census's caster, the fifth.
export type Duration = number | Amount;
export class Lasting {
  static readonly nominal = 5;
  // Its turns as it is laid, by its caster's values and the fight's stream (the nominal caster's mean, without one).
  static laid(duration: Duration, expressions: Expressions | undefined, values: Record<string, number>): number {
    if (typeof duration === 'number') { return duration; }
    if (duration.kind === 'literal') { return duration.value; }
    return Math.max(0, Math.floor(expressions ? expressions.number(duration.expression, values)
      : Lasting.at(duration, Lasting.nominal)));
  }
  // Its turns at a casting level, the mean of any dice.
  static at(duration: Duration, castingLevel: number): number {
    if (typeof duration === 'number') { return duration; }
    if (duration.kind === 'literal') { return duration.value; }
    return Math.max(0, Math.floor(Amounts.mean(duration.expression, { castingLevel, level: castingLevel })));
  }
  // Whether it grows with its caster.
  static grows(duration: Duration): boolean {
    return typeof duration !== 'number' && duration.kind === 'deem' && Lasting.at(duration, 1) !== Lasting.at(duration, 20);
  }
  // What is wrong with one as written: a whole number of turns from one, or an expression that reads.
  static problem(duration: Duration): string | undefined {
    if (typeof duration === 'number') {
      return Number.isSafeInteger(duration) && duration >= 1 ? undefined : 'Status duration must be positive';
    }
    if (duration.kind === 'literal') { return Lasting.problem(duration.value); }
    try { Lasting.at(duration, 20); } catch { return `Status duration ${duration.expression} does not read`; }
    return Lasting.at(duration, 20) >= 1 ? undefined : 'Status duration never comes to a turn';
  }
}
