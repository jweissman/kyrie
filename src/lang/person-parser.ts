import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import { WorldConstructs, type ThingSpec } from './world-constructs';
import { ItemCatalog } from '../item-catalog';
import type { Module, Person, Predicate } from './module';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// A person's words, and when they are said, if not always (Leaves "…" when …).
interface Manner { kind: string; text: string; when?: Predicate; place?: string }
// The Person declaration of the Kyr grammar: who someone is (a role, an ancestry and calling or a species, how many
// and what each is called, what they carry, offer and sell), and how they enter a module.
export class PersonParser {
  // A topic raised once, or only while the speaker travels with the company; an action spoken by someone.
  static TopicOnce(_once: Node) { return true; }
  static Speaker(_s: Node, id: Node, _dot: Node): Field { return { field: 'speaker', value: id.sourceString }; }
  // What cannot be undone, said before it is done (Grave "Hightown comes down where it is."): the page asks first.
  static Grave(_g: Node, text: Node, _dot: Node): Field {
    return { field: 'grave', value: (text as unknown as { ast(): unknown }).ast() as string };
  }
  // What a topic is beside its words: put once; grave, as written before its Says or after; the answer to a question
  // the company has been put (`answering ask_bound`).
  static topic(once: Node, graves: Node[], answering: Node): { once?: true; grave?: string; answers?: string } {
    const grave = graves.flatMap(o => o.children).map(g => (ModuleParser.ast(g) as Field).value as string)[0];
    const answers = answering.children.map(a => ModuleParser.ast(a) as string)[0];
    return { ...once.children.length ? { once: true } : {}, ...grave ? { grave } : {}, ...answers ? { answers } : {} };
  }
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
      if (part.field === 'roles') { (p.roles ??= []).push(part.value as NonNullable<Person['roles']>[number]); continue; }
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
  static PersonWords(word: Node, text: Node, when: Node, _dot: Node): Field {
    const holds = when.children[0] ? { when: ModuleParser.ast(when.children[0]) as Predicate } : {};
    return { field: 'words', value: { kind: word.sourceString, text: ModuleParser.ast(text) as string, ...holds } };
  }
  // What someone says to a company that comes back (What Tessary Owes' W18).
  static PersonAgain(_greets: Node, _again: Node, text: Node, _dot: Node): Field {
    return { field: 'words', value: { kind: 'GreetsAgain', text: ModuleParser.ast(text) as string } };
  }
  // What someone with the company says on coming somewhere that matters to them, once (A Winter in Carth's friction
  // 21: Hern came into the fold his whole story points at, and the page said only that he was there).
  static PersonRemarks(_r: Node, place: Node, text: Node, _dot: Node): Field {
    return { field: 'words', value: { kind: 'Remarks', place: place.sourceString, text: ModuleParser.ast(text) as string } };
  }
  static PersonHaunt(word: Node, id: Node, _dot: Node): Field {
    return { field: 'haunt', value: { kind: word.sourceString, text: id.sourceString } };
  }
  static readonly manners: Record<string, string> = { Warns: 'warning', Arrives: 'arrival', Comes: 'onslaught',
    Flinches: 'flinch', Pleads: 'plea', Objects: 'objection', Resents: 'resentment', Joins: 'joining',
    Leaves: 'parting', Greets: 'greeting', GreetsAgain: 'regreeting', Likeness: 'likeness', Lair: 'lair',
    Refuge: 'refuge', Fears: 'fears', Manner: 'manner', Pronouns: 'pronouns' };
  private static manner(module: Module, id: string, temperament: string | undefined, manner: Manner[]) {
    if (temperament) { PersonParser.fact(module, 'temperament', id, `temper_${temperament}`); }
    for (const m of manner) {
      if (m.kind === 'Remarks') { PersonParser.remark(module, id, m); continue; }
      const relation = PersonParser.manners[m.kind]!;
      if (['Lair', 'Refuge', 'Fears', 'Manner', 'Pronouns'].includes(m.kind)) {
        PersonParser.fact(module, relation, id, m.text); continue;
      }
      const words = `${id}_${relation}`;
      module.entities.push({ id: words, type: 'fact', name: m.text });
      PersonParser.fact(module, relation, id, words);
      // Said only while it holds: a gaol door shutting on someone is no parting (A Winter in Carth's friction 8).
      if (m.when) { (module.queries ??= []).push({ name: `${words}_when`, parameters: [], body: m.when }); }
    }
  }
  // Said when the company comes to the place with them, travelling with it or following it, once.
  private static remark(module: Module, id: string, m: Manner) {
    const latch = `${id}_remarks_${m.place}`;
    module.relations.push({ name: `${latch}_once`, types: [], exclusive: false });
    (module.rules ??= []).push({ id: latch, say: m.text,
      effects: [{ kind: 'assert', call: { kind: 'call', name: `${latch}_once`, args: [] } }],
      when: ModuleParser.predicate(`company(?c) and at(?c, ${m.place}) and (travelsWith(${id}, ?c) or following(${id}, ?c))`
        + ` and able(${id}) and not ${latch}_once()`) });
  }
  private static fact(module: Module, name: string, ...args: string[]) {
    module.initial.push({ kind: 'assert', call: { kind: 'call', name, args } });
  }
  // Who someone is, said after their name; or who they are while something holds (Role "a goose, let out" when
  // freed(goose)), said instead while it does: What Tessary Owes' W20, a goose still "in a crate" once let out.
  static PersonRole(_r: Node, text: Node, when: Node, _dot: Node): Field {
    return when.children.length ? { field: 'roles', value: { role: ModuleParser.ast(text) as string,
      when: ModuleParser.ast(when.children[0]!) as Predicate } } : { field: 'role', value: ModuleParser.ast(text) };
  }
  // What someone is called while something holds, in place of their name and role: "a woman in a grey shawl" until
  // she has said who she is, "the masked lady" while the mask is on (the Liberty of the Ice's friction 12; A Winter in
  // Carth's 5, which wrote the masked Lady as a second person).
  static PersonKnown(_k: Node, text: Node, when: Node, _dot: Node): Field {
    return { field: 'roles', value: { role: ModuleParser.ast(text) as string, when: ModuleParser.ast(when) as Predicate,
      whole: true } };
  }
  static RoleWhen(_w: Node, p: Node) { return ModuleParser.ast(p); }
  static PersonRace(_r: Node, id: Node, _dot: Node): Field { return { field: 'raceId', value: id.sourceString }; }
  static PersonClass(_c: Node, id: Node, _dot: Node): Field { return { field: 'classId', value: id.sourceString }; }
  static PersonLevel(_l: Node, n: Node, _dot: Node): Field { return { field: 'level', value: Number(n.sourceString) }; }
  static PersonSpecies(_s: Node, id: Node, _dot: Node): Field { return { field: 'species', value: id.sourceString }; }
  // Whom they are seen by: only a viewer for whom the condition holds (viewer is whoever is looking).
  static PersonSeen(_s: Node, _w: Node, predicate: Node, _dot: Node): Field {
    return { field: 'seen', value: PersonParser.viewer(ModuleParser.ast(predicate) as Predicate) };
  }
  private static viewer(p: Predicate): Predicate {
    switch (p.kind) {
      case 'call': return { ...p, args: p.args.map(a => a === 'viewer' ? '?viewer' : a) };
      case 'not': return { ...p, value: this.viewer(p.value) };
      case 'and': case 'or': return { ...p, left: this.viewer(p.left), right: this.viewer(p.right) };
      default: return p;
    }
  }
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
    // What they are called while something holds comes before who they are while something else does.
    const roles = p.roles?.toSorted((a, b) => Number(!!b.whole) - Number(!!a.whole));
    module.entities.push({ id: p.id, name: named, type: 'group',
      ...roles ? { roles: roles.map(r => ({ name: r.whole ? r.role : `${p.name}, ${r.role}`, when: r.when })) } : {} });
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
