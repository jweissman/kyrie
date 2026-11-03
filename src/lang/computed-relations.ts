import { EntityIndex } from './entity-index';
import type { Call, Module } from './module';

// Relations the world computes rather than keeps, each a test of what is bound that binds nothing: two parties are
// distinct when they are not the same one, and someone or something is within an area when it is in a place of it,
// however deep ("anywhere in Mrs Cherrett's lodgings" was written room by room: the Banns at Hessel's friction 13); a
// place is within an area it is, or is a place of (the Grand Tour's 11: "a room of the Collegium" had held of no room).
export class ComputedRelations {
  static readonly names: ReadonlySet<string> = new Set(['distinct', 'within']);
  static has(name: string): boolean { return this.names.has(name); }
  static test(world: { module: Module; one(name: string, first: string): string | undefined }, call: Call): boolean {
    const [first, second] = call.args as [string, string];
    if (call.name === 'distinct') { return first !== second; }
    const byId = EntityIndex.of(world.module.entities).byId;
    const start = byId.get(first)?.type === 'place' ? first : world.one('at', first);
    for (let p = start; p; p = byId.get(p)?.space?.parent) { if (p === second) { return true; } }
    return false;
  }
}
