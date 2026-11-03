import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';

// Whether something is a treasure (its kind valuable, by the catalog: see Overlays.declareWorth).
export class Treasure {
  static valuable(w: World, id: string): boolean {
    const kind = w.module.relations.some(r => r.name === 'valuable') ? w.one('itemKind', id) : undefined;
    return !!kind && w.test(ModuleWriter.call('valuable', kind));
  }
}
