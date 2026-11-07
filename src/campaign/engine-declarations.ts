import type { Instance } from '../lang/module';
import { Overlays } from '../overlays';
import { LookAnswers } from './look-answers';
import { HerbRecipes } from './herb-recipes';

// What the engine declares of a module as it is installed, from the catalog and from what the module's rules read:
// the gear and worth of its kinds, what answers a closer look or a search, and the remedies of the herbs it holds.
export class EngineDeclarations {
  static declare(draft: { instance: Instance; imports: readonly string[] }) {
    Overlays.declareGear(draft.instance); Overlays.declareWorth(draft.instance);
    LookAnswers.declare(draft); HerbRecipes.declare(draft.instance);
  }
}
