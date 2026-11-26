import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// A thing of a module's own that is worn (the item audit, 6 November: a module's kind could be like the catalog's
// things but could not say it was worn, so a bell rung over the dead could not be hung on a belt): `worn as <slot>`,
// and what it grants granted while it is.
describe('a kind of a module\'s own, worn', () => {
  it('is worn where it says, and brings what it grants', () => {
    const module = ModuleParser.parseWithin(CanonVocabulary.context(), `Module bells "Bells" {
  Kind dirge_bell "a dirge bell" like holy_symbol granting lore worn as charm described "A small bell of grey bronze.".
  Goal false.
}`);
    expect(module.catalog?.items?.dirge_bell).toMatchObject({ name: 'a dirge bell', slot: 'charm',
      grants: { skill: 'lore' }, category: 'tool' });
  });
  it('is refused where nothing of the catalog is worn', () => {
    expect(() => ModuleParser.parseWithin(CanonVocabulary.context(), `Module bells "Bells" {
  Kind dirge_bell "a dirge bell" like holy_symbol worn as tail.
  Goal false.
}`)).toThrow(/worn as tail, where nothing of the catalog is worn/);
  });
});
