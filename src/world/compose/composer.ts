import type { DeemValue } from 'deem';
import type { BundleSource } from '../../campaign/bundle-source';
import type { BundleRequest } from '../../campaign/module-bundle';
import { ModuleParser } from '../../lang/module-parser';
import { RandomStreams } from '../../random-streams';
import { Binder } from './binder';
import { Geography } from './geography';
import type { Ledger } from './ledger';
import type { Kit, KitModule, SlotSpec } from './kit';
import { Proposer } from './proposer';
import { Trace } from './trace';

// Asks for one placement of a kit: an installation id, and any slots or dimensions its author fixes.
export interface KitRequest { kit: string; id: string; fix?: Record<string, string> }
export interface Placement {
  kit: string; id: string; bindings: Record<string, string>; choices: Record<string, string>;
  entities: Record<string, string>; modules: BundleRequest[];
}

// Places kits into a world being assembled. For each request: bind the slots to committed places, let Deem propose
// each open dimension, check every proposal against what is committed, then establish what the placement provides
// and install its modules against the bound places. A request that cannot be met is refused with the reason; what
// is already committed is never changed to make room for it.
export class Composer {
  readonly trace = new Trace();
  private readonly binder: Binder;
  private readonly proposer: Proposer;
  constructor(readonly ledger: Ledger, private readonly options: { seed: string; source: BundleSource;
    context: Record<string, string> }) {
    this.binder = new Binder(ledger, this.trace);
    this.proposer = new Proposer(ledger, this.trace);
  }
  place(kit: Kit, request: KitRequest): Placement | undefined {
    const step = `${request.kit}#${request.id}`, fix = request.fix ?? {}, seed = this.options.seed;
    const dimensions = Object.keys(kit.manifest.proposals ?? {});
    this.trace.add({ step, kind: 'request', kit: kit.manifest.id, fixed: fix });
    // An author fixes a slot by the place's import name (varrow.barrows); the ledger knows it as varrow__barrows.
    const slots = Object.fromEntries(Object.entries(fix).filter(([k]) => !dimensions.includes(k))
      .map(([k, v]) => [k, v.replace('.', '__')]));
    const bound = this.binder.bind(kit.manifest.slots, { fixed: slots, step, seed: RandomStreams.key(seed, 'compose', step) });
    if ('refused' in bound) { this.trace.add({ step, kind: 'refused', reason: bound.refused }); return undefined; }
    const bindings = Object.fromEntries(Object.entries(bound.bindings).map(([k, v]) => [`?${k}`, v]));
    const choices = this.choose(kit, { step, fix: slots, dimensions: fix, bindings });
    if (!choices) { return undefined; }
    const named = Object.fromEntries(Object.entries(bindings).map(([k, v]) => [k.slice(1), v]));
    const entities = { ...Object.fromEntries(this.minted(kit).map(name => [name, `${request.id}__${name}`])) };
    this.establish(kit, { step, id: request.id, bindings, choices, entities });
    const modules = kit.manifest.modules.filter(m => Object.entries(m.when ?? {}).every(([d, v]) => choices[d] === v))
      .map(m => this.request(m, { kit, request, bindings: named, choices }));
    for (const m of modules) { this.trace.add({ step, kind: 'module', id: m.id, bundle: m.bundle }); }
    return { kit: kit.manifest.id, id: request.id, bindings: named, choices, entities, modules };
  }
  // Deem's proposal for each dimension in turn. A proposal that implies more (a chapel the hobs robbed) is accepted
  // only if what it implies can be bound now; those bindings join the placement's.
  private choose(kit: Kit, at: { step: string; fix: Record<string, string>; dimensions: Record<string, string>;
    bindings: Record<string, string> }): Record<string, string> | undefined {
    const { step, bindings } = at, choices: Record<string, string> = {};
    for (const [dimension, spec] of Object.entries(kit.manifest.proposals ?? {})) {
      const implied: Record<string, string> = {};
      const imply = this.imply.bind(this, { step, fix: at.fix, given: bindings, into: implied,
        seed: RandomStreams.key(this.options.seed, 'compose', step, dimension, 'implies') });
      const proposed = this.proposer.propose({ kit, dimension, spec, context: { ...this.options.context, ...choices } },
        { bindings, step, seed: RandomStreams.key(this.options.seed, 'compose', step, dimension), implied: imply,
          ...(at.dimensions[dimension] ? { fixed: at.dimensions[dimension] } : {}) });
      if ('refused' in proposed) { this.trace.add({ step, kind: 'refused', reason: proposed.refused }); return undefined; }
      choices[dimension] = proposed.key;
      Object.assign(bindings, implied);
    }
    return choices;
  }
  // Binds what a proposed row implies, into the given record; the reason it cannot, if it cannot.
  private imply(at: { step: string; fix: Record<string, string>; given: Record<string, string>; seed: string;
    into: Record<string, string> }, slots: Record<string, SlotSpec>): string | undefined {
    for (const k of Object.keys(at.into)) { delete at.into[k]; }
    const bound = this.binder.bind(slots, { fixed: at.fix, step: at.step, given: at.given, seed: at.seed });
    if ('refused' in bound) { return `it implies what cannot be: ${bound.refused}`; }
    for (const k of Object.keys(slots)) { at.into[`?${k}`] = bound.bindings[k]!; }
    return undefined;
  }
  // A kit module's installation id: the placement's id and the module's (knot and hold make knotHold).
  static install(placement: string, module: string): string {
    return `${placement}${module.charAt(0).toUpperCase()}${module.slice(1)}`;
  }
  // The kit's own entities (@band, @chief...) named in what it provides.
  private minted(kit: Kit): string[] {
    return [...new Set(kit.manifest.provides.flatMap(p => [...p.matchAll(/@(\w+)/g)].map(m => m[1]!)))];
  }
  private establish(kit: Kit, at: { step: string; id: string; bindings: Record<string, string>;
    choices: Record<string, string>; entities: Record<string, string> }) {
    const { step, bindings, choices, entities } = at, by = { by: `kit:${step}` };
    const facts = [...kit.manifest.provides, ...(kit.manifest.claims ?? []).map(s => `taken(?${s}, ${kit.manifest.id})`)];
    for (const text of facts) {
      // $module.export names something one of the kit's own modules exports, as the ledger knows it once installed.
      const filled = text.replace(/@(\w+)/g, (_, n: string) => entities[n]!)
        .replace(/#(\w+)/g, (_, d: string) => choices[d]!)
        .replace(/\$(\w+)\.(\w+)/g, (_, m: string, e: string) => Geography.id(Composer.install(at.id, m), e));
      const call = ModuleParser.predicate(filled);
      if (call.kind !== 'call') { throw new Error(`Kit ${kit.manifest.id} provides ${text}, which is not a fact`); }
      const args = call.args.map(a => bindings[a] ?? a);
      if (this.ledger.commit(call.name, args, by)) { this.trace.add({ step, kind: 'commit', fact: `${call.name}(${args.join(', ')})` }); }
    }
  }
  private request(m: KitModule, at: { kit: Kit; request: KitRequest; bindings: Record<string, string>;
    choices: Record<string, string> }): BundleRequest {
    const { kit, request, bindings, choices } = at;
    const party = this.ledger.solve(ModuleParser.predicate('company(?p)'))[0]?.['?p'];
    const region = this.ledger.solve(ModuleParser.predicate('region(?r)'))[0]?.['?r'];
    const imports = Object.fromEntries(Object.entries(m.imports).map(([name, value]) => {
      if (value === '@party') { return [name, Geography.ref(party!)]; }
      if (value === '@region') { return [name, Geography.ref(region!)]; }
      if (value.startsWith('?')) { return [name, Geography.ref(bindings[value.slice(1)]!)]; }
      const [module, exported] = value.split('.') as [string, string];
      return [name, `${Composer.install(request.id, module)}.${exported}`];
    }));
    return { id: Composer.install(request.id, m.id), bundle: this.options.source.resolve(m.bundle, kit.path), imports,
      context: { ...this.options.context, ...choices } as Record<string, DeemValue> };
  }
}
