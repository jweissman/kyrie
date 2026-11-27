import type { AbilityDomain } from './abilities';
import type { CallingsDomain } from './callings';
import type { ConditionDomain } from './conditions';
import type { EffectDomain } from './effects';
import type { TraitsDomain } from './traits';
import type { PresentationResources } from './presentation';

// What a setting installs for the runtime's rules to ask of (the installed context, OR-520; platform-separation.md,
// the third review): small capabilities, each owned by the layer that asks, held together by one installation. Never a
// current domain chosen by whichever was installed last. A campaign owns its installation and runs its operations
// within it; code with no campaign in scope (a spec's helper, a tool) asks of the one the composition root names, once.
export interface InstalledDomain {
  readonly id: string;
  readonly conditions?: ConditionDomain;
  readonly abilities?: AbilityDomain;
  readonly traits?: TraitsDomain;
  readonly callings?: CallingsDomain;
  readonly effects?: EffectDomain;
  readonly presentation?: PresentationResources;
}
// What carries an installation along an asynchronous operation, through its awaits, apart from any other under way at
// once (Node's and Bun's AsyncLocalStorage, given by their composition roots: src/cli/installed-carried.ts). The page's
// worker plays one campaign and has none: there a scope is a stack, and two installations interleaving are refused.
export interface Carrier {
  run<T>(store: InstalledDomain, run: () => T): T;
  getStore(): InstalledDomain | undefined;
}
export class Installed {
  private static root?: InstalledDomain;
  private static carrier?: Carrier;
  private static readonly scope: InstalledDomain[] = [];
  // How many asynchronous operations are under way within each installation, by its id (where nothing carries them).
  private static readonly awaiting = new Map<string, number>();
  // The composition root's installation, named once; named again otherwise, it is refused.
  static base(domain: InstalledDomain): void {
    if (this.root && this.root !== domain) {
      throw new Error(`The composition root has installed ${this.root.id}; ${domain.id} cannot replace it`);
    }
    this.root = domain;
  }
  static get rootId(): string | undefined { return this.root?.id; }
  // What carries an installation through awaits, given once by a composition root that has one.
  static carriedBy(carrier: Carrier): void { this.carrier ??= carrier; }
  // The installation in scope, else the composition root's.
  static current(): InstalledDomain {
    const domain = (this.carrier ? this.carrier.getStore() : this.scope.at(-1)) ?? this.root;
    if (!domain) { throw new Error('Nothing installed: a setting installs its rules at the composition root'); }
    return domain;
  }
  // Runs within an installation: synchronously, the scope left as it was however it ends.
  static within<T>(domain: InstalledDomain, run: () => T): T {
    if (this.carrier) { return this.carrier.run(domain, run); }
    this.scope.push(domain);
    try { return run(); } finally { this.scope.pop(); }
  }
  // Runs an asynchronous operation within an installation. Carried, it is its own through every await; where nothing
  // carries it, nothing of another installation may run while it awaits.
  static async during<T>(domain: InstalledDomain, run: () => Promise<T>): Promise<T> {
    if (this.carrier) { return this.carrier.run(domain, run); }
    const other = [...this.awaiting].find(([id, n]) => n > 0 && id !== domain.id);
    if (other) { throw new Error(`${domain.id} entered while ${other[0]} is under way: two installations interleaved`); }
    this.awaiting.set(domain.id, (this.awaiting.get(domain.id) ?? 0) + 1);
    this.scope.push(domain);
    try { return await run(); } finally {
      this.scope.splice(this.scope.lastIndexOf(domain), 1);
      this.awaiting.set(domain.id, this.awaiting.get(domain.id)! - 1);
    }
  }
  // A capability of the installation in scope, or a plain refusal naming what is missing.
  static need<K extends Exclude<keyof InstalledDomain, 'id'>>(part: K): NonNullable<InstalledDomain[K]> {
    const domain = this.current(), given = domain[part];
    if (!given) { throw new Error(`${domain.id} installs no ${part}`); }
    return given as NonNullable<InstalledDomain[K]>;
  }
}
