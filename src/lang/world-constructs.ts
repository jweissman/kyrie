import { ItemNames } from '../item-names';
import type { Anchor, Call, Change, Module, Predicate } from './module';
import { ItemCatalog } from '../item-catalog';

export interface StateSpec { id: string; flags: string[]; text: string }
export interface ChangeSpec {
  id: string; label: string; from: string; to: string; needs?: string[]; after?: string; consumes?: string;
  // Where the change can be made from, when only one side reaches it (a bar on the cellar side of a door).
  at?: string;
}
export interface ThingSpec {
  id: string; name: string; type: string; site?: { anchor: 'at' | 'on' | 'inside'; id: string };
  states: StateSpec[]; changes: ChangeSpec[]; hurts?: { ability: string; when: string; then: string };
  guards?: string[];
  // Not perceived or reachable until the company knows this fact; holds: things can be put inside it.
  hidden?: string; holds?: boolean;
  // Ways of trying it its author offers besides those its look suits (Tries pushing: a bell can be rung).
  tries?: string[];
}
export interface PassageSpec {
  id: string; name: string; sides: [string, string]; oneWay: boolean; hidden?: string; needs?: string[];
  kind?: string; ticks?: number; minutes?: number;
  // Crossed only while this holds, and how the way looks while it does not.
  opening?: Predicate; shut?: string;
}
export interface EventSpec {
  id: string; anchor?: { kind: Anchor; id: string }; when: Predicate; text: string; effects: Change[];
}

