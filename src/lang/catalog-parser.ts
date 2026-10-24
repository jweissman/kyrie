import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import { LocalKinds, type LocalCatalog, type LocalKindSpec, type LocalSpeciesSpec } from '../canon/local-catalog';
import type { ItemKind } from '../canon/schema';
import type { Module } from './module';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// A module's own kinds of thing and of creature:
//   Kind dreg_ox "a little ox of dreg" is treasure worth 2 weighing 1.
//   Kind bone_knife "a bone knife" like dagger worth 1.
//   Kind oath_tablet "an oath-tablet" like old_glossary granting oath.
//   Species hall_dog "the hall dog" like cave_hound tame living in hall.
// Read before anything else the module declares, so its items and people may be of them wherever they are written.
export class CatalogParser {
  static LocalKind(_k: Node, id: Node, name: Node, body: Node): Field {
    return { field: 'localkind', value: { id: id.sourceString, name: ModuleParser.ast(name) as string,
      ...ModuleParser.ast(body) as object } as LocalKindSpec };
  }
  static KindBody(base: Node, parts: Node, _dot: Node) {
    return Object.assign({ base: ModuleParser.ast(base) as LocalKindSpec['base'] },
      ...parts.children.map(part => ModuleParser.ast(part) as object)) as Partial<LocalKindSpec>;
  }
  static KindIs(_is: Node, category: Node) { return { category: category.sourceString as ItemKind['category'] }; }
  static KindLike(_like: Node, kind: Node) { return { like: kind.sourceString }; }
  static Worth(_w: Node, n: Node) { return { worth: Number(n.sourceString) }; }
  static Weighing(_w: Node, n: Node) { return { mass: Number(n.sourceString) }; }
  static Described(_d: Node, text: Node) { return { description: ModuleParser.ast(text) as string }; }
  static Granting(_g: Node, skill: Node) { return { grants: skill.sourceString }; }
  static LocalSpecies(_s: Node, id: Node, name: Node, body: Node): Field {
    return { field: 'localspecies', value: { id: id.sourceString, name: ModuleParser.ast(name) as string,
      ...ModuleParser.ast(body) as object } as LocalSpeciesSpec };
  }
  static SpeciesBody(_like: Node, like: Node, parts: Node, _dot: Node) {
    return Object.assign({ like: like.sourceString },
      ...parts.children.map(part => ModuleParser.ast(part) as object)) as Partial<LocalSpeciesSpec>;
  }
  static Tame(_t: Node) { return { temperament: 'tame' }; }
  static Temperament(_t: Node, id: Node) { return { temperament: id.sourceString }; }
  static Living(_l: Node, _in: Node, list: Node) {
    return { habitats: list.asIteration().children.map(c => c.sourceString) };
  }
  static readonly actions = {
    LocalKind: CatalogParser.LocalKind, KindBody: CatalogParser.KindBody, SpeciesBody: CatalogParser.SpeciesBody,
    KindBase_is: CatalogParser.KindIs, KindBase_like: CatalogParser.KindLike,
    KindPart_worth: CatalogParser.Worth, KindPart_weighing: CatalogParser.Weighing,
    KindPart_described: CatalogParser.Described, KindPart_granting: CatalogParser.Granting,
    LocalSpecies: CatalogParser.LocalSpecies,
    SpeciesPart_tame: CatalogParser.Tame, SpeciesPart_temperament: CatalogParser.Temperament,
    SpeciesPart_described: CatalogParser.Described, SpeciesPart_living: CatalogParser.Living,
  };
  // The module's own kinds, made and joined to the catalogs, from the declarations that make them.
  static declare(module: Module, fields: Field[], located: (i: number, run: () => void) => void) {
    const catalog: LocalCatalog = {};
    fields.forEach(({ field, value }, i) => located(i, () => {
      if (field === 'localkind') {
        const spec = value as LocalKindSpec;
        (catalog.items ??= {})[spec.id] = LocalKinds.item(module.id, spec);
      } else if (field === 'localspecies') {
        const spec = value as LocalSpeciesSpec;
        (catalog.species ??= {})[spec.id] = LocalKinds.species(module.id, spec);
      }
    }));
    if (!catalog.items && !catalog.species) { return; }
    LocalKinds.install(catalog);
    module.catalog = catalog;
    // A kind declared here is a kind of thing in this world whether or not any of it is placed yet; what it weighs
    // is a fact of the world, for rules to read (see belongings.kyr).
    for (const [id, item] of Object.entries(catalog.items ?? {})) {
      if (!module.entities.some(e => e.id === id)) { module.entities.push({ id, type: 'itemkind', name: item.name }); }
      if (item.mass !== undefined) {
        module.initial.push({ kind: 'set', call: { kind: 'call', name: 'mass', args: [id] },
          value: { kind: 'number', value: item.mass } });
      }
    }
  }
}
