import type { Anchor, Change, Module, Predicate } from './module';

export interface StateSpec { id: string; flags: string[]; text: string }
export interface ChangeSpec {
  id: string; label: string; from: string; to: string; needs?: string; after?: string; consumes?: string;
}
export interface ThingSpec {
  id: string; name: string; type: string; site?: { anchor: 'at' | 'on'; id: string };
  states: StateSpec[]; changes: ChangeSpec[]; hurts?: { ability: string; when: string; then: string };
  guards?: string[];
}
export interface PassageSpec {
  id: string; name: string; sides: [string, string]; oneWay: boolean; hidden?: string; needs?: string;
  kind?: string; ticks?: number;
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
  static passage(module: Module, p: PassageSpec) {
    if (p.sides[0] === p.sides[1]) { throw new Error(`Passage ${p.id} must join two different places`); }
    module.entities.push({ id: p.id, type: 'passage', name: p.name });
    this.assert(module, 'connects', p.id, p.sides[0], p.sides[1]);
    if (!p.oneWay) { this.assert(module, 'connects', p.id, p.sides[1], p.sides[0]); }
    if (p.hidden) { this.assert(module, 'revealedBy', p.id, p.hidden); }
    if (p.needs) { this.assert(module, 'needs', p.id, p.needs); }
    const kind = p.kind ?? 'passage';
    if (!this.wayKinds.includes(kind)) { throw new Error(`Unknown passage kind ${kind} for ${p.id}`); }
    this.entity(module, `way_${kind}`, 'waykind', kind);
    this.assert(module, 'passageKind', p.id, `way_${kind}`);
    module.initial.push({ kind: 'set', call: { kind: 'call', name: 'travelTime', args: [p.id] },
      value: { kind: 'number', value: p.ticks ?? 1 } });
  }
  static readonly wayKinds = ['passage', 'door', 'doorway', 'arch', 'gate', 'stair', 'steps', 'ladder', 'shaft', 'path',
    'track', 'road', 'causeway', 'bridge', 'ford', 'tunnel', 'crawl', 'culvert', 'drift', 'incline', 'ferry', 'climb'];
  // An item instance with one name: the authored one, or its catalog kind's name.
  static item(module: Module, i: { id: string; name?: string; kind: string; place: string }, kindName?: string) {
    if (!kindName) { throw new Error(`Item ${i.id} names a kind missing from the item catalog: ${i.kind}`); }
    module.entities.push({ id: i.id, type: 'item', name: i.name ?? kindName });
    this.entity(module, i.kind, 'itemkind', kindName);
    this.assert(module, 'itemKind', i.id, i.kind);
    this.assert(module, 'at', i.id, i.place);
  }
  // A person's offers and wares: services with fees, counted goods, or item instances of catalog kinds for sale.
  static offers(module: Module, p: { id: string; place: string; offers?: { kind: string; text: string; fee: number }[];
    sells?: { what: string; fee: number; stock: number }[] },
  catalog?: (kind: string) => string | undefined) {
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
      for (let n = 1; n <= s.stock; n++) {
        const id = `${p.id}_${s.what}_${n}`;
        module.entities.push({ id, type: 'item', name: kindName });
        this.assert(module, 'itemKind', id, s.what); this.assert(module, 'at', id, p.place);
        this.assert(module, 'forSale', id); this.assert(module, 'soldBy', id, p.id);
        module.initial.push({ kind: 'set', call: { kind: 'call', name: 'price', args: [id] }, value: { kind: 'number', value: s.fee } });
      }
    }
  }
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
      if (s.text) {
        (module.observations ??= []).push({ id: `${t.id}__${s.id}`, place: anchor.id, anchor: anchor.kind,
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
      if (c.needs) { this.assert(module, 'needs', id, c.needs); }
      if (c.after) { this.assert(module, 'changeKnows', id, c.after); }
      if (c.consumes) { this.assert(module, 'consumes', id, c.consumes); }
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
    this.states(module, t, t.site.anchor === 'on' ? { kind: 'beside', id: t.site.id } : { kind: 'near', id: t.id });
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
