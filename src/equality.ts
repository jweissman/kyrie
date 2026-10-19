export class Equality {
  static deep(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) { return true; }
    if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) { return false; }
    if (Array.isArray(left) !== Array.isArray(right)) { return false; }
    const a = left as Record<string, unknown>, b = right as Record<string, unknown>;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length
      && keys.every(key => Object.hasOwn(b, key) && Equality.deep(a[key], b[key]));
  }
}