// First-class world declarations lowered into ordinary entities, facts, observations and rules. The runtime
// keeps one execution model; these constructs only remove bookkeeping the author used to write by hand.
export class WorldConstructs {
  private static assert(module: Module, name: string, ...args: string[]) {
    module.initial.push({ kind: 'assert', call: { kind: 'call', name, args } });
  }
  private static entity(module: Module, id: string, type: string, name: string) {
    if (!module.entities.some(e => e.id === id)) { module.entities.push({ id, type, name }); }
  }
  static readonly quick: Record<string, number> = { door: 1, doorway: 1, arch: 1, gate: 1, stair: 2, steps: 2,
    ladder: 2 };
  static passage(module: Module, p: PassageSpec) {
    if (p.sides[0] === p.sides[1]) { throw new Error(`Passage ${p.id} must join two different places`); }
    module.entities.push({ id: p.id, type: 'passage', name: p.name });
    this.assert(module, 'connects', p.id, p.sides[0], p.sides[1]);
    if (!p.oneWay) { this.assert(module, 'connects', p.id, p.sides[1], p.sides[0]); }
    if (p.hidden) { this.assert(module, 'revealedBy', p.id, p.hidden); }
    for (const need of p.needs ?? []) { this.assert(module, 'needs', p.id, need); }
    const kind = p.kind ?? 'passage';
    if (!this.wayKinds.includes(kind)) { throw new Error(`Unknown passage kind ${kind} for ${p.id}`); }
    this.entity(module, `way_${kind}`, 'waykind', kind);
    this.assert(module, 'passageKind', p.id, `way_${kind}`);
    if (['road', 'bridge', 'ford'].includes(kind)) { this.assert(module, 'roadway', p.id); }
    module.initial.push({ kind: 'set', call: { kind: 'call', name: 'travelTime', args: [p.id] },
      value: { kind: 'number', value: p.ticks ?? 1 } });
    // A door is stepped through in a minute and a stair climbed in two, unless the author says how long it takes.
    const minutes = p.minutes ?? (p.ticks === undefined ? WorldConstructs.quick[kind] : undefined);
    if (minutes) {
      module.initial.push({ kind: 'set', call: { kind: 'call', name: 'travelMinutes', args: [p.id] },
        value: { kind: 'number', value: minutes } });
    }
    if (p.opening) { this.opening(module, p.id, p.opening, p.shut); }
  }
  // A way that opens only while something holds is unopened until the world's rules find that it does, and again
  // whenever it stops holding; while unopened, it is not passable, and looks as the author says.
  private static opening(module: Module, id: string, when: Predicate, shut?: string) {
    const unopened: Predicate = { kind: 'call', name: 'unopened', args: [id] };
    this.assert(module, 'unopened', id);
    (module.rules ??= []).push(
      { id: `${id}__opens`, when: { kind: 'and', left: when, right: unopened },
        effects: [{ kind: 'retract', call: unopened }] },
      { id: `${id}__shuts`, when: { kind: 'and', left: { kind: 'not', value: when }, right: { kind: 'not', value: unopened } },
        effects: [{ kind: 'assert', call: unopened }] });
    if (shut) {
      (module.observations ??= []).push({ id: `${id}__shut`, place: id, anchor: 'beside', when: unopened, text: shut,
        aspect: 'feature' });
    }
  }
  static readonly wayKinds = ['passage', 'door', 'doorway', 'arch', 'gate', 'stair', 'steps', 'ladder', 'shaft', 'path',
    'track', 'road', 'causeway', 'bridge', 'ford', 'tunnel', 'crawl', 'culvert', 'drift', 'incline', 'ferry', 'climb',
    'portal'];
  // An item instance with one name: the authored one, or its catalog kind's name.
  static item(module: Module, i: { id: string; name?: string; kind: string; place: string; inside?: boolean;
    hidden?: string; owner?: string }, kindName?: string) {
    if (!kindName) { throw new Error(`Item ${i.id} names a kind missing from the item catalog: ${i.kind}`); }
    module.entities.push({ id: i.id, type: 'item', name: i.name ?? ItemNames.called(kindName) });
    this.entity(module, i.kind, 'itemkind', kindName);
    this.assert(module, 'itemKind', i.id, i.kind);
    this.assert(module, i.inside ? 'inside' : 'at', i.id, i.place);
    if (i.hidden) { this.assert(module, 'revealedBy', i.id, i.hidden); }
    // Whose it is: an owner who sees it in the company's hands, not lent, objects (belongings.kyr).
    if (i.owner) { this.assert(module, 'owns', i.owner, i.id); }
  }
  // A person's offers and wares: services with fees, counted goods, or item instances of catalog kinds for sale.
  static offers(module: Module, p: { id: string; place: string; offers?: { kind: string; text: string; fee: number }[];
    sells?: { what: string; fee: number; stock: number }[]; buys?: { what: string; fee: number }[] },
  catalog?: (kind: string) => string | undefined) {
    // What a person will pay for a kind of thing the company brings them.
    for (const b of p.buys ?? []) {
      const kindName = catalog?.(b.what);
      if (!kindName) { throw new Error(`${p.id} buys ${b.what}, which is no kind of item`); }
      this.entity(module, b.what, 'itemkind', kindName);
      module.initial.push({ kind: 'set', call: { kind: 'call', name: 'pays', args: [p.id, b.what] }, value: { kind: 'number', value: b.fee } });
    }
    for (const o of p.offers ?? []) {
      const id = `${p.id}_${o.kind}`;
      module.entities.push({ id, type: 'service', name: o.text });
      this.assert(module, 'offers', p.id, id);
      this.assert(module, 'serviceOf', id, o.kind);
      module.initial.push({ kind: 'set', call: { kind: 'call', name: 'fee', args: [id] }, value: { kind: 'number', value: o.fee } });
    }
    for (const s of p.sells ?? []) {
      const kindName = catalog?.(s.what);
      if (!kindName) {
        this.assert(module, 'sells', p.id, s.what);
        for (const [name, value] of [['goodsPrice', s.fee], ['quantity', s.stock]] as const) {
          module.initial.push({ kind: 'set', call: { kind: 'call', name, args: [p.id, s.what] }, value: { kind: 'number', value } });
        }
        continue;
      }
      this.entity(module, s.what, 'itemkind', kindName);
      module.initial.push({ kind: 'set', call: { kind: 'call', name: 'shelf', args: [p.id, s.what] }, value: { kind: 'number', value: s.stock } });
      if (ItemCatalog.definitions[s.what]?.use) { this.restock(module, p, s.what, s.stock); }
      for (let n = 1; n <= s.stock; n++) {
        const id = `${p.id}_${s.what}_${n}`;
        module.entities.push({ id, type: 'item', name: ItemNames.called(kindName) });
        this.assert(module, 'itemKind', id, s.what); this.assert(module, 'at', id, p.place);
        this.assert(module, 'forSale', id); this.assert(module, 'soldBy', id, p.id);
        module.initial.push({ kind: 'set', call: { kind: 'call', name: 'price', args: [id] }, value: { kind: 'number', value: s.fee } });
      }
    }
  }
  // What is used up comes back to the shelf: each dawn, any of a seller's own stock of the kind that has been bought
  // and spent (owned by no one, lying nowhere) is set out for sale again, while fewer than they began with are out.
  private static restock(module: Module, p: { id: string; place: string }, kind: string, stock: number) {
    const shelf = this.call('shelf', p.id, kind), one = { kind: 'number' as const, value: 1 };
    (module.rules ??= []).push({ id: `${p.id}_${kind}_restock`, when: this.all([
      { kind: 'compare', operator: '==', left: this.call('untilLight', 'clock'), right: one },
      { kind: 'compare', operator: '<', left: shelf, right: { kind: 'number', value: stock } },
      this.call('soldBy', '?r', p.id), this.call('itemKind', '?r', kind), this.none('forSale', '?r'),
      this.none('at', '?r', '?w'), this.none('ownedItem', '?r', '?o'), this.none('inside', '?r', '?b')]),
    effects: [{ kind: 'assert', call: this.call('at', '?r', p.place) }, { kind: 'assert', call: this.call('forSale', '?r') },
      { kind: 'increase', call: shelf, value: one }] });
  }
  private static call(name: string, ...args: string[]): Call { return { kind: 'call', name, args }; }
  private static none(name: string, ...args: string[]): Predicate { return { kind: 'not', value: this.call(name, ...args) }; }
  private static all(ps: Predicate[]): Predicate { return ps.reduce((left, right) => ({ kind: 'and', left, right })); }
  // States and changes of a thing or person. A thing's descriptions follow the thing: they are perceived where it
  // stands, or from either side of the passage it occupies, and only while it is in that state.
  static states(module: Module, t: ThingSpec, anchor: { kind: Anchor; id: string }) {
    const names = new Set(t.states.map(s => s.id));
    if (names.size !== t.states.length) { throw new Error(`Duplicate state in ${t.id}`); }
    for (const c of t.changes) {
      if (!names.has(c.from) || !names.has(c.to)) { throw new Error(`Change ${t.id}.${c.id} names an undeclared state`); }
    }
    if (t.hurts && (!names.has(t.hurts.when) || !names.has(t.hurts.then))) {
      throw new Error(`Hurts in ${t.id} names an undeclared state`);
    }
    if (!t.states.length) { return; }
    for (const s of t.states) {
      this.entity(module, s.id, 'condition', s.id);
      if (s.flags.includes('blocking')) { this.assert(module, 'blocksWhen', t.id, s.id); }
      if (s.flags.includes('dangerous')) { this.assert(module, 'harmsWhen', t.id, s.id); }
      if (s.flags.includes('closed')) { this.assert(module, 'closesWhen', t.id, s.id); }
      if (s.text) {
        (module.observations ??= []).push({ id: `${t.id}__${s.id}`, place: anchor.id, anchor: anchor.kind, about: t.id,
          when: t.type === 'group' ? { kind: 'and',
            left: { kind: 'call', name: 'able', args: [t.id] },
            right: { kind: 'call', name: 'state', args: [t.id, s.id] } }
            : { kind: 'call', name: 'state', args: [t.id, s.id] }, text: s.text });
      }
    }
    this.assert(module, 'state', t.id, t.states[0]!.id);
    for (const c of t.changes) {
      const id = `${t.id}_${c.id}`;
      module.entities.push({ id, type: 'change', name: c.label.replaceAll('{self}', `{${t.id}}`) });
      this.assert(module, 'changeOf', id, t.id);
      this.assert(module, 'changeFrom', id, c.from);
      this.assert(module, 'changeTo', id, c.to);
      for (const need of c.needs ?? []) { this.assert(module, 'needs', id, need); }
      if (c.after) { this.assert(module, 'changeKnows', id, c.after); }
      if (c.at) { this.assert(module, 'changeAt', id, c.at); }
      // Consuming a good spends some of the company's stock; consuming a kind of item uses one up.
      const spent = c.consumes ? ItemCatalog.definitions[c.consumes]?.name : undefined;
      if (spent) { this.entity(module, c.consumes!, 'itemkind', spent); this.assert(module, 'spends', id, c.consumes!); }
      else if (c.consumes) { this.assert(module, 'consumes', id, c.consumes); }
    }
    if (t.hurts) {
      this.assert(module, 'harmsWhen', t.id, t.hurts.when);
      this.assert(module, 'hurtsWith', t.id, t.hurts.ability);
      this.assert(module, 'hurtsInto', t.id, t.hurts.then);
    }
    for (const way of t.guards ?? []) { this.assert(module, 'guards', t.id, way); }
  }
  static thing(module: Module, t: ThingSpec) {
    module.entities.push({ id: t.id, type: t.type, name: t.name });
    if (!t.site) { throw new Error(`Thing ${t.id} needs a place or passage`); }
    this.assert(module, t.site.anchor, t.id, t.site.id);
    if (t.hidden) { this.assert(module, 'revealedBy', t.id, t.hidden); }
    if (t.holds) { this.assert(module, 'receptacle', t.id); }
    // Anything a company can handle can be tried, in the ways that suit it.
    if (t.type !== 'group' && t.type !== 'scenery') {
      this.assert(module, 'probeable', t.id);
      for (const verb of this.tries(t)) { this.assert(module, 'suits', t.id, verb); }
    }
    this.states(module, t, t.site.anchor === 'on' ? { kind: 'beside', id: t.site.id } : { kind: 'near', id: t.id });
  }
  // How a thing may be tried, by what anyone can see of it, so that offering a try gives nothing away: anything can
  // be looked at closely; a chest or a casket, or anything shut, prodded, pried at and listened at; a door, wall or
  // grate across a way listened at, pushed and pried at; something set in a way (a plate, a wire, a loose stone)
  // prodded from a pace off. Its author may offer more.
  private static tries(t: ThingSpec): string[] {
    const flags = new Set(t.states.flatMap(s => s.flags)), on = t.site?.anchor === 'on';
    return [...new Set(['looking', ...t.holds || flags.has('closed') ? ['prodding', 'prying', 'listening'] : [],
      ...on && flags.has('blocking') ? ['listening', 'pushing', 'prying'] : [],
      ...on && (t.hurts || flags.has('dangerous')) ? ['prodding'] : [], ...t.tries ?? []])];
  }
  // An event happens once, when its condition first holds, and is perceived only by those at its anchor.
  static event(module: Module, e: EventSpec) {
    const latch = `once_${e.id}`;
    module.relations.push({ name: latch, types: [], exclusive: false });
    (module.rules ??= []).push({ id: e.id, when: { kind: 'and', left: e.when,
      right: { kind: 'not', value: { kind: 'call', name: latch, args: [] } } },
    effects: [{ kind: 'assert', call: { kind: 'call', name: latch, args: [] } }, ...e.effects], say: e.text,
    ...(e.anchor ? { place: e.anchor.id, anchor: e.anchor.kind } : {}) });
  }
  static once(module: Module, action: Module['actions'][number]) {
    const latch = `said_${action.id}`;
    module.relations.push({ name: latch, types: [], exclusive: false });
    action.requires = { kind: 'and', left: action.requires, right: { kind: 'not', value: { kind: 'call', name: latch, args: [] } } };
    action.success = [...action.success, { kind: 'assert', call: { kind: 'call', name: latch, args: [] } }];
  }
}
