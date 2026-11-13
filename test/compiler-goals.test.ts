import { describe, expect, it } from 'bun:test';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleParser } from '../src/lang/module-parser';

// What a module's pressures, outcomes and people's goals say is checked with the module in one pass (Mission 21,
// world/construction.md §6: the module had been checked whole once for every one of them, a second of a generated
// start), and an ill-formed one is refused as it was.
const module = ModuleParser.parse(`Module m "A yard" {
  Kind thing. Relation lit(thing). Entity lamp: thing "a lamp".
  Goal false.
}`);
describe('a module checked with the predicates its people pursue', () => {
  it('passes a well-formed predicate and refuses one that names what the module does not have', () => {
    const compiler = new ModuleCompiler();
    expect(() => compiler.validate(module, [ModuleParser.predicate('lit(lamp)')])).not.toThrow();
    expect(() => compiler.validate(module, [ModuleParser.predicate('lit(lamp)'),
      ModuleParser.predicate('burning(lamp)')])).toThrow();
    expect(() => compiler.validate(module, [ModuleParser.predicate('lit(candle)')])).toThrow();
  });
});
