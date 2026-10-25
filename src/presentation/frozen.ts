// A value and everything it holds, made unchangeable: one value handed to many readers is never changed by one of
// them under the others (a change throws, in a module, rather than passing unseen).
export class Frozen {
  static deep<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const inner of Object.values(value)) { Frozen.deep(inner); }
    }
    return value;
  }
}
