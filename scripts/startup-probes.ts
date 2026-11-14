// Where a start's time goes, stage by stage, for scripts/startup-bench.ts: the compiler's and the installer's own
// steps timed from outside, by wrapping them in this process only, so that the engine itself carries no measuring of
// its own beyond Costs. A stage's time includes what it calls (an install includes its compose, its compose its
// validations), and structuredClone's is counted wherever it is called from.
import { Costs, type Tally } from '../src/costs';

export interface Probe { n: number; ms: number }
export type Probes = Record<string, Probe>;
interface Wrappable { [name: string]: unknown }

export class StartupProbes {
  static readonly probes: Probes = {};
  // Each install's own time, by its id, in the order taken; and each stage's time within it, or after it before the
  // next is begun (its joining and its people's facts: see Campaign.install).
  static readonly installs: { id: string; ms: number; stages: Record<string, number> }[] = [];
  private static current?: Record<string, number>;
  private static timed<T>(name: string, f: () => T): T {
    const began = performance.now();
    try { return f(); } finally { StartupProbes.add(name, performance.now() - began); }
  }
  private static add(name: string, ms: number) {
    const p = this.probes[name] ??= { n: 0, ms: 0 };
    p.n++; p.ms += ms;
    if (this.current) { this.current[name] = (this.current[name] ?? 0) + ms; }
  }
  // A method of an object (a class, or a prototype) timed under a name each time it is called.
  private static wrap(target: object, method: string, name: string) {
    const holder = target as Wrappable, original = holder[method] as (...a: unknown[]) => unknown;
    holder[method] = new Proxy(original, { apply: StartupProbes.applied.bind(undefined, name) });
  }
  private static applied(this: void, name: string, f: (...a: unknown[]) => unknown, self: unknown, a: unknown[]) {
    return StartupProbes.timed(name, () => Reflect.apply(f, self, a));
  }
  private static async loaded(this: void, f: (...a: unknown[]) => Promise<unknown>, self: unknown, a: unknown[]) {
    const began = performance.now(), stages: Record<string, number> = {};
    StartupProbes.current = stages;
    try { return await Reflect.apply(f, self, a); } finally {
      StartupProbes.installs.push({ id: (a[0] as { id: string }).id, ms: performance.now() - began, stages });
    }
  }
  // Every probe laid on the code a start runs; imported here, after the scale's own import was measured.
  static async install(clones = true): Promise<void> {
    const { ModuleCompiler } = await import('../src/lang/module-compiler');
    const { ModuleAssembly } = await import('../src/campaign/module-assembly');
    const { ModuleInstallations } = await import('../src/campaign/module-installations');
    const { ModuleNamespace } = await import('../src/campaign/module-namespace');
    const { ModuleBundle } = await import('../src/campaign/module-bundle');
    const { CreatureFacts } = await import('../src/campaign/creature-facts');
    const { Discovery } = await import('../src/information/discovery');
    const { RoleRequirements } = await import('../src/campaign/role-requirements');
    this.wrap(ModuleCompiler.prototype, 'validate', 'validate');
    this.wrap(ModuleCompiler.prototype, 'instantiate', 'instantiate');
    this.wrap(ModuleAssembly, 'compose', 'compose');
    this.wrap(ModuleInstallations, 'prepare', 'join');
    this.wrap(ModuleInstallations, 'check', 'check joined');
    this.wrap(ModuleInstallations, 'populate', 'populate');
    this.wrap(ModuleNamespace.prototype, 'draft', 'namespace');
    this.wrap(CreatureFacts, 'project', 'project');
    this.wrap(Discovery, 'validate', 'discovery');
    this.wrap(RoleRequirements, 'validate', 'roles');
    const { Composition } = await import('../src/world/compose/composition');
    const { CanonInstall } = await import('../src/campaign/canon-install');
    const { Campaign } = await import('../src/campaign/campaign');
    const { CampaignTick } = await import('../src/campaign/campaign-tick');
    const { ParseCache } = await import('../src/lang/parse-cache');
    this.wrap(Composition, 'expand', 'kits');
    this.wrap(CanonInstall, 'first', 'canon');
    this.wrap(Campaign.prototype, 'refresh', 'refresh');
    this.wrap(CampaignTick, 'settle', 'settle');
    (ParseCache as unknown as Wrappable).set = new Proxy(ParseCache.set, { apply: StartupProbes.parsedText });
    this.perInstall(ModuleBundle as unknown as Wrappable);
    if (clones) { this.clones(); }
  }
  // Each text parsed: its text's hash apart from the kinds it was read among (the key's first part), so that one text
  // parsed twice among different kinds is seen to be.
  static readonly parses: { text: string; kinds: string; kb: number; ms: number }[] = [];
  private static parsedText(this: void, f: (...a: unknown[]) => unknown, self: unknown, a: unknown[]) {
    const key = a[0] as string, cut = key.indexOf('\u0000'), text = key.slice(cut + 1);
    StartupProbes.parses.push({ text: Bun.hash(text).toString(36), kinds: key.slice(0, cut),
      kb: Math.round(text.length / 1024), ms: Math.round(a[2] as number) });
    return Reflect.apply(f, self, a);
  }
  private static perInstall(bundle: Wrappable) {
    bundle.load = new Proxy(bundle.load as (...a: unknown[]) => Promise<unknown>, { apply: StartupProbes.loaded });
  }
  private static clones() {
    globalThis.structuredClone = new Proxy(globalThis.structuredClone,
      { apply: StartupProbes.applied.bind(undefined, 'structuredClone') });
  }
  // The probes and Costs' tally together, rounded, as one record of stages.
  static stages(tally: Tally): Record<string, { n: number; ms: number; kb?: number }> {
    const out: Record<string, { n: number; ms: number; kb?: number }> = {};
    for (const [stage, c] of Object.entries(tally)) {
      out[stage] = { n: c.n, ms: Math.round(c.ms), ...c.bytes ? { kb: Math.round(c.bytes / 1024) } : {} };
    }
    for (const [name, p] of Object.entries(this.probes)) { out[name] = { n: p.n, ms: Math.round(p.ms) }; }
    return out;
  }
  static reset() {
    for (const k of Object.keys(this.probes)) { delete this.probes[k]; }
    this.installs.length = 0; this.parses.length = 0; this.current = undefined;
  }
  static mark(): Tally { return Costs.mark(); }
}
