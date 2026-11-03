import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import type { ThingSpec } from './world-constructs';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// The object declarations of the Kyr grammar: an item or thing at a place, on a passage or inside a container,
// perhaps hidden until something is known; a receptacle; a discovery found by searching a place.
export class ObjectParser {
  // ItemDecl = "Item" ident string? "is" ident ItemPlace Concealed? "."
  static item(id: Node, name: Node, kind: Node, where: { place: Node; concealed: Node; owner: Node }): Field {
    const { place, concealed, owner } = where, site = ModuleParser.ast(place) as { anchor: string; id: string };
    return { field: 'item', value: { id: id.sourceString, kind: kind.sourceString, place: site.id,
      ...(site.anchor === 'inside' ? { inside: true } : {}),
      ...(concealed.children.length ? { hidden: ModuleParser.ast(concealed.children[0]!) } : {}),
      ...(owner.children.length ? { owner: ModuleParser.ast(owner.children[0]!) } : {}),
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
    for (const part of parts.children) { ObjectParser.thingPart(spec, ModuleParser.ast(part) as Field); }
    return { field: 'thing', value: spec };
  }
  // One part of a thing (or of a person, who has states and changes too), joined to it.
  static thingPart(spec: ThingSpec, part: Field) {
    if (part.field === 'state') { spec.states.push(part.value as ThingSpec['states'][number]); }
    else if (part.field === 'change') { spec.changes.push(part.value as ThingSpec['changes'][number]); }
    else if (part.field === 'hurts') { spec.hurts = part.value as ThingSpec['hurts']; }
    else if (part.field === 'guards') { (spec.guards ??= []).push(part.value as string); }
    else if (part.field === 'holds') { spec.holds = true; }
    else if (part.field === 'tries') { spec.tries = [...spec.tries ?? [], ...part.value as string[]]; }
  }
  static HoldsPart(_holds: Node, _dot: Node): Field { return { field: 'holds', value: true }; }
  // FoundBy = "Found" "by" "searching" ident FoundWith? string? "."
  static found(place: Node, skill: Node, text: Node): Field {
    return { field: 'found', value: { place: place.sourceString,
      ...(skill.children.length ? { with: ModuleParser.ast(skill.children[0]!) as string } : {}),
      ...(text.children.length ? { text: ModuleParser.ast(text.children[0]!) as string } : {}) } };
  }
  static FoundWith(_with: Node, skill: Node) { return skill.sourceString; }
  // A thing on a way, or a line beside it, and the end of the way it is told from, if only one (GTR-08, TTN-18).
  static SiteOn(_on: Node, id: Node, end: Node) {
    return { anchor: 'on', id: id.sourceString, ...end.children.length ? { from: ModuleParser.ast(end.children[0]!) } : {} };
  }
  static Beside(_beside: Node, id: Node, end: Node) {
    return { kind: 'beside', id: id.sourceString, ...end.children.length ? { from: ModuleParser.ast(end.children[0]!) } : {} };
  }
  static WayEnd(_from: Node, id: Node) { return id.sourceString; }
}
