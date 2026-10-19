import { Deem } from 'deem';
import { FantasyRules } from './fantasy-rules';
import type { Amount } from './lang/parse';

export class Expressions {
  private runtime: Deem;
  static seed(seed: string): number {
    let hash = 2166136261;
    for (const char of seed) { hash = Math.imul(hash ^ char.charCodeAt(0), 16777619); }
    return hash >>> 0;
  }
  constructor(seed: string) {
    this.runtime = new Deem({ seed: Expressions.seed(seed), stdlib: FantasyRules.functions });
  }
  integer(expression: string, context: Record<string, number> = {}): number {
    const value = this.runtime.evaluate(expression, context);
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) { throw new Error('Expected a safe integer'); }
    return value;
  }
  number(expression: string, context: Record<string, number> = {}): number {
    const value = this.runtime.evaluate(expression, context);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || !Number.isSafeInteger(value)) {
      throw new Error(`Expected a nonnegative safe integer from (${expression}), got ${String(value)}`);
    }
    return value;
  }
  condition(expression: string, context: Record<string, number>): boolean {
    const result = this.runtime.evaluate(expression, context);
    if (typeof result !== 'boolean') { throw new Error(`Expected boolean from (${expression})`); }
    return result;
  }
  amount(amount: Amount, context: Record<string, number>): number {
    return this.number(amount.kind === 'literal' ? String(amount.value) : amount.expression, context);
  }
}
