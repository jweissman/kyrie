import { ModuleWriter } from '../lang/module-writer';
import type { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';

// Whether something is a treasure (its kind valuable, by the catalog: see Overlays.declareWorth).
export class Treasure {
  static valuable(w: World, id: string): boolean {
    const kind = w.module.relations.some(r => r.name === 'valuable') ? w.one('itemKind', id) : undefined;
    return !!kind && w.test(ModuleWriter.call('valuable', kind));
  }
  // Whose a thing is, when it is someone's other than the company's: theirs, not spoils to be led to (the page led with
  // the hobs' rings in their own store after "Don't touch nothing", and brought the raiders down on a lone newcomer:
  // register M19-233).
  // Not once they have been routed from it: the Gaffer gone out of the back way from the bell, his chest is plunder.
  static theirs(w: World, id: string, company: string): string | undefined {
    const owner = w.relates('owns') ? w.related('owns').find(r => r.args[1] === id && r.args[0] !== company)?.args[0]
      : undefined;
    const routed = !!owner && w.relates('routed') && w.test(ModuleWriter.call('routed', owner));
    return owner && !routed ? ObservationText.label(w, owner) : undefined;
  }
}
