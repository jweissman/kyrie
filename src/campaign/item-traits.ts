import { ItemCatalog } from '../item-catalog';
import { ModuleWriter } from '../lang/module-writer';
import type { Module } from '../lang/module';

// What the rules need to know of each kind of thing a module holds: worn, used up, a light, a light's fuel, and what
// burns what. Asserted once for every kind present, when the module is composed and again when a company's gear is
// declared into it (a candle carried by everyone from the start was never a light: no kind in the module had been one).
export class ItemTraits {
  static assert(module: Module) {
    const kinds = new Set(module.initial.filter(c => c.kind === 'assert' && c.call.name === 'itemKind')
      .map(c => c.call.args[1]!));
    for (const kind of kinds) {
      const definition = ItemCatalog.get(kind);
      const fuel = [...kinds].some(k => ItemCatalog.get(k).fuel === kind);
      for (const name of [...(definition.slot ? ['wearable'] : []), ...(definition.use ? ['consumable'] : []),
        ...(/^Apply (torchlit|candlelit) to self/.test(definition.use ?? '') ? ['lightsUp'] : []), ...fuel ? ['fuel'] : []]) {
        this.trait(module, name, kind);
      }
      if (definition.fuel && kinds.has(definition.fuel)) { this.trait(module, 'burns', kind, definition.fuel); }
    }
  }
  private static trait(module: Module, name: string, ...args: string[]) {
    if (module.relations.some(r => r.name === name) && !module.initial.some(c => c.kind === 'assert'
      && c.call.name === name && c.call.args.every((a, i) => a === args[i]))) {
      module.initial.push({ kind: 'assert', call: ModuleWriter.call(name, ...args) });
    }
  }
}
