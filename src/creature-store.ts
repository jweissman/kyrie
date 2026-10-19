import { CreatureSchema, type Creature } from './creature';
import { CreatureLease } from './creature-lease';
import { Equality } from './equality';
export { CreatureLease } from './creature-lease';

export class CreatureStore {
  private records = new Map<string, Creature>();
  private occupied = new Set<string>();
  private leases = new Map<CreatureLease, string[]>();
  constructor(creatures: Creature[] = []) {
    for (const creature of creatures) { this.insert(creature); }
  }
  insert(creature: Creature) {
    CreatureSchema.validate(creature);
    if (this.records.has(creature.id)) { throw new Error(`Duplicate creature ${creature.id}`); }
    const existingItems = new Set([...this.records.values()].flatMap(c => (c.state.inventory ?? []).map(i => i.id)));
    if (creature.state.inventory?.some(i => existingItems.has(i.id))) { throw new Error('Item has multiple owners'); }
    this.records.set(creature.id, structuredClone(creature));
  }
  get(id: string): Creature {
    const creature = this.records.get(id);
    if (!creature) { throw new Error(`Unknown creature ${id}`); }
    return structuredClone(creature);
  }
  get hasActiveLeases(): boolean { return this.leases.size > 0; }
  get snapshot(): Creature[] { return structuredClone([...this.records.values()]); }
  acquire(ids: string[]): CreatureLease {
    if (new Set(ids).size !== ids.length) { throw new Error('Duplicate encounter creature'); }
    const creatures = ids.map(id => this.get(id));
    if (ids.some(id => this.occupied.has(id))) { throw new Error('Creature already participates in an encounter'); }
    ids.forEach(id => this.occupied.add(id));
    const lease = new CreatureLease(this, creatures);
    this.leases.set(lease, [...ids]);
    return lease;
  }
  commit(lease: CreatureLease, next: Creature[]) {
    const ids = this.leases.get(lease);
    if (!ids) { throw new Error('Encounter lease is closed'); }
    if (next.length !== ids.length || new Set(next.map(c => c.id)).size !== ids.length
      || next.some(c => !ids.includes(c.id))) { throw new Error('Encounter changed creature identities'); }
    next.forEach(c => {
      CreatureSchema.validate(c);
      const previous = this.records.get(c.id)!;
      if (!Equality.deep(c.base, previous.base)
        || c.name !== previous.name || c.classId !== previous.classId || c.raceId !== previous.raceId
        || c.backgroundId !== previous.backgroundId) {
        throw new Error('Combat cannot replace generated characteristics');
      }
    });
    const all = [...this.records.values()].filter(c => !ids.includes(c.id)).concat(next);
    const previousItems = new Map([...this.records.values()].flatMap(c =>
      (c.state.inventory ?? []).map(i => [i.id, i.definition] as const)));
    if (all.some(c => c.state.inventory?.some(i => previousItems.has(i.id)
      && previousItems.get(i.id) !== i.definition))) { throw new Error('Cannot replace instantiated item identity'); }
    const itemIds = all.flatMap(c => (c.state.inventory ?? []).map(i => i.id));
    if (new Set(itemIds).size !== itemIds.length) { throw new Error('Item has multiple owners'); }
    next.forEach(c => this.records.set(c.id, structuredClone(c)));
  }
  release(lease: CreatureLease) {
    const ids = this.leases.get(lease);
    if (ids) { ids.forEach(id => this.occupied.delete(id)); this.leases.delete(lease); }
  }
}
