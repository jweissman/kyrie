import * as ohm from 'ohm-js';
import kyr from './Kyr.recipe.json';
import abilities from './Abilities.recipe.json';
import quick from './KyrQuick.recipe.json';

// The Kyr grammars, loaded from the recipes ohm made of their sources (scripts/grammar-recipes.ts), not compiled from
// the sources in every process: 7 ms where compiling Kyr.ohm and Abilities.ohm had been 0.22 s of every start. A
// recipe kept apart from its source fails test/small/grammar-recipes.
export class Grammars {
  // ohm makes a grammar from its recipe; its typings do not declare it.
  private static readonly make = (ohm as unknown as { makeRecipe(recipe: unknown): ohm.Grammar }).makeRecipe;
  static readonly kyr: ohm.Grammar = Grammars.make(kyr);
  static readonly abilities: ohm.Grammar = Grammars.make(abilities);
  // Kyr read faster, matching exactly where Kyr does (see KyrQuick.ohm): what the parser reads with; a text it does
  // not match is told why by Kyr as written.
  static readonly quick: ohm.Grammar = Grammars.make(quick);
  // Why a text KyrQuick does not match is not Kyr, as Kyr as written says it.
  static why(text: string, rule?: string): string {
    const written = Grammars.kyr.match(text, rule);
    return written.failed() ? `${written.message}${Grammars.hint(text, written.getRightmostFailurePosition())}`
      : 'Kyr as written reads it';
  }
  // What an author most often writes the other way round, said where the parse stops on it (The Ninth Voice's friction
  // 9, AU-27: `says "…" once` on a Rule had pointed at its brace).
  private static hint(text: string, at: number): string {
    const line = text.slice(text.lastIndexOf('\n', at - 1) + 1, at);
    return /^\s*Rule\b/.test(line) && /^once\b/.test(text.slice(at)) && /\bsays\s+"/.test(line)
      ? '\nHint: a Rule is told once by `once` before what it says: Rule <id> when <condition> once says "…" { … }' : '';
  }
}
