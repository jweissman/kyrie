import type { Change, NumberValue, Predicate, Value } from './module';
import type { Dice } from './module-compiler';

// A definition's dice settled as it is instantiated (ModuleCompiler.instantiate): each roll in parentheses, `(2d6)`, a
// Deem expression rolled once for the module; arithmetic is left to be worked out as it is read. Each part is copied
// only where it changes.
export class Settling {
  // A change with its value and its guard (Change.when) settled, as a new change; one with neither as it is.
  static change<C extends Change>(expressions: Dice | undefined, c: C): C {
    const next = 'value' in c ? { ...c, value: Settling.value(expressions, c.value) } : c;
    return next.when ? { ...next, when: Settling.predicate(expressions, next.when) } : next;
  }
  static value(expressions: Dice | undefined, value: Value): Value {
    if (value.kind === 'call' || value.kind === 'count') { return value; }
    if (value.kind === 'arith') { return { ...value, left: this.value(expressions, value.left),
      right: this.value(expressions, value.right) }; }
    return this.number(expressions, value);
  }
  static number(expressions: Dice | undefined, value: NumberValue): NumberValue {
    if (value.kind !== 'deem') { return { kind: 'number', value: value.value }; }
    if (!expressions) {
      throw new Error(`The module rolls (${value.expression}), and no dice were given to instantiate it`);
    }
    return { kind: 'number', value: expressions.number(value.expression) };
  }
  static predicate(expressions: Dice | undefined, predicate: Predicate): Predicate {
    switch (predicate.kind) {
      case 'compare': return { ...predicate,
        left: Settling.value(expressions, predicate.left),
        right: Settling.value(expressions, predicate.right) };
      case 'and': case 'or': return { ...predicate, left: this.predicate(expressions, predicate.left),
        right: this.predicate(expressions, predicate.right) };
      case 'not': return { ...predicate, value: this.predicate(expressions, predicate.value) };
      default: return predicate;
    }
  }
}
