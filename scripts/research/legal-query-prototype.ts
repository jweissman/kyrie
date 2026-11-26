import { Operators } from '../../src/campaign/operators';
import type { CampaignActor } from '../../src/campaign/definition';
import { KeptReading, type Kept, type Module, type Operator, type World } from '../../src/lang';

// Research only: one query per actor, scoped to one immutable module and controller list.
export class LegalQueryPrototype {
  private readonly operators: Operators;
  private readonly entries = new Map<string | undefined, Kept<Operator[]>>();
  hits = 0;
  misses = 0;

  constructor(private readonly module: Module, actors?: readonly CampaignActor[]) {
    this.operators = new Operators(module, actors);
  }

  ask(world: World, actor?: string): Operator[] {
    if (world.module !== this.module) { throw new Error('Legal query used with a different module'); }
    const old = this.entries.get(actor);
    if (old && KeptReading.holds(world, old)) { this.hits++; return old.value; }
    this.misses++;
    const read = KeptReading.read(world, () => this.operators.applicable(world, actor));
    if (read.kept) { this.entries.set(actor, read.kept); } else { this.entries.delete(actor); }
    return read.value;
  }
}
