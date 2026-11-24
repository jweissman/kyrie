import type * as ohm from 'ohm-js';
import type { Module, Predicate } from './module';
import { SemanticRecords as S, type Span } from './semantic-record';
import { EngineOwned } from './engine-owned';

type Node = ohm.Node;
export interface IncidentSpec { id: string; text: string; of: string[]; core: boolean; resolved: Predicate }
export interface SituationSpec {
  id: string; title: string; at?: string; begins?: Predicate; incidents: IncidentSpec[];
  turn?: { text: string; when: Predicate };
  done: Predicate; span?: Span;
}

// A bounded situation and what it is made of (BRIEF §6; register AU-55, OR-196): the incidents met in it, each with
// how it is resolved, which of them are its core (what must be resolved before it is done), the marked turn where
// something significant changes, and when it is done. It says what the author's ordinary declarations add up to, and
// lowers to nothing the runtime runs: an entity for it and each incident, and a semantic record whose phases are said
// over the facts those declarations already keep (MT-30), so that a tool, a pin or a lint asks which holds and never
// reads a generated rule. One relational engine; no interpreter, no scheduler.
//   Situation fall "Under the fall" at fall {
//     Incident dark "the dark" of party resolved when not benighted(party).
//     Core prop "the fallen prop across the way out" of prop resolved when state(prop, raised).
//     Turn "the prop comes up, and beyond it the dark is grey" when state(prop, raised).
//     Done when at(party, mouth). }
export class Situations {
  static readonly actions = { Situation: Situations.parse, SituationBody: Situations.body,
    SituationParts: Situations.parts, SituationHead: Situations.head, SituationAt: Situations.at,
    SituationBegins: Situations.begins,
    SituationIncident: Situations.incident, IncidentTail: Situations.tail, IncidentResolved: Situations.resolved,
    IncidentOf: Situations.of, SituationTurn: Situations.turn, TurnWhen: Situations.when,
    SituationDone: Situations.done };
  // Situation = "Situation" SituationHead SituationBody
  static parse(word: Node, head: Node, body: Node) {
    return { field: 'situation', value: { ...Situations.ast(head) as object, ...Situations.ast(body) as object,
      span: S.span(word) } };
  }
  // SituationBody = "{" SituationParts "}"
  static body(_open: Node, parts: Node, _close: Node): unknown { return Situations.ast(parts); }
  // SituationParts = SituationIncident+ SituationTurn? SituationDone
  static parts(incidents: Node, turn: Node, done: Node) {
    const t = turn.children.map(c => Situations.ast(c) as SituationSpec['turn'])[0];
    return { incidents: incidents.children.map(i => Situations.ast(i)), ...t ? { turn: t } : {},
      done: Situations.ast(done) as Predicate };
  }
  // SituationHead = ident string SituationWhere?, where it is (at a place) or what begins it (when it first holds).
  static head(id: Node, title: Node, where: Node) {
    const w = where.children.map(p => Situations.ast(p) as object)[0];
    return { id: id.sourceString, title: Situations.ast(title) as string, ...w };
  }
  static at(_word: Node, place: Node) { return { at: place.sourceString }; }
  static begins(_word: Node, when: Node) { return { begins: Situations.ast(when) as Predicate }; }
  // SituationIncident = IncidentWord ident string IncidentTail (IncidentWord = "Incident" | "Core")
  static incident(word: Node, id: Node, text: Node, tail: Node): IncidentSpec {
    return { id: id.sourceString, text: Situations.ast(text) as string, core: word.sourceString === 'Core',
      ...Situations.ast(tail) as Pick<IncidentSpec, 'of' | 'resolved'> };
  }
  // IncidentTail = IncidentOf? IncidentResolved "."
  static tail(of: Node, resolved: Node, _dot: Node) {
    return { of: of.children.flatMap(o => Situations.ast(o) as string[]), resolved: Situations.ast(resolved) };
  }
  // IncidentResolved = "resolved" "when" Predicate
  static resolved(_r: Node, _w: Node, when: Node): unknown { return Situations.ast(when); }
  // IncidentOf = "of" NonemptyListOf<ident, ",">
  static of(_of: Node, list: Node): string[] { return list.asIteration().children.map(c => c.sourceString); }
  // SituationTurn = "Turn" string TurnWhen; TurnWhen = "when" Predicate "."
  static turn(_t: Node, text: Node, when: Node) {
    return { text: Situations.ast(text) as string, when: Situations.ast(when) as Predicate };
  }
  static when(_w: Node, p: Node, _dot: Node): unknown { return Situations.ast(p); }
  // SituationDone = "Done" "when" Predicate "."
  static done(_d: Node, _w: Node, when: Node, _dot: Node): Predicate { return Situations.ast(when) as Predicate; }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  // Its record, over the facts its declarations keep: done; turned and not yet done; each core incident open, then each
  // other, once the company has come to it; and before it has. The first that holds is the phase it is in.
  static lower(module: Module, s: SituationSpec) {
    module.entities.push({ id: s.id, type: 'situation', name: s.title },
      ...s.incidents.map(i => ({ id: `${s.id}_${i.id}`, type: 'incident', name: i.text })));
    const begun = s.at ? S.call('been', 'party', s.at) : s.begins, done = s.done;
    const incidents = [...s.incidents.filter(i => i.core), ...s.incidents.filter(i => !i.core)];
    S.add(module, { kind: 'situation', name: s.id, words: s.title, ...s.span ? { span: s.span } : {},
      participants: [...s.at ? [{ role: 'at', id: s.at }] : [],
        ...s.incidents.flatMap(i => i.of.map(id => ({ role: `in ${i.id}`, id })))],
      phases: [{ id: 'done', said: 'done', holds: done },
        ...s.turn ? [{ id: 'turned', said: s.turn.text, holds: S.all(s.turn.when, S.not(done)) }] : [],
        ...incidents.map(i => ({ id: i.id, said: `${i.core ? 'core' : 'open'}: ${i.text}`,
          holds: S.all(...begun ? [begun] : [], S.not(i.resolved), S.not(done)) })),
        ...begun ? [{ id: 'before', said: s.at ? 'not yet come to' : 'not yet begun', holds: S.not(begun) }] : []],
      requires: [...s.incidents.map(i => i.resolved), ...s.turn ? [s.turn.when] : [], done,
        ...s.begins ? [s.begins] : []], effects: [],
      lowered: { rules: [], pursuits: [], objectives: [], entities: [s.id, ...s.incidents.map(i => `${s.id}_${i.id}`)] },
      serves: [] });
  }
  // What a situation must have to be one (AU-55's first check), read off its record as the lint finds it: a marked
  // turn; a core; and each incident resolvable, that is, every fact its resolution asks is one something can make hold
  // (written by an act, a rule, an initial fact or a thing's change, kept by the engine, or a query that says it). A
  // situation whose part nothing can resolve is a design the play cannot finish.
  static lint(module: Module): string[] {
    const made = this.made(module), out: string[] = [];
    for (const r of (module.semantic ?? []).filter(x => x.kind === 'situation')) {
      if (!r.phases.some(p => p.id === 'turned')) { out.push(`Situation ${r.name} has no Turn: say where something significant changes.`); }
      if (!r.phases.some(p => p.said.startsWith('core:'))) {
        out.push(`Situation ${r.name} has no Core: say what must be resolved before it is done.`);
      }
      const incidents = r.lowered.entities.slice(1);
      incidents.forEach((id, n) => {
        const asked = new Set<string>();
        S.called(r.requires[n]!, asked);
        const never = [...asked].filter(x => !made.has(x));
        if (never.length) {
          out.push(`Situation ${r.name}'s incident ${this.bare(id)} can never be resolved: nothing makes `
            + `${never.map(x => this.bare(x)).join(', ')} hold.`);
        }
      });
    }
    return out;
  }
  // A name as its author wrote it, not as its installation calls it (t__own_asleep is asleep).
  private static bare(name: string): string { return name.replace(/^.*__(own_)?/, ''); }
  // Every relation or measure something in the module, or the engine, can make hold.
  static made(module: Module): Set<string> {
    const names = new Set<string>([...EngineOwned.rules, ...EngineOwned.held, 'at', 'been', 'benighted', 'routed',
      'yielded', 'travelsWith', 'following', 'state', 'assails', 'warned', 'tolerates', 'fallen', 'slain', 'holding',
      'keeps', 'grateful', 'willing']);
    for (const q of module.queries ?? []) { names.add(q.name); }
    this.written([module.actions, module.rules, module.initial], names);
    return names;
  }
  private static written(x: unknown, names: Set<string>) {
    if (Array.isArray(x)) { for (const y of x) { this.written(y, names); } return; }
    if (!x || typeof x !== 'object') { return; }
    const o = x as { kind?: string; call?: { name?: string } };
    if (o.call?.name && ['assert', 'retract', 'set', 'increase', 'decrease'].includes(o.kind ?? '')) {
      names.add(o.call.name);
    }
    for (const y of Object.values(x)) { this.written(y, names); }
  }
}
