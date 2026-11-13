#!/usr/bin/env bun
// The Kyr grammars kept as ohm's recipes (src/lang/*.recipe.json), for the parser to load rather than compile from
// their source in every process: compiling Kyr.ohm and Abilities.ohm had been 0.22 s of every worker's, every
// command's and the page's start, and a recipe loads in 7 ms (the loading boundaries, 14 November). Run after any
// change to a .ohm file; test/small/grammar-recipes fails while a recipe and its source differ.
//   bun scripts/grammar-recipes.ts
import * as ohm from 'ohm-js';
import { readFileSync, writeFileSync } from 'node:fs';

export class GrammarRecipes {
  static readonly dir = 'src/lang';
  // Each grammar as its recipe, built from the sources as the parser had built it.
  static built(): Record<string, string> {
    const core = readFileSync(`${this.dir}/Kyr.ohm`, 'utf8'), abilities = readFileSync(`${this.dir}/Abilities.ohm`, 'utf8');
    return { 'Kyr.recipe.json': this.recipe(ohm.grammar(core)),
      'Abilities.recipe.json': this.recipe(ohm.grammars(`${core}\n${abilities}`).KyrAbilities!) };
  }
  // ohm writes a grammar's recipe; its typings do not declare it.
  private static recipe(grammar: ohm.Grammar): string {
    return (grammar as unknown as { toRecipe(): string }).toRecipe();
  }
  static main(): number {
    for (const [file, recipe] of Object.entries(this.built())) { writeFileSync(`${this.dir}/${file}`, `${recipe}\n`); }
    console.log('grammar recipes written');
    return 0;
  }
}
if (import.meta.main) { process.exit(GrammarRecipes.main()); }
