import type { BundleSource } from '../../campaign/bundle-source';
import type { BundleRequest } from '../../campaign/module-bundle';
import { ModuleParser } from '../../lang/module-parser';
import { Geography } from './geography';
import type { Ledger } from './ledger';

// One hook of a placement, resolved: the installation id its word is named under, the fact as the placement's modules
// export it (knotFolk.bell_taken), what it is asked about (the bell the hobs took), the settlement (or its square)
// where it is heard, and the place the placement claims, which knowing it leads to.
export interface HookWord { id: string; fact: string; topic: string; heard: string; there: string }

// Word of a kit's placement, as the scenarios' word is spread (see ScenarioWord), out of three small modules the
// composer installs against the ledger: knowing the fact leads to the claimed place; whoever keeps the inn where it is
// heard, and the inn of the settlement nearest that, can be asked about it; and a place known only by its look until
// a fact names it is named by them too, as people who live by it say it (the hobs' hold "Gaudumport", not "a smooth
// doorway in a crag"). The kits had declared hooks that nothing read: the hobs' bell-frame in the start town pointed
// at nothing and nobody would speak of it (the expedition diagnosis, change 1).
export class KitWord {
  static readonly lead = 'data/kits/word/lead/module.json';
  static readonly naming = 'data/kits/word/naming/module.json';
  static readonly teller = 'data/kits/word/teller/module.json';
  // The ledger's measure of hours between places, as the assembly vocabulary declares it (not the shared rules').
  private static readonly hours = 'hours';
  constructor(private readonly ledger: Ledger, private readonly source: BundleSource) {}
  requests(hook: HookWord): BundleRequest[] {
    const party = Geography.ref(this.one('company(?p)', {}, '?p')!), there = Geography.ref(hook.there);
    const name = this.one('namedBy(?there, ?name)', { '?there': hook.there }, '?name');
    return [{ id: `${hook.id}Lead`, bundle: this.path(KitWord.lead), imports: { party, word: hook.fact, there } },
      ...name ? [{ id: `${hook.id}Name`, bundle: this.path(KitWord.naming),
        imports: { party, word: hook.fact, name: Geography.ref(name) } }] : [],
      ...this.tellers(hook.heard).map((t, n) => ({ id: `${hook.id}Teller${n + 1}`, bundle: this.path(KitWord.teller),
        imports: { party, word: hook.fact, teller: Geography.ref(t.keeper), square: Geography.ref(t.square) },
        context: { topic: hook.topic } }))];
  }
  // Who keeps the inn where the word is heard, and the inn of the settlement nearest it by the hours between them
  // (none, in a region whose author named no keepers); and the square of each.
  tellers(heard: string): { keeper: string; square: string }[] {
    const squares = this.ledger.solve(ModuleParser.predicate('square(?town, ?square)')).map(b => b['?square']!);
    const own = squares.includes(heard) ? heard : this.one('square(?town, ?square)', { '?town': heard }, '?square');
    if (!own) { return []; }
    const next = squares.filter(s => s !== own)
      .map(s => ({ s, hours: this.ledger.number(KitWord.hours, own, s) }))
      .sort((a, b) => a.hours - b.hours || a.s.localeCompare(b.s))[0]?.s;
    return [own, ...next ? [next] : []]
      .flatMap(s => this.ledger.solve(ModuleParser.predicate('keeper(?keeper, ?square)'), { '?square': s })
        .map(b => ({ keeper: b['?keeper']!, square: s })));
  }
  private one(text: string, bindings: Record<string, string>, variable: string): string | undefined {
    return this.ledger.solve(ModuleParser.predicate(text), bindings)[0]?.[variable];
  }
  private path(bundle: string): string { return this.source.resolve(bundle); }
}
