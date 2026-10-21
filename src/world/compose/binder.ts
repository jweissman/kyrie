import { ModuleParser } from '../../lang/module-parser';
import type { Predicate } from '../../lang/module';
import { RandomStreams } from '../../random-streams';
import type { Ledger } from './ledger';
import type { SlotSpec } from './kit';
import type { Trace } from './trace';

interface Search { slots: [string, SlotSpec][]; fixed: Record<string, string>; step: string; seed: string }
interface Scored { value: string; score: number; draw: number }

// Binds a kit's slots to committed places, in order: each slot's candidates are what its `is` names, kept only if
// every hard requirement holds, ordered by preference and then by a seeded draw. If a later slot cannot be filled
// the next candidate for an earlier one is tried, within a fixed budget of checks; nothing is retried beyond that.
export class Binder {
  static readonly budget = 600;
  private checks = 0;
  private readonly parsed = new Map<string, Predicate>();
  constructor(private readonly ledger: Ledger, private readonly trace: Trace) {}
  bind(slots: Record<string, SlotSpec>, at: { fixed: Record<string, string>; step: string; seed: string }):
    { bindings: Record<string, string> } | { refused: string } {
    this.checks = 0;
    const search: Search = { slots: Object.entries(slots), ...at };
    let refused = 'no candidates';
    const found = this.from(0, {}, search, why => { refused = why; });
    if (!found) { return { refused }; }
    return { bindings: Object.fromEntries(Object.entries(found).map(([k, v]) => [k.slice(1), v])) };
  }
  private from(index: number, bindings: Record<string, string>, search: Search,
    fail: (why: string) => void): Record<string, string> | undefined {
    if (index === search.slots.length) { return bindings; }
    const [name, spec] = search.slots[index]!;
    const candidates = this.candidates(name, spec, bindings, search);
    if (!candidates.length) { fail(`nothing can be ${name}: ${this.reason(name, spec, bindings, search)}`); return undefined; }
    for (const c of candidates) {
      if (this.checks > Binder.budget) { fail(`gave up after ${Binder.budget} checks`); return undefined; }
      this.trace.add({ step: search.step, kind: 'bound', slot: name, value: c.value, score: c.score,
        considered: candidates.length, fixed: name in search.fixed });
      const rest = this.from(index + 1, { ...bindings, [`?${name}`]: c.value }, search, fail);
      if (rest) { return rest; }
      this.trace.add({ step: search.step, kind: 'candidate', slot: name, candidate: c.value, score: c.score,
        failed: `nothing fits ${search.slots[index + 1]![0]} with it` });
    }
    return undefined;
  }
  // What can fill the slot now, best first; each candidate weighed is recorded with the requirement that failed.
  private candidates(name: string, spec: SlotSpec, bindings: Record<string, string>, search: Search): Scored[] {
    const own = `?${name}`, pool = search.fixed[name] ? [search.fixed[name]]
      : [...new Set(this.ledger.solve(this.predicate(spec.is), bindings).map(b => b[own]!))];
    const kept: Scored[] = [];
    for (const value of pool) {
      this.checks++;
      const at = { ...bindings, [own]: value };
      const failed = [spec.is, ...spec.requires ?? []].find(r => !this.ledger.test(this.predicate(r), at));
      const score = (spec.prefers ?? [])
        .reduce((sum, p) => sum + (this.ledger.test(this.predicate(p.when), at) ? p.weight : 0), 0);
      this.trace.add({ step: search.step, kind: 'candidate', slot: name, candidate: value, score,
        ...(failed ? { failed } : {}) });
      if (failed) { continue; }
      kept.push({ value, score, draw: Binder.draw(RandomStreams.key(search.seed, search.step, name, value)) });
    }
    return kept.sort((a, b) => b.score - a.score || a.draw - b.draw);
  }
  private reason(name: string, spec: SlotSpec, bindings: Record<string, string>, search: Search): string {
    if (search.fixed[name]) { return `the fixed ${search.fixed[name]} does not meet the requirements`; }
    return this.ledger.solve(this.predicate(spec.is), bindings).length ? 'every candidate fails a requirement'
      : `no place is ${spec.is}`;
  }
  private predicate(text: string): Predicate {
    let p = this.parsed.get(text);
    if (!p) { p = ModuleParser.predicate(text); this.parsed.set(text, p); }
    return p;
  }
  // A stable number in [0, 1) from a key: the seeded order among equally preferred candidates.
  static draw(key: string): number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }
}
