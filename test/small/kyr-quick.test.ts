import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import type * as ohm from 'ohm-js';
import { Grammars } from '../../src/lang/grammars';
import { ModuleParser } from '../../src/lang/module-parser';

// OR-121: the parser reads with KyrQuick, Kyr's string, comment, ident and identPart written as ranges of characters.
// A text matches it exactly where it matches Kyr as written, and every node outside those rules is the same rule over
// the same span (so the parser, which reads those rules by their text alone, reads the same module); a text that
// does not match is told why by Kyr as written. On the shared rules every world is read with, and on texts made to
// try the edges: letters beyond ASCII, characters beyond the first plane, escapes, a lone surrogate, a line's end in
// a string. (The whole corpus, data/ and test/ and two drawn countries, 1178 texts and 19 MB, was found alike once.)
class Shapes {
  static of(grammar: ohm.Grammar): (m: ohm.MatchResult) => string {
    const s = grammar.createSemantics().addOperation<string>('shape', {
      _nonterminal(this: ohm.Node, ...c: ohm.Node[]) { return `${Shapes.at(this)}(${Shapes.all(c)})`; },
      _terminal(this: ohm.Node) { return Shapes.at(this); },
      _iter(this: ohm.Node, ...c: ohm.Node[]) { return `${Shapes.at(this)}[${Shapes.all(c)}]`; },
      string(this: ohm.Node, _o: ohm.Node, _c: ohm.Node, _e: ohm.Node) { return Shapes.at(this); },
      ident(this: ohm.Node, _l: ohm.Node, _p: ohm.Node) { return Shapes.at(this); },
      identPart(this: ohm.Node, _p: ohm.Node) { return Shapes.at(this); },
    });
    return (m: ohm.MatchResult) => (s(m) as unknown as { shape(): string }).shape();
  }
  static at(n: ohm.Node): string { return `${n.ctorName}@${n.source.startIdx}-${n.source.endIdx}`; }
  static all(c: ohm.Node[]): string { return c.map(x => (x as unknown as { shape(): string }).shape()).join(','); }
}

describe('KyrQuick', () => {
  const written = Shapes.of(Grammars.kyr), quick = Shapes.of(Grammars.quick);
  const alike = (text: string, rule?: string) => {
    const a = Grammars.kyr.match(text, rule), b = Grammars.quick.match(text, rule);
    return a.failed() || b.failed() ? [a.failed(), b.failed()] : written(a) === quick(b);
  };
  it('reads the shared rules as Kyr does', () => {
    const rules = readdirSync('data/rules').filter(f => f.endsWith('.kyr'));
    expect(rules.length).toBeGreaterThan(10);
    for (const f of rules) { expect([f, alike(readFileSync(`data/rules/${f}`, 'utf8'))]).toEqual([f, true]); }
  });
  it('matches the edges where Kyr does, and refuses where it refuses', () => {
    const place = (id: string, name: string) =>
      `Module m "M" {\n  Place ${id} "${name}" is room. // ${name.replace(/\n/g, ' ')}\n}`;
    const read = ['café', 'straße', '東京', 'a-b_c9', 'Zed'].map(id => place(id, id))
      .concat(['tab\there', 'a 🐉 dragon', 'it\\\'s \\"quoted\\" \\\\ \\{x\\}', 'lone \ud800 half', '#[]^`~!',
        'back\\\nslash'].map(n => place('p', n)));
    for (const text of read) { expect([text, alike(text)]).toEqual([text, true]); }
    const refused = [place('p', 'line\nend'), place('p', 'return\rend'), place('9p', 'x'), place('p', 'open'), '"'];
    for (const text of refused.map(t => t.replace('"open"', '"open'))) {
      expect([text, alike(text)]).toEqual([text, [true, true]]);
    }
    expect(alike('at(actor, café) and not asleep(東京)', 'Predicate')).toBe(true);
  });
  it('is told why it does not match by Kyr as written', () => {
    const text = 'Module m "M" {\n  Place p "the yard" is .\n}';
    const written = Grammars.kyr.match(text);
    expect(written.failed() && written.message).toContain('Line 2');
    expect(() => ModuleParser.parse(text)).toThrow(`Invalid Kyr module: ${Grammars.why(text)}`);
  });
});
