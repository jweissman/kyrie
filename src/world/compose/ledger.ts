import type { Module, Predicate } from '../../lang/module';
import { World } from '../../lang/world';
import { ModuleWriter } from '../../lang/module-writer';

// Where a commitment came from: the region module it was read from, a kit placement, an author fixing a binding.
export interface Provenance { by: string; why?: string }
export interface Commitment { fact: string; args: string[]; value?: number; by: Provenance }

// The world being assembled, as facts in the assembly vocabulary (data/assembly/vocabulary.kyr). Commitments are only
// ever added: once a fact is established, a later placement builds on it or is refused; nothing rewrites it.
export class Ledger {
  readonly commitments: Commitment[] = [];
  private current: World;
  constructor(readonly vocabulary: Module) { this.current = new World(vocabulary); }
  get world(): World { return this.current; }
  holds(fact: string, ...args: string[]): boolean { return this.current.test(ModuleWriter.call(fact, ...args)); }
  test(predicate: Predicate, bindings: Record<string, string> = {}): boolean {
    return this.current.test(predicate, bindings);
  }
  // Every binding of the predicate's ?variables under which it holds, in the order the facts were committed.
  solve(predicate: Predicate, bindings: Record<string, string> = {}): Record<string, string>[] {
    return [...this.current.solve(predicate, bindings)];
  }
  number(fact: string, ...args: string[]): number { return this.current.number(ModuleWriter.call(fact, ...args)); }
  // Establishes a fact; false if it was already established.
  commit(fact: string, args: string[], by: Provenance): boolean {
    if (this.holds(fact, ...args)) { return false; }
    this.current = this.current.apply([{ kind: 'assert', call: ModuleWriter.call(fact, ...args) }]);
    this.commitments.push({ fact, args, by });
    return true;
  }
  // Establishes a measure. A measure already established with another value is a contradiction, not an update.
  measure(fact: string, args: string[], value: number, by: Provenance): void {
    const call = ModuleWriter.call(fact, ...args), known = this.commitments.find(c => c.fact === fact
      && c.args.length === args.length && c.args.every((a, i) => a === args[i]));
    if (known) {
      if (known.value !== value) { throw new Error(`${fact}(${args.join(', ')}) is already ${known.value}, not ${value}`); }
      return;
    }
    this.current = this.current.apply([{ kind: 'set', call, value: ModuleWriter.number(value) }]);
    this.commitments.push({ fact, args, value, by });
  }
  // Establishes many measures at once (a region's distances), with the same contradiction check as one.
  measures(values: { fact: string; args: string[]; value: number }[], by: Provenance): void {
    const known = new Map(this.commitments.filter(c => c.value !== undefined)
      .map(c => [JSON.stringify([c.fact, ...c.args]), c.value!]));
    const fresh = values.filter(v => {
      const was = known.get(JSON.stringify([v.fact, ...v.args]));
      if (was !== undefined && was !== v.value) {
        throw new Error(`${v.fact}(${v.args.join(', ')}) is already ${was}, not ${v.value}`);
      }
      return was === undefined;
    });
    this.current = this.current.apply(fresh.map(v => ({ kind: 'set' as const,
      call: ModuleWriter.call(v.fact, ...v.args), value: ModuleWriter.number(v.value) })));
    this.commitments.push(...fresh.map(v => ({ ...v, by })));
  }
  // The commitments that name an entity, for explaining where it came from.
  about(id: string): Commitment[] { return this.commitments.filter(c => c.args.includes(id)); }
  static restore(vocabulary: Module, commitments: Commitment[]): Ledger {
    const ledger = new Ledger(vocabulary);
    for (const c of commitments) {
      if (c.value === undefined) { ledger.commit(c.fact, c.args, c.by); continue; }
      ledger.measure(c.fact, c.args, c.value, c.by);
    }
    return ledger;
  }
}
