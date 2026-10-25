import type { Entity } from './module';

// A module's entities by id, by type and by the place each way out leads from, and their places in the module's
// order: built once for a list of entities, and again only if the list grows (a frontier adds to it). Whatever is
// looked up among them is found from these, not by going through every entity (Mission 15's profile: a country of
// several regions holds tens of thousands).
export class EntityIndex {
  private static readonly built = new WeakMap<readonly Entity[], EntityIndex>();
  static of(entities: readonly Entity[]): EntityIndex {
    let index = this.built.get(entities);
    if (index?.size !== entities.length) { index = new EntityIndex(entities); this.built.set(entities, index); }
    return index;
  }
  readonly size: number;
  readonly byId = new Map<string, Entity>();
  private readonly order = new Map<string, number>();
  private readonly types = new Map<string, Entity[]>();
  private readonly exits = new Map<string, Entity[]>();
  // The entities called otherwise until something is known (a place by what it looks like), in the module's order.
  readonly aliased: Entity[] = [];
  private constructor(entities: readonly Entity[]) {
    this.size = entities.length;
    entities.forEach((e, i) => {
      this.byId.set(e.id, e); this.order.set(e.id, i);
      EntityIndex.add(this.types, e.type, e);
      if (e.exit) { EntityIndex.add(this.exits, e.exit.origin, e); }
      if (e.alias) { this.aliased.push(e); }
    });
  }
  private static add(index: Map<string, Entity[]>, key: string, e: Entity) {
    const those = index.get(key);
    if (those) { those.push(e); } else { index.set(key, [e]); }
  }
  // The entities of a type, in the module's order.
  typed(type: string): readonly Entity[] { return this.types.get(type) ?? []; }
  // The ways out of a place (entities with an exit from it), in the module's order.
  exitsFrom(place: string): readonly Entity[] { return this.exits.get(place) ?? []; }
  // The entities with these ids, in the module's order; an id no entity has is passed over.
  ordered(ids: Iterable<string>): Entity[] {
    const found = [...new Set(ids)].filter(id => this.order.has(id));
    return found.sort((a, b) => this.at(a) - this.at(b)).map(id => this.byId.get(id)!);
  }
  private at(id: string): number { return this.order.get(id)!; }
}
