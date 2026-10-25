import { parseAbility } from './parse';
import { Spatial } from '../spatial';
import { Discovery, type DiscoveryDefinition } from '../information/discovery';
import * as ohm from 'ohm-js';
import source from './Kyr.ohm' with { type: 'text' };
import type { Change, Module, Operator, Predicate } from './module';
import type { PassageSpec, ThingSpec } from './world-constructs';
import { PersonParser } from './person-parser';
import { StatementParser } from './statement-parser';
import { ObjectParser } from './object-parser';
import { CatalogParser } from './catalog-parser';
import { InformationParser } from './information-parser';
import { LocalKinds } from '../canon/local-catalog';
import { ModuleDeclarations } from './module-declarations';

type Node = ohm.Node;
type AstNode = ohm.Node & { ast(): unknown };
type Field = { field: string; value: unknown };
export class ModuleParser {
  private static readonly grammar = ohm.grammar(source);
  private static readonly semantics = ModuleParser.grammar.createSemantics().addOperation<unknown>('ast', {
    Place: ModuleParser.Place, PlaceParent: ModuleParser.PlaceParent, PlaceGrid: ModuleParser.PlaceGrid,
    PlaceAlias: ModuleParser.PlaceAlias, PlaceShelter: ModuleParser.text, ObservationAspect: ModuleParser.Second,
    ObservationBy: ModuleParser.Third,
    Passage: ModuleParser.Passage, PassagePart_oneway: ModuleParser.OneWay, PassagePart_hidden: ModuleParser.Hidden,
    PassagePart_needs: ModuleParser.Needs, Thing: ModuleParser.Thing, ThingSite_in: ObjectParser.In,
    HoldsPart: ObjectParser.HoldsPart, Concealed: ObjectParser.Concealed, ItemPlace_at: ObjectParser.At,
    ItemPlace_in: ObjectParser.In, FoundBy: ModuleParser.FoundBy, FoundWith: ObjectParser.FoundWith,
    ThingSite_at: ModuleParser.Site, ThingSite_on: ModuleParser.Site, ThingKind: ModuleParser.ThingKind,
    StatePart: ModuleParser.StatePart,
    ChangePart: ModuleParser.ChangePart, ChangeNeeds: ModuleParser.ChangeNeeds, ChangeAfter: ModuleParser.Third,
    ChangeConsumes: ModuleParser.Second, HurtsPart: ModuleParser.HurtsPart, GuardsPart: ModuleParser.GuardsPart,
    TriesPart: ModuleParser.TriesPart,
    Event: ModuleParser.Event, EventTail_effects: ModuleParser.EventEffects, EventTail_plain: ModuleParser.EventPlain,
    Anchor_at: ModuleParser.Anchor, Anchor_near: ModuleParser.Anchor, Anchor_beside: ModuleParser.Anchor,
    Objective: ModuleParser.Objective, PersonCalled: PersonParser.PersonCalled,
    PersonHorizon: PersonParser.PersonHorizon, PersonPeaceable: PersonParser.PersonPeaceable,
    RuleSays: ModuleParser.Second, Seen: ModuleParser.Seen, TopicOnce: PersonParser.TopicOnce,
    TopicTravelling: PersonParser.TopicOnce,
    Company: ModuleParser.Company, ItemDecl: ModuleParser.ItemDecl, PassageKind: ModuleParser.ThingKind,
    PassagePart_taking: ModuleParser.Taking, PassagePart_opening: ModuleParser.Opening,
    PersonProfession: PersonParser.PersonProfession,
    PersonBackground: PersonParser.PersonBackground, OffersPart: ModuleParser.OffersPart,
    SellsPart: ModuleParser.SellsPart, BuysPart: ModuleParser.BuysPart, Time_fixed: StatementParser.Time,
    Time_minutes: StatementParser.Minutes,
    Time_measured: StatementParser.Duration,
    Exit: ModuleParser.Exit, ExitDoor: ModuleParser.ExitDoor, ExitKnowledge: ModuleParser.ExitKnowledge,
    Person: ModuleParser.Person, PersonRole: PersonParser.PersonRole,
    PersonRace: PersonParser.PersonRace, PersonClass: PersonParser.PersonClass,
    PersonLevel: PersonParser.PersonLevel, PersonSpecies: PersonParser.PersonSpecies,
    PersonVariant: PersonParser.PersonVariant, PersonSeen: PersonParser.PersonSeen,
    PersonCreature: PersonParser.PersonCreature, PersonCount: PersonParser.PersonCount,
    PersonTrait: PersonParser.PersonTrait, PersonCarries: PersonParser.PersonCarries,
    HazardDecl: ModuleParser.HazardDecl, PersonUses: PersonParser.PersonUses, PersonWants: PersonParser.PersonWants,
    Topic: ModuleParser.Topic, TopicEffects: ModuleParser.TopicEffects, Result: ModuleParser.Result,
    Otherwise: ModuleParser.Otherwise,
    Information_parts: ModuleParser.Information, InformationSource: ModuleParser.InformationSource,
    ChangeAt: ModuleParser.Second, ItemOwner: ModuleParser.Third,
    PersonTemperament: PersonParser.PersonTemperament, PersonWords: PersonParser.PersonWords,
    PersonManner: PersonParser.PersonManner, PersonPronouns: PersonParser.PersonPronouns,
    PersonHaunt: PersonParser.PersonHaunt,
    Module: ModuleParser.Module, Observation: ModuleParser.Observation, Speaker: PersonParser.Speaker,
    WorldRule: ModuleParser.WorldRule, Pursuit: ModuleParser.Pursuit, PursuitUsing: ModuleParser.PursuitUsing,
    MemberBinding: StatementParser.MemberBinding,
    Kind: StatementParser.Kind, Relation: ModuleParser.Relation, Measure: ModuleParser.Measure,
    Query: ModuleParser.Query, Parameter: StatementParser.Parameter, Entity: ModuleParser.Entity,
    Initial: StatementParser.Initial, Goal: StatementParser.Goal, Budget: StatementParser.Budget,
    Description: StatementParser.Description, ActionParameters: StatementParser.ActionParameters,
    Action: ModuleParser.Action, Requires: StatementParser.Requires,
    Success: ModuleParser.Success, Failure: ModuleParser.Failure, Cost: StatementParser.Cost,
    Resolve: StatementParser.Resolve, ChangeStatement: StatementParser.ChangeStatement,
    Interruption: StatementParser.Interruption, Watchful: StatementParser.Watchful,
    Assert: StatementParser.Assert, Retract: StatementParser.Retract, Set: StatementParser.Set,
    Increase: StatementParser.Increase, Decrease: StatementParser.Decrease,
    Or_binary: StatementParser.Or, And_binary: StatementParser.And,
    Unary_not: StatementParser.Not, Unary_group: StatementParser.Group,
    Unary_true: StatementParser.True, Unary_false: StatementParser.False,
    Comparison: StatementParser.Comparison, Call: StatementParser.Call,
    Value: StatementParser.Value, expression: StatementParser.Expression, integer: StatementParser.Integer,
    string: StatementParser.String,
    ...CatalogParser.actions, ...InformationParser.actions,
  });
  // Parsing is the costliest part of loading a campaign, and the same texts (the shared rules above all) come again
  // and again; each caller gets its own copy of the remembered module.
  private static readonly parsed = new Map<string, Module>();
  // A text parsed before comes back as it was, and declares its own kinds again, as its parse did: a start meanwhile
  // may have put other kinds in their place, and the files read after it place things of these kinds.
  static parse(text: string): Module {
    const known = ModuleParser.parsed.get(text);
    if (known) { LocalKinds.install(known.catalog); return structuredClone(known); }
    const match = ModuleParser.grammar.match(text);
    if (match.failed()) { throw new Error(`Invalid Kyr module: ${match.message}`); }
    const module = ModuleParser.semantics(match).ast() as Module;
    if (ModuleParser.parsed.size >= 96) { ModuleParser.parsed.delete(ModuleParser.parsed.keys().next().value!); }
    ModuleParser.parsed.set(text, structuredClone(module));
    return module;
  }
  static predicate(text: string): Predicate {
    const match = ModuleParser.grammar.match(text, 'Predicate');
    if (match.failed()) { throw new Error(`Invalid predicate: ${match.message}`); }
    return ModuleParser.semantics(match).ast() as Predicate;
  }
  static list(node: ohm.Node): unknown[] {
    const values: unknown[] = [];
    for (const child of node.asIteration().children) { values.push(ModuleParser.ast(child)); }
    return values;
  }
  // Ohm calls an action with one node per element of its rule; these take the elements that matter to PersonParser.
  static Person(_p: Node, id: Node, name: Node, _at: Node, place: Node, _open: Node, parts: Node, _close: Node) {
    return PersonParser.person(id, name, place, parts);
  }
  static OffersPart(_o: Node, kind: Node, text: Node, _for: Node, fee: Node, _coin: Node, _dot: Node) {
    return PersonParser.offers(kind, text, fee);
  }
  static SellsPart(_s: Node, what: Node, _for: Node, fee: Node, _coin: Node, _from: Node, stock: Node, _dot: Node) {
    return PersonParser.sells(what, fee, stock);
  }
  static BuysPart(_b: Node, what: Node, _for: Node, fee: Node, _coin: Node, _dot: Node) {
    return { field: 'buys', value: { what: what.sourceString, fee: Number(fee.sourceString) } };
  }
  static Module(_module: Node, id: Node, name: Node, _open: Node, declarations: Node, _close: Node): Module {
    const module: Module = { id: id.sourceString, name: ModuleParser.ast(name) as string, description: '', kinds: [],
      entities: [], relations: [], measures: [], queries: [], initial: [], actions: [],
      goal: { kind: 'boolean', value: false }, budget: { kind: 'number', value: 10 } };
    const information: DiscoveryDefinition[] = [];
    const singleton = new Set<string>();
    // A module's own kinds come first, wherever they are written, so that its items and people may be of them.
    const fields = declarations.children.map(child => ModuleParser.located(child,
      () => ModuleParser.ast(child) as Field));
    CatalogParser.declare(module, fields, (i, run) => ModuleParser.located(declarations.children[i]!, run));
    fields.forEach((f, i) => ModuleParser.located(declarations.children[i]!,
      () => ModuleDeclarations.declare(module, f, { information, singleton })));
    const expanded = Discovery.describe(information);
    module.entities.push(...expanded.entities); module.initial.push(...expanded.initial);
    if (expanded.observations.length) { (module.observations ??= []).push(...expanded.observations); }
    Spatial.addEscorts(module); Spatial.addSearches(module);
    // A module that never says what would end it goes on: Goal false is the default, and one file of a module in
    // several files says it for all of them.
    return module;
  }
  // An error in a declaration, said with the line and column it begins at.
  static located<T>(node: Node, run: () => T): T {
    try { return run(); } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/^Line \d+, col \d+: /.test(message)) { throw error; }
      const at = node.source.getLineAndColumn();
      throw new Error(`Line ${at.lineNum}, col ${at.colNum}: ${message}`);
    }
  }
  static Place(_p: Node, id: Node, name: Node, _is: Node, kind: Node, parent: Node, grid: Node, shelter: Node,
    alias: Node, _dot: Node): Field {
    const space = { kind: kind.sourceString,
      ...(parent.children.length ? { parent: ModuleParser.ast(parent.children[0]!) } : {}),
      ...(grid.children.length ? { grid: ModuleParser.ast(grid.children[0]!) } : {}),
      ...(shelter.children.length ? { shelter: ModuleParser.ast(shelter.children[0]!) } : {}) };
    return { field: 'place', value: { id: id.sourceString, name: ModuleParser.ast(name), type: 'place', space,
      ...(alias.children.length ? { alias: ModuleParser.ast(alias.children[0]!) } : {}) } };
  }
  // What a place is called by those who do not know its name, until they learn a fact: "a lone tower".
  static PlaceAlias(_seen: Node, _as: Node, name: Node, _until: Node, fact: Node): { name: string; until: string } {
    return { name: ModuleParser.ast(name) as string, until: fact.sourceString };
  }
  static PlaceParent(_within: Node, parent: Node): string { return parent.sourceString; }
  static PlaceGrid(_at: Node, x: Node, _comma: Node, y: Node): [number, number] {
    return [Number(x.sourceString), Number(y.sourceString)];
  }
  static Passage(_p: Node, id: Node, name: Node, kind: Node, _between: Node, a: Node, _and: Node, b: Node, parts: Node,
    _dot: Node): Field {
    const spec: PassageSpec = { id: id.sourceString, name: ModuleParser.ast(name) as string,
      sides: [a.sourceString, b.sourceString], oneWay: false,
      ...(kind.children.length ? { kind: ModuleParser.ast(kind.children[0]!) as string } : {}) };
    for (const part of parts.children) { Object.assign(spec, ModuleParser.ast(part)); }
    return { field: 'passage', value: spec };
  }
  static OneWay(_one: Node, _way: Node) { return { oneWay: true }; }
  // "opening when dark() \"By day the gate is a wall.\"": crossed only while it holds, and how it looks shut.
  static Opening(_opening: Node, _when: Node, predicate: Node, shut: Node) {
    return { opening: ModuleParser.ast(predicate) as Predicate,
      ...shut.children.length ? { shut: ModuleParser.ast(shut.children[0]!) as string } : {} };
  }
  static Hidden(_hidden: Node, _until: Node, fact: Node) { return { hidden: fact.sourceString }; }
  // "needing rope or climbing": any one of them will do.
  static Needs(_needing: Node, kind: Node, _ors: Node, more: Node) {
    return { needs: [kind.sourceString, ...more.children.map(n => n.sourceString)] };
  }
  static ChangeNeeds(_needing: Node, kind: Node, _ors: Node, more: Node) {
    return [kind.sourceString, ...more.children.map(n => n.sourceString)];
  }
  // Ohm calls an action with one node per element of its rule; these take the elements that matter to ObjectParser.
  static ItemDecl(_i: Node, id: Node, name: Node, _is: Node, kind: Node, place: Node, concealed: Node, owner: Node,
    _dot: Node) {
    return ObjectParser.item(id, name, kind, { place, concealed, owner });
  }
  static Thing(_t: Node, id: Node, name: Node, site: Node, kind: Node, concealed: Node, _open: Node, parts: Node,
    _close: Node) {
    return ObjectParser.thing(id, name, { site, kind, concealed }, parts);
  }
  static FoundBy(_found: Node, _by: Node, _searching: Node, place: Node, skill: Node, text: Node, _dot: Node) {
    return ObjectParser.found(place, skill, text);
  }
  static thingPart(spec: ThingSpec, part: Field) {
    if (part.field === 'state') { spec.states.push(part.value as ThingSpec['states'][number]); }
    else if (part.field === 'change') { spec.changes.push(part.value as ThingSpec['changes'][number]); }
    else if (part.field === 'hurts') { spec.hurts = part.value as ThingSpec['hurts']; }
    else if (part.field === 'guards') { (spec.guards ??= []).push(part.value as string); }
    else if (part.field === 'holds') { spec.holds = true; }
    else if (part.field === 'tries') { spec.tries = [...spec.tries ?? [], ...part.value as string[]]; }
  }
  static Site(word: Node, id: Node) { return { anchor: word.sourceString, id: id.sourceString }; }
  static ThingKind(_is: Node, kind: Node) { return kind.sourceString; }
  static StatePart(_s: Node, id: Node, flags: Node, text: Node, _dot: Node): Field {
    return { field: 'state', value: { id: id.sourceString, flags: flags.children.map(ModuleParser.text),
      text: ModuleParser.ast(text) } };
  }
  static ChangePart(_c: Node, id: Node, label: Node, _from: Node, from: Node, _to: Node, to: Node, needs: Node,
    after: Node, consumes: Node, at: Node, _dot: Node): Field {
    const [a, c, p] = [after, consumes, at].map(node => node.children.length ?
      ModuleParser.ast(node.children[0]!) as string : undefined);
    const n = needs.children.length ? ModuleParser.ast(needs.children[0]!) as unknown as string[] : undefined;
    return { field: 'change', value: { id: id.sourceString, label: ModuleParser.ast(label), from: from.sourceString,
      to: to.sourceString, ...(n ? { needs: n } : {}), ...(a ? { after: a } : {}), ...(c ? { consumes: c } : {}),
      ...(p ? { at: p } : {}) } };
  }
  static Second(_word: Node, value: Node) { return value.ctorName === 'string' ? ModuleParser.ast(value) : value.sourceString; }
  static Third(_a: Node, _b: Node, value: Node) { return value.sourceString; }
  static HurtsPart(_h: Node, _with: Node, ability: Node, _when: Node, when: Node, _then: Node, then: Node,
    _dot: Node): Field {
    return { field: 'hurts', value: { ability: ability.sourceString, when: when.sourceString, then: then.sourceString } };
  }
  static GuardsPart(_g: Node, way: Node, _dot: Node): Field { return { field: 'guards', value: way.sourceString }; }
  static TriesPart(_t: Node, first: Node, _commas: Node, more: Node, _dot: Node): Field {
    return { field: 'tries', value: [first.sourceString, ...more.children.map(n => n.sourceString)] };
  }
  static Anchor(word: Node, id: Node) { return { kind: word.sourceString, id: id.sourceString }; }
  static Event(_e: Node, id: Node, anchor: Node, _when: Node, when: Node, text: Node, taught: Node, tail: Node): Field {
    return { field: 'event', value: { id: id.sourceString,
      ...(anchor.children.length ? { anchor: ModuleParser.ast(anchor.children[0]!) } : {}),
      when: ModuleParser.ast(when), text: ModuleParser.ast(text), ...InformationParser.teaching(taught),
      effects: ModuleParser.ast(tail) } };
  }
  static EventEffects(_then: Node, _open: Node, changes: Node, _close: Node) { return ModuleParser.list(changes); }
  static EventPlain(_dot: Node) { return []; }
  static Objective(_o: Node, id: Node, _when: Node, when: Node, text: Node, _dot: Node): Field {
    return { field: 'objective', value: { id: id.sourceString, when: ModuleParser.ast(when), text: ModuleParser.ast(text) } };
  }
  static Seen(_s: Node, text: Node, _dot: Node): Field { return { field: 'seen', value: ModuleParser.ast(text) }; }
  static Exit(_e: Node, id: Node, name: Node, _from: Node, origin: Node, _to: Node, destination: Node,
    _by: Node, mode: Node, door: Node, knowledge: Node, _dot: Node): Field {
    return { field: 'exit', value: { id: id.sourceString, name: ModuleParser.ast(name), type: 'passage',
      exit: { origin: origin.sourceString, destination: destination.sourceString, mode: mode.sourceString,
        ...(door.children.length ? { door: ModuleParser.ast(door.children[0]!) } : {}),
        ...(knowledge.children.length ? { knowledge: ModuleParser.ast(knowledge.children[0]!) } : {}) } } };
  }
  static ExitDoor(_through: Node, door: Node): string { return door.sourceString; }
  static ExitKnowledge(_known: Node, _by: Node, knowledge: Node): string { return knowledge.sourceString; }
  // A mechanism of this place: its effect is written in the Kyr effect language and belongs to this module only.
  static HazardDecl(_h: Node, id: Node, name: Node, _means: Node, effect: Node, _dot: Node): Field {
    const text = ModuleParser.ast(effect) as string;
    parseAbility(id.sourceString, ModuleParser.ast(name) as string, text);
    return { field: 'hazard', value: { id: id.sourceString, type: 'hazard', name: ModuleParser.ast(name), effect: text } };
  }
  static Company(_c: Node, id: Node, name: Node, _of: Node, size: Node, _at: Node, place: Node, _dot: Node): Field {
    return { field: 'company', value: { id: id.sourceString, name: ModuleParser.ast(name), size: Number(size.sourceString),
      place: place.sourceString } };
  }
  // A way under ten minutes is walked in minutes (they add up to watches); a longer one in whole watches.
  static Taking(_t: Node, amount: Node, unit: Node) {
    const n = Number(amount.sourceString), u = unit.sourceString;
    return { ticks: Math.max(1, u.startsWith('minute') ? Math.ceil(n / 10) : u.startsWith('hour') ? n * 6 : n * 144),
      ...u.startsWith('minute') && n < 10 ? { minutes: n } : {} };
  }
  static Result(_r: Node, text: Node, _dot: Node): Field {
    return { field: 'report', value: ModuleParser.ast(text) };
  }
  static Otherwise(_o: Node, text: Node, _dot: Node): Field {
    return { field: 'otherwise', value: ModuleParser.ast(text) };
  }
  static TopicEffects(_on: Node, _discuss: Node, _open: Node, changes: Node, _close: Node): Change[] {
    return ModuleParser.list(changes) as Change[];
  }
  // A topic is put to someone where they are; one "travelling" to someone who has joined the company, wherever it is.
  static Topic(_t: Node, id: Node, _with: Node, speaker: Node, travelling: Node, title: Node, _when: Node,
    condition: Node, once: Node, _open: Node, _says: Node, response: Node, _dot: Node, effects: Node,
    _close: Node): Field {
    const who = speaker.sourceString;
    // Someone who has joined the company is still themselves: what could be put to them where they were can be put to
    // them on the way, so long as they can answer (not fallen, nor asleep).
    const along = `travelsWith(${who}, actor) and not (joinedAs(?m, ${who}) and not awake(?m))`;
    const text = travelling.children.length
      ? `able(actor) and distinct(actor, ${who}) and at(actor, site) and ${along}`
      : `able(actor) and distinct(actor, ${who}) and at(actor, site)`
        + ` and ((able(${who}) and at(${who}, site)) or (${along}))`;
    return { field: 'action', value: { id: id.sourceString, name: ModuleParser.ast(title),
      description: '', speaker: who,
      report: ModuleParser.ast(response), parameters: [{ name: 'actor', type: 'group' }, { name: 'site', type: 'place' }],
      requires: { kind: 'and', left: ModuleParser.predicate(text), right: ModuleParser.ast(condition) },
      success: ModuleParser.told(effects.children.length ? ModuleParser.ast(effects.children[0]!) as Change[] : [],
        who),
      failure: [], cost: 1, time: 0, ...(once.children.length ? { once: true } : {}) } };
  }
  // What a topic teaches the company it learns from the speaker: each fact it comes to know is also told by them.
  static told(changes: Change[], speaker: string): Change[] {
    return changes.flatMap(c => c.kind === 'assert' && c.call.name === 'knows' && c.call.args[0] === 'actor'
      ? [c, { kind: 'assert' as const,
        call: { kind: 'call' as const, name: 'toldBy', args: ['actor', speaker, c.call.args[1]!] } }]
      : [c]);
  }
  // A discovery with nothing to say of where it is learnt: something people know, or a scene teaches.
  static Information(_discovery: Node, id: Node, text: Node, _open: Node, parts: Node, _close: Node): Field {
    const definition: DiscoveryDefinition = { id: id.sourceString,
      text: ModuleParser.ast(text) as string, sources: [] };
    const seen = new Set<string>();
    for (const node of parts.children) {
      const part = ModuleParser.ast(node) as Field;
      if (part.field === 'source') {
        definition.sources.push(part.value as DiscoveryDefinition['sources'][number]);
      }
      else if (part.field === 'found') { (definition.found ??= []).push(part.value as NonNullable<DiscoveryDefinition['found']>[number]); }
      else {
        if (seen.has(part.field)) { throw new Error(`Duplicate discovery field ${part.field}`); }
        seen.add(part.field); Object.assign(definition, { [part.field]: part.value });
      }
    }
    return { field: 'information', value: definition };
  }
  static InformationSource(_source: Node, id: Node, text: Node, _at: Node, place: Node, _readable: Node,
    _by: Node, readers: Node, speakers: Node, destructible: Node, _dot: Node): Field {
    return { field: 'source', value: { id: id.sourceString, text: ModuleParser.ast(text), place: place.sourceString,
      readers: readers.asIteration().children.map(ModuleParser.text),
      ...(speakers.children.length ? { speakers: ModuleParser.ast(speakers.children[0]!) } : {}),
      ...(destructible.children.length ? { destructible: true } : {}) } };
  }
  // A pursuit may name the actions its actor uses for it, and may be given to someone another module declared.
  static Pursuit(_pursuit: Node, id: Node, _for: Node, actor: Node, label: Node, _priority: Node, priority: Node,
    _when: Node, when: Node, _seeks: Node, target: Node, using: Node, _dot: Node): Field {
    return { field: 'pursuit', value: { id: id.sourceString, actor: actor.sourceString,
      ...(label.children.length ? { label: ModuleParser.ast(label.children[0]!) } : {}),
      priority: Number(priority.sourceString), when: ModuleParser.ast(when), target: ModuleParser.ast(target),
      ...(using.children.length ? { using: ModuleParser.ast(using.children[0]!) } : {}) } };
  }
  static PursuitUsing(_using: Node, ids: Node) { return ids.asIteration().children.map(ModuleParser.text); }
  static WorldRule(_rule: Node, id: Node, anchor: Node, _when: Node, predicate: Node, says: Node, teaches: Node,
    _open: Node, changes: Node, _close: Node): Field {
    const where = anchor.children.length ?
      ModuleParser.ast(anchor.children[0]!) as { kind: string; id: string } : undefined;
    return { field: 'rule', value: { id: id.sourceString, when: ModuleParser.ast(predicate),
      effects: ModuleParser.list(changes), ...(where ? { place: where.id, anchor: where.kind } : {}),
      ...(says.children.length ? { say: ModuleParser.ast(says.children[0]!) } : {}),
      ...InformationParser.teaching(teaches) } };
  }
  // An observation may teach a fact: what the company sees here, it knows from then on. One "of" an entity is not
  // perceived while the company has not noticed that entity.
  static Observation(_observe: Node, id: Node, anchor: Node, about: Node, aspect: Node, by: Node, _when: Node,
    predicate: Node, text: Node, teaches: Node, _dot: Node): Field {
    const where = ModuleParser.ast(anchor) as { kind: string; id: string };
    return { field: 'observation', value: { id: id.sourceString, place: where.id,
      ...(where.kind === 'at' ? {} : { anchor: where.kind }), when: ModuleParser.ast(predicate), text: ModuleParser.ast(text),
      ...(about.children.length ? { about: about.children[0]!.children[1]!.sourceString } : {}),
      ...(aspect.children.length ? { aspect: ModuleParser.ast(aspect.children[0]!) } : {}),
      ...(by.children.length ? { by: ModuleParser.ast(by.children[0]!) } : {}),
      ...(teaches.children.length ? { teaches: teaches.children[0]!.children[1]!.sourceString } : {}) } };
  }
  static Relation(_relation: Node, name: Node, _open: Node, types: Node,
    _close: Node, exclusive: Node, _dot: Node): Field {
    return { field: 'relation', value: { name: name.sourceString,
      types: types.asIteration().children.map(ModuleParser.text), exclusive: exclusive.children.length > 0 } };
  }
  static Measure(_measure: Node, name: Node, _open: Node, types: Node, _close: Node, _dot: Node): Field {
    return { field: 'measure', value: { name: name.sourceString,
      types: types.asIteration().children.map(ModuleParser.text), exclusive: false } };
  }
  static Query(_query: Node, name: Node, _open: Node, parameters: Node, _close: Node,
    _means: Node, predicate: Node, _dot: Node): Field {
    return { field: 'query', value: { name: name.sourceString, parameters: ModuleParser.list(parameters),
      body: ModuleParser.ast(predicate) } };
  }
  static Entity(_entity: Node, id: Node, _colon: Node, type: Node, name: Node, binding: Node, _dot: Node): Field {
    return { field: 'entity', value: { id: id.sourceString, type: type.sourceString, name: ModuleParser.ast(name),
      ...(binding.children.length ? { creatureId: ModuleParser.ast(binding.children[0]!) } : {}) } };
  }
  static Action(_action: Node, id: Node, parameters: Node, name: Node, _open: Node, parts: Node, _close: Node): Field {
    const action: Operator = { id: id.sourceString, name: ModuleParser.ast(name) as string, description: '',
      requires: { kind: 'boolean', value: true }, success: [], failure: [], cost: 1, time: 1 };
    if (parameters.children.length) {
      action.parameters = ModuleParser.ast(parameters.children[0]!) as Operator['parameters'];
    }
    const seen = new Set<string>();
    for (const child of parts.children) {
      const { field, value } = ModuleParser.ast(child) as Field;
      if (seen.has(field)) { throw new Error(`Duplicate ${field} in action ${action.id}`); }
      seen.add(field);
      Object.assign(action, { [field]: value });
    }
    return { field: 'action', value: action };
  }
  static Success(_on: Node, _success: Node, _open: Node, changes: Node, _close: Node): Field {
    return { field: 'success', value: ModuleParser.list(changes) };
  }
  static Failure(_on: Node, _failure: Node, _open: Node, changes: Node, _close: Node): Field {
    return { field: 'failure', value: ModuleParser.list(changes) };
  }
  static ast(node: Node): unknown { return (node as AstNode).ast(); }
  static text(node: ohm.Node): string { return node.sourceString; }
}
