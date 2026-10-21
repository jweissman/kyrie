import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import type { ThingSpec } from './world-constructs';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// The object declarations of the Kyr grammar: an item or thing at a place, on a passage or inside a container,
// perhaps hidden until something is known; a receptacle; a discovery found by searching a place.
export class ObjectParser {
  // ItemDecl = "Item" ident string? "is" ident ItemPlace Concealed? "."
  static item(id: Node, name: Node, kind: Node, where: { place: Node; concealed: Node }): Field {
    const { place, concealed } = where, site = ModuleParser.ast(place) as { anchor: string; id: string };
    return { field: 'item', value: { id: id.sourceString, kind: kind.sourceString, place: site.id,
      ...(site.anchor === 'inside' ? { inside: true } : {}),
      ...(concealed.children.length ? { hidden: ModuleParser.ast(concealed.children[0]!) } : {}),
      ...(name.children.length ? { name: ModuleParser.ast(name.children[0]!) } : {}) } };
  }
  static At(_at: Node, id: Node) { return { anchor: 'at', id: id.sourceString }; }
  static In(_in: Node, id: Node) { return { anchor: 'inside', id: id.sourceString }; }
  static Concealed(_hidden: Node, _until: Node, fact: Node) { return fact.sourceString; }
  static thing(id: Node, name: Node, where: { site: Node; kind: Node; concealed: Node }, parts: Node): Field {
    const { site, kind, concealed } = where;
    const spec: ThingSpec = { id: id.sourceString, name: ModuleParser.ast(name) as string,
      type: kind.children.length ? ModuleParser.ast(kind.children[0]!) as string : 'thing',
      site: ModuleParser.ast(site) as ThingSpec['site'], states: [], changes: [],
      ...(concealed.children.length ? { hidden: ModuleParser.ast(concealed.children[0]!) as string } : {}) };
    for (const part of parts.children) { ModuleParser.thingPart(spec, ModuleParser.ast(part) as Field); }
    return { field: 'thing', value: spec };
  }
  static HoldsPart(_holds: Node, _dot: Node): Field { return { field: 'holds', value: true }; }
  // FoundBy = "Found" "by" "searching" ident FoundWith? string? "."
  static found(place: Node, skill: Node, text: Node): Field {
    return { field: 'found', value: { place: place.sourceString,
      ...(skill.children.length ? { with: ModuleParser.ast(skill.children[0]!) as string } : {}),
      ...(text.children.length ? { text: ModuleParser.ast(text.children[0]!) as string } : {}) } };
  }
  static FoundWith(_with: Node, skill: Node) { return skill.sourceString; }
}
