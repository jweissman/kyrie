import * as ohm from 'ohm-js';
import kyr from './Kyr.recipe.json';
import abilities from './Abilities.recipe.json';

// The Kyr grammars, loaded from the recipes ohm made of their sources (scripts/grammar-recipes.ts), not compiled from
// the sources in every process: 7 ms where compiling Kyr.ohm and Abilities.ohm had been 0.22 s of every start. A
// recipe kept apart from its source fails test/small/grammar-recipes.
export class Grammars {
  // ohm makes a grammar from its recipe; its typings do not declare it.
  private static readonly make = (ohm as unknown as { makeRecipe(recipe: unknown): ohm.Grammar }).makeRecipe;
  static readonly kyr: ohm.Grammar = Grammars.make(kyr);
  static readonly abilities: ohm.Grammar = Grammars.make(abilities);
}
