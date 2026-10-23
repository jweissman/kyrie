import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import { WorldConstructs, type ThingSpec } from './world-constructs';
import { ItemCatalog } from '../item-catalog';
import type { Module, Person } from './module';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
interface Manner { kind: string; text: string }
// The Person declaration of the Kyr grammar: who someone is (a role, an ancestry and calling or a species, how many
// and what each is called, what they carry, offer and sell), and how they enter a module.
export class PersonParser {
  // Person = "Person" ident string "at" ident "{" PersonPart* "}"
  static person(id: Node, name: Node, place: Node, parts: Node): Field {
    const p: Person = { id: id.sourceString, name: ModuleParser.ast(name) as string, place: place.sourceString,
      raceId: 'human', classId: 'commoner', level: 1, actions: [] };
    const spec: ThingSpec = { id: p.id, name: p.name, type: 'group', states: [], changes: [] };
    const seen = new Set<string>(), authored: string[] = [], manner: Manner[] = [];
    for (const node of parts.children) {
      const part = ModuleParser.ast(node) as Field;
      if (['state', 'change', 'hurts', 'guards'].includes(part.field)) { ModuleParser.thingPart(spec, part); continue; }
      if (part.field === 'offers' || part.field === 'sells' || part.field === 'buys') {
        ((p as unknown as Record<string, unknown[]>)[part.field] ??= []).push(part.value); continue;
      }
      if (part.field === 'wants') { (p.wants ??= []).push(part.value as string); continue; }
      if (part.field === 'words' || part.field === 'haunt') { manner.push(part.value as Manner); continue; }
      if (part.field === 'traits' || part.field === 'gear') {
        const list = ((p as unknown as Record<string, string[]>)[part.field] ??= []);
        list.push(part.value as string);
        if (!authored.includes(part.field)) { authored.push(part.field); }
        continue;
      }
      if (part.field === 'species' || part.field === 'creature') {
        if (seen.has('raceId') || seen.has('classId')) { throw new Error(`${p.id}: a species has no ancestry or calling`); }
        if (part.field === 'creature') {
          p.creature = part.value as Record<string, string | number>;
          delete p.raceId; delete p.classId;
          seen.add('raceId'); seen.add('classId'); continue;
        }
        p.raceId = part.value as string; delete p.classId;
        authored.push('raceId'); seen.add('raceId'); seen.add('classId');
        continue;
      }
      if (['raceId', 'classId'].includes(part.field) && seen.has(part.field)) {
        throw new Error(`${p.id}: a species has no ancestry or calling`);
      }
      if (['raceId', 'classId', 'level', 'professionId', 'backgroundId', 'aspect', 'template'].includes(part.field)) {
        authored.push(part.field);
      }
      if (seen.has(part.field)) { throw new Error(`Duplicate Person field ${part.field} for ${p.id}`); }
      seen.add(part.field); Object.assign(p, { [part.field]: part.value });
    }
    return { field: 'person', value: { ...p, ...(authored.length ? { authored } : {}), spec, manner } };
  }
  // How a creature meets a company, said with it: its temperament, its words (a warning, an onslaught, a flinch, a
  // plea, and what it says on seeing what is its own, or its master's, in the company's hands) and its haunts (where
  // its lair and refuge are, what it fears), for the inhabitants and belongings rules.
  static PersonTemperament(_t: Node, id: Node, _dot: Node): Field { return { field: 'temperament', value: id.sourceString }; }
  // How they carry themselves (proud, grim, cheerful…), and the words they are spoken of in (he, she, they, it).
  static PersonManner(_m: Node, id: Node, _dot: Node): Field {
    return { field: 'haunt', value: { kind: 'Manner', text: `manner_${id.sourceString}` } };
  }
  static PersonPronouns(_p: Node, id: Node, _dot: Node): Field {
    return { field: 'haunt', value: { kind: 'Pronouns', text: `pron_${id.sourceString}` } };
  }
  static PersonWords(word: Node, text: Node, _dot: Node): Field {
    return { field: 'words', value: { kind: word.sourceString, text: ModuleParser.ast(text) as string } };
  }
  static PersonHaunt(word: Node, id: Node, _dot: Node): Field {
    return { field: 'haunt', value: { kind: word.sourceString, text: id.sourceString } };
  }
  static readonly manners: Record<string, string> = { Warns: 'warning', Comes: 'onslaught', Flinches: 'flinch',
    Pleads: 'plea', Objects: 'objection', Joins: 'joining', Leaves: 'parting', Greets: 'greeting', Likeness: 'likeness',
    Lair: 'lair',
    Refuge: 'refuge', Fears: 'fears', Manner: 'manner', Pronouns: 'pronouns' };
  private static manner(module: Module, id: string, temperament: string | undefined, manner: Manner[]) {
    if (temperament) { PersonParser.fact(module, 'temperament', id, `temper_${temperament}`); }
    for (const m of manner) {
      const relation = PersonParser.manners[m.kind]!;
      if (['Lair', 'Refuge', 'Fears', 'Manner', 'Pronouns'].includes(m.kind)) {
        PersonParser.fact(module, relation, id, m.text); continue;
      }
      const words = `${id}_${relation}`;
      module.entities.push({ id: words, type: 'fact', name: m.text });
      PersonParser.fact(module, relation, id, words);
    }
  }
  private static fact(module: Module, name: string, ...args: string[]) {
    module.initial.push({ kind: 'assert', call: { kind: 'call', name, args } });
  }
  static PersonRole(_r: Node, text: Node, _dot: Node): Field {
    return { field: 'role', value: ModuleParser.ast(text) };
  }
  static PersonRace(_r: Node, id: Node, _dot: Node): Field { return { field: 'raceId', value: id.sourceString }; }
  static PersonClass(_c: Node, id: Node, _dot: Node): Field { return { field: 'classId', value: id.sourceString }; }
  static PersonLevel(_l: Node, n: Node, _dot: Node): Field { return { field: 'level', value: Number(n.sourceString) }; }
  static PersonSpecies(_s: Node, id: Node, _dot: Node): Field { return { field: 'species', value: id.sourceString }; }
  // What makes this creature other than its kind: an aspect (an agile wolf), or the dead of its kind (skeletal).
  static PersonVariant(word: Node, id: Node, _dot: Node): Field {
    return { field: word.sourceString === 'Aspect' ? 'aspect' : 'template', value: id.sourceString };
  }
  static PersonCreature(_c: Node, list: Node, _dot: Node): Field {
    const params = list.asIteration().children.map(c => {
      const [name, value] = c.children as [Node, Node];
      const text = value.sourceString;
      return [name.sourceString, /^\d+$/.test(text) ? Number(text) : text] as const;
    });
    return { field: 'creature', value: Object.fromEntries(params) };
  }
  static PersonCount(_n: Node, n: Node, _dot: Node): Field { return { field: 'count', value: Number(n.sourceString) }; }
  // What each member of a numbered group is called, in order: "the sow", "her cub".
  static PersonCalled(_c: Node, list: Node, _dot: Node): Field {
    return { field: 'names', value: list.asIteration().children.map(c => ModuleParser.ast(c) as string) };
  }
  static PersonTrait(_t: Node, id: Node, _dot: Node): Field { return { field: 'traits', value: id.sourceString }; }
  // A kind of thing the person will take when it is given to them (a lost register, a dead ewe).
  static PersonWants(_w: Node, id: Node, _dot: Node): Field { return { field: 'wants', value: id.sourceString }; }
  static PersonCarries(_c: Node, id: Node, _dot: Node): Field { return { field: 'gear', value: id.sourceString }; }
  static PersonHorizon(_p: Node, n: Node, _steps: Node, _dot: Node): Field {
    return { field: 'horizon', value: Number(n.sourceString) };
  }
  static PersonPeaceable(_p: Node, _dot: Node): Field { return { field: 'peaceable', value: true }; }
  static PersonProfession(_p: Node, id: Node, _dot: Node): Field { return { field: 'professionId', value: id.sourceString }; }
  static PersonBackground(_p: Node, id: Node, _dot: Node): Field { return { field: 'backgroundId', value: id.sourceString }; }
  // OffersPart = "Offers" ident string "for" integer "coin" "."
  static offers(kind: Node, text: Node, fee: Node): Field {
    return { field: 'offers', value: { kind: kind.sourceString, text: ModuleParser.ast(text), fee: Number(fee.sourceString) } };
  }
  // SellsPart = "Sells" ident "for" integer "coin" "from" integer "."
  static sells(what: Node, fee: Node, stock: Node): Field {
    return { field: 'sells', value: { what: what.sourceString, fee: Number(fee.sourceString), stock: Number(stock.sourceString) } };
  }
  static PersonUses(_u: Node, ids: Node, _dot: Node): Field {
    return { field: 'actions', value: ids.asIteration().children.map(ModuleParser.text) };
  }
  // A person enters a module as a group where they stand, named for their role, with their states told near them.
  static declare(module: Module, value: unknown) {
    const { spec, peaceable, manner, temperament, ...p } = value as Person & { spec: ThingSpec; peaceable?: boolean;
      manner: Manner[]; temperament?: string };
    (module.people ??= []).push(p);
    PersonParser.manner(module, p.id, temperament, manner);
    WorldConstructs.offers(module, p, kind => ItemCatalog.definitions[kind]?.name);
    // A person's role follows their name ("Garth, shepherd"), unless it only repeats it, or it is what each
    // of a numbered group is ("a cave spider") rather than the group ("a sow bear and her grown cub").
    const each = (p.count ?? 1) > 1 && !/ and |,/.test(p.role ?? '');
    const named = p.role && !each && p.role.toLowerCase() !== p.name.toLowerCase() ? `${p.name}, ${p.role}` : p.name;
    module.entities.push({ id: p.id, name: named, type: 'group' });
    module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'at', args: [p.id, p.place] } });
    if (peaceable) { module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'peaceable', args: [p.id] } }); }
    for (const kind of p.wants ?? []) {
      module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'wants', args: [p.id, kind] } });
    }
    WorldConstructs.states(module, spec, { kind: 'near', id: p.id });
  }
  static company(module: Module, c: NonNullable<Module['company']>) {
    if (module.company) { throw new Error('A module declares at most one company'); }
    module.company = c;
    module.entities.push({ id: c.id, type: 'group', name: c.name });
    module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'at', args: [c.id, c.place] } });
  }
}
