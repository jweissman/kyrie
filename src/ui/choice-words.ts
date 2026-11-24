// An act's words and its one way of doing it, said as one: run on where the words lead into it ("Take for Bran",
// "Buy a ration"), else apart ("Lift it — Bran takes the weight"). A choice's name of parts ("Lift it; Bran takes the
// weight") is said so wherever it is said whole: the runner had kept the semicolon where the engine said the dash
// (scripts/offer-parity, the adit's fallen prop).
export class ChoiceWords {
  static joined(label: string, rest: string): string {
    const article = /^(A|An|The|Some) /.test(rest);
    const runs = /\b(on|for|to|with|by|at|from|into)$/i.test(label) || !/^[A-Z]/.test(rest) || article;
    return `${label}${runs ? ' ' : ' — '}${article ? `${rest.charAt(0).toLowerCase()}${rest.slice(1)}` : rest}`;
  }
  static whole(name: string): string {
    return name.split('; ').reduce((said, part) => this.joined(said, part));
  }
}
