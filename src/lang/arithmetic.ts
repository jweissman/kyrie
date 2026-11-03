// Arithmetic as Kyr has it: a sum, a difference, a product, a quotient rounded down (none by nothing), and the less
// or the greater of two (AUT-05).
export class Arithmetic {
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
