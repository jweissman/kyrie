import { afterEach, describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { LocalKinds } from '../src/canon/local-catalog';

// A thing of a module's own that is worn (the item audit, 6 November: a module's kind could be like the catalog's
// things but could not say it was worn, so a bell rung over the dead could not be hung on a belt): `worn as <slot>`,
// and what it grants granted while it is.
describe('a kind of a module\'s own, worn', () => {
  afterEach(() => { LocalKinds.reset(); });
  it('is worn where it says, and brings what it grants', () => {
    const module = ModuleParser.parse(`Module bells "Bells" {
  Kind dirge_bell "a dirge bell" like holy_symbol granting lore worn as charm described "A small bell of grey bronze.".
  Goal false.
}`);
    expect(module.catalog?.items?.dirge_bell).toMatchObject({ name: 'a dirge bell', slot: 'charm',
      grants: { skill: 'lore' }, category: 'tool' });
  });
  it('is refused where nothing of the catalog is worn', () => {
    expect(() => ModuleParser.parse(`Module bells "Bells" {
  Kind dirge_bell "a dirge bell" like holy_symbol worn as tail.
  Goal false.
}`)).toThrow(/worn as tail, where nothing of the catalog is worn/);
  });
});
