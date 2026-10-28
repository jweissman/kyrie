import type * as ohm from 'ohm-js';
import type { Change, Module, Predicate, Value, WorldRule } from './module';

type Node = ohm.Node;
interface MatterSpec { id: string; text: string; watches: number; until?: Predicate }
export interface OccasionSpec {
  id: string; title: string; at?: string; when: Predicate; matters: MatterSpec[]; closes?: string;
}

// An occasion with matters taken up in order (a court's cases, a council's business, a hearing): it opens when its
// condition first holds; each matter is said as it opens and stays open until its own condition closes it or its time
// is up, and then the next is taken up; after the last it is over. Actions ask matterOpen(m). Five adventures built
// one by hand in watch-windows (the Liberty of the Ice's Landing, its 9; Low Water's Hearing, Tessary's Board,
// Wrayford's Remonstrance, Calamy's Parliament), and the Landing's first windows were too short to act in.
//   Occasion landing "the Landing" at quay when hour(clock) >= 9 {
//     Matter herring "Master Harker brings the herring case." for 30 minutes until decided(herring).
//     Matter boat "The boat case is called." for 30 minutes.
//     Closes "The Reeve rises." }
export class Occasions {
  static readonly actions = { Occasion: Occasions.parse, OccasionBody: Occasions.body, OccasionHead: Occasions.head,
    OccasionWhere: Occasions.where, OccasionAt: Occasions.second, OccasionMatter: Occasions.matter,
    MatterFor: Occasions.span, MatterUntil: Occasions.until, MatterCondition: Occasions.second,
    OccasionCloses: Occasions.closes };
  // Occasion = "Occasion" OccasionHead "{" OccasionBody
  static parse(_o: Node, head: Node, _open: Node, body: Node) {
    const [matters, closes] = Occasions.ast(body) as [MatterSpec[], string | undefined];
    return { field: 'occasion', value: { ...Occasions.ast(head) as object, matters, ...closes ? { closes } : {} } };
  }
  // OccasionBody = OccasionMatter+ OccasionCloses? "}"
  static body(matters: Node, closes: Node, _close: Node) {
    return [matters.children.map(m => Occasions.ast(m)), closes.children.map(c => Occasions.ast(c))[0]];
  }
  // OccasionHead = ident string OccasionWhere
  static head(id: Node, title: Node, where: Node) {
    return { id: id.sourceString, title: Occasions.ast(title) as string, ...Occasions.ast(where) as object };
  }
  // OccasionWhere = OccasionAt? "when" Predicate; OccasionAt = "at" ident; MatterCondition = "until" Predicate
  static where(at: Node, _when: Node, when: Node) {
    const place = at.children.map(p => Occasions.ast(p) as string)[0];
    return { ...place ? { at: place } : {}, when: Occasions.ast(when) as Predicate };
  }
  static second(_word: Node, value: Node): unknown {
    return value.ctorName === 'ident' ? value.sourceString : Occasions.ast(value);
  }
  // OccasionMatter = "Matter" ident string MatterFor
  static matter(_m: Node, id: Node, text: Node, span: Node): MatterSpec {
    return { id: id.sourceString, text: Occasions.ast(text) as string,
      ...Occasions.ast(span) as Omit<MatterSpec, 'id' | 'text'> };
  }
  // MatterFor = "for" integer MatterUnit MatterUntil
  static span(_for: Node, n: Node, unit: Node, until: Node) {
    const minutes = Number(n.sourceString) * (unit.sourceString.startsWith('hour') ? 60 : 1);
    return { watches: Math.max(1, Math.ceil(minutes / 10)), ...Occasions.ast(until) as object };
  }
  // MatterUntil = MatterCondition? "."
  static until(condition: Node, _dot: Node) {
    const when = condition.children.map(c => Occasions.ast(c) as Predicate)[0];
    return when ? { until: when } : {};
  }
  // OccasionCloses = "Closes" string "."
  static closes(_c: Node, text: Node, _dot: Node) { return Occasions.ast(text) as string; }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static lower(module: Module, o: OccasionSpec) {
    module.entities.push({ id: o.id, type: 'occasion', name: o.title },
      ...o.matters.map(m => ({ id: m.id, type: 'matter', name: m.id.replace(/_/g, ' ') })));
    const call = Occasions.call, place = o.at ? { place: o.at, anchor: 'at' as const } : {}, first = o.matters[0]!;
    const rules: WorldRule[] = [{ id: `${o.id}_begins`, ...place, say: first.text,
      when: { kind: 'and', left: o.when, right: { kind: 'not', value: call('occasionBegun', o.id) } },
      effects: [{ kind: 'assert', call: call('occasionBegun', o.id) }, ...Occasions.open(first.id)] }];
    o.matters.forEach((m, i) => rules.push(Occasions.closing(o, m, o.matters[i + 1], place)));
    (module.rules ??= []).push(...rules);
  }
  // A matter closed, by its own condition or its time, and the next taken up, or the occasion over.
  private static closing(o: OccasionSpec, m: MatterSpec, next: MatterSpec | undefined,
    place: { place?: string; anchor?: 'at' }): WorldRule {
    const call = Occasions.call;
    const since: Value = { kind: 'arith', op: '+', left: call('matterSince', m.id),
      right: { kind: 'number', value: m.watches } };
    const up: Predicate = { kind: 'compare', operator: '>=', left: call('watch', 'clock'), right: since };
    const done: Change[] = [{ kind: 'retract', call: call('matterOpen', m.id) },
      { kind: 'assert', call: call('matterDone', m.id) }];
    const say = next ? next.text : o.closes;
    return { id: `${m.id}_closes`, ...place, ...say ? { say } : {},
      when: { kind: 'and', left: call('matterOpen', m.id),
        right: m.until ? { kind: 'or', left: m.until, right: up } : up },
      effects: [...done, ...next ? Occasions.open(next.id) : [{ kind: 'assert' as const, call: call('occasionOver', o.id) }]] };
  }
  private static open(matter: string): Change[] {
    return [{ kind: 'assert', call: Occasions.call('matterOpen', matter) },
      { kind: 'set', call: Occasions.call('matterSince', matter), value: Occasions.call('watch', 'clock') }];
  }
  private static call(name: string, ...args: string[]): Extract<Predicate, { kind: 'call' }> {
    return { kind: 'call', name, args };
  }
}
