import type { Module } from './module';
import { CatalogParser } from './catalog-parser';
import { DeclaredValues } from './declared-values';
import { ModuleDeclarations } from './module-declarations';
import { Discovery, type DiscoveryDefinition } from './discovery';
import { Spatial } from './spatial';
import { Endings } from './endings';
import { Superseded } from './superseded';
import { Bringing } from './bringing';
import type { VocabularyContext } from './vocabulary';
import { DeclarationSites } from './declaration-sites';

// A module made of its header and its declarations' fields, as a whole parse makes it (ModuleParser.Module) and a
// text parsed a declaration at a time does (DeclarationParses): the one way either is made.
export type Field = { field: string; value: unknown };
export class ModuleMade {
  // A module's header and its declarations' fields, each where it begins (by the character) in the text it was read
  // in, made one module; an error in one said where it is (locate). Where each name came from is kept beside it
  // (DeclarationSites).
  static of(context: VocabularyContext, at: { id: string; name: string; fields: Field[]; starts: number[];
    text: string }, locate: <T>(i: number, run: () => T) => T): Module {
    const { fields, starts } = at;
    const module: Module = { id: at.id, name: at.name, description: '', kinds: [],
      entities: [], relations: [], measures: [], queries: [], initial: [], actions: [],
      goal: { kind: 'boolean', value: false }, budget: { kind: 'number', value: 10 } };
    const information: DiscoveryDefinition[] = [], singleton = new Set<string>(), into = { information, singleton };
    const sites = new DeclarationSites(module);
    // A module's own kinds come first, wherever they are written, so that its items and people may be of them.
    sites.together(ModuleMade.kinds(fields, starts), () => CatalogParser.declare(context, module, fields, locate));
    // And what a generator declared for it as values, each where its line was (DeclaredValues).
    DeclaredValues.interleave(starts, { context, module, into },
      i => sites.during({ field: fields[i]!.field, at: starts[i]! }, DeclarationSites.named(fields[i]!.value),
        () => locate(i, () => ModuleDeclarations.declare(context, module, fields[i]!, into))),
      (d, place) => sites.during({ field: d.kind, at: d.at, generator: d.generator }, d.name, place));
    const expanded = Discovery.describe(information);
    module.entities.push(...expanded.entities); module.initial.push(...expanded.initial);
    if (expanded.observations.length) { (module.observations ??= []).push(...expanded.observations); }
    Spatial.addEscorts(module); Spatial.addSearches(module); Endings.rank(module, fields);
    Superseded.lower(module, false); Bringing.lower(module);
    module.sites = sites.finish(at.text);
    // A module that never says what would end it goes on: Goal false is the default, and one file of a module in
    // several files says it for all of them.
    return module;
  }
  // The module's own kinds of thing and of creature, each where it is declared.
  private static kinds(fields: Field[], starts: number[]) {
    return fields.flatMap(({ field, value }, i) => field === 'localkind' || field === 'localspecies'
      ? [{ name: (value as { id: string }).id, span: { field, at: starts[i]! } }] : []);
  }
}
