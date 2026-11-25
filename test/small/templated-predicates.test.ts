import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../../src/lang/module-parser';
import { TemplatedPredicates } from '../../src/lang/templated-predicates';

// OR-121: who a topic is put to is parsed once with a stand-in, and the speaker put in its place. What comes back is
// what parsing the text with the speaker written in gives, for an id of any shape an ident takes (a hyphen, a digit,
// a word the language says otherwise), and a topic's own requirement is the same either way. One unseen by the company
// is put nothing (OR-524).
describe('A templated predicate', () => {
  const s = TemplatedPredicates.stand;
  const along = (who: string) => `travelsWith(${who}, actor) and not (joinedAs(?m, ${who}) and not awake(?m))`;
  const reach = (who: string) => `able(actor) and distinct(actor, ${who}) and at(actor, site)`
    + ` and ((able(${who}) and not asleep(${who}) and at(${who}, site) and not unseen(${who}, actor))`
    + ` or (${along(who)}))`;
  it('is the parse of its text with the id written in', () => {
    for (const who of ['wren', 's5_traveller', 'old-hob', 'z9', 'and', 'true', 'site']) {
      expect(TemplatedPredicates.of(reach(s), who, ModuleParser.predicate)).toEqual(ModuleParser.predicate(reach(who)));
    }
  });
  it('is who a topic is put to, travelling or not', () => {
    const travelling = `able(actor) and distinct(actor, wren) and at(actor, site) and ${along('wren')}`;
    expect(TemplatedPredicates.topic('wren', false, ModuleParser.predicate)).toEqual(ModuleParser.predicate(reach('wren')));
    expect(TemplatedPredicates.topic('wren', true, ModuleParser.predicate)).toEqual(ModuleParser.predicate(travelling));
  });
  it('is its own copy each time', () => {
    const one = TemplatedPredicates.of(reach(s), 'wren', ModuleParser.predicate);
    (one as { kind: string }).kind = 'or';
    const again = TemplatedPredicates.of(reach(s), 'wren', ModuleParser.predicate);
    expect(again).toEqual(ModuleParser.predicate(reach('wren')));
  });
  it('makes a topic require what it did', () => {
    const module = ModuleParser.parse(`Module t "T" {
  Place hall "the hall" is room.
  Person wren "Wren" at hall { }
  Topic ask_wren with wren "Ask" when true { Says "Yes.". }
  Topic ask_along with wren travelling "Ask on the way" when true { Says "Yes.". }
}`);
    const [plain, travelling] = ['ask_wren', 'ask_along'].map(id => module.actions.find(a => a.id === id)!.requires);
    expect(plain).toEqual({ kind: 'and', left: ModuleParser.predicate(reach('wren')),
      right: { kind: 'boolean', value: true } });
    expect(travelling).toEqual({ kind: 'and', right: { kind: 'boolean', value: true },
      left: ModuleParser.predicate(`able(actor) and distinct(actor, wren) and at(actor, site) and ${along('wren')}`) });
  });
});
