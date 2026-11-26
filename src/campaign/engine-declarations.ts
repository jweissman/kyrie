import type { Instance } from '../lang/module';
import { Overlays } from '../overlays';
import { LookAnswers } from './look-answers';
import { HerbRecipes } from './herb-recipes';
import type { ItemCatalog } from '../item-catalog';

// What the engine declares of a module as it is installed, from the catalog and from what the module's rules read:
// the gear and worth of its kinds, what answers a closer look or a search, and the remedies of the herbs it holds.
export class EngineDeclarations {
  // Among its campaign's kinds (kinds: the campaign's before it, none for the first).
  static declare(draft: { instance: Instance; imports: readonly string[] }, catalog: ItemCatalog) {
    Overlays.declareGear(draft.instance, catalog); Overlays.declareWorth(draft.instance, catalog);
    LookAnswers.declare(draft); HerbRecipes.declare(draft.instance);
  }
}
