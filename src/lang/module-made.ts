import type { Module } from './module';
import { CatalogParser } from './catalog-parser';
import { DeclaredValues } from './declared-values';
import { ModuleDeclarations } from './module-declarations';
import { Discovery, type DiscoveryDefinition } from './discovery';
import { Spatial } from './spatial';
import { Endings } from './endings';
import { Superseded } from './superseded';
import { Bringing } from './bringing';
import { Vocabularies, type Vocabulary } from './vocabulary';

// A module made of its header and its declarations' fields, as a whole parse makes it (ModuleParser.Module) and a
// text parsed a declaration at a time does (DeclarationParses): the one way either is made.
export type Field = { field: string; value: unknown };
export class ModuleMade {
  // A module's header and its declarations' fields, each where it begins (by the character), made one module; an
  // error in one said where it is (locate).
  static of(at: { id: string; name: string; fields: Field[]; starts: number[] },
    locate: <T>(i: number, run: () => T) => T, vocabulary: Vocabulary = Vocabularies): Module {
    const { fields, starts } = at;
    const module: Module = { id: at.id, name: at.name, description: '', kinds: [],
      entities: [], relations: [], measures: [], queries: [], initial: [], actions: [],
      goal: { kind: 'boolean', value: false }, budget: { kind: 'number', value: 10 } };
    const information: DiscoveryDefinition[] = [], singleton = new Set<string>(), into = { information, singleton };
    // A module's own kinds come first, wherever they are written, so that its items and people may be of them.
    CatalogParser.declare(module, fields, locate, vocabulary);
    // And what a generator declared for it as values, each where its line was (DeclaredValues).
    DeclaredValues.interleave({ starts, module, into, vocabulary },
      i => locate(i, () => ModuleDeclarations.declare(module, fields[i]!, into, vocabulary)));
    const expanded = Discovery.describe(information);
    module.entities.push(...expanded.entities); module.initial.push(...expanded.initial);
    if (expanded.observations.length) { (module.observations ??= []).push(...expanded.observations); }
    Spatial.addEscorts(module); Spatial.addSearches(module); Endings.rank(module, fields);
    Superseded.lower(module, false); Bringing.lower(module);
    // A module that never says what would end it goes on: Goal false is the default, and one file of a module in
    // several files says it for all of them.
    return module;
  }
}
