import type { Call } from './module';
import type { World } from './world';

// A read of a relation the module does not declare, told where it is asked for (MT-25, the architectural review's
// Finding D: a misspelled or undeclared relation read as an innocent nothing, `mounted` four times in one short probe).
// Set by the specs that hold it (test/small/declared-reads), never in play, where a read costs one test of an unset
// hook. A read that may name a relation its module does not declare (another module's, read wherever it is installed)
// says so: optional.
export class DeclaredReads {
  static told?: (name: string) => void;
  private static loose = 0;
  static saw(world: World, name: string): void {
    // A name read for its facts and its values alike (World.describe) is declared as either.
    if (this.told && !this.loose && !world.declares(name) && !world.measures(name)) { this.told(name); }
  }
  static optional(world: World, name: string, first?: string): readonly Call[] {
    this.loose++;
    try { return world.related(name, first); } finally { this.loose--; }
  }
  // Every relation read and not declared while a reading is played, each once.
  static async during(play: () => Promise<void>): Promise<string[]> {
    const seen = new Set<string>(), before = this.told;
    this.told = seen.add.bind(seen) as (name: string) => void;
    try { await play(); } finally { this.told = before; }
    return [...seen].sort();
  }
}
