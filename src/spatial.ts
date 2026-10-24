import type { Change, Entity, ExitDefinition, Module, Operator, Predicate } from './lang/module';
import { World } from './lang/world';

export class Spatial {
  static readonly kinds = ['plane', 'region', 'settlement', 'wilderness', 'site', 'building', 'level', 'room'];
  private static call(name: string, ...args: string[]): Predicate { return { kind: 'call', name, args }; }
  private static within(rows: Entity[], kind: string): string | undefined {
    return rows.find(e => e.space?.kind === kind)?.id;
  }
  static readonly modes = ['walk', 'enter', 'leave', 'ascend', 'descend', 'travel', 'cross_plane'];
  private static commandId(prefix: string, entity: string): string {
    const separator = entity.indexOf('__');
    return separator < 0 ? `${prefix}_${entity}` : `${entity.slice(0, separator)}__${prefix}_${entity.slice(separator + 2)}`;
  }
  static lowerExit(entity: Entity): { action: Operator; initial: Change[] } {
    const e = entity.exit!;
    const tests: Predicate[] = [this.call('able', 'actor'), this.call('at', 'actor', e.origin),
      { kind: 'not', value: this.call('closed', e.destination) },
      { kind: 'not', value: this.call('denied', 'actor', e.origin, e.destination) }];
    if (e.door) { tests.push(this.call('openedDoor', e.door)); }
    if (e.knowledge) { tests.push(this.call('knows', 'actor', e.knowledge)); }
    const labels: Record<string, string> = { walk: 'Walk', enter: 'Enter', leave: 'Leave', ascend: 'Ascend',
      descend: 'Descend', travel: 'Travel', cross_plane: 'Cross the planar threshold' };
    const time = e.mode === 'travel' ? 6 : e.mode === 'cross_plane' ? 12 : 1;
    return { action: { id: this.commandId('move', entity.id), name: `${labels[e.mode] ?? e.mode}: ${entity.name}`,
      description: `Follow this ${e.mode} connection.`, report: `${labels[e.mode] ?? e.mode}: ${entity.name}.`,
      movement: { ...structuredClone(e), passage: entity.id }, parameters: [{ name: 'actor', type: 'group' }],
      requires: tests.reduce((left, right) => ({ kind: 'and', left, right })),
      success: [{ kind: 'assert', call: { kind: 'call', name: 'at', args: ['actor', e.destination] } }],
      failure: [], cost: 1, time },
      initial: e.door ? [...new Set([e.origin, e.destination])].map(site => ({ kind: 'assert',
        call: { kind: 'call', name: 'doorHere', args: [e.door!, site] } })) : [] };
  }
  static addSearches(module: Module): void {
    if (!module.relations.some(r => r.name === 'discoverable')) { return; }
    const rooms = new Map<string, string[]>();
    for (const c of module.initial) {
      if (c.kind !== 'assert' || c.call.name !== 'discoverable') { continue; }
      const [place, fact] = c.call.args;
      if (!place || !fact) { continue; }
      rooms.set(place, [...new Set([...(rooms.get(place) ?? []), fact])]);
    }
    const searches = module.actions.filter(a => a.searchPlace);
    module.actions = module.actions.filter(a => !a.searchPlace);
    for (const [place, facts] of rooms) {
      const id = this.commandId('search_place', place);
      const existing = searches.find(a => a.id === id);
      if (existing) { module.actions.push(existing); continue; }
      const unseen: Predicate = facts.map<Predicate>(f => ({ kind: 'not' as const, value: this.call('knows', 'actor', f) }))
        .reduce((left, right) => ({ kind: 'or', left, right }));
      module.actions.push({ id, name: `Search ${module.entities.find(e => e.id === place)?.name ?? place}`,
        searchPlace: place, description: 'Spend twenty minutes examining this place for concealed physical details.',
        report: 'The company searches carefully. Newly discovered physical details are recorded in the journal.',
        parameters: [{ name: 'actor', type: 'group' }],
        requires: { kind: 'and', left: this.call('able', 'actor'), right: { kind: 'and',
          left: this.call('at', 'actor', place), right: unseen } },
        success: [...facts.map(fact => ({ kind: 'assert' as const,
          call: { kind: 'call' as const, name: 'knows', args: ['actor', fact] } })),
        { kind: 'assert', call: { kind: 'call', name: 'searched', args: ['actor', place] } }],
        failure: [], cost: 1, time: 2 });
    }
  }
  static addEscorts(module: Module): void {
    if (!['rescued', 'trapped', 'distinct'].every(name => module.relations.some(r => r.name === name))) { return; }
    const escorts = module.actions.filter(a => a.movement && a.parameters?.some(p => p.name === 'escorted_group'));
    module.actions = module.actions.filter(a => !escorts.includes(a));
    for (const entity of module.entities.filter(e => e.exit)) {
      const id = this.commandId('escort', entity.id);
      const existing = escorts.find(a => a.id === id);
      if (existing) { module.actions.push(existing); continue; }
      const action = this.lowerExit(entity).action;
      const guards: Predicate[] = [action.requires, this.call('able', 'escorted_group'), this.call('rescued', 'escorted_group'),
        { kind: 'not', value: this.call('trapped', 'escorted_group') }, this.call('distinct', 'actor', 'escorted_group'),
        this.call('at', 'escorted_group', entity.exit!.origin)];
      if (module.relations.some(r => r.name === 'home')) {
        guards.push({ kind: 'not', value: this.call('home', 'escorted_group', entity.exit!.origin) });
      }
      module.actions.push({ ...action, id, name: `Escort {escorted_group}: ${entity.name}`,
        description: 'Accompany a freed person through this same physical threshold.',
        report: `The rescued person accompanies the company: ${entity.name}.`,
        parameters: [{ name: 'actor', type: 'group' }, { name: 'escorted_group', type: 'group' }],
        requires: guards.reduce((left, right) => ({ kind: 'and', left, right })),
        success: [...action.success, { kind: 'assert',
          call: { kind: 'call', name: 'at', args: ['escorted_group', entity.exit!.destination] } }] });
    }
  }
  // Containment facts a rule can test: inside a building or dungeon level, unless the place says it is outdoors (a
  // forecourt open to the sky in front of a barrow's door), or a place that says it is indoors; within a settlement.
  static placeFacts(module: Module): void {
    if (!module.relations.some(r => r.name === 'indoors')) { return; }
    const entities = new Map(module.entities.map(e => [e.id, e]));
    for (const place of module.entities.filter(e => e.space)) {
      const above = this.ancestry(entities, place.id).slice(1).map(e => e.space!.kind);
      const shelter = place.space!.shelter;
      const inside = shelter ? shelter !== 'outdoors' : above.some(k => k === 'building' || k === 'level');
      if (inside) { module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'indoors', args: [place.id] } }); }
      if (above.includes('settlement')) { module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'settled', args: [place.id] } }); }
    }
  }
  static validate(module: Module): void {
    const entities = new Map(module.entities.map(e => [e.id, e]));
    for (const entity of module.entities) {
      if (entity.space) {
        if (entity.type !== 'place' || !this.kinds.includes(entity.space.kind)) {
          throw new Error(`Invalid place kind for ${entity.id}`);
        }
        if (entity.space.kind === 'plane' && entity.space.parent) { throw new Error('A plane cannot be contained by a place'); }
        if (entity.space.parent && !entities.get(entity.space.parent)?.space) {
          throw new Error(`Unknown spatial parent ${entity.space.parent} for ${entity.id}`);
        }
        this.validateParent(entity, entities);
        const seen = new Set<string>([entity.id]); let parent = entity.space.parent;
        while (parent) {
          if (seen.has(parent)) { throw new Error(`Containment cycle at ${entity.id}`); }
          seen.add(parent); parent = entities.get(parent)?.space?.parent;
        }
      }
      if (entity.exit) {
        const exit = entity.exit;
        if (entity.type !== 'passage' || !this.modes.includes(exit.mode)) { throw new Error(`Invalid exit mode for ${entity.id}`); }
        if (exit.origin === exit.destination
          || !entities.get(exit.origin)?.space || !entities.get(exit.destination)?.space) {
          throw new Error(`Exit ${entity.id} needs two distinct declared places`);
        }
        if (exit.door && entities.get(exit.door)?.type !== 'door') { throw new Error(`Unknown exit door ${exit.door}`); }
        if (exit.knowledge && entities.get(exit.knowledge)?.type !== 'fact') {
          throw new Error(`Unknown exit knowledge ${exit.knowledge}`);
        }
        this.validateMode(entity, entities);
      }
    }
  }
  private static validateParent(entity: Entity, entities: Map<string, Entity>): void {
    const space = entity.space!;
    const allowed: Record<string, string[]> = {
      plane: [], region: ['plane'], settlement: ['region'], wilderness: ['region'],
      site: ['region', 'settlement', 'wilderness'], building: ['settlement', 'site', 'wilderness'],
      level: ['site', 'building', 'level'], room: ['settlement', 'wilderness', 'site', 'building', 'level', 'room'],
    };
    if (space.parent && !allowed[space.kind]!.includes(entities.get(space.parent)!.space!.kind)) {
      throw new Error(`Invalid ${space.kind} containment for ${entity.id}`);
    }
  }
  private static validateMode(entity: Entity, entities: Map<string, Entity>): void {
    const exit = entity.exit!;
    const origin = this.ancestry(entities, exit.origin), destination = this.ancestry(entities, exit.destination);
    const changedLevel = this.within(origin, 'level') !== this.within(destination, 'level');
    const changedPlane = this.within(origin, 'plane') !== this.within(destination, 'plane');
    if (changedPlane && exit.mode !== 'cross_plane') { throw new Error(`Exit ${entity.id} crosses planes without cross_plane mode`); }
    if (!changedPlane && exit.mode === 'cross_plane') { throw new Error(`Exit ${entity.id} does not cross planes`); }
    if (['ascend', 'descend'].includes(exit.mode) && !changedLevel) { throw new Error(`Exit ${entity.id} must change dungeon level`); }
    if (exit.mode === 'walk' && (changedLevel || this.within(origin, 'building') !== this.within(destination, 'building')
      || this.within(origin, 'region') !== this.within(destination, 'region')
      || this.within(origin, 'settlement') !== this.within(destination, 'settlement')
      || this.within(origin, 'wilderness') !== this.within(destination, 'wilderness'))) {
      throw new Error(`Exit ${entity.id} needs an explicit building, level or regional transition`);
    }
    if (exit.mode === 'enter' && !destination.some(e => ['building', 'site'].includes(e.space?.kind ?? '')
      && !origin.some(o => o.id === e.id))) { throw new Error(`Exit ${entity.id} does not enter a building or site`); }
    if (exit.mode === 'leave' && !origin.some(e => ['building', 'site'].includes(e.space?.kind ?? '')
      && !destination.some(o => o.id === e.id))) {
      throw new Error(`Exit ${entity.id} does not leave a building or site`);
    }
  }
  static ancestry(entities: Map<string, Entity>, id: string): Entity[] {
    const rows: Entity[] = [], seen = new Set<string>(); let e = entities.get(id);
    while (e?.space && !seen.has(e.id)) {
      rows.push(e); seen.add(e.id); e = e.space.parent ? entities.get(e.space.parent) : undefined;
    }
    return rows;
  }
  static visible(world: World, actor: string, entity: Entity): boolean {
    return !entity.exit?.knowledge || world.test({ kind: 'call', name: 'knows', args: [actor, entity.exit.knowledge] });
  }
  static scope(exit: ExitDefinition, id: (value: string) => string): ExitDefinition {
    return { ...exit, ...(exit.passage ? { passage: id(exit.passage) } : {}),
      origin: id(exit.origin), destination: id(exit.destination),
      ...(exit.door ? { door: id(exit.door) } : {}), ...(exit.knowledge ? { knowledge: id(exit.knowledge) } : {}) };
  }
}
