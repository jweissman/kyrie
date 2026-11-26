import { Canon } from './canon';
import { CanonRuntime } from './canon-runtime';
import type { Effect } from '../lang';

// The catalog's abilities' effects as the runtime reads them, once each, for the effects port's lowering (OR-1101).
export class EffectsRead {
  private static readonly read = new Map<string, readonly Effect[]>();
  static effects(id: string): readonly Effect[] {
    const had = this.read.get(id);
    if (had) { return had; }
    const a = Canon.abilities[Canon.resolve('abilities', id)];
    const effects = a && !a.unsupported ? CanonRuntime.ability(id, a).effects : [];
    this.read.set(id, effects);
    return effects;
  }
}
