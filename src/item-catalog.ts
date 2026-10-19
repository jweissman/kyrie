import { CanonRuntime } from './canon/canon-runtime';
import type { Creature } from './creature';
export interface ItemDefinition {
  name: string; description: string; slot?: string; capability?: string;
  ability?: string;
  armor?: number; power?: number; save?: number; use?: string;
}
export class ItemCatalog {
  static readonly definitions: Record<string, ItemDefinition> = CanonRuntime.items();
  static get(id: string): ItemDefinition {
    const result = this.definitions[id];
    if (!result) { throw new Error(`Unknown item definition ${id}`); }
    return result;
  }
  static abilities(creature: Creature): Record<string, { id: string; kind: 'item'; name: string }> {
    return Object.fromEntries((creature.state.inventory ?? []).filter(i => i.equipped)
      .flatMap(i => { const d = this.get(i.definition); return d.ability
        ? [[d.ability, { id: i.id, kind: 'item' as const, name: d.name }]] : []; }));
  }
  static attachments(creature: Creature) {
    return (creature.state.inventory ?? []).filter(i => i.equipped).map(i => ({
      source: i.id, definition: i.definition, modifiers: {
        armor: this.get(i.definition).armor ?? 0, power: this.get(i.definition).power ?? 0,
        save: this.get(i.definition).save ?? 0,
      },
    }));
  }
  static modifiers(creature: Creature) {
    return (creature.state.inventory ?? []).filter(i => i.equipped).reduce((result, i) => {
      const definition = this.get(i.definition);
      return { armor: result.armor + (definition.armor ?? 0), power: result.power + (definition.power ?? 0),
        save: result.save + (definition.save ?? 0) };
    }, { armor: 0, power: 0, save: 0 });
  }
}
