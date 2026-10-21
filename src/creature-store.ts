import { Creation } from './rules/creation';
import { Canon } from './canon/canon';
import { Spellcasting } from './rules/spellcasting';
import { CreatureSchema, type Creature } from './creature';
import { CreatureLease } from './creature-lease';
import { Equality } from './equality';
export { CreatureLease } from './creature-lease';

export class CreatureStore {
  private records = new Map<string, Creature>();
  private occupied = new Set<string>();
  private leases = new Map<CreatureLease, string[]>();
  // Incremented by every write, so derived views can tell when they are stale.
  private revision = 0;
  get version(): number { return this.revision; }
  constructor(creatures: Creature[] = []) {
    for (const creature of creatures) { this.insert(creature); }
  }
  insert(creature: Creature) {
    creature = Spellcasting.equip(structuredClone(creature));
    CreatureSchema.validate(creature);
    if (this.records.has(creature.id)) { throw new Error(`Duplicate creature ${creature.id}`); }
    const existingItems = new Set([...this.records.values()].flatMap(c => (c.state.inventory ?? []).map(i => i.id)));
    if (creature.state.inventory?.some(i => existingItems.has(i.id))) { throw new Error('Item has multiple owners'); }
    this.records.set(creature.id, structuredClone(creature));
    this.revision++;
  }
  get(id: string): Creature {
    const creature = this.records.get(id);
    if (!creature) { throw new Error(`Unknown creature ${id}`); }
    return structuredClone(creature);
  }
  get hasActiveLeases(): boolean { return this.leases.size > 0; }
  get snapshot(): Creature[] { return structuredClone([...this.records.values()]); }
  // The live records, for reading only: no copy is made, so a caller must never change them.
  get live(): readonly Creature[] { return [...this.records.values()]; }
  acquire(ids: string[]): CreatureLease {
    if (new Set(ids).size !== ids.length) { throw new Error('Duplicate encounter creature'); }
    const creatures = ids.map(id => this.get(id));
    if (ids.some(id => this.occupied.has(id))) { throw new Error('Creature already participates in an encounter'); }
    ids.forEach(id => this.occupied.add(id));
    const lease = new CreatureLease(this, creatures);
    this.leases.set(lease, [...ids]);
    return lease;
  }
  // Advancement may change a creature's level, maximum health and spell slots, raise its qualities by the points it
  // spends, and add the feats it spends a feat on with the abilities they grant; nothing else may alter what was
  // generated.
  commit(lease: CreatureLease, next: Creature[], options: { advancement?: boolean } = {}) {
    const ids = this.leases.get(lease);
    if (!ids) { throw new Error('Encounter lease is closed'); }
    if (next.length !== ids.length || new Set(next.map(c => c.id)).size !== ids.length
      || next.some(c => !ids.includes(c.id))) { throw new Error('Encounter changed creature identities'); }
    next.forEach(c => {
      CreatureSchema.validate(c);
      const previous = this.records.get(c.id)!;
      if (!Equality.deep(CreatureStore.kept(c.base, options), CreatureStore.kept(previous.base, options))
        || c.base.level < previous.base.level
        || c.name !== previous.name || c.classId !== previous.classId || c.raceId !== previous.raceId
        || c.backgroundId !== previous.backgroundId || (options.advancement && !CreatureStore.spent(previous, c))) {
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
    this.revision++;
  }
  private static kept(base: Creature['base'], options: { advancement?: boolean }) {
    if (!options.advancement) { return base; }
    const qualities = Object.fromEntries(CreatureSchema.attributes.map(k => [k, 0]));
    return { ...base, level: 0, maxHp: 0, maxSlots: [], abilities: [], ...qualities };
  }
  // Qualities only rise, and by no more than the points of advance spent; feats are only added, one for each feat
  // spent; abilities and traits only by what those feats grant and the calling brings at the levels gained.
  private static spent(previous: Creature, next: Creature): boolean {
    const raised = CreatureSchema.attributes.map(k => next.base[k] - previous.base[k]);
    const points = (previous.state.advances?.qualities ?? 0) - (next.state.advances?.qualities ?? 0);
    const features = Creation.features(next.classId, previous.base.level, next.base.level);
    const taken = (next.traits ?? []).filter(t => !(previous.traits ?? []).includes(t) && !features.traits.includes(t));
    const feats = (previous.state.advances?.feats ?? 0) - (next.state.advances?.feats ?? 0);
    const granted = new Set([...previous.base.abilities, ...features.abilities,
      ...taken.flatMap(t => Canon.traits[t]?.grants?.abilities ?? [])]);
    return raised.every(n => n >= 0) && raised.reduce((a, b) => a + b, 0) <= Math.max(0, points)
      && (previous.traits ?? []).every(t => next.traits?.includes(t)) && taken.length <= Math.max(0, feats)
      && taken.every(t => Canon.traits[t]?.category === 'feat')
      && previous.base.abilities.every(a => next.base.abilities.includes(a))
      && next.base.abilities.every(a => granted.has(a));
  }
  release(lease: CreatureLease) {
    const ids = this.leases.get(lease);
    if (ids) { ids.forEach(id => this.occupied.delete(id)); this.leases.delete(lease); }
  }
}
