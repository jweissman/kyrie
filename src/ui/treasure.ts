import type { World } from '../lang/world';
import { Knowing } from '../presentation/knowing';

// Whether something is a treasure, and whose: the engine's reading, through the knowledge boundary's door (Knowing).
export class Treasure {
  static valuable(w: World, id: string): boolean { return Knowing.valuable(w, id); }
  static theirs(w: World, id: string, company: string): string | undefined { return Knowing.theirs(w, id, company); }
}
