import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { GrammarRecipes } from '../../scripts/grammar-recipes';
import { ModuleParser } from '../../src/lang/module-parser';

// The Kyr grammars the parser loads are its sources' (see Grammars): each recipe kept is the one its .ohm source makes
// now, so a grammar edited and not made again fails here, not at play (run `bun scripts/grammar-recipes.ts`); and Kyr
// is read by the recipe as it was by the source.
describe('the grammars loaded from their recipes', () => {
  it('are the recipes their sources make now', () => {
    for (const [file, recipe] of Object.entries(GrammarRecipes.built())) {
      expect([file, readFileSync(`src/lang/${file}`, 'utf8').trim() === recipe]).toEqual([file, true]);
    }
  });
  it('read Kyr as the sources did', () => {
    const m = ModuleParser.parse('Module m "M" { Place yard "the yard" is room at 0, 0 outdoors. Goal false. }');
    expect(m.entities.map(e => e.id)).toContain('yard');
  });
});
