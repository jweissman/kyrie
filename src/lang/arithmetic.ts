// Arithmetic as Kyr has it: a sum, a difference, a product, a quotient rounded down (none by nothing), and the less
// or the greater of two (AUT-05).
export class Arithmetic {
  // A number a query is given, named in its body as a value (`Query speaking(a: group, n: number) means beat(a) == n`):
  // Gosse's Company's second pass (GOS-12) wrote the comparison out twenty-two times, for want of it. Written as a call
  // of this name, which no module can declare.
  static readonly given = '#';
  // How many ways a condition holds, as the world answers it (count(…): the House That Grows kept a tally by hand at
  // every change to what it counted, HTH-06).
  static count(ways: Iterator<unknown>): number {
    let n = 0;
    while (!ways.next().done) { n++; }
    return n;
  }
  static number(given: string): number {
    const n = Number(given);
    if (!Number.isSafeInteger(n)) { throw new Error(`${given} is no number`); }
    return n;
  }
  static of(op: string, left: number, right: number): number {
    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '/': return right === 0 ? 0 : Math.floor(left / right);
      case 'min': return Math.min(left, right);
      case 'max': return Math.max(left, right);
      default: return left * right;
    }
  }
}
